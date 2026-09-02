import { useTheme } from '@react-navigation/native';
import { StyleSheet, useColorScheme } from 'react-native';
import { moderateScale, verticalScale } from 'react-native-size-matters';

const MainStyle = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { colors } = useTheme();
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      backgroundColor: colors.card,
      margin: 10,
      borderRadius: 16,
      shadowColor: isDarkMode ? '#000000' : '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 3,
    },
    headerWelcome: {
      fontSize: 14,
      color: isDarkMode ? '#94A3B8' : '#64748B',
      fontWeight: '500',
    },
    headerUsername: {
      fontSize: 18,
      color: colors.text,
      fontWeight: '700',
    },
    safeContent: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerLight: {
      backgroundColor: '#FFFFFF', // Light mode header background
    },
    headerDark: {
      backgroundColor: '#1E293B', // Dark mode header background
    },
    mainContainer: {
      flex: 1,
      paddingHorizontal: moderateScale(16),
      paddingTop: 10,
      paddingBottom: 5,
    },
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    cardContainer: {
      backgroundColor: colors.card,
      padding: 15,
      borderRadius: 16,
      shadowColor: isDarkMode ? '#000000' : '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 12,
      elevation: 2,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    topView: {
      width: '100%',
      padding: 10,
      backgroundColor: '#232323',
      borderColor: '#232323',
      borderBottomWidth: 0.5,
    },
    row: {
      flexDirection: 'row',
    },
    flexItem: {
      flex: 1,
      paddingRight: 10,
    },
    mainView: {
      marginTop: 10,
      marginBottom: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    labelSize: {
      fontSize: 14,
      color: colors.text,
      // fontFamily: 'PTSans-Regular',
    },
    textInput: {
      height: 52,

      padding: 14,
      paddingHorizontal: 7,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderWidth: moderateScale(1),
      borderColor: '#E5E7EB',
      borderRadius: moderateScale(8),
      // paddingHorizontal: moderateScale(12),
      paddingVertical: verticalScale(12),
    },
    textArea: {
      textAlignVertical: 'top',

      height: 100,

      padding: 12,
      paddingHorizontal: 7,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderWidth: moderateScale(1),
      borderColor: '#E5E7EB',
      borderRadius: moderateScale(8),
      // paddingHorizontal: moderateScale(12),
      paddingVertical: verticalScale(12),
    },
    box: {
      backgroundColor: '#fff',
      width: '100%',
      height: 100,
      borderRadius: 10,
      borderWidth: 2,
      marginVertical: '2%',
      padding: 13,
      borderColor: '#FFF',
    },
    Images: {
      alignSelf: 'center',
      marginRight: 10,
    },
    boxTitle: {
      color: '#232323',
      fontSize: 20,
      alignSelf: 'center',
      marginTop: 13,
      marginLeft: '10%',
      fontWeight: 'bold',
      width: '70%',
    },
    backBtn: {
      width: 50,
      height: 50,
      marginTop: 10,
      alignItems: 'center',
      alignContent: 'center',
      alignSelf: 'center',
    },
    dropdown: {
      // height: 60,
      paddingVertical: moderateScale(7),
      paddingHorizontal: moderateScale(7),

      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderWidth: moderateScale(1),
      borderColor: '#E5E7EB',
      borderRadius: moderateScale(8),
    },
    containerStyle: {
      backgroundColor: colors.background, // Set your desired background color
      borderRadius: moderateScale(8), // Optional: add rounded corners
      padding: moderateScale(10), // Optional: add some padding for better UI
      elevation: moderateScale(2), // Optional: add shadow for better visibility
      color: colors.text,
    },
    itemContainer: {
      paddingVertical: moderateScale(10),
      paddingHorizontal: moderateScale(15),
      backgroundColor: colors.background,
    },
    selectedItem: {
      backgroundColor: colors.background, // Highlight color for selected item
    },
    itemText: {
      color: colors.text,
      fontSize: moderateScale(18),
    },
    selectedStyle: {
      borderRadius: moderateScale(12),
      margin: moderateScale(16),
    },
    formlabel: {
      fontSize: moderateScale(16),
      marginHorizontal: moderateScale(16),
      marginTop: moderateScale(10),
      color: colors.text,
      fontFamily: 'PTSans-Regular',
    },
    placeholderStyle: {
      fontSize: moderateScale(16),
      marginLeft: moderateScale(10),
      color: '#c0c0c0',
      borderColor: 'grey',
    },
    selectedTextStyle: {
      fontSize: moderateScale(14),
      marginLeft: moderateScale(10),
      color: colors.text,
    },
    iconStyle: {
      width: moderateScale(20),
      height: moderateScale(20),
      tintColor: colors.notification,
    },
    inputSearchStyle: {
      // height: 40,
      fontSize: moderateScale(16),
      color: colors.text,
      backgroundColor: colors.background,
    },
    itemTextStyle: {
      color: '#000000',
    },
    itemTextWhite: {
      color: '#FFFFFF',
    },
    textItem: {
      flex: 1,
      fontSize: moderateScale(16),
      color: colors.text,
    },
    buttonWidth100: {
      width: '100%',
    },
    buttonWidth95: {
      width: '95%',
    },
    button: {
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: moderateScale(10),
      paddingHorizontal: moderateScale(15),
      marginVertical: moderateScale(15),
      // elevation: 3,
      // marginLeft: 10,
      // marginRight: 10,
      borderRadius: 10,
      flexDirection: 'row',
    },
    buttonLabel: {
      fontSize: moderateScale(20),
      color: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'PTSans-Regular',
    },
    ButtonText: {
      fontWeight: 'bold',
      color: '#fff',
    },
    buttonGreen: {
      backgroundColor: '#0eaa6e',
    },
    buttonDarkGreen: {
      backgroundColor: '#3a3a3a',
    },
    buttonBlue: {
      backgroundColor: '#4169E1',
    },
    buttonWhite: {
      backgroundColor: '#FFF',
    },
    buttonBlack: {
      backgroundColor: '#232323',
    },
    buttonSoftGray: {
      backgroundColor: '#4169E1',
    },
    buttonBroun: {
      backgroundColor: '#832b29',
    },
    buttonRed: {
      backgroundColor: '#d74836',
    },
    buttonOrange: {
      backgroundColor: '#008080',
    },
    buttonRedLight: {
      backgroundColor: '#FF6057',
    },
    buttonGray: {
      backgroundColor: '#708090',
    },
    buttonPeachOrange: {
      backgroundColor: '#FF6347',
    },
    buttonIris: {
      backgroundColor: '#4B0082',
    },
    buttonYellow: {
      backgroundColor: '#FFEB3B',
    },
    bottomMargin: {
      marginBottom: moderateScale(5),
    },
    colorWhite: {
      color: '#FFFFFF',
    },
    buttonLable: {
      color: colors.text,
      marginLeft: moderateScale(5),
      fontFamily: 'PTSans-Regular',
    },
    labelTitle: {
      color: colors.text,
      alignItems: 'center',
      justifyContent: 'center',
    },
    flexRow: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
    searchView: {
      width: '100%',
      height: 50,
      flexDirection: 'row',
      borderColor: colors.border,
      backgroundColor: '#F2F3F5',
      borderWidth: moderateScale(1),
      borderRadius: moderateScale(8),
      paddingHorizontal: moderateScale(10),
      alignItems: 'center',
      // shadowColor: '#232323',
      // elevation: 5,
      marginBottom: moderateScale(10),
    },
    searchIcon: {
      marginRight: moderateScale(5),
      // backgroundColor: '#CCD1D9',
    },
    searchTextBox: {
      flex: 1,
      fontSize: moderateScale(16), // Explicit font size
      height: moderateScale(40), // Define a consistent height
      padding: 0, // Remove default padding
      color: isDarkMode ? '#FFFFFF' : '#232323', // Text color
      paddingLeft: moderateScale(5), // Spacing for input text
    },
    viewBtn: {
      position: 'absolute',
      bottom: 40,
      right: 20,
      height: 70,
      width: 70,
    },
    btn: {
      height: moderateScale(70),
      width: moderateScale(70),
      backgroundColor: '#232323',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: moderateScale(50),
    },
    txtBtn: {
      textAlign: 'center',
      fontSize: moderateScale(21),
      color: 'white',
      fontWeight: 'bold',
    },
    BottomView: {
      flex: 1,
    },
    noDataContainer: {
      flex: 1,
      // backgroundColor:'red',
      alignItems: 'center',
      justifyContent: 'center',
    },
    noDataText: {
      color: isDarkMode ? '#f5f5f5' : '#232323',
      alignSelf: 'center',
    },
    disabledButton: {
      backgroundColor: '#c0c0c0', // Set your desired color for the disabled state
      opacity: 0.7, // Adjust the opacity to indicate it's disabled
    },
    bottomFloatingButton: {
      position: 'absolute',
      bottom: moderateScale(75),
      right: 20,
      alignSelf: 'flex-end',
      width: '40%', // Adjust width to fit better on screen
      marginVertical: moderateScale(8),
      borderRadius: 13,
      elevation: 6,
      shadowColor: '#232323',
      shadowRadius: moderateScale(10),
      shadowOffset: { width: moderateScale(2), height: moderateScale(2) }, // Optional: rounded corners
    },
    topSection: {
      backgroundColor: colors.background,
      shadowColor: colors.notification,
      shadowOffset: { width: 0, height: moderateScale(10) },
      shadowOpacity: 0.15,
      shadowRadius: moderateScale(10),
      elevation: 10,
      borderRadius: moderateScale(10),
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
  });
};

export default MainStyle;
