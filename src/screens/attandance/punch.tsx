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

  const statusConfig = punchStatus==='AFTER_PUNCH_OUT' ? {label:'Shift completed',color:'#0FBA83',soft:'#DCF8EE'} : punchStatus==='AFTER_PUNCH_IN' ? {label:'Currently working',color:'#2563EB',soft:'#EAF2FF'} : punchStatus==='ON_LEAVE' ? {label:'On approved leave',color:'#D97706',soft:'#FFF0CC'} : {label:'Ready to punch in',color:'#2563EB',soft:'#EAF2FF'};
  const formattedClock = moment(currentTime,'HH:mm:ss').isValid() ? moment(currentTime,'HH:mm:ss').format('hh:mm:ss A') : currentTime;
  return <View style={{flex:1,backgroundColor:isDarkMode?'#08121E':'#F4F7FB'}}>
    <NetInfoComponent onReconnect={handleReconnect}/>
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      {address && punchStatus!=='AFTER_PUNCH_OUT' && <View style={styles.mapCard}><View style={styles.mapHeader}><View style={[styles.mapIcon,{backgroundColor:isDarkMode?'#18335E':'#EAF2FF'}]}><MapPin size={18} color="#2563EB"/></View><View style={{flex:1}}><Text style={[styles.mapTitle,{color:isDarkMode?'#F4F8FC':'#0B1728'}]}>Current location</Text><Text style={[styles.mapSub,{color:isDarkMode?'#A1B0C2':'#687B94'}]} numberOfLines={1}>{getShortAddress(address)}</Text></View><View style={[styles.statusPill,{backgroundColor:statusConfig.soft}]}><View style={[styles.statusDot,{backgroundColor:statusConfig.color}]}/><Text style={[styles.statusText,{color:statusConfig.color}]}>{statusConfig.label}</Text></View></View><View style={styles.mapView}><MapView style={{flex:1}} region={mapRegion} showsUserLocation={false}><Marker coordinate={mapRegion} title="Your Location"><CustomMarker/></Marker></MapView></View></View>}
      <View style={[styles.statusCard,{backgroundColor:isDarkMode?'#102236':'#FFFFFF',borderColor:isDarkMode?'#263F59':'#DCE5F0'}]}><View style={styles.statusTop}><View><Text style={[styles.overline,{color:isDarkMode?'#7E93AA':'#73869D'}]}>TODAY • {moment().format('ddd, D MMM')}</Text><Text style={[styles.time,{color:isDarkMode?'#F4F8FC':'#0B1728'}]}>{formattedClock}</Text><Text style={[styles.shift,{color:isDarkMode?'#A1B0C2':'#687B94'}]}>Day Shift • 10:00 AM – 07:30 PM</Text></View><View style={[styles.bigStatus,{backgroundColor:statusConfig.soft}]}><Text style={[styles.bigStatusText,{color:statusConfig.color}]}>{statusConfig.label}</Text></View></View>
        <View style={[styles.locationBox,{backgroundColor:isDarkMode?'#142A40':'#F7FAFD',borderColor:isDarkMode?'#263F59':'#E1E9F2'}]}><Navigation size={18} color="#2563EB"/><View style={{flex:1}}><Text style={[styles.locationLabel,{color:isDarkMode?'#A1B0C2':'#73869D'}]}>LOCATION</Text><Text style={[styles.locationText,{color:isDarkMode?'#F4F8FC':'#0B1728'}]} numberOfLines={2}>{address||'Getting your current location…'}</Text></View></View>
        {punchStatus==='BEFORE_PUNCH_IN'||punchStatus==='AFTER_PUNCH_IN' ? <View style={styles.punchZone}><Text style={[styles.actionEyebrow,{color:isDarkMode?'#A1B0C2':'#687B94'}]}>{punchStatus==='BEFORE_PUNCH_IN'?'START YOUR SHIFT':'END YOUR SHIFT'}</Text><Text style={[styles.actionTitle,{color:isDarkMode?'#F4F8FC':'#0B1728'}]}>{punchStatus==='BEFORE_PUNCH_IN'?'Ready when you are':'Slide to punch out'}</Text><SlideToPunchButton onComplete={launchCameraHandler} title={punchLabel==='Punch_in'?'SLIDE TO PUNCH IN':'SLIDE TO PUNCH OUT'}/></View> : punchStatus==='AFTER_PUNCH_OUT' ? <View style={[styles.complete,{backgroundColor:isDarkMode?'#142A40':'#F7FAFD'}]}><View style={styles.completeIcon}><AppIcon name="CheckCircle2" size={34} color="#0FBA83"/></View><Text style={[styles.completeTitle,{color:isDarkMode?'#F4F8FC':'#0B1728'}]}>Work completed</Text><Text style={[styles.completeText,{color:isDarkMode?'#A1B0C2':'#687B94'}]}>Your shift is closed and the recorded hours are saved.</Text><View style={styles.timeRow}><View style={styles.timeBox}><Text style={styles.timeLabel}>PUNCHED IN</Text><Text style={[styles.timeValue,{color:isDarkMode?'#F4F8FC':'#0B1728'}]}>{inTime?moment(inTime,'HH:mm:ss').format('hh:mm A'):'--'}</Text></View><View style={styles.timeBox}><Text style={styles.timeLabel}>PUNCHED OUT</Text><Text style={[styles.timeValue,{color:isDarkMode?'#F4F8FC':'#0B1728'}]}>{outTime?moment(outTime,'HH:mm:ss').format('hh:mm A'):'--'}</Text></View></View><View style={styles.miniMap}><MapView style={{flex:1}} region={mapRegion}><Marker coordinate={mapRegion}><CustomMarker/></Marker></MapView></View></View> : <View style={[styles.complete,{backgroundColor:isDarkMode?'#142A40':'#F7FAFD'}]}><View style={styles.completeIcon}><AppIcon name="CalendarOff" size={34} color="#D97706"/></View><Text style={[styles.completeTitle,{color:isDarkMode?'#F4F8FC':'#0B1728'}]}>On approved leave</Text><Text style={[styles.completeText,{color:isDarkMode?'#A1B0C2':'#687B94'}]}>You do not need to punch attendance for today.</Text></View>}
      </View>
    </ScrollView>
    {cameraVisible&&<Modal visible={cameraVisible} animationType="slide" onRequestClose={()=>setCameraVisible(false)}><CameraScreen onCapture={onPhotoCaptured} onClose={()=>setCameraVisible(false)}/></Modal>}
    {fileUri&&attendanceModalVisible&&<Modal transparent animationType="slide" visible onRequestClose={()=>setAttendanceModalVisible(false)}><View style={punchStyles.modalOverlay}><View style={punchStyles.modalContainer}><View style={punchStyles.BottomView}><Text style={[mainStyles.labelTitle,{color:colors.text}]}>Verify photo • {currentDateLabel} {currentTimeLabel}</Text><ViewShot ref={viewRef} style={punchStyles.imageWithTimestamp}><Image source={{uri:fileUri}} style={{width:250,height:300}}/><Text style={punchStyles.timestamp}>{captureTime}</Text></ViewShot><ButtonOrWaitingMessage/></View></View></View></Modal>}
  </View>
};
const styles=StyleSheet.create({page:{padding:16,paddingBottom:28},mapCard:{borderRadius:20,overflow:'hidden',backgroundColor:'#fff',borderWidth:1,borderColor:'#DCE5F0',marginBottom:12},mapHeader:{padding:13,flexDirection:'row',alignItems:'center',gap:10},mapIcon:{width:38,height:38,borderRadius:12,alignItems:'center',justifyContent:'center'},mapTitle:{fontSize:13,fontWeight:'900'},mapSub:{fontSize:10.5,fontWeight:'600',marginTop:2},mapView:{height:180},statusPill:{paddingHorizontal:8,paddingVertical:6,borderRadius:99,flexDirection:'row',alignItems:'center',gap:5},statusDot:{width:6,height:6,borderRadius:3},statusText:{fontSize:9,fontWeight:'900'},statusCard:{borderRadius:20,borderWidth:1,padding:16},statusTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'},overline:{fontSize:9,fontWeight:'900',letterSpacing:1.1},time:{fontSize:32,fontWeight:'900',marginTop:4},shift:{fontSize:10.5,fontWeight:'700',marginTop:2},bigStatus:{borderRadius:12,paddingHorizontal:10,paddingVertical:8},bigStatusText:{fontSize:9,fontWeight:'900'},locationBox:{marginTop:16,borderWidth:1,borderRadius:14,padding:11,flexDirection:'row',gap:9},locationLabel:{fontSize:9,fontWeight:'900',letterSpacing:1},locationText:{fontSize:12,fontWeight:'700',marginTop:2,lineHeight:17},punchZone:{marginTop:18,paddingTop:16,borderTopWidth:StyleSheet.hairlineWidth,borderTopColor:'#DCE5F0',alignItems:'center'},actionEyebrow:{fontSize:9,fontWeight:'900',letterSpacing:1.1},actionTitle:{fontSize:17,fontWeight:'900',marginTop:4},complete:{marginTop:18,borderRadius:16,padding:16,alignItems:'center'},completeIcon:{width:64,height:64,borderRadius:22,backgroundColor:'#DCF8EE',alignItems:'center',justifyContent:'center',marginBottom:10},completeTitle:{fontSize:19,fontWeight:'900'},completeText:{fontSize:11.5,fontWeight:'600',lineHeight:17,textAlign:'center',marginTop:4,maxWidth:300},timeRow:{width:'100%',flexDirection:'row',justifyContent:'space-between',gap:10,marginTop:16},timeBox:{flex:1,borderRadius:13,padding:12,backgroundColor:'#FFFFFF'},timeLabel:{fontSize:9,fontWeight:'900',color:'#73869D',letterSpacing:.8},timeValue:{fontSize:16,fontWeight:'900',marginTop:5},miniMap:{height:150,width:'100%',borderRadius:14,overflow:'hidden',marginTop:16}});
export default Punch;
