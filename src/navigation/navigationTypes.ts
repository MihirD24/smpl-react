import {
  NativeStackScreenProps,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import {
  BottomTabNavigationProp,
  BottomTabScreenProps as RNBottomTabScreenProps,
} from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';

export type AuthStackParamList = {
  signIn: undefined;
};

export type AppStackParamList = {
  AdminTabNavigator: undefined;

  TabNavigator: {
    screen: keyof BottomTabParamList;
  };
  TaskList: {
    task_status: 'Pending' | 'Working' | 'Completed By Developer' | 'Re Open';
  };
  TaskDetail: {
    data: {
      id: string;
      status: string;
      priority?: 'High' | 'Medium' | 'Low';
    };
  };
  TaskDiscussion: {
    task_id: string;
  };
  UpdateTask: { data: any };
  Attendancelist: undefined;
  LeaveList: undefined;
  AddLeave: {};
  AddProjectReminder: undefined;

  WorkLog: undefined;
  AdminDashboard: undefined;
  AdminAttendancelist: undefined;
  AttendanceFilter:
    | {
        monthYear?: string;
        onMonthChange?: (month: string) => void; // 👈 add callback
      }
    | undefined;
  PunchInPage: {
    address: string;
    currentTimeLabel: string;
    currentDateLabel: string;
    punchLabel: 'Punch_in' | 'Punch_out';
  };
  AddTask: undefined;
  NotificationScreen: undefined;
  Project: undefined;
  ModuleList: {
    projectData: {
      project_id: number;
    };
  };
  ModuelTaskList: {
    module_id: number;
  };
  AddModule: {
    ProjectId: number;
  };
  HolidayList: undefined;
  showImage: {
    url: string;
  };
  showMap: {
    lat: number;
    long: number;
  };
  PerformanceReport: undefined;
  // ProjectList: undefined;
  Salary: undefined;
  ModuleTaskList: undefined;
  ProjectReminder: undefined;
  AddProjectReminderScreen: undefined;
  AddProjectRemainingScreen: undefined;
  ProjectRemainingScreen: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Punch: undefined;
  Profile: undefined;
  // TransactionList: undefined;
  staffSalary: undefined;
};

// Props for Screens with Navigation & Route
export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;
export type AppStackScreenProps<T extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, T>;
export type BottomTabScreenProps<T extends keyof BottomTabParamList> =
  RNBottomTabScreenProps<BottomTabParamList, T>;

// Composite navigation type for navigating from Bottom Tab to App Stack
export type TabWithStackNavProp<T extends keyof BottomTabParamList> =
  CompositeNavigationProp<
    BottomTabNavigationProp<BottomTabParamList, T>,
    NativeStackNavigationProp<AppStackParamList>
  >;

// Composite navigation type for navigating from App Stack to Bottom Tab
export type StackWithTabNavProp<T extends keyof AppStackParamList> =
  CompositeNavigationProp<
    NativeStackNavigationProp<AppStackParamList, T>,
    BottomTabNavigationProp<BottomTabParamList>
  >;
