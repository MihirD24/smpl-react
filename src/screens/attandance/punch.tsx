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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
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
      <View style={styles.loadingScreen}>
        <View style={styles.loadingIcon}><AppIcon name="Clock" size={24} color="#2563EB" /></View>
        <Text style={styles.loadingTitle}>Preparing attendance</Text>
        <Text style={styles.loadingSub}>Checking your location and today’s punch status…</Text>
        <BarIndicator size={22} color="#2563EB" count={5} />
      </View>
    );
  }

  const isPunchIn = punchLabel === 'Punch_in';
  const statusCopy = punchStatus === 'AFTER_PUNCH_IN' ? 'READY TO PUNCH OUT' : isPunchIn ? 'READY TO PUNCH IN' : 'READY TO PUNCH OUT';
  const timeDisplay = moment(currentTime, ['HH:mm:ss','H:mm:ss','HH:mm','H:mm']).isValid() ? moment(currentTime, ['HH:mm:ss','H:mm:ss','HH:mm','H:mm']).format('hh:mm:ss A') : currentTime;

  return (
    <View style={[styles.page, { backgroundColor: isDarkMode ? '#0B1220' : '#F5F7FB' }]}>
      <NetInfoComponent onReconnect={handleReconnect} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}><AppIcon name="Clock" size={21} color="#2563EB" /></View>
          <View style={{ flex:1 }}><Text style={styles.kicker}>TIME & ATTENDANCE</Text><Text style={styles.title}>Punch</Text><Text style={styles.subtitle}>{moment().format('dddd, DD MMMM YYYY')}</Text></View>
          <View style={styles.gpsPill}><View style={styles.gpsDot}/><Text style={styles.gpsText}>GPS READY</Text></View>
        </View>

        {address && punchStatus !== 'AFTER_PUNCH_OUT' && (
          <View style={styles.mapCard}>
            <MapView style={punchStyles.map} region={mapRegion} showsUserLocation={false} followsUserLocation={true}>
              <Marker coordinate={mapRegion} title="Your Location" description={address}><CustomMarker /></Marker>
            </MapView>
            <View style={styles.mapOverlay}><View style={styles.mapPin}><AppIcon name="MapPin" size={15} color="#2563EB"/></View><View style={{flex:1}}><Text style={styles.mapLabel}>CURRENT LOCATION</Text><Text numberOfLines={1} style={styles.mapAddress}>{getShortAddress(address) || 'Locating current position…'}</Text></View><View style={styles.verified}><AppIcon name="CheckCircle" size={13} color="#16A34A"/><Text style={styles.verifiedText}>Verified</Text></View></View>
          </View>
        )}

        {punchStatus === 'BEFORE_PUNCH_IN' || punchStatus === 'AFTER_PUNCH_IN' ? (
          <View style={styles.actionCard}>
            <View style={styles.readyPill}><View style={styles.readyDot}/><Text style={styles.readyText}>{statusCopy}</Text></View>
            <Text style={styles.currentCaption}>CURRENT TIME</Text>
            <Text style={styles.timeHero}>{timeDisplay}</Text>
            <View style={styles.dateRow}><AppIcon name="Calendar" size={14} color="#64748B"/><Text style={styles.dateText}>{moment().format('dddd, DD MMMM YYYY')}</Text></View>

            <View style={styles.locationStrip}>
              <View style={styles.locationIcon}><AppIcon name="Navigation" size={18} color="#2563EB"/></View>
              <View style={{flex:1}}><Text style={styles.locationTitle}>Attendance location</Text><Text numberOfLines={2} style={styles.locationValue}>{address || 'Locating your current position…'}</Text></View>
              <View style={styles.verifiedSmall}><AppIcon name="CheckCircle" size={14} color="#16A34A"/></View>
            </View>

            <View style={styles.shiftRow}><View><Text style={styles.shiftCaption}>TODAY’S SHIFT</Text><Text style={styles.shiftTitle}>Day Shift</Text><Text style={styles.shiftTime}>10:00 AM — 07:30 PM</Text></View><View style={styles.shiftBadge}><AppIcon name="Briefcase" size={15} color="#2563EB"/></View></View>

            <View style={styles.divider}/>
            <SlideToPunchButton onComplete={launchCameraHandler} title={`Slide to ${isPunchIn ? 'Punch In' : 'Punch Out'}`} />
            <Text style={styles.actionHint}>Your photo and GPS location are recorded for attendance verification.</Text>
          </View>
        ) : null}

        {punchStatus === 'AFTER_PUNCH_OUT' && (
          <View style={styles.completedCard}>
            <View style={styles.completedHero}><View style={styles.completedIcon}><AppIcon name="Check" size={25} color="#059669"/></View><View style={{flex:1}}><View style={styles.donePill}><View style={styles.doneDot}/><Text style={styles.doneText}>DAY COMPLETED</Text></View><Text style={styles.completedTitle}>Attendance recorded</Text><Text style={styles.completedSub}>Your workday has been successfully closed.</Text></View></View>
            <View style={styles.timeGrid}>
              <View style={styles.timeBlock}><Text style={styles.timeBlockLabel}>PUNCHED IN</Text><Text style={styles.timeBlockValue}>{inTime ? moment(inTime,'HH:mm:ss').format('hh:mm A') : '--:--'}</Text></View>
              <View style={styles.timeBlock}><Text style={styles.timeBlockLabel}>PUNCHED OUT</Text><Text style={styles.timeBlockValue}>{outTime ? moment(outTime,'HH:mm:ss').format('hh:mm A') : '--:--'}</Text></View>
            </View>
            <View style={styles.totalBar}><View><Text style={styles.totalLabel}>TOTAL WORKED</Text><Text style={styles.totalValue}>{typeof todayAttendance?.total_minutes === 'number' ? `${Math.floor(Math.abs(todayAttendance.total_minutes)/60)}h ${Math.abs(todayAttendance.total_minutes)%60}m` : 'Recorded'}</Text></View><AppIcon name="Clock" size={22} color="#FFFFFF"/></View>
            <View style={styles.miniMap}><MapView style={punchStyles.map} region={mapRegion} showsUserLocation={false}><Marker coordinate={mapRegion}><CustomMarker /></Marker></MapView><View style={styles.miniMapChip}><AppIcon name="MapPin" size={13} color="#2563EB"/><Text numberOfLines={1} style={styles.miniMapText}>{getShortAddress(outAddress || address) || 'Punch-out location'}</Text></View></View>
          </View>
        )}

        {punchStatus === 'ON_LEAVE' && (
          <View style={styles.leaveCard}><View style={styles.leaveIcon}><AppIcon name="Calendar" size={23} color="#7C3AED"/></View><Text style={styles.leaveOverline}>TODAY’S STATUS</Text><Text style={styles.leaveTitle}>You’re on leave</Text><Text style={styles.leaveSub}>Your approved leave covers today. No punch is required.</Text><View style={styles.leaveLine}><AppIcon name="MapPin" size={15} color="#64748B"/><Text numberOfLines={2} style={styles.leaveAddress}>{address}</Text></View></View>
        )}

        <View style={styles.trustNote}><AppIcon name="ShieldCheck" size={17} color="#2563EB"/><Text style={styles.trustText}>Location is used only for attendance verification.</Text></View>
      </ScrollView>

      {cameraVisible && <Modal visible={cameraVisible} transparent={false} animationType="slide" onRequestClose={() => setCameraVisible(false)}><CameraScreen onCapture={onPhotoCaptured} onClose={() => setCameraVisible(false)} /></Modal>}
      {fileUri !== null && <Modal animationType="slide" transparent visible={attendanceModalVisible} onRequestClose={() => setAttendanceModalVisible(false)}><View style={punchStyles.modalOverlay}>{Platform.OS === 'ios' && <BlurView style={StyleSheet.absoluteFill} blurAmount={10} blurType="extraDark" />}<View style={punchStyles.modalContainer}><View style={punchStyles.BottomView}><Text style={styles.modalEyebrow}>ATTENDANCE EVIDENCE</Text><Text style={mainStyles.labelTitle}><AppIcon name="Clock" size={15} color={colors.notification}/> {currentDateLabel} {currentTimeLabel}</Text><Text style={[mainStyles.labelTitle,{marginTop:10}]}><AppIcon name="MapPin" size={15} color={colors.notification}/> {address}</Text><ViewShot ref={viewRef} style={punchStyles.imageWithTimestamp}><Image style={[mainStyles.backBtn,{width:moderateScale(250),height:moderateScale(300)}]} source={{uri:fileUri}}/><Text style={punchStyles.timestamp}>{captureTime}</Text></ViewShot>{punchLabel == 'Punch_in' && <ButtonOrWaitingMessage />}{punchLabel == 'Punch_out' && <ButtonOrWaitingMessage />}</View></View></View></Modal>}
    </View>
  );
};

export default Punch;

const styles = StyleSheet.create({
  page:{flex:1}, content:{paddingHorizontal:moderateScale(16),paddingTop:verticalScale(8),paddingBottom:verticalScale(30)},
  loadingScreen:{flex:1,backgroundColor:'#F5F7FB',alignItems:'center',justifyContent:'center',padding:28}, loadingIcon:{width:54,height:54,borderRadius:18,backgroundColor:'#EAF2FF',alignItems:'center',justifyContent:'center',marginBottom:14},loadingTitle:{fontSize:18,fontWeight:'900',color:'#0F172A'},loadingSub:{fontSize:10.5,color:'#64748B',textAlign:'center',marginTop:5,marginBottom:18,lineHeight:16},
  headerRow:{flexDirection:'row',alignItems:'center',marginBottom:14},headerIcon:{width:42,height:42,borderRadius:14,backgroundColor:'#EAF2FF',alignItems:'center',justifyContent:'center',marginRight:11},kicker:{fontSize:7.5,fontWeight:'900',letterSpacing:1.7,color:'#64748B'},title:{fontSize:23,fontWeight:'900',color:'#0F172A',letterSpacing:-.6,marginTop:2},subtitle:{fontSize:9.5,fontWeight:'600',color:'#64748B',marginTop:2},gpsPill:{flexDirection:'row',alignItems:'center',backgroundColor:'#ECFDF5',borderRadius:99,paddingHorizontal:9,paddingVertical:6},gpsDot:{width:6,height:6,borderRadius:3,backgroundColor:'#16A34A',marginRight:5},gpsText:{fontSize:7.5,fontWeight:'900',letterSpacing:.7,color:'#15803D'},
  mapCard:{height:178,borderRadius:20,overflow:'hidden',backgroundColor:'#E2E8F0',marginBottom:12,borderWidth:1,borderColor:'#E1E8F2'},mapOverlay:{position:'absolute',left:10,right:10,bottom:10,backgroundColor:'rgba(255,255,255,.97)',borderRadius:14,padding:9,flexDirection:'row',alignItems:'center',gap:8},mapPin:{width:30,height:30,borderRadius:10,backgroundColor:'#EEF4FF',alignItems:'center',justifyContent:'center'},mapLabel:{fontSize:7.5,fontWeight:'900',letterSpacing:1,color:'#64748B'},mapAddress:{fontSize:10,fontWeight:'800',color:'#0F172A',marginTop:2},verified:{flexDirection:'row',alignItems:'center',gap:3,paddingHorizontal:7,paddingVertical:5,borderRadius:99,backgroundColor:'#ECFDF5'},verifiedText:{fontSize:7.5,fontWeight:'900',color:'#15803D'},
  actionCard:{backgroundColor:'#FFF',borderRadius:24,borderWidth:1,borderColor:'#E3E9F1',padding:16,shadowColor:'#0F172A',shadowOpacity:.05,shadowRadius:16,shadowOffset:{width:0,height:7},elevation:2},readyPill:{alignSelf:'flex-start',flexDirection:'row',alignItems:'center',backgroundColor:'#ECFDF5',borderRadius:99,paddingHorizontal:10,paddingVertical:6},readyDot:{width:6,height:6,borderRadius:3,backgroundColor:'#16A34A',marginRight:6},readyText:{fontSize:7.5,fontWeight:'900',letterSpacing:1,color:'#15803D'},currentCaption:{fontSize:7.5,fontWeight:'900',letterSpacing:1.5,color:'#2563EB',marginTop:17},timeHero:{fontSize:43,fontWeight:'900',color:'#0B1220',letterSpacing:-2,marginTop:2},dateRow:{flexDirection:'row',alignItems:'center',gap:6,marginTop:1},dateText:{fontSize:9.5,fontWeight:'600',color:'#64748B'},locationStrip:{flexDirection:'row',alignItems:'center',backgroundColor:'#F6F8FB',borderRadius:15,padding:10,marginTop:14,gap:9},locationIcon:{width:34,height:34,borderRadius:11,backgroundColor:'#EAF2FF',alignItems:'center',justifyContent:'center'},locationTitle:{fontSize:9,fontWeight:'900',color:'#334155'},locationValue:{fontSize:9.5,color:'#64748B',fontWeight:'600',marginTop:2,lineHeight:14},verifiedSmall:{width:26,height:26,borderRadius:13,backgroundColor:'#ECFDF5',alignItems:'center',justifyContent:'center'},shiftRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:15},shiftCaption:{fontSize:7.5,fontWeight:'900',letterSpacing:1.2,color:'#94A3B8'},shiftTitle:{fontSize:12.5,fontWeight:'900',color:'#0F172A',marginTop:3},shiftTime:{fontSize:9.5,color:'#64748B',fontWeight:'600',marginTop:1},shiftBadge:{width:34,height:34,borderRadius:12,backgroundColor:'#EEF4FF',alignItems:'center',justifyContent:'center'},divider:{height:1,backgroundColor:'#EEF2F7',marginVertical:15},actionHint:{fontSize:8.5,color:'#94A3B8',textAlign:'center',lineHeight:13,marginTop:9,fontWeight:'600'},
  completedCard:{backgroundColor:'#FFF',borderRadius:24,borderWidth:1,borderColor:'#E3E9F1',padding:16},completedHero:{flexDirection:'row',alignItems:'center',gap:11},completedIcon:{width:48,height:48,borderRadius:16,backgroundColor:'#ECFDF5',alignItems:'center',justifyContent:'center'},donePill:{alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:5,backgroundColor:'#ECFDF5',borderRadius:99,paddingHorizontal:7,paddingVertical:4},doneDot:{width:5,height:5,borderRadius:3,backgroundColor:'#16A34A'},doneText:{fontSize:7,fontWeight:'900',letterSpacing:.8,color:'#15803D'},completedTitle:{fontSize:17,fontWeight:'900',color:'#0F172A',marginTop:5},completedSub:{fontSize:9.5,color:'#64748B',marginTop:2},timeGrid:{flexDirection:'row',gap:8,marginTop:15},timeBlock:{flex:1,backgroundColor:'#F8FAFC',borderRadius:13,padding:11,borderWidth:1,borderColor:'#EEF2F7'},timeBlockLabel:{fontSize:7.2,fontWeight:'900',letterSpacing:.8,color:'#94A3B8'},timeBlockValue:{fontSize:14,fontWeight:'900',color:'#0F172A',marginTop:5},totalBar:{marginTop:9,backgroundColor:'#2563EB',borderRadius:15,padding:12,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},totalLabel:{fontSize:7.5,fontWeight:'900',letterSpacing:1,color:'#CFE0FF'},totalValue:{fontSize:18,fontWeight:'900',color:'#FFF',marginTop:3},miniMap:{height:135,borderRadius:16,overflow:'hidden',marginTop:10,position:'relative'},miniMapChip:{position:'absolute',left:9,right:9,bottom:9,backgroundColor:'rgba(255,255,255,.96)',borderRadius:12,padding:8,flexDirection:'row',alignItems:'center',gap:5},miniMapText:{flex:1,fontSize:8.5,fontWeight:'800',color:'#334155'},
  leaveCard:{backgroundColor:'#FFF',borderRadius:24,padding:20,borderWidth:1,borderColor:'#E6E8F0'},leaveIcon:{width:48,height:48,borderRadius:16,backgroundColor:'#F3EEFF',alignItems:'center',justifyContent:'center',marginBottom:18},leaveOverline:{fontSize:7.5,fontWeight:'900',letterSpacing:1.4,color:'#7C3AED'},leaveTitle:{fontSize:26,fontWeight:'900',color:'#0F172A',marginTop:4},leaveSub:{fontSize:10.5,color:'#64748B',lineHeight:16,marginTop:6},leaveLine:{marginTop:18,paddingTop:13,borderTopWidth:1,borderTopColor:'#EEF2F7',flexDirection:'row',gap:7},leaveAddress:{flex:1,fontSize:9.5,color:'#64748B'},
  trustNote:{flexDirection:'row',alignItems:'center',gap:8,marginTop:13,paddingHorizontal:12,paddingVertical:11,borderRadius:14,backgroundColor:'#EFF6FF'},trustText:{fontSize:8.5,color:'#4A6080',fontWeight:'700'},modalEyebrow:{fontSize:8,fontWeight:'900',letterSpacing:1.3,color:'#2563EB',marginBottom:8},
});
