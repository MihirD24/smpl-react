import { useTheme } from '@react-navigation/native';
import { StyleSheet, useColorScheme } from 'react-native';
const PunchStyle = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { colors } = useTheme();
  return StyleSheet.create({
    scrollContainer: {
      flex: 1,
      backgroundColor: colors.background, // Background color for the entire screen
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 30, // Adds space at the bottom
    },
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      margin: 10,
      width: '95%',
      height: '50%',
      overflow: 'hidden',
      borderRadius: 15,
      borderWidth: 0.5,
      borderColor: '#000',
      alignSelf: 'center', // Centers the container horizontally in the parent view
    },
    map: {
      width: '100%',
      height: '100%',
    },
    waitingMessage: {
      fontSize: 15,
      color: colors.text,
      textAlign: 'center',
      marginVertical: 10,
    },
    mainView: {
      marginTop: 20,
      marginBottom: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    markerContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    },
    markerImage: {
      width: '100%',
      height: '100%',
      borderRadius: 20,
    },
    bottomBar: {
      backgroundColor: colors.card, // Light, neutral background
      borderTopLeftRadius: 15, // Slightly more rounded for a modern touch
      borderTopRightRadius: 15, // Slightly more rounded for a modern touch
      padding: 20,
      // elevation: 10, // Subtle shadow for a premium feel
      // marginBottom: 20,
      height: '100%',
      shadowColor: '#000', // Shadow details for iOS
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
    },
    punchView: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      paddingVertical: 10, // Add some vertical spacing
      borderBottomWidth: 0.5,
      borderBottomColor: isDarkMode ? '#FFFFFF' : '#000000', // Light border for sections
    },
    locationInfo: {
      alignItems: 'flex-start',
      marginBottom: 10,
    },
    sliderContainer: {
      backgroundColor: '#232323', // Corporate blue
      borderRadius: 20, // Rounded buttons for a clean look
      elevation: 5,
      shadowColor: isDarkMode ? '#FFFFFF' : '#000000',
      shadowOpacity: 0.2,
      shadowRadius: 10,
    },
    punchLabel: {
      fontSize: 16,
      color: isDarkMode ? '#FFFFFF' : '#000000', // Use the corporate blue color
      fontWeight: '600', // Medium font weight for emphasis
    },
    punchButtonContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    punchTime: {
      fontSize: 15,
      color: '#6C757D', // Muted gray for secondary text
      fontWeight: '500',
    },
    submit: {
      fontSize: 16,
      color: colors.text, // Green for success
      textAlign: 'center',
      marginTop: 15,
      fontWeight: '600',
    },
    punchButton: {
      backgroundColor: '#0056A1', // Corporate blue
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    buttonText: {
      color: '#FFFFFF', // Contrasting white text
      fontSize: 16,
      fontWeight: '600',
    },
    swipeAction: {
      backgroundColor: '#FF8800', // Bright orange for actions
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingHorizontal: 20,
      width: 250,
    },
    actionText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    arrowImage: {
      width: 20,
      height: 20,
      marginTop: 5,
      tintColor: '#0056A1', // Corporate blue for the arrow
    },

    saveIcon: {
      width: 24,
      height: 24,
      tintColor: '#232323',
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center', // Center the modal vertically
      alignItems: 'center', // Center the modal horizontally
      backgroundColor: 'rgba(37, 2, 2, 0.5)', // Semi-transparent background for overlay effect
    },
    modalContainer: {
      width: '80%', // Adjust the width to be 80% of the screen
      backgroundColor: colors.card, // Modal background color
      borderRadius: 10, // Rounded corners
      padding: 20, // Add padding inside the modal
      elevation: 10, // Shadow effect on Android
      shadowColor: '#232323', // Shadow on iOS
      shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
      shadowOpacity: 0.25, // Shadow opacity for iOS
      shadowRadius: 4, // Shadow radius for iOS
    },
    BottomView: {
      marginTop: 20, // Adjust the spacing between sections
    },
    timestamp: {
      position: 'absolute',
      bottom: 10, // Adjust this value as needed
      left: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      color: 'white',
      padding: 5,
      fontSize: 16,
      borderRadius: 5,
    },
    imageWithTimestamp: {
      position: 'relative',
    },
  });
};

export default PunchStyle;
