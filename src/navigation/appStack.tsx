import React from 'react';
import { useColorScheme } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ShowImage from '../screens/imageMap/showImage';
import ShowMap from '../screens/imageMap/showMap';
import TaskList from '../screens/task/taskList';
import TaskDetail from '../screens/task/taskDetail';
import TaskDiscussion from '../screens/task/taskDiscussion';
import UpdateTask from '../screens/task/updateTask';
import Attendancelist from '../screens/attandance/attendanceList';
import LeaveList from '../screens/leave/leaveList';
import AddLeave from '../screens/leave/addLeave';
import WorkLog from '../screens/task/workLog';
import AdminAttendancelist from '../screens/attandance/admin/adminAttendance';
import AddTask from '../screens/task/addTask';
import ProjectList from '../screens/profile/project/projectList';
import ModuleList from '../screens/profile/project/module/moduleList';
import AddModule from '../screens/profile/project/module/addModule';
import NotificationScreen from '../screens/notification/notificationScreen';
import TabNavigator from './tabNavigator';
import HolidayList from '../screens/profile/holiday/holidayList';
import { AppStackParamList } from './navigationTypes';
import AdminTabNavigator from './adminTabNavigator';
import { useAuth } from '../context/authContext';
import AttendanceFilter from '../screens/attandance/attendanceFilter';
import performanceReport from '../screens/home/performanceReport';
import Salary from '../screens/profile/salary/salary';
import moduleTaskList from '../screens/profile/project/module/moduleTaskList';
import projectReminder from '../screens/profile/projectRemain/projectReminder';
import addProjectReminder from '../screens/profile/projectRemain/addProjectReminder';
import AddProjectRemainingScreen from '../screens/profile/projectRemain/addProjectRemainingScreen';
import ProjectRemainingScreen from '../screens/profile/projectRemain/projectRemainingScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppStack = ({
  initialRoute,
}: {
  initialRoute: keyof AppStackParamList;
}) => {
  const { userInfo } = useAuth();
  const isDarkMode = useColorScheme() === 'dark';

  // Dynamically set header styles based on dark mode
  const headerStyle = {
    backgroundColor: isDarkMode ? '#111827' : '#FFFFFF',
  };

  const headerTintColor = isDarkMode ? '#F9FAFB' : '#000000';
  const detailHeaderOptions = (title: string) => ({
    headerShown: true,
    title,
    headerStyle,
    headerTintColor,
    headerTitleStyle: {
      color: headerTintColor,
      fontWeight: '600' as const,
    },
    headerBackTitle: '',
    headerBackVisible: true,
  });

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: headerStyle, // Dynamically set header background color
        headerTintColor: headerTintColor, // White/black title and back button
        headerTitleStyle: { color: headerTintColor }, // White/black title text
        headerBackButtonDisplayMode: 'minimal',
      }}
      initialRouteName={
        userInfo?.role === 'Owner' ? 'AdminTabNavigator' : 'TabNavigator'
      }
    >
      {userInfo?.role === 'Owner' ? (
        <Stack.Screen
          name="AdminTabNavigator"
          component={AdminTabNavigator}
          options={{
            headerShown: false,
            headerBackTitle: '',
            headerBackVisible: true,
          }}
        />
      ) : (
        <Stack.Screen
          name="TabNavigator"
          component={TabNavigator}
          options={{
            headerShown: false,
            headerBackTitle: '',
            headerBackVisible: true,
          }}
        />
      )}

      <Stack.Screen
        name="showImage"
        component={ShowImage}
        options={{
          headerShown: false,
          headerBackTitle: '',
          headerBackVisible: true,
        }}
      />
      <Stack.Screen
        name="showMap"
        component={ShowMap}
        options={{
          headerShown: false,
          title: 'Attendance Location',
          headerBackTitle: '',
          headerBackVisible: true,
        }}
      />
      <Stack.Screen
        name="TaskList"
        component={TaskList}
        options={detailHeaderOptions('Task List')}
      />
      <Stack.Screen
        name="TaskDetail"
        component={TaskDetail}
        options={detailHeaderOptions('Task Detail')}
      />
      <Stack.Screen
        name="TaskDiscussion"
        component={TaskDiscussion}
        options={detailHeaderOptions('Task Discussion')}
      />
      <Stack.Screen
        name="UpdateTask"
        component={UpdateTask}
        options={detailHeaderOptions('Update Task')}
      />
      <Stack.Screen
        name="Attendancelist"
        component={Attendancelist}
        options={detailHeaderOptions('Attendance List')}
      />
      <Stack.Screen
        name="AttendanceFilter"
        component={AttendanceFilter}
        options={detailHeaderOptions('Attendance Calendar')}
      />
      <Stack.Screen
        name="LeaveList"
        component={LeaveList}
        options={detailHeaderOptions('Leave Requests')}
      />

      <Stack.Screen
        name="AddLeave"
        component={AddLeave}
        options={detailHeaderOptions('Leave Requests')}
      />

      <Stack.Screen
        name="WorkLog"
        component={WorkLog}
        options={detailHeaderOptions('Work Log')}
      />

      <Stack.Screen
        name="AdminAttendancelist"
        component={AdminAttendancelist}
        options={detailHeaderOptions('Attendance List')}
      />

      <Stack.Screen
        name="AddTask"
        component={AddTask}
        options={detailHeaderOptions('Add New Task')}
      />
      <Stack.Screen
        name="NotificationScreen"
        component={NotificationScreen}
        options={detailHeaderOptions('Notifications')}
      />
      <Stack.Screen
        name="Project"
        component={ProjectList}
        options={detailHeaderOptions('Projects')}
      />
      <Stack.Screen
        name="ModuleList"
        component={ModuleList}
        options={detailHeaderOptions('Module List')}
      />
      <Stack.Screen
        name="ModuleTaskList"
        component={moduleTaskList}
        options={detailHeaderOptions('Module Task List')}
      />
      <Stack.Screen
        name="AddModule"
        component={AddModule}
        options={detailHeaderOptions('Add New Module')}
      />
      <Stack.Screen
        name="HolidayList"
        component={HolidayList}
        options={detailHeaderOptions('Holiday List')}
      />
      <Stack.Screen
        name="PerformanceReport"
        component={performanceReport}
        options={detailHeaderOptions('Performance Report')}
      />
      <Stack.Screen
        name="Salary"
        component={Salary}
        options={detailHeaderOptions('Salary')}
      />
      <Stack.Screen
        name="ProjectReminder"
        component={projectReminder}
        options={{
          headerShown: true,
          title: 'Reminders',
          headerBackTitle: '',
          headerBackVisible: true,
        }}
      />
      <Stack.Screen
        name="AddProjectReminder"
        component={addProjectReminder}
        options={{
          headerShown: true,
          title: 'Add Reminder',
          headerBackTitle: '',
          headerBackVisible: true,
        }}
      />
      <Stack.Screen
        name="AddProjectRemainingScreen"
        component={AddProjectRemainingScreen}
        options={{
          headerShown: true,
          title: 'Add Project Remaining',
          headerBackTitle: '',
          headerBackVisible: true,
        }}
      />
      <Stack.Screen
        name="ProjectRemainingScreen"
        component={ProjectRemainingScreen}
        options={{
          headerShown: true,
          title: 'Project Remaining',
          headerBackTitle: '',
          headerBackVisible: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default AppStack;
