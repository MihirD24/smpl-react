import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Platform,
  Linking,
  Alert,
  PermissionsAndroid,
  useColorScheme,
  useWindowDimensions,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import { useIsFocused } from '@react-navigation/native';
import GetLocation from 'react-native-get-location';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { BarIndicator } from 'react-native-indicators';
import { BlurView } from '@react-native-community/blur';
import ViewShot, { captureRef } from 'react-native-view-shot';
import moment from 'moment';
import {
  LogIn,
  LogOut,
  MapPin,
  Clock,
  Coffee,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  X,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react-native';

import {
  requestLocationPermission,
  requestCameraPermission,
  showPermissionAlert,
} from '../../utils';
import { checkPunch, punchIn, punchOut } from '../../services';
import { BottomTabScreenProps } from '../../navigation/navigationTypes';
import CustomMarker from './customMarker';
import ToastUtil from '../../utils/toastAndroid';
import CameraScreen from '../../components/cameraScreen';
import NetInfoComponent from '../../components/netinfoComponent';
import { PunchSession, GraceInfo } from '../../types/adminAttendance';
import GraceTrackerWidget from '../../components/graceTrackerWidget';
import PunchSessionsTimeline from '../../components/punchSessionsTimeline';
import { BRAND, isTabletWidth, contentMaxWidth } from '../../assets/style/brandTheme';

if (!(Geocoder as any).isInitialized) {
  Geocoder.init('AIzaSyBHL-m8PpehMXtvM5sRlEpMWxJJGycmmo4');
  (Geocoder as any).isInitialized = true;
}

const getPunchPhotoUri = (photoUri: string) => {
  if (Platform.OS !== 'android') {
    return photoUri.replace('file://', '');
  }

  if (photoUri.startsWith('file://') || photoUri.startsWith('content://')) {
    return photoUri;
  }

  return `file://${photoUri}`;
};

const createPunchPhoto = (photoUri: string) => ({
  uri: getPunchPhotoUri(photoUri),
  type: 'image/jpeg',
  name: `punch-${Date.now()}.jpg`,
});

const Punch: React.FC<BottomTabScreenProps<'Punch'>> = ({ navigation }) => {
  const isFocused = useIsFocused();
  const isDarkMode = useColorScheme() === 'dark';
  const { width } = useWindowDimensions();
  const tablet = isTabletWidth(width);
  const containerMaxWidth = contentMaxWidth(width);

  const viewRef = useRef<ViewShot>(null);
  const isFetchingLocation = useRef(false);

  // Map state
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.008,
    longitudeDelta: 0.008,
  });

  const [address, setAddress] = useState('');
  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [punchStatus, setPunchStatus] = useState<
    'BEFORE_PUNCH_IN' | 'AFTER_PUNCH_OUT' | 'AFTER_PUNCH_IN' | 'ON_LEAVE'
  >('BEFORE_PUNCH_IN');

  const [captureTime, setCaptureTime] = useState(
    moment().format('DD/MM/YYYY, hh:mm:ss A'),
  );

  const [punchLabel, setPunchLabel] = useState<'Punch_in' | 'Punch_out' | string>('Punch_in');
  const [screenLoading, setScreenLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Attendance metrics & data
  const [todaysStatus, setTodaysStatus] = useState('');
  const [totalWorkFormatted, setTotalWorkFormatted] = useState('00h 00m');
  const [totalBreakFormatted, setTotalBreakFormatted] = useState('00h 00m');
  const [punches, setPunches] = useState<PunchSession[]>([]);
  const [graceInfo, setGraceInfo] = useState<GraceInfo | null>(null);

  const [fileUri, setFileUri] = useState('');
  const [lat, setLat] = useState('');
  const [long, setLong] = useState('');
  const [firstInTime, setFirstInTime] = useState('');
  const [lastOutTime, setLastOutTime] = useState('');
  const [disableBtn, setDisableBtn] = useState(false);

  // Live date & time
  const [currentDate, setCurrentDate] = useState(() => moment().format('YYYY-MM-DD'));
  const [currentTime, setCurrentTime] = useState(() => moment().format('hh:mm:ss A'));
  const [currentDateLabel, setCurrentDateLabel] = useState(() => moment().format('DD-MM-YYYY'));
  const [currentTimeLabel, setCurrentTimeLabel] = useState(() => moment().format('hh:mm:ss A'));

  const [cameraVisible, setCameraVisible] = useState(false);

  // Theme color tokens
  const theme = {
    screenBg: isDarkMode ? '#101112' : '#F5F6F7',
    cardBg: isDarkMode ? '#1A1C1E' : '#FFFFFF',
    cardBorder: isDarkMode ? '#2E3238' : '#E4E6E8',
    textPrimary: isDarkMode ? '#F5F5F5' : '#111111',
    textSecondary: isDarkMode ? '#9CA3AF' : '#5F6368',
    subtleBg: isDarkMode ? '#151719' : '#F8FAFC',
    divider: isDarkMode ? '#25292E' : '#EAECEF',
    headerBg: isDarkMode ? '#17191C' : '#FFFFFF',
    liveBadgeBg: isDarkMode ? '#143026' : '#E8F7EE',
    leaveBadgeBg: isDarkMode ? '#3B2212' : '#FFEDD5',
    leaveTitle: isDarkMode ? '#FDBA74' : '#9A3412',
    leaveDesc: isDarkMode ? '#D1D5DB' : '#7C2D12',
    liveClockLabel: isDarkMode ? '#F4C400' : '#8A6D00',
  };

  const requestAllPermissions = async () => {
    const locationGranted = await requestLocationPermission();
    const cameraGranted = await requestCameraPermission();

    if (!locationGranted) {
      showPermissionAlert(
        'Location Permission Denied',
        'This app needs location permission to track your attendance location.',
      );
      return;
    }

    if (!cameraGranted) {
      showPermissionAlert(
        'Camera Permission Denied',
        'This app needs camera permission to take attendance selfie verification.',
      );
      return;
    }
  };

  useEffect(() => {
    requestAllPermissions();
  }, []);

  const checkLocationRef = useRef<() => Promise<void>>(async () => {});

  const showRetryAlert = useCallback(() => {
    Alert.alert('Location Required', 'Enable location to detect your workplace coordinate.', [
      { text: 'Retry', onPress: () => checkLocationRef.current() },
    ]);
  }, []);

  const showSettingsAlert = useCallback(() => {
    Alert.alert(
      'Permission Blocked',
      'Location permission is blocked. Please enable it from settings.',
      [{ text: 'Open Settings', onPress: () => Linking.openSettings() }],
    );
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    if (result === PermissionsAndroid.RESULTS.GRANTED) return true;

    if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      showSettingsAlert();
    } else {
      showRetryAlert();
    }
    return false;
  }, [showSettingsAlert, showRetryAlert]);

  const enableHighAccuracyLocation = async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const { promptForEnableLocationIfNeeded } = await import(
        'react-native-android-location-enabler'
      );
      await promptForEnableLocationIfNeeded({
        interval: 10000,
      });
      return true;
    } catch {
      Alert.alert(
        'High Accuracy Location Required',
        'Please enable GPS to accurately register attendance location.',
        [{ text: 'Open Settings', onPress: () => Linking.openSettings() }],
      );
    }
  };

  const checkLocation = useCallback(async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    if (isFetchingLocation.current) {
      return;
    }

    isFetchingLocation.current = true;

    try {
      const isLocationEnabled = await enableHighAccuracyLocation();
      if (!isLocationEnabled) {
        enableHighAccuracyLocation();
      }

      const location = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 30000,
      });

      const { latitude, longitude } = location;

      setLat(latitude.toString());
      setLong(longitude.toString());

      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      });

      const geoData = await Geocoder.from(latitude, longitude);

      if (geoData.results && geoData.results.length > 0) {
        setAddress(geoData.results[0].formatted_address);
      } else {
        console.warn('No address found');
      }
    } catch (error) {
      console.error('Error in checkLocation:', error);
    } finally {
      isFetchingLocation.current = false;
    }
  }, [requestPermission]);

  useEffect(() => {
    checkLocationRef.current = checkLocation;
  }, [checkLocation]);

  const resolveScreenMode = (
    today_attendance_status?: string,
    show_label?: string,
  ) => {
    if (show_label === 'Punch_out') {
      return 'AFTER_PUNCH_IN';
    }
    if (
      today_attendance_status === 'Leave' ||
      today_attendance_status === 'Paid Leave'
    ) {
      return 'ON_LEAVE';
    }
    return 'BEFORE_PUNCH_IN';
  };

  const handlecheckPunch = useCallback(async (targetDate: string) => {
    try {
      setDisableBtn(true);
      const punchData = await checkPunch(targetDate);

      if (punchData && typeof punchData === 'object') {
        const label = punchData.show_label || 'Punch_in';
        const status = punchData.today_attendance_status || punchData.raw_status || '';
        const inT = punchData.in_time || '';
        const outT = punchData.out_time || '';

        setPunchLabel(label);
        setTodaysStatus(status);
        setFirstInTime(inT);
        const rawPunches = Array.isArray(punchData.punches) ? punchData.punches : [];
        setPunches(rawPunches);

        let workFmt = punchData.total_work_formatted;
        let breakFmt = punchData.total_break_formatted;

        // Fallback / dynamic client-side summation if backend formatted strings are default or missing
        if (!workFmt || workFmt === '00h 00m') {
          let workMins = 0;
          for (let i = 0; i < rawPunches.length; i++) {
            const p = rawPunches[i];
            if (p.punch_in && p.punch_out) {
              const tIn = moment(p.punch_in, ['HH:mm:ss', 'HH:mm', 'YYYY-MM-DD HH:mm:ss']);
              const tOut = moment(p.punch_out, ['HH:mm:ss', 'HH:mm', 'YYYY-MM-DD HH:mm:ss']);
              if (tIn.isValid() && tOut.isValid()) {
                workMins += Math.max(0, tOut.diff(tIn, 'minutes'));
              }
            } else if (p.punch_in && !p.punch_out) {
              const tIn = moment(p.punch_in, ['HH:mm:ss', 'HH:mm', 'YYYY-MM-DD HH:mm:ss']);
              if (tIn.isValid()) {
                workMins += Math.max(0, moment().diff(tIn, 'minutes'));
              }
            }
          }
          if (workMins > 0) {
            workFmt = `${String(Math.floor(workMins / 60)).padStart(2, '0')}h ${String(workMins % 60).padStart(2, '0')}m`;
          }
        }

        if (!breakFmt || breakFmt === '00h 00m') {
          let breakMins = 0;
          for (let i = 1; i < rawPunches.length; i++) {
            if (rawPunches[i - 1]?.punch_out && rawPunches[i]?.punch_in) {
              const prevOut = moment(rawPunches[i - 1].punch_out, ['HH:mm:ss', 'HH:mm', 'YYYY-MM-DD HH:mm:ss']);
              const currIn = moment(rawPunches[i].punch_in, ['HH:mm:ss', 'HH:mm', 'YYYY-MM-DD HH:mm:ss']);
              if (prevOut.isValid() && currIn.isValid()) {
                breakMins += Math.max(0, currIn.diff(prevOut, 'minutes'));
              }
            }
          }
          if (breakMins > 0) {
            breakFmt = `${String(Math.floor(breakMins / 60)).padStart(2, '0')}h ${String(breakMins % 60).padStart(2, '0')}m`;
          }
        }

        setTotalWorkFormatted(workFmt || '00h 00m');
        setTotalBreakFormatted(breakFmt || '00h 00m');

        if (punchData.grace_info) {
          setGraceInfo(punchData.grace_info);
        }

        const mode = resolveScreenMode(status, label);
        setPunchStatus(mode);
      }
    } catch (error) {
      console.log('Error in handlecheckPunch:', error);
    } finally {
      setDisableBtn(false);
    }
  }, []);

  const handlePunchIn = async (photoUri: string) => {
    try {
      setDisableBtn(true);
      const photo = createPunchPhoto(photoUri);
      const formData = new FormData();

      formData.append('date', currentDate);
      formData.append('in_time', moment().format('HH:mm:ss'));
      formData.append('in_location', address);
      formData.append('in_lat', lat);
      formData.append('in_long', long);
      formData.append('in_image', photo as any);
      formData.append('punch_type', 'regular');

      const { success, message } = await punchIn(formData);

      if (success) {
        setDisableBtn(false);
        setAttendanceModalVisible(false);
        await handlecheckPunch(currentDate);
        navigation.navigate('Home');
        ToastUtil.success(message || 'Welcome to office !!');
      } else {
        ToastUtil.error(message || 'Failed to mark attendance');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error marking attendance:', error.message);
      }
      ToastUtil.error('Failed to submit punch. Please try again.');
    } finally {
      setDisableBtn(false);
      setAttendanceModalVisible(false);
    }
  };

  const handlePunchOut = async (photoUri: string) => {
    try {
      setDisableBtn(true);
      const photo = createPunchPhoto(photoUri);
      const formData = new FormData();
      formData.append('date', currentDate);
      formData.append('out_time', moment().format('HH:mm:ss'));
      formData.append('out_location', address);
      formData.append('out_lat', lat);
      formData.append('out_long', long);
      formData.append('out_image', photo as any);

      const { success, message } = await punchOut(formData);

      if (success) {
        setDisableBtn(false);
        setAttendanceModalVisible(false);
        await handlecheckPunch(currentDate);
        navigation.navigate('Home');
        ToastUtil.success(message || 'See you soon, Take care !!!');
      } else {
        ToastUtil.error(message || 'Failed to mark attendance');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error marking attendance:', error.message);
      }
      ToastUtil.error('Failed to submit punch. Please try again.');
    } finally {
      setDisableBtn(false);
      setAttendanceModalVisible(false);
    }
  };

  const getStatusBadgeConfig = (status: string, punchesCount: number) => {
    const norm = (status || '').toLowerCase();
    if (norm.includes('present')) {
      return {
        label: 'PRESENT (1.0 Day)',
        color: '#16803D',
        bg: isDarkMode ? '#143026' : '#E8F6ED',
        dot: '#16A34A',
      };
    }
    if (norm.includes('half')) {
      return {
        label: 'HALF DAY (0.5 Day)',
        color: '#B45309',
        bg: isDarkMode ? '#382810' : '#FEF3C7',
        dot: '#F59E0B',
      };
    }
    if (norm.includes('leave')) {
      return {
        label: 'ON LEAVE',
        color: '#C2410C',
        bg: isDarkMode ? '#3B2212' : '#FFEDD5',
        dot: '#EA580C',
      };
    }
    if (norm.includes('absent')) {
      return {
        label: 'ABSENT (0.0 Day)',
        color: '#C62828',
        bg: isDarkMode ? '#3A1418' : '#FDECEC',
        dot: '#EF4444',
      };
    }
    if (punchesCount > 0) {
      return {
        label: 'IN PROGRESS',
        color: '#B45309',
        bg: isDarkMode ? '#382810' : '#FEF3C7',
        dot: '#F59E0B',
      };
    }
    return {
      label: 'NOT MARKED',
      color: isDarkMode ? '#9CA3AF' : '#64748B',
      bg: isDarkMode ? '#222631' : '#F1F5F9',
      dot: '#94A3B8',
    };
  };

  useEffect(() => {
    if (!isFocused) return;
    const loadScreenData = async () => {
      try {
        setScreenLoading(true);
        const formattedDate = moment().format('YYYY-MM-DD');
        setCurrentDate(formattedDate);
        setCurrentDateLabel(moment().format('DD-MM-YYYY'));

        await Promise.all([handlecheckPunch(formattedDate), checkLocation()]);
      } catch (e) {
        console.log('Screen load error', e);
      } finally {
        setScreenLoading(false);
      }
    };

    loadScreenData();
  }, [isFocused, handlecheckPunch, checkLocation]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([handlecheckPunch(currentDate), checkLocation()]);
    } catch (e) {
      console.log('Refresh error', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment().format('hh:mm:ss A'));
      setCurrentTimeLabel(moment().format('hh:mm:ss A'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const launchCameraHandler = async () => {
    const cameraGranted = await requestCameraPermission();
    if (!cameraGranted) {
      Alert.alert(
        'Camera permission required',
        'Please grant camera permission to take attendance verification selfie.',
      );
      return;
    }
    setCameraVisible(true);
  };

  const onPhotoCaptured = (uri: string) => {
    setFileUri(uri);
    setCaptureTime(moment().format('DD/MM/YYYY, hh:mm:ss A'));
    setCameraVisible(false);
    setAttendanceModalVisible(true);
  };

  const handleRetakePhoto = () => {
    setAttendanceModalVisible(false);
    setFileUri('');
    setCameraVisible(true);
  };

  const handleAddTimestamp = async (type: 'PunchIn' | 'PunchOut') => {
    if (!viewRef.current) {
      if (type === 'PunchIn') {
        handlePunchIn(fileUri);
      } else {
        handlePunchOut(fileUri);
      }
      return;
    }

    try {
      const uri = await captureRef(viewRef, {
        format: 'jpg',
        quality: 0.6,
        result: 'tmpfile',
      });

      if (type === 'PunchIn') {
        await handlePunchIn(uri);
      } else {
        await handlePunchOut(uri);
      }
    } catch (error) {
      console.error('Error capturing timestamped image:', error);
      if (type === 'PunchIn') {
        await handlePunchIn(fileUri);
      } else {
        await handlePunchOut(fileUri);
      }
    }
  };

  if (screenLoading) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.screenBg }]}>
        <StatusBar
          backgroundColor={theme.headerBg}
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBox}>
            <BarIndicator size={moderateScale(32)} color={BRAND.yellow} count={5} />
            <Text style={[styles.loadingEyebrow, { color: BRAND.yellow }]}>
              WORKFORCE ATTENDANCE
            </Text>
            <Text style={[styles.loadingTitle, { color: theme.textPrimary }]}>
              Synchronizing Status & GPS
            </Text>
            <Text style={[styles.loadingSubtext, { color: theme.textSecondary }]}>
              Fetching daily sessions, location coordinates and grace tracker...
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const badge = getStatusBadgeConfig(todaysStatus, punches.length);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.screenBg }]}>
      <StatusBar
        backgroundColor={theme.headerBg}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      <NetInfoComponent onReconnect={handleRefresh} />

      {/* ─── Enterprise ERP Header ─── */}
      <View
        style={[
          styles.erpHeader,
          {
            backgroundColor: theme.headerBg,
            borderBottomColor: theme.cardBorder,
          },
        ]}
      >
        <View style={styles.headerTitleWrap}>
          <View style={styles.yellowRail} />
          <View>
            <Text style={[styles.erpEyebrow, { color: theme.textSecondary }]}>
              WORKFORCE / ATTENDANCE
            </Text>
            <Text style={[styles.erpTitle, { color: theme.textPrimary }]}>
              Punch & Attendance
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.liveBadge,
            { backgroundColor: theme.liveBadgeBg },
          ]}
        >
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: theme.screenBg }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={BRAND.yellow}
            colors={[BRAND.yellow]}
          />
        }
      >
        <View
          style={[
            styles.contentContainer,
            { maxWidth: containerMaxWidth },
            tablet && styles.contentContainerTablet,
          ]}
        >
          {/* ─── ON LEAVE SPECIAL STATE ─── */}
          {punchStatus === 'ON_LEAVE' ? (
            <View
              style={[
                styles.masterCard,
                {
                  backgroundColor: theme.cardBg,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <View>
                  <Text style={styles.cardEyebrow}>ATTENDANCE STATUS</Text>
                  <Text style={[styles.cardDateText, { color: theme.textPrimary }]}>
                    {moment().format('D MMM YYYY (dddd)')}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: theme.leaveBadgeBg },
                  ]}
                >
                  <View style={[styles.statusBadgeDot, styles.leaveDot]} />
                  <Text style={[styles.statusBadgeText, styles.leaveText]}>
                    ON LEAVE
                  </Text>
                </View>
              </View>

              <View style={styles.leaveBannerBox}>
                <AlertTriangle size={moderateScale(22)} color="#EA580C" />
                <View style={styles.leaveBannerTextCol}>
                  <Text
                    style={[
                      styles.leaveBannerTitle,
                      { color: theme.leaveTitle },
                    ]}
                  >
                    Approved Leave
                  </Text>
                  <Text
                    style={[
                      styles.leaveBannerDesc,
                      { color: theme.leaveDesc },
                    ]}
                  >
                    Your leave for today has been officially approved. Attendance
                    marking is suspended for this shift.
                  </Text>
                </View>
              </View>

              {/* Location Address */}
              <View
                style={[
                  styles.locationContainer,
                  {
                    backgroundColor: theme.subtleBg,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                <View style={styles.locationHeaderRow}>
                  <MapPin size={moderateScale(14)} color={BRAND.yellow} />
                  <Text
                    style={[
                      styles.locationLabel,
                      { color: theme.textSecondary },
                    ]}
                  >
                    CURRENT LOCATION
                  </Text>
                </View>
                <Text style={[styles.address, { color: theme.textPrimary }]}>
                  {address || 'Location acquired'}
                </Text>
              </View>

              {graceInfo && (
                <View style={styles.graceSectionWrapper}>
                  <GraceTrackerWidget graceInfo={graceInfo} />
                </View>
              )}
            </View>
          ) : (
            /* ─── HERO ATTENDANCE & PRIMARY PUNCH COCKPIT CARD (TOP OF SCREEN) ─── */
            <>
              <View
                style={[
                  styles.masterCard,
                  {
                    backgroundColor: theme.cardBg,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                {/* Header Row: Title + Dynamic Status Badge */}
                <View style={styles.cardHeaderRow}>
                  <View>
                    <Text style={styles.cardEyebrow}>TODAY'S ATTENDANCE</Text>
                    <Text
                      style={[
                        styles.cardDateText,
                        { color: theme.textPrimary },
                      ]}
                    >
                      {moment().format('D MMM YYYY (dddd)')}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <View
                      style={[
                        styles.statusBadgeDot,
                        { backgroundColor: badge.dot },
                      ]}
                    />
                    <Text style={[styles.statusBadgeText, { color: badge.color }]}>
                      {badge.label}
                    </Text>
                  </View>
                </View>

                {/* Digital Clock & Shift Banner */}
                <View
                  style={[
                    styles.clockSection,
                    {
                      backgroundColor: theme.subtleBg,
                      borderColor: theme.cardBorder,
                    },
                  ]}
                >
                  <View style={styles.clockTopRow}>
                    <Text
                      style={[
                        styles.currentTimeLabel,
                        { color: theme.liveClockLabel },
                      ]}
                    >
                      LIVE CLOCK
                    </Text>
                    <View style={styles.shiftBadge}>
                      <Clock size={moderateScale(11)} color={theme.textSecondary} />
                      <Text
                        style={[
                          styles.shiftBadgeText,
                          { color: theme.textSecondary },
                        ]}
                      >
                        Day Shift (10:00 AM - 07:30 PM)
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.bigTime, { color: theme.textPrimary }]}>
                    {currentTime}
                  </Text>
                </View>

                {/* ─── HIGH-IMPACT DIRECT PUNCH CTA (NO SLIDER, NO SCROLL REQUIRED) ─── */}
                <TouchableOpacity
                  disabled={disableBtn}
                  onPress={launchCameraHandler}
                  style={[
                    styles.punchHeroBtn,
                    punchLabel === 'Punch_out'
                      ? styles.punchHeroBtnOut
                      : styles.punchHeroBtnIn,
                    disableBtn && styles.punchHeroBtnDisabled,
                  ]}
                  activeOpacity={0.82}
                >
                  <View style={styles.punchBtnLeftWrap}>
                    <View
                      style={[
                        styles.punchBtnIconCircle,
                        punchLabel === 'Punch_out'
                          ? styles.punchBtnIconCircleOut
                          : styles.punchBtnIconCircleIn,
                      ]}
                    >
                      {punchLabel === 'Punch_out' ? (
                        <LogOut size={moderateScale(20)} color="#FFFFFF" />
                      ) : (
                        <LogIn size={moderateScale(20)} color={BRAND.black} />
                      )}
                    </View>
                    <View style={styles.punchBtnTextCol}>
                      <Text
                        style={[
                          styles.punchBtnTitle,
                          punchLabel === 'Punch_out'
                            ? styles.punchBtnTitleOut
                            : styles.punchBtnTitleIn,
                        ]}
                      >
                        {punchLabel === 'Punch_out'
                          ? 'PUNCH OUT NOW'
                          : punches.length > 0
                          ? `RESUME WORK • SESSION ${punches.length + 1}`
                          : 'PUNCH IN NOW'}
                      </Text>
                      <Text
                        style={[
                          styles.punchBtnSubtitle,
                          punchLabel === 'Punch_out'
                            ? styles.punchBtnSubtitleOut
                            : styles.punchBtnSubtitleIn,
                        ]}
                      >
                        {punchLabel === 'Punch_out'
                          ? 'Tap to verify selfie & record break or exit'
                          : punches.length > 0
                          ? 'Tap to verify selfie and resume shift'
                          : 'Tap to capture selfie & mark morning punch-in'}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.punchBtnArrowCircle,
                      punchLabel === 'Punch_out'
                        ? styles.punchBtnArrowCircleOut
                        : styles.punchBtnArrowCircleIn,
                    ]}
                  >
                    <ArrowRight
                      size={moderateScale(17)}
                      color={punchLabel === 'Punch_out' ? '#FFFFFF' : BRAND.black}
                    />
                  </View>
                </TouchableOpacity>

                {/* Working Hours & Break Stats Grid */}
                <View style={styles.hoursRow}>
                  {/* Net Work Time Card */}
                  <View
                    style={[
                      styles.hourBox,
                      {
                        backgroundColor: theme.subtleBg,
                        borderColor: theme.cardBorder,
                      },
                    ]}
                  >
                    <View style={styles.hourAccentRailNet} />
                    <View style={styles.hourIconRow}>
                      <Clock size={moderateScale(15)} color="#15803D" />
                      <Text
                        style={[
                          styles.hourBoxLabel,
                          { color: theme.textSecondary },
                        ]}
                      >
                        NET WORK TIME
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.hourBoxValue,
                        { color: theme.textPrimary },
                      ]}
                    >
                      {totalWorkFormatted || '00h 00m'}
                    </Text>
                    <Text
                      style={[
                        styles.hourBoxCaption,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Excluding breaks
                    </Text>
                  </View>

                  {/* Total Break Card */}
                  <View
                    style={[
                      styles.hourBox,
                      {
                        backgroundColor: theme.subtleBg,
                        borderColor: theme.cardBorder,
                      },
                    ]}
                  >
                    <View style={styles.hourAccentRailBreak} />
                    <View style={styles.hourIconRow}>
                      <Coffee size={moderateScale(15)} color="#D97706" />
                      <Text
                        style={[
                          styles.hourBoxLabel,
                          { color: theme.textSecondary },
                        ]}
                      >
                        TOTAL BREAK
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.hourBoxValue,
                        { color: theme.textPrimary },
                      ]}
                    >
                      {totalBreakFormatted || '00h 00m'}
                    </Text>
                    <Text
                      style={[
                        styles.hourBoxCaption,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {punches.length > 1
                        ? `${punches.length - 1} break session(s)`
                        : '0 breaks recorded'}
                    </Text>
                  </View>
                </View>

                {/* First In / Latest Out Summary (if available) */}
                {(firstInTime || lastOutTime) && (
                  <View
                    style={[
                      styles.punchesSummaryRow,
                      {
                        backgroundColor: theme.subtleBg,
                        borderColor: theme.cardBorder,
                      },
                    ]}
                  >
                    <View style={styles.punchSummaryCol}>
                      <Text
                        style={[
                          styles.punchSummaryLabel,
                          { color: theme.textSecondary },
                        ]}
                      >
                        FIRST IN
                      </Text>
                      <Text
                        style={[
                          styles.punchSummaryVal,
                          { color: theme.textPrimary },
                        ]}
                      >
                        {firstInTime
                          ? moment(firstInTime, ['HH:mm:ss', 'YYYY-MM-DD HH:mm:ss']).format('hh:mm A')
                          : '--:--'}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.summaryColDivider,
                        { backgroundColor: theme.cardBorder },
                      ]}
                    />
                    <View style={styles.punchSummaryCol}>
                      <Text
                        style={[
                          styles.punchSummaryLabel,
                          { color: theme.textSecondary },
                        ]}
                      >
                        LATEST OUT
                      </Text>
                      <Text
                        style={[
                          styles.punchSummaryVal,
                          { color: theme.textPrimary },
                        ]}
                      >
                        {lastOutTime
                          ? moment(lastOutTime, ['HH:mm:ss', 'YYYY-MM-DD HH:mm:ss']).format('hh:mm A')
                          : '--:--'}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Location Address Pill */}
                <View
                  style={[
                    styles.locationContainer,
                    {
                      backgroundColor: theme.subtleBg,
                      borderColor: theme.cardBorder,
                    },
                  ]}
                >
                  <View style={styles.locationHeaderRow}>
                    <MapPin size={moderateScale(14)} color={BRAND.yellow} />
                    <Text
                      style={[
                        styles.locationLabel,
                        { color: theme.textSecondary },
                      ]}
                    >
                      REGISTERED GPS LOCATION
                    </Text>
                    <TouchableOpacity
                      onPress={checkLocation}
                      style={styles.refreshLocBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <RefreshCw size={moderateScale(12)} color={theme.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.address, { color: theme.textPrimary }]}>
                    {address || 'Fetching reverse geocoded address...'}
                  </Text>
                </View>
              </View>

              {/* ─── TODAY'S PUNCH SESSIONS TIMELINE ─── */}
              <View
                style={[
                  styles.sectionCard,
                  {
                    backgroundColor: theme.cardBg,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionAccentBar} />
                  <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                    Today's Punch Sessions
                  </Text>
                </View>
                <PunchSessionsTimeline
                  punches={punches}
                  isDarkMode={isDarkMode}
                />
              </View>

              {/* ─── WORKPLACE LOCATION & GPS MAP ─── */}
              <View
                style={[
                  styles.sectionCard,
                  {
                    backgroundColor: theme.cardBg,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionAccentBar} />
                  <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                    Workplace Location Map
                  </Text>
                  <View style={styles.gpsSyncPill}>
                    <ShieldCheck size={moderateScale(12)} color="#16A34A" />
                    <Text style={styles.gpsSyncText}>GPS LIVE</Text>
                  </View>
                </View>

                {address ? (
                  <View
                    style={[
                      styles.mapContainer,
                      {
                        borderColor: theme.cardBorder,
                        backgroundColor: theme.cardBg,
                      },
                    ]}
                  >
                    <MapView
                      style={styles.map}
                      region={mapRegion}
                      showsUserLocation={false}
                      followsUserLocation={true}
                    >
                      <Marker
                        coordinate={mapRegion}
                        title="Your Verified Location"
                        description={address}
                      >
                        <CustomMarker />
                      </Marker>
                    </MapView>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.mapPlaceholder,
                      {
                        backgroundColor: theme.subtleBg,
                        borderColor: theme.cardBorder,
                      },
                    ]}
                  >
                    <ActivityIndicator size="small" color={BRAND.yellow} />
                    <Text
                      style={[
                        styles.mapPlaceholderText,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Acquiring high-accuracy GPS coordinates...
                    </Text>
                  </View>
                )}
              </View>

              {/* ─── MONTHLY 45-MINUTE GRACE TRACKER WIDGET ─── */}
              {graceInfo && (
                <View style={styles.graceSectionWrapper}>
                  <GraceTrackerWidget
                    graceInfo={graceInfo}
                    monthName={moment(currentDate).format('MMMM YYYY')}
                  />
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* ─── Camera Modal ─── */}
      {cameraVisible && (
        <Modal
          visible={cameraVisible}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setCameraVisible(false)}
        >
          <CameraScreen
            onCapture={onPhotoCaptured}
            onClose={() => setCameraVisible(false)}
          />
        </Modal>
      )}

      {/* ─── Polished Camera Timestamp Confirmation Modal ─── */}
      {attendanceModalVisible && Boolean(fileUri) && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={attendanceModalVisible}
          onRequestClose={() => {
            if (!disableBtn) setAttendanceModalVisible(false);
          }}
        >
          <View style={styles.modalOverlay}>
            {Platform.OS === 'ios' && (
              <BlurView
                style={StyleSheet.absoluteFill}
                blurAmount={12}
                blurType="extraDark"
              />
            )}

            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: theme.cardBg,
                  borderColor: theme.cardBorder,
                  maxWidth: Math.min(width * 0.92, 460),
                },
              ]}
            >
              {/* Modal Top Header */}
              <View style={styles.modalHeaderRow}>
                <View>
                  <View style={styles.modalEyebrowRow}>
                    <View style={styles.modalHeaderAccent} />
                    <Text
                      style={[
                        styles.modalEyebrow,
                        { color: theme.textSecondary },
                      ]}
                    >
                      VERIFICATION REQUIRED
                    </Text>
                  </View>
                  <Text
                    style={[styles.modalTitle, { color: theme.textPrimary }]}
                  >
                    {punchLabel === 'Punch_in'
                      ? 'Confirm Punch In'
                      : 'Confirm Punch Out'}
                  </Text>
                </View>
                {!disableBtn && (
                  <TouchableOpacity
                    onPress={() => setAttendanceModalVisible(false)}
                    style={[
                      styles.modalCloseBtn,
                      { backgroundColor: theme.subtleBg },
                    ]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <X size={moderateScale(18)} color={theme.textPrimary} />
                  </TouchableOpacity>
                )}
              </View>

              {/* ViewShot Container for Photo + Timestamp Watermark */}
              <ViewShot
                ref={viewRef}
                options={{ format: 'jpg', quality: 0.6 }}
                style={styles.viewShotContainer}
              >
                <Image
                  style={styles.modalSelfieImage}
                  source={{ uri: fileUri }}
                  resizeMode="cover"
                />

                {/* Verified Watermark Banner */}
                <View style={styles.photoWatermarkOverlay}>
                  <View style={styles.watermarkHeader}>
                    <CheckCircle2 size={moderateScale(12)} color="#10B981" />
                    <Text style={styles.watermarkHeaderText}>
                      SMPL HRMS VERIFIED PUNCH
                    </Text>
                  </View>
                  <Text style={styles.watermarkTimestamp}>{captureTime}</Text>
                  <Text style={styles.watermarkCoords}>
                    {lat && long
                      ? `GPS: ${parseFloat(lat).toFixed(4)}, ${parseFloat(long).toFixed(4)}`
                      : 'GPS: Verified'}
                  </Text>
                </View>
              </ViewShot>

              {/* Metadata Info Summary Box */}
              <View
                style={[
                  styles.modalMetaBox,
                  {
                    backgroundColor: theme.subtleBg,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                <View style={styles.metaItemRow}>
                  <Clock size={moderateScale(13)} color={BRAND.yellow} />
                  <Text
                    style={[
                      styles.metaItemLabel,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Time:
                  </Text>
                  <Text
                    style={[styles.metaItemVal, { color: theme.textPrimary }]}
                  >
                    {currentTimeLabel}
                  </Text>
                </View>

                <View style={styles.metaItemRow}>
                  <Calendar size={moderateScale(13)} color={BRAND.yellow} />
                  <Text
                    style={[
                      styles.metaItemLabel,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Date:
                  </Text>
                  <Text
                    style={[styles.metaItemVal, { color: theme.textPrimary }]}
                  >
                    {currentDateLabel}
                  </Text>
                </View>

                <View style={styles.metaLocationRow}>
                  <MapPin size={moderateScale(13)} color={BRAND.yellow} />
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.metaLocationText,
                      { color: theme.textPrimary },
                    ]}
                  >
                    {address || 'Current workplace coordinate'}
                  </Text>
                </View>
              </View>

              {/* Action Buttons: Primary JCB Yellow/Red CTA + Retake Button */}
              <View style={styles.modalActionCol}>
                <TouchableOpacity
                  disabled={disableBtn}
                  onPress={() => {
                    setDisableBtn(true);
                    if (punchLabel === 'Punch_in') {
                      handleAddTimestamp('PunchIn');
                    } else {
                      handleAddTimestamp('PunchOut');
                    }
                  }}
                  style={[
                    styles.primaryPunchBtn,
                    punchLabel === 'Punch_out'
                      ? styles.primaryPunchBtnOut
                      : styles.primaryPunchBtnIn,
                    disableBtn && styles.primaryPunchBtnDisabled,
                  ]}
                  activeOpacity={0.85}
                >
                  {disableBtn ? (
                    <View style={styles.btnLoadingRow}>
                      <ActivityIndicator
                        size="small"
                        color={
                          punchLabel === 'Punch_out' ? '#FFFFFF' : BRAND.black
                        }
                      />
                      <Text
                        style={[
                          styles.primaryPunchBtnText,
                          punchLabel === 'Punch_out'
                            ? styles.primaryPunchBtnTextOut
                            : styles.primaryPunchBtnTextIn,
                        ]}
                      >
                        Recording Attendance...
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.btnContentRow}>
                      {punchLabel === 'Punch_out' ? (
                        <LogOut size={moderateScale(16)} color="#FFFFFF" />
                      ) : (
                        <LogIn size={moderateScale(16)} color={BRAND.black} />
                      )}
                      <Text
                        style={[
                          styles.primaryPunchBtnText,
                          punchLabel === 'Punch_out'
                            ? styles.primaryPunchBtnTextOut
                            : styles.primaryPunchBtnTextIn,
                        ]}
                      >
                        {punchLabel === 'Punch_in'
                          ? punches.length > 0
                            ? 'CONFIRM & RESUME WORK'
                            : 'CONFIRM & PUNCH IN'
                          : 'CONFIRM & PUNCH OUT'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {!disableBtn && (
                  <TouchableOpacity
                    onPress={handleRetakePhoto}
                    style={[
                      styles.retakeBtn,
                      { borderColor: theme.cardBorder },
                    ]}
                    activeOpacity={0.7}
                  >
                    <RotateCcw size={moderateScale(14)} color={theme.textSecondary} />
                    <Text
                      style={[
                        styles.retakeBtnText,
                        { color: theme.textSecondary },
                      ]}
                    >
                      Retake Photo
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default Punch;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(24),
  },
  loadingBox: {
    alignItems: 'center',
    padding: moderateScale(24),
    borderRadius: moderateScale(16),
  },
  loadingEyebrow: {
    fontSize: moderateScale(10),
    fontWeight: '800',
    letterSpacing: 1.3,
    marginTop: verticalScale(16),
  },
  loadingTitle: {
    fontSize: moderateScale(17),
    fontWeight: '800',
    marginTop: verticalScale(4),
  },
  loadingSubtext: {
    fontSize: moderateScale(12),
    textAlign: 'center',
    marginTop: verticalScale(6),
    maxWidth: scale(280),
    lineHeight: verticalScale(16),
  },
  erpHeader: {
    minHeight: verticalScale(64),
    paddingHorizontal: moderateScale(18),
    paddingTop: verticalScale(6),
    paddingBottom: verticalScale(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  yellowRail: {
    width: scale(4),
    height: verticalScale(34),
    borderRadius: scale(3),
    backgroundColor: BRAND.yellow,
    marginRight: scale(10),
  },
  erpEyebrow: {
    fontSize: moderateScale(9),
    letterSpacing: 1.3,
    fontWeight: '800',
    marginBottom: verticalScale(2),
  },
  erpTitle: {
    fontSize: moderateScale(19),
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(5),
    borderRadius: moderateScale(16),
  },
  liveDot: {
    width: scale(7),
    height: scale(7),
    borderRadius: scale(4),
    backgroundColor: '#16A34A',
    marginRight: scale(5),
  },
  liveText: {
    fontSize: moderateScale(10),
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#16A34A',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(32),
  },
  contentContainer: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: moderateScale(14),
  },
  contentContainerTablet: {
    paddingHorizontal: moderateScale(24),
  },
  masterCard: {
    padding: moderateScale(16),
    borderRadius: moderateScale(16),
    width: '100%',
    borderWidth: 1,
    borderLeftWidth: scale(4),
    borderLeftColor: BRAND.yellow,
    elevation: 3,
    shadowColor: '#101828',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    marginTop: verticalScale(12),
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  cardEyebrow: {
    fontSize: moderateScale(9),
    fontWeight: '800',
    letterSpacing: 1.1,
    color: '#9A7600',
    marginBottom: verticalScale(2),
  },
  cardDateText: {
    fontSize: moderateScale(13),
    fontWeight: '800',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(9),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
    gap: scale(5),
  },
  statusBadgeDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
  },
  statusBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  clockSection: {
    padding: moderateScale(12),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    marginTop: verticalScale(2),
    marginBottom: verticalScale(10),
  },
  clockTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(2),
  },
  currentTimeLabel: {
    fontSize: moderateScale(9),
    fontWeight: '800',
    letterSpacing: 1,
  },
  shiftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  shiftBadgeText: {
    fontSize: moderateScale(10),
    fontWeight: '600',
  },
  bigTime: {
    fontSize: moderateScale(26),
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: verticalScale(2),
  },

  /* ─── Hero Direct Punch CTA Button ─── */
  punchHeroBtn: {
    width: '100%',
    minHeight: verticalScale(58),
    borderRadius: moderateScale(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(14),
    paddingVertical: verticalScale(10),
    marginVertical: verticalScale(8),
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  punchHeroBtnIn: {
    backgroundColor: BRAND.yellow,
  },
  punchHeroBtnOut: {
    backgroundColor: BRAND.danger,
  },
  punchHeroBtnDisabled: {
    opacity: 0.65,
  },
  punchBtnLeftWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: scale(10),
  },
  punchBtnIconCircle: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    justifyContent: 'center',
    alignItems: 'center',
  },
  punchBtnIconCircleIn: {
    backgroundColor: 'rgba(17, 17, 17, 0.1)',
  },
  punchBtnIconCircleOut: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  punchBtnTextCol: {
    flex: 1,
  },
  punchBtnTitle: {
    fontSize: moderateScale(14),
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  punchBtnTitleIn: {
    color: BRAND.black,
  },
  punchBtnTitleOut: {
    color: '#FFFFFF',
  },
  punchBtnSubtitle: {
    fontSize: moderateScale(10),
    fontWeight: '600',
    marginTop: verticalScale(1),
  },
  punchBtnSubtitleIn: {
    color: '#333333',
  },
  punchBtnSubtitleOut: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  punchBtnArrowCircle: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(8),
  },
  punchBtnArrowCircleIn: {
    backgroundColor: 'rgba(17, 17, 17, 0.12)',
  },
  punchBtnArrowCircleOut: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },

  /* ─── Metrics ─── */
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: scale(10),
    marginTop: verticalScale(4),
    marginBottom: verticalScale(6),
  },
  hourBox: {
    flex: 1,
    padding: moderateScale(12),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  hourAccentRailNet: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: scale(3),
    backgroundColor: '#16A34A',
  },
  hourAccentRailBreak: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: scale(3),
    backgroundColor: '#D97706',
  },
  hourIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    marginBottom: verticalScale(4),
    paddingLeft: scale(2),
  },
  hourBoxLabel: {
    fontSize: moderateScale(9),
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  hourBoxValue: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    paddingLeft: scale(2),
  },
  hourBoxCaption: {
    fontSize: moderateScale(9),
    fontWeight: '500',
    marginTop: verticalScale(2),
    paddingLeft: scale(2),
  },
  punchesSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: verticalScale(8),
    paddingHorizontal: moderateScale(10),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    marginVertical: verticalScale(6),
  },
  punchSummaryCol: {
    alignItems: 'center',
    flex: 1,
  },
  summaryColDivider: {
    width: 1,
    height: '70%',
  },
  punchSummaryLabel: {
    fontSize: moderateScale(8),
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  punchSummaryVal: {
    fontSize: moderateScale(12),
    fontWeight: '800',
    marginTop: verticalScale(2),
  },
  locationContainer: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    marginTop: verticalScale(8),
  },
  locationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    marginBottom: verticalScale(4),
  },
  locationLabel: {
    fontSize: moderateScale(10),
    fontWeight: '800',
    letterSpacing: 0.8,
    flex: 1,
  },
  refreshLocBtn: {
    padding: scale(3),
  },
  address: {
    fontSize: moderateScale(12),
    fontWeight: '500',
    lineHeight: verticalScale(17),
    paddingLeft: scale(20),
  },

  /* ─── Section Card (Timeline, Map) ─── */
  sectionCard: {
    padding: moderateScale(16),
    borderRadius: moderateScale(16),
    width: '100%',
    borderWidth: 1,
    marginTop: verticalScale(12),
    elevation: 2,
    shadowColor: '#101828',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  sectionAccentBar: {
    width: scale(3),
    height: verticalScale(14),
    borderRadius: scale(2),
    backgroundColor: BRAND.yellow,
    marginRight: scale(8),
  },
  sectionTitle: {
    fontSize: moderateScale(13),
    fontWeight: '800',
    flex: 1,
    letterSpacing: 0.2,
  },
  gpsSyncPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(3),
    borderRadius: moderateScale(10),
    gap: scale(4),
  },
  gpsSyncText: {
    fontSize: moderateScale(9),
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.6,
  },
  mapContainer: {
    width: '100%',
    height: verticalScale(135),
    borderRadius: moderateScale(14),
    overflow: 'hidden',
    borderWidth: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapPlaceholder: {
    width: '100%',
    height: verticalScale(100),
    borderRadius: moderateScale(14),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: verticalScale(8),
  },
  mapPlaceholderText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
  },

  leaveBannerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFEDD5',
    padding: moderateScale(12),
    borderRadius: moderateScale(12),
    gap: scale(10),
    marginVertical: verticalScale(10),
  },
  leaveBannerTextCol: {
    flex: 1,
  },
  leaveBannerTitle: {
    fontSize: moderateScale(13),
    fontWeight: '800',
    marginBottom: verticalScale(2),
  },
  leaveBannerDesc: {
    fontSize: moderateScale(11),
    lineHeight: verticalScale(15),
  },
  leaveDot: {
    backgroundColor: '#EA580C',
  },
  leaveText: {
    color: '#C2410C',
  },

  graceSectionWrapper: {
    width: '100%',
    marginTop: verticalScale(12),
  },

  /* ─── Modal ─── */
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    paddingHorizontal: moderateScale(18),
  },
  modalCard: {
    width: '100%',
    borderRadius: moderateScale(18),
    borderWidth: 1,
    padding: moderateScale(18),
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(12),
  },
  modalEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    marginBottom: verticalScale(2),
  },
  modalHeaderAccent: {
    width: scale(3),
    height: verticalScale(11),
    borderRadius: 1,
    backgroundColor: BRAND.yellow,
  },
  modalEyebrow: {
    fontSize: moderateScale(9),
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  modalTitle: {
    fontSize: moderateScale(17),
    fontWeight: '800',
  },
  modalCloseBtn: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewShotContainer: {
    width: '100%',
    height: verticalScale(220),
    borderRadius: moderateScale(14),
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  modalSelfieImage: {
    width: '100%',
    height: '100%',
  },
  photoWatermarkOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(8),
  },
  watermarkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(5),
    marginBottom: verticalScale(2),
  },
  watermarkHeaderText: {
    color: '#FFFFFF',
    fontSize: moderateScale(9),
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  watermarkTimestamp: {
    color: BRAND.yellow,
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  watermarkCoords: {
    color: '#D1D5DB',
    fontSize: moderateScale(9),
    marginTop: verticalScale(1),
  },
  modalMetaBox: {
    borderRadius: moderateScale(12),
    borderWidth: 1,
    padding: moderateScale(10),
    marginTop: verticalScale(12),
    gap: verticalScale(4),
  },
  metaItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  metaItemLabel: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    width: scale(36),
  },
  metaItemVal: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    flex: 1,
  },
  metaLocationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(6),
    marginTop: verticalScale(2),
  },
  metaLocationText: {
    fontSize: moderateScale(10),
    fontWeight: '500',
    flex: 1,
    lineHeight: verticalScale(14),
  },
  modalActionCol: {
    marginTop: verticalScale(14),
    gap: verticalScale(8),
  },
  primaryPunchBtn: {
    height: verticalScale(48),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryPunchBtnIn: {
    backgroundColor: BRAND.yellow,
  },
  primaryPunchBtnOut: {
    backgroundColor: BRAND.danger,
  },
  primaryPunchBtnDisabled: {
    opacity: 0.65,
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  btnLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  primaryPunchBtnText: {
    fontSize: moderateScale(13),
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  primaryPunchBtnTextIn: {
    color: BRAND.black,
  },
  primaryPunchBtnTextOut: {
    color: '#FFFFFF',
  },
  retakeBtn: {
    height: verticalScale(40),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(6),
  },
  retakeBtnText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
  },
});
