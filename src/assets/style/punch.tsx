import { useTheme } from '@react-navigation/native';
import { StyleSheet, useColorScheme } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

const PunchStyle = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { colors } = useTheme();

  const bg = isDarkMode ? '#0F172A' : '#F8FAFC';
  const card = isDarkMode ? '#1E293B' : '#FFFFFF';
  const border = isDarkMode ? '#334155' : '#E2E8F0';
  const text = isDarkMode ? '#F8FAFC' : '#0F172A';
  const muted = isDarkMode ? '#94A3B8' : '#64748B';

  return StyleSheet.create({
    scrollContainer: {
      flex: 1,
      backgroundColor: bg,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: verticalScale(30),
    },
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      margin: scale(10),
      width: '95%',
      height: '50%',
      overflow: 'hidden',
      borderRadius: moderateScale(16),
      borderWidth: 1,
      borderColor: border,
      alignSelf: 'center',
    },
    map: {
      width: '100%',
      height: '100%',
    },
    waitingMessage: {
      fontSize: moderateScale(14),
      color: muted,
      textAlign: 'center',
      marginVertical: verticalScale(10),
    },
    mainView: {
      marginTop: verticalScale(20),
      marginBottom: verticalScale(10),
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    markerContainer: {
      width: moderateScale(40),
      height: moderateScale(40),
      borderRadius: moderateScale(20),
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    },
    markerImage: {
      width: '100%',
      height: '100%',
      borderRadius: moderateScale(20),
    },
    bottomBar: {
      backgroundColor: card,
      borderTopLeftRadius: moderateScale(20),
      borderTopRightRadius: moderateScale(20),
      padding: moderateScale(20),
      height: '100%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 8,
    },
    punchView: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: verticalScale(20),
      paddingVertical: verticalScale(10),
      borderBottomWidth: 1,
      borderBottomColor: border,
    },
    locationInfo: {
      alignItems: 'flex-start',
      marginBottom: verticalScale(10),
    },
    sliderContainer: {
      backgroundColor: '#1D4ED8',
      borderRadius: moderateScale(20),
      elevation: 5,
      shadowColor: '#2563EB',
      shadowOpacity: 0.3,
      shadowRadius: 10,
    },
    punchLabel: {
      fontSize: moderateScale(16),
      color: text,
      fontWeight: '600',
    },
    punchButtonContainer: {
      alignItems: 'center',
      marginBottom: verticalScale(20),
    },
    punchTime: {
      fontSize: moderateScale(14),
      color: muted,
      fontWeight: '500',
    },
    submit: {
      fontSize: moderateScale(16),
      color: text,
      textAlign: 'center',
      marginTop: verticalScale(15),
      fontWeight: '600',
    },
    punchButton: {
      backgroundColor: '#2563EB',
      padding: moderateScale(12),
      borderRadius: moderateScale(12),
      alignItems: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: moderateScale(16),
      fontWeight: '600',
    },
    swipeAction: {
      backgroundColor: '#2563EB',
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingHorizontal: moderateScale(20),
      width: moderateScale(250),
    },
    actionText: {
      color: 'white',
      fontSize: moderateScale(16),
      fontWeight: '600',
    },
    arrowImage: {
      width: moderateScale(20),
      height: moderateScale(20),
      marginTop: verticalScale(5),
      tintColor: '#2563EB',
    },
    saveIcon: {
      width: moderateScale(24),
      height: moderateScale(24),
      tintColor: text,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContainer: {
      width: '85%',
      backgroundColor: card,
      borderRadius: moderateScale(20),
      padding: moderateScale(20),
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: moderateScale(10),
    },
    BottomView: {
      marginTop: verticalScale(20),
    },
    timestamp: {
      position: 'absolute',
      bottom: verticalScale(10),
      left: moderateScale(20),
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      color: 'white',
      padding: moderateScale(5),
      fontSize: moderateScale(14),
      borderRadius: moderateScale(5),
    },
    imageWithTimestamp: {
      position: 'relative',
    },
  });
};

export default PunchStyle;
