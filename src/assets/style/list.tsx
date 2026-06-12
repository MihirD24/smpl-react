import { StyleSheet, useColorScheme } from 'react-native';

const TaskListStyle = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  return StyleSheet.create({
    monthSelectorContainer: {
      paddingVertical: 5,
    },
    statsRowContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
      paddingHorizontal: 10,
      flexWrap: 'wrap',
    },
    statBox: {
      width: '32%',
      marginVertical: '1%',
      backgroundColor: isDarkMode ? '#3a3a3a' : '#F5F5F5',
      borderWidth: 1,
      borderColor: isDarkMode ? '#3a3a3a' : '#ddd',
      justifyContent: 'center',
    },
    statValue: {
      fontSize: 18,
      color: isDarkMode ? '#FFFFFF' : '#000',
      paddingLeft: 10,
    },
    statLabel: {
      fontSize: 14,
      color: isDarkMode ? '#FFFFFF' : '#000',
      textAlign: 'left',
      paddingLeft: 10,
    },
    bottomView: {
      width: '100%',
      height: '100%',
      padding: 10,
      flex: 1,
      // backgroundColor: isDarkMode ? '#232323' : '#f9f9f9'
    },
    listBox: { padding: 10 },
  });
};

export default TaskListStyle;
