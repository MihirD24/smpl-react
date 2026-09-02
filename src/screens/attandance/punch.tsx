import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Platform,
  Linking,
  Alert,
  PermissionsAndroid,
  useColorScheme,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import { useIsFocused, useTheme } from '@react-navigation/native';
import GetLocation from 'react-native-get-location';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { BarIndicator } from 'react-native-indicators';
import PunchStyle from '../../assets/style/punch';
import MainStyle from '../../assets/style/maincss';
import { BlurView } from '@react-native-community/blur';
import ViewShot, { captureRef } from 'react-native-view-shot';

import {
  requestLocationPermission,
  requestCameraPermission,
  showPermissionAlert,
} from '../../utils';
import { checkPunch, punchIn, punchOut } from '../../services';
import AppIcon from '../../components/appIcon';
import { BottomTabScreenProps } from '../../navigation/navigationTypes';
import moment from 'moment';
import { LogIn, LogOut, MapPin, Navigation } from 'lucide-react-native';
import CustomMarker from './customMarker';
import ToastUtil from '../../utils/toastAndroid';
import SlideToPunchButton from '../../components/slideToPunchButton';
import CameraScreen from '../../components/cameraScreen';
import NetInfoComponent from '../../components/netinfoComponent';
if (!(Geocoder as any).isInitialized) {
  Geocoder.init('AIzaSyBuUVyHOxiZyUIvBIvsZg6O_ZiedhxW0FA');
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
  const viewRef = useRef<ViewShot>(null);
  const punchStyles = PunchStyle();
  const mainStyles = MainStyle();
  const { colors } = useTheme();
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [address, setAddress] = useState(''); // New state for address
  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [punchStatus, setPunchStatus] = useState<
    'BEFORE_PUNCH_IN' | 'AFTER_PUNCH_OUT' | 'AFTER_PUNCH_IN' | 'ON_LEAVE'
  >('BEFORE_PUNCH_IN');
  
  const [captureTime] = useState(new Date().toLocaleString());
  var date = new Date().getDate(); //Current Date
  var month = new Date().getMonth() + 1; //Current Month
  var year = new Date().getFullYear(); //Current Year
  var hours = new Date().getHours(); //Current Hours
  var min = new Date().getMinutes(); //Current Minutes
  var sec = new Date().getSeconds(); //Current Seconds

  const [punchLabel, setPunchLabel] = useState('');
  const [screenLoading, setScreenLoading] = useState(true);

  const [todaysStatus, setTodaysStatus] = useState('');
  const [fileUri, setFileUri] = useState('');
  const [lat, setLat] = useState('');
  const [long, setLong] = useState('');
  const [inTime, setInTime] = useState('');
  const [outTime, setOutTime] = useState('');
  const [outAddress, setOutAddress] = useState(''); // ✅ Store punch-out address separately
  const [disableBtn, setDisableBtn] = useState(false);
  const [currentDate, setCurrentDate] = useState(
    year + '-' + month + '-' + date,
  );
  const [currentTime, setCurrentTime] = useState(hours + ':' + min + ':' + sec);
  const [currentDateLabel, setCurrentDateLabel] = useState(
    date + '-' + month + '-' + year,
  );
  const [currentTimeLabel, setCurrentTimeLabel] = useState(
    hours + ':' + min + ':' + sec,
  );

  const [cameraVisible, setCameraVisible] = useState(false);

  const requestAllPermissions = async () => {
    const locationGranted = await requestLocationPermission();
    const cameraGranted = await requestCameraPermission();

    if (!locationGranted) {
      showPermissionAlert(
        'Location Permission Denied',
        'This app needs location permission to track your location.',
      );
      return;
    }

    if (!cameraGranted) {
      showPermissionAlert(
        'Camera Permission Denied',
        'This app needs camera permission to take photos.',
      );
      return;
    }
  };

  useEffect(() => {
    requestAllPermissions();
  }, []);

  const isFetchingLocation = useRef(false); // Lock variable

  const requestPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    console.log('Permission result:', result);
    if (result === PermissionsAndroid.RESULTS.GRANTED) return true;

    if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN)
      showSettingsAlert();
    else showRetryAlert();
    return false;
  };

  const showRetryAlert = () => {
    Alert.alert('Location Required', 'Enable location to find nearby jaatayu', [
      { text: 'Retry', onPress: checkLocation },
    ]);
  };

  const showSettingsAlert = () => {
    Alert.alert(
      'Permission Blocked',
      'Location permission is blocked. Please enable it from settings.',
      [{ text: 'Open Settings', onPress: () => Linking.openSettings() }],
    );
  };

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
        // fastInterval: 5000,
      });
      return true;
    } catch {
      Alert.alert(
        'Location Required',
        'Enable location to find nearby jaatayu',
        [{ text: 'Open Settings', onPress: () => Linking.openSettings() }],
      );
    }
  };

  async function checkLocation() {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    if (isFetchingLocation.current) {
      return;
    }

    isFetchingLocation.current = true;

    try {
      // 🔥 THIS triggers Zomato-like popup
      const isLocationEnabled = await enableHighAccuracyLocation();
      if (!isLocationEnabled) {
        enableHighAccuracyLocation();
      }

      const location = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 30000,
        // maximumAge: 10000,
      });
      console.log('Location fetched:', location);

      const { latitude, longitude } = location;

      setLat(latitude.toString());
      setLong(longitude.toString());

      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      const geoData = await Geocoder.from(latitude, longitude);

      if (geoData.results?.length > 0) {
        setAddress(geoData.results[0].formatted_address);
      } else {
        console.warn('No address found');
      }
    } catch (error) {
      console.error('Error in checkLocation:', error);
    } finally {
      isFetchingLocation.current = false;
    }
  }

  const handlePunchIn = async (photoUri: string) => {
    try {
      setDisableBtn(true);
      const photo = createPunchPhoto(photoUri);
      let formData = new FormData();

      formData.append('date', currentDate);
      formData.append('in_time', currentTime);
      formData.append('in_location', address);
      formData.append('in_lat', lat);
      formData.append('in_long', long);
      formData.append('in_image', photo as any);

      const { success, message } = await punchIn(formData);

      if (success) {
        setDisableBtn(false);
        setAttendanceModalVisible(false);
        navigation.navigate('Home');
        ToastUtil.success(message || 'Attendance marked successfully');
      } else {
        ToastUtil.error(message || 'Failed to mark attendance');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error marking attendance:', error.message);
      }
    } finally {
      setDisableBtn(false);
      setAttendanceModalVisible(false);
    }
  };
  // to get which ui to be rendered

  const resolveScreenMode = (
    in_time?: string,
    out_time?: string,
    today_attendance_status?: string,
  ) => {
    if (today_attendance_status === 'Absent') return 'ON_LEAVE';
    if (!in_time) return 'BEFORE_PUNCH_IN';
    if (in_time && !out_time) return 'AFTER_PUNCH_IN';
    if (in_time && out_time) return 'AFTER_PUNCH_OUT';
    return 'BEFORE_PUNCH_IN';
  };

  const handlePunchOut = async (photoUri: string) => {
    try {
      setDisableBtn(true);
      const photo = createPunchPhoto(photoUri);
      let formData = new FormData();
      formData.append('date', currentDate);
      formData.append('out_time', currentTime);
      formData.append('out_location', address);
      formData.append('out_lat', lat);
      formData.append('out_long', long);
      formData.append('out_image', photo as any);

      const { success, message } = await punchOut(formData);

      if (success) {
        // ✅ Save the address at the time of punch out
        setOutAddress(address);
        navigation.navigate('Home');
        ToastUtil.success(message || 'Attendance marked successfully');
      } else {
        ToastUtil.error(message || 'Failed to mark attendance');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error marking attendance:', error.message);
      }
    } finally {
      setDisableBtn(false);
      setAttendanceModalVisible(false);
    }
  };

  const handlecheckPunch = async (currentDate: string) => {
    try {
      setDisableBtn(true);

      const punchData = await checkPunch(currentDate);

      setPunchLabel(punchData.show_label);
      setTodaysStatus(punchData.today_attendance_status);
      setInTime(punchData.in_time);
      setOutTime(punchData.out_time);

      if (punchData.out_location) {
        setOutAddress(punchData.out_location);
      }

      const mode = resolveScreenMode(
        punchData.in_time,
        punchData.out_time,
        punchData.today_attendance_status,
      );

      setPunchStatus(mode);
    } finally {
      setDisableBtn(false);
    }
  };

  const ButtonOrWaitingMessage = () => {
    return disableBtn ? (
      <Text style={punchStyles.waitingMessage}>
        Please wait for mark attendance...
      </Text>
    ) : (
      <TouchableOpacity
        disabled={disableBtn}
        onPress={() => {
          setDisableBtn(true);
          punchLabel === 'Punch_in'
            ? handleAddTimestamp('PunchIn')
            : handleAddTimestamp('PunchOut');
        }}
        style={[
          mainStyles.button,
          mainStyles.buttonSoftGray,
          {
            marginTop: 10,
          },
          disableBtn && mainStyles.disabledButton,
        ]}
      >
        <Text
          style={[
            mainStyles.buttonLable,
            mainStyles.buttonWidth100,
            { textAlign: 'center', color: 'white' },
          ]}
        >
          {punchLabel === 'Punch_in' ? 'Save Punch In' : 'Save Punch Out'}
        </Text>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    if (!isFocused) return;
    const loadScreenData = async () => {
      try {
        setScreenLoading(true);

        const dateObj = new Date();

        const date = dateObj.getDate();
        const month = dateObj.getMonth() + 1;
        const year = dateObj.getFullYear();

        const formattedDate = `${year}-${month}-${date}`;

        setCurrentDate(formattedDate);

        setCurrentDateLabel(`${date}-${month}-${year}`);

        await Promise.all([handlecheckPunch(formattedDate), checkLocation()]);
      } catch (e) {
        console.log('Screen load error', e);
      } finally {
        setScreenLoading(false);
      }
    };

    loadScreenData();
  }, [isFocused]);

  useEffect(() => {
    const timer = setInterval(() => {
      const dateObj = new Date();
      const hours = dateObj.getHours();
      const min = dateObj.getMinutes();
      const sec = dateObj.getSeconds();
      const formattedTime = `${hours}:${min}:${sec}`;
      setCurrentTime(formattedTime);
      setCurrentTimeLabel(`${hours}:${min}:${sec}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const launchCameraHandler = async () => {
    const cameraGranted = await requestCameraPermission();
    // console.log('Camera permission granted cameraGranted:', cameraGranted);
    if (!cameraGranted) {
      Alert.alert('Camera permission required');
      return;
    }
    console.log('Launching camera...');
    setCameraVisible(true);
  };

  const onPhotoCaptured = (uri: string) => {
    setFileUri(uri);
    setCameraVisible(false);
    setAttendanceModalVisible(true);
  };

  const handleAddTimestamp = async (type: 'PunchIn' | 'PunchOut') => {
    if (!viewRef) {
      console.error('viewRef is not set');
      return;
    }

    try {
      const uri = await captureRef(viewRef, {
        format: 'jpg',
        quality: 0.5,
        result: 'tmpfile',
      });

      if (type == 'PunchIn') {
        handlePunchIn(uri);
      } else {
        handlePunchOut(uri);
      }
    } catch (error) {
      console.error('Error capturing timestamped image:', error);
    }
  };

  // ─── Helper: short address label (first 2 parts) ──────────────────────────
  const getShortAddress = (fullAddress: string) => {
    if (!fullAddress) return '';
    const parts = fullAddress.split(',');
    return parts.slice(0, 2).join(',').trim();
  };

  if (screenLoading) {
    return (
      <View
        style={{
          height: verticalScale(100),
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: verticalScale(200),
        }}
      >
        <BarIndicator size={30} color="#2563EB" count={5} />
        <Text style={styles.loaderText}>
          {' '}
          Fetching attendance & location...
        </Text>
      </View>
    );
  }
  const handleReconnect = async () => {
  try {
    setScreenLoading(true);

    await Promise.all([
      handlecheckPunch(currentDate),
      checkLocation(),
    ]);
  } catch (e) {
    console.log('Reconnect error', e);
  } finally {
    setScreenLoading(false);
  }
};

  return (
    <>
        <NetInfoComponent onReconnect={handleReconnect} />

      {address && punchStatus !== 'AFTER_PUNCH_OUT' && (
        <View style={styles.mapContainer}>
          <MapView
            // provider={PROVIDER_GOOGLE}
            style={punchStyles.map}
            region={mapRegion}
            showsUserLocation={false}
            followsUserLocation={true}
          >
            <Marker
              coordinate={mapRegion}
              title="Your Location"
              description={address}
            >
              <CustomMarker />
            </Marker>
          </MapView>
        </View>
      )}
      {/* BEFORE PUNCH IN */}
      {punchStatus === 'BEFORE_PUNCH_IN' && (
        <>
          <View
            style={[
              styles.bottomCard,
              { backgroundColor: isDarkMode ? '#1E1E2E' : '#FFFFFF' },
            ]}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <View>
                <View style={styles.statusPill}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusPillText}>{punchLabel === 'Punch_in' ? 'READY TO START' : 'READY TO FINISH'}</Text>
                </View>
                <Text
                  style={[
                    styles.currentTimeLabel,
                    { color: isDarkMode ? '#6C757D' : 'blue' },
                  ]}
                >
                  CURRENT TIME
                </Text>
                <Text
                  style={[
                    styles.bigTime,
                    { color: isDarkMode ? '#bfd6f5' : 'black' },
                  ]}
                >
                  {currentTime}
                </Text>
                <Text style={styles.subText}>
                  {' '}
                  {moment(Date.now()).format('dddd, MMMM D, YYYY')}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.locationContainer,
                { backgroundColor: isDarkMode ? '#bfd6f5' : '#f5f5f7' },
              ]}
            >
              <Navigation
                color="#2563EB"
                size={20}
                style={{
                  position: 'absolute',
                  top: verticalScale(16),
                  left: scale(10),
                }}
              />
              <Text style={styles.locationLabel}>CURRENT LOCATION</Text>
              <Text style={styles.locationHint}>GPS location used for attendance verification</Text>
              <Text style={styles.address}>{address || 'Locating your current position…'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.shiftCaption}>YOUR SHIFT</Text>
                <Text
                  style={[
                    styles.locationLabel,
                    { color: isDarkMode ? '#bfd6f5' : 'black' },
                  ]}
                >
                  SHIFT
                </Text>
                <Text
                  style={[
                    styles.shiftText,
                    { color: isDarkMode ? '#bfd6f5' : 'black' },
                  ]}
                >
                  Day Shift (10:00 - 07:30)
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.sliderWrapper}>
            <SlideToPunchButton
              onComplete={launchCameraHandler}
              title={`Slide to ${punchLabel === 'Punch_in' ? 'Punch In' : 'Punch Out'}`}
            />
          </View>
        </>
      )}
      {/* AFTER PUNCH IN */}
      {punchStatus === 'AFTER_PUNCH_IN' && (
        <>
          <View
            style={[
              styles.bottomCard,
              { backgroundColor: isDarkMode ? '#1E1E2E' : '#FFFFFF' },
            ]}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <View>
                <View style={styles.statusPill}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusPillText}>{punchLabel === 'Punch_in' ? 'READY TO START' : 'READY TO FINISH'}</Text>
                </View>
                <Text
                  style={[
                    styles.currentTimeLabel,
                    { color: isDarkMode ? '#6C757D' : 'blue' },
                  ]}
                >
                  CURRENT TIME
                </Text>
                <Text
                  style={[
                    styles.bigTime,
                    { color: isDarkMode ? '#bfd6f5' : 'black' },
                  ]}
                >
                  {currentTime}
                </Text>
                <Text style={styles.subText}>
                  {moment(Date.now()).format('dddd, MMMM D, YYYY')}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.locationContainer,
                { backgroundColor: isDarkMode ? '#bfd6f5' : '#f5f5f7' },
              ]}
            >
              <Navigation
                color="#2563EB"
                size={20}
                style={{
                  position: 'absolute',
                  top: verticalScale(16),
                  left: scale(10),
                }}
              />
              <Text style={styles.locationLabel}>CURRENT LOCATION</Text>
              <Text style={styles.locationHint}>GPS location used for attendance verification</Text>
              <Text style={styles.address}>{address || 'Locating your current position…'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.shiftCaption}>YOUR SHIFT</Text>
                <Text
                  style={[
                    styles.locationLabel,
                    { color: isDarkMode ? '#bfd6f5' : 'black' },
                  ]}
                >
                  SHIFT
                </Text>
                <Text
                  style={[
                    styles.shiftText,
                    { color: isDarkMode ? '#bfd6f5' : 'black' },
                  ]}
                >
                  Day Shift (10:00 - 07:30)
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.sliderWrapper}>
            <SlideToPunchButton
              onComplete={launchCameraHandler}
              title={`Slide to ${punchLabel === 'Punch_in' ? 'Punch In' : 'Punch Out'}`}
            />
          </View>
        </>
      )}

      {/* AFTER PUNCH OUT */}
      {punchStatus === 'AFTER_PUNCH_OUT' && (
        <View
          style={[
            styles.bottomCardOut,
            { backgroundColor: isDarkMode ? '#1E1E2E' : '#FFFFFF' },
          ]}
        >
          <View
            style={[
              styles.completedCard,
              { backgroundColor: isDarkMode ? '#bfd6f5' : '#FFFFFF' },
            ]}
          >
            <Image
              source={require('../../assets/images/checkmark.png')}
              style={{ height: moderateScale(50), width: moderateScale(50) }}
            />
            <View style={styles.completedBadge}><View style={styles.completedBadgeDot} /><Text style={styles.completedBadgeText}>DAY COMPLETED</Text></View>
            <Text style={styles.completedTitle}>Attendance completed</Text>
            <Text style={styles.completedDesc}>
              You're all set. Your shifts ended and your hours are recorded.
            </Text>
          </View>

          <View style={styles.timeRow}>
            <View
              style={[
                styles.timeBox,
                { backgroundColor: isDarkMode ? '#bfd6f5' : '#f8f4f4' },
              ]}
            >
              <Text style={styles.locationLabel}>
                <LogIn size={11} /> PUNCHED IN
              </Text>
              <Text style={styles.timeValue}>
                {moment(inTime, 'HH:mm:ss').format('hh:mm A') ?? '---'}
              </Text>
            </View>

            <View
              style={[
                styles.timeBox,
                { backgroundColor: isDarkMode ? '#bfd6f5' : '#f8f4f4' },
              ]}
            >
              <Text style={styles.locationLabel}>
                <LogOut size={11} /> PUNCHED OUT
              </Text>
              <Text style={styles.timeValue}>
                {moment(outTime, 'HH:mm:ss').format('hh:mm A') ?? '---'}
              </Text>
            </View>
          </View>

          <View style={styles.miniMap}>
            {/* ✅ Floating chip on top of map */}
            <View
              style={[
                styles.punchOutChip,
                { backgroundColor: isDarkMode ? '#bfd6f5' : '#f8f4f4' },
              ]}
            >
              <View style={styles.punchOutChipLeft}>
                <MapPin size={13} color="#2563EB" />
                <Text style={styles.punchOutChipTitle}>Punch-out Location</Text>
              </View>
              <Text style={styles.punchOutChipAddress} numberOfLines={1}>
                {getShortAddress(outAddress || address)}
              </Text>
            </View>
            <MapView
              // provider={PROVIDER_GOOGLE}
              style={punchStyles.map}
              region={mapRegion}
              showsUserLocation={false}
              followsUserLocation={true}
            >
              <Marker
                coordinate={mapRegion}
                title="Your Location"
                description={address}
              >
                <CustomMarker />
              </Marker>
            </MapView>
          </View>
        </View>
      )}
      {/* ON LEAVE */}
      {punchStatus === 'ON_LEAVE' && (
        <>
          <View
            style={[
              styles.bottomCard,
              { backgroundColor: isDarkMode ? '#1E1E2E' : '#FFFFFF' },
            ]}
          >
            <View>
              <Text style={styles.currentTimeLabel}>STATUS</Text>
              <Text style={styles.bigTime}>On Leave</Text>
              <Text style={styles.subText}>
                Your leave for today has been approved
              </Text>
            </View>

            <View
              style={[
                styles.locationContainer,
                { backgroundColor: isDarkMode ? '#bfd6f5' : '#f5f5f7' },
              ]}
            >
              <Navigation
                color="#2563EB"
                size={20}
                style={{
                  position: 'absolute',
                  top: verticalScale(16),
                  left: scale(10),
                }}
              />
              <Text style={styles.locationLabel}>LOCATION ADDRESS</Text>

              <Text style={styles.address}>{address}</Text>
            </View>
            <View style={styles.divider} />
          </View>
        </>
      )}
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
      {fileUri !== null && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={attendanceModalVisible}
          onRequestClose={() => {
            setAttendanceModalVisible(false);
          }}
        >
          <View style={punchStyles.modalOverlay}>
            {Platform.OS === 'ios' && (
              <BlurView
                style={StyleSheet.absoluteFill}
                blurAmount={10}
                blurType="extraDark"
              />
            )}
            <View style={punchStyles.modalContainer}>
              <View style={punchStyles.BottomView}>
                <View>
                  <Text style={styles.modalEyebrow}>ATTENDANCE EVIDENCE</Text>
                  <Text style={mainStyles.labelTitle}>
                    <AppIcon
                      name="Clock"
                      size={15}
                      color={colors.notification}
                    />{' '}
                    : {currentDateLabel} {currentTimeLabel}
                  </Text>
                  <Text style={[mainStyles.labelTitle, { marginTop: 10 }]}>
                    <AppIcon
                      name="MapPin"
                      size={15}
                      color={colors.notification}
                    />{' '}
                    : {address}
                  </Text>
                </View>
                <ViewShot ref={viewRef} style={punchStyles.imageWithTimestamp}>
                  <Image
                    style={[
                      mainStyles.backBtn,
                      {
                        width: moderateScale(250),
                        height: moderateScale(300),
                      },
                    ]}
                    source={{ uri: fileUri }}
                  />
                  <Text style={punchStyles.timestamp}>{captureTime}</Text>
                </ViewShot>
                {punchLabel == 'Punch_in' && <ButtonOrWaitingMessage />}
                {punchLabel == 'Punch_out' && <ButtonOrWaitingMessage />}
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

export default Punch;

const styles = StyleSheet.create({
  sliderWrapper: {
    left: 0,
    right: 0,
    bottom: verticalScale(18),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(18),
    position: 'absolute',
  },
  mapContainer: {
    marginHorizontal: moderateScale(14),
    marginTop: verticalScale(10),
    width: '100%',
    height: verticalScale(300),
    borderRadius: moderateScale(22),
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: '#E8EEF7',
  },
  bottomCard: {
    padding: moderateScale(20),
    borderRadius: moderateScale(20),
    width: '92%',
    alignSelf: 'center',
    elevation: 5,
    shadowColor: '#0F172A',
    shadowOpacity: 0.10,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 7},
    position: 'absolute',
    top: verticalScale(208),
  },
  bottomCardOut: {
    padding: moderateScale(16),
    borderRadius: moderateScale(20),
    width: '92%',
    alignSelf: 'center',
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 5},
    marginTop: verticalScale(18),
  },
  statusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(6),
    borderRadius: 99,
    backgroundColor: '#ECFDF5',
    marginBottom: verticalScale(10),
  },
  statusDot: {width: moderateScale(6), height: moderateScale(6), borderRadius: 6, backgroundColor: '#10B981', marginRight: moderateScale(6)},
  statusPillText: {fontSize: moderateScale(8.5), fontWeight: '800', letterSpacing: 0.8, color: '#047857'},
  currentTimeLabel: {fontSize: moderateScale(9), fontWeight: '800', letterSpacing: 1.2, color: '#64748B'},
  bigTime: {fontSize: moderateScale(34), fontWeight: '800', letterSpacing: -1, marginTop: verticalScale(2)},
  subText: {fontSize: moderateScale(11), color: '#64748B', marginTop: verticalScale(2), marginBottom: verticalScale(12), fontWeight: '500'},
  divider: {height: 1, backgroundColor: '#E8EDF3', marginVertical: verticalScale(15)},
  locationContainer: {paddingHorizontal: moderateScale(40), paddingVertical: verticalScale(13), borderRadius: moderateScale(14), marginTop: verticalScale(6)},
  locationLabel: {fontSize: moderateScale(9.5), fontWeight: '800', letterSpacing: 0.7},
  locationHint: {fontSize: moderateScale(8.5), color: '#64748B', marginTop: verticalScale(2), marginBottom: verticalScale(2)},
  address: {fontSize: moderateScale(11.5), color: '#111827', marginTop: verticalScale(3), lineHeight: moderateScale(16)},
  shiftCaption: {fontSize: moderateScale(8.5), fontWeight: '800', letterSpacing: 1, color: '#94A3B8', marginBottom: verticalScale(3)},
  rowBetween: {marginTop: verticalScale(2), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  shiftText: {fontSize: moderateScale(13), fontWeight: '700', color: '#111827'},
  completedCard: {padding: moderateScale(20), borderRadius: moderateScale(18), backgroundColor: '#F8FAFC', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0'},
  completedBadge: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: moderateScale(9), paddingVertical: verticalScale(5), borderRadius: 99, backgroundColor: '#ECFDF5', marginBottom: verticalScale(10)},
  completedBadgeDot: {width: moderateScale(5), height: moderateScale(5), borderRadius: 5, backgroundColor: '#10B981', marginRight: moderateScale(5)},
  completedBadgeText: {fontSize: moderateScale(8), fontWeight: '800', letterSpacing: 0.9, color: '#047857'},
  completedTitle: {fontSize: moderateScale(18), fontWeight: '800', color: '#0F172A'},
  completedDesc: {marginTop: verticalScale(5), textAlign: 'center', fontSize: moderateScale(11), lineHeight: moderateScale(16), color: '#64748B'},
  timeRow: {flexDirection: 'row', justifyContent: 'space-between', marginTop: verticalScale(14), gap: moderateScale(8)},
  timeBox: {width: '50%', padding: moderateScale(14), borderRadius: moderateScale(14), backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0'},
  timeValue: {marginTop: verticalScale(5), fontSize: moderateScale(18), fontWeight: '800', color: '#0F172A'},
  miniMap: {height: verticalScale(150), borderRadius: moderateScale(16), overflow: 'hidden', marginTop: verticalScale(14)},
  punchOutChip: {backgroundColor: 'rgba(255,255,255,0.96)', paddingHorizontal: moderateScale(12), paddingVertical: verticalScale(10), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2},
  punchOutChipLeft: {flexDirection: 'row', alignItems: 'center', gap: scale(4)},
  punchOutChipTitle: {fontSize: moderateScale(10), fontWeight: '800', color: '#0F172A', marginLeft: scale(4)},
  punchOutChipAddress: {fontSize: moderateScale(9.5), color: '#64748B', flexShrink: 1, marginLeft: scale(8), textAlign: 'right'},
  modalEyebrow: {fontSize: moderateScale(9), fontWeight: '800', letterSpacing: 1.2, color: '#64748B', marginBottom: verticalScale(5)},
  loaderText: {marginTop: verticalScale(12), fontSize: moderateScale(13), color: '#64748B', fontWeight: '500'},
});
