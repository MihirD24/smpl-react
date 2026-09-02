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
              <Text style={styles.locationLabel}>LOCATION ADDRESS</Text>

              <Text style={styles.address}>{address}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.rowBetween}>
              <View>
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
              title={`Slide To ${
                punchLabel === 'Punch_in' ? ' Punch In' : 'Punch Out'
              }`}
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
              <Text style={styles.locationLabel}>LOCATION ADDRESS</Text>

              <Text style={styles.address}>{address}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.rowBetween}>
              <View>
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
              title={`Slide To ${
                punchLabel === 'Punch_in' ? ' Punch In' : ' Punch Out'
              }`}
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
            <Text style={styles.completedTitle}>Work Completed</Text>
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
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(10),
    position: 'absolute',
    bottom: scale(10),
  },
  mapContainer: {
    margin: scale(10),
    width: '100%',
    height: verticalScale(280),
    borderRadius: moderateScale(18),
    overflow: 'hidden',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomCard: {
    padding: moderateScale(18),
    borderRadius: moderateScale(18),
    width: '92%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    position: 'absolute',
    top: verticalScale(210),
  },
  bottomCardOut: {
    padding: moderateScale(18),
    borderRadius: moderateScale(18),
    width: '92%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginTop: verticalScale(20),
  },
  currentTimeLabel: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  bigTime: {
    fontSize: moderateScale(28),
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subText: {
    fontSize: moderateScale(12),
    color: '#64748B',
    marginBottom: verticalScale(8),
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: verticalScale(14),
  },
  locationContainer: {
    paddingHorizontal: moderateScale(40),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(12),
    marginTop: verticalScale(7),
  },
  locationLabel: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  address: {
    fontSize: moderateScale(13),
    marginTop: verticalScale(4),
    lineHeight: moderateScale(18),
  },
  rowBetween: {
    marginTop: verticalScale(14),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shiftText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: '#2563EB',
  },
  completedCard: {
    padding: moderateScale(16),
    borderRadius: moderateScale(16),
    alignItems: 'center',
  },
  completedTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  completedDesc: {
    marginTop: verticalScale(4),
    textAlign: 'center',
    fontSize: moderateScale(12),
    color: '#64748B',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(18),
  },
  timeBox: {
    width: '48%',
    padding: moderateScale(14),
    borderRadius: moderateScale(14),
  },
  timeValue: {
    marginTop: verticalScale(6),
    fontSize: moderateScale(15),
    fontWeight: '700',
  },
  miniMap: {
    height: verticalScale(140),
    borderRadius: moderateScale(14),
    overflow: 'hidden',
    marginTop: verticalScale(40),
  },
  punchOutChip: {
    borderTopRightRadius: moderateScale(14),
    borderTopLeftRadius: moderateScale(14),
    paddingHorizontal: moderateScale(14),
    paddingVertical: verticalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  punchOutChipLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  punchOutChipTitle: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    marginLeft: scale(4),
  },
  punchOutChipAddress: {
    fontSize: moderateScale(11),
    color: '#64748B',
    flexShrink: 1,
    marginLeft: scale(8),
    textAlign: 'right',
  },
  loaderText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(13),
    color: '#64748B',
  },
});
