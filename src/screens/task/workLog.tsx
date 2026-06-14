import React, { useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TaskCard from './taskCard';
import moment from 'moment';
import MainStyle from '../../assets/style/maincss';
import TaskListStyle from '../../assets/style/list';
import { getTaskByStatus } from '../../services';
import WorkLogCardSkeleton from '../../skeletonview/workLogSkeleton';
import DateScrollBar from '../../components/dateScrollBarSeperateMonth';
import { AppStackScreenProps } from '../../navigation/navigationTypes';
import { TaskData } from '../../types/taskData';
import ScreenWrapper from '../../components/screenWrapper';
import AppIcon from '../../components/appIcon';
import { moderateScale } from 'react-native-size-matters';
import NetInfoComponent from '../../components/netinfoComponent';

const WorkLog: React.FC<AppStackScreenProps<'WorkLog'>> = ({ navigation }) => {
  const isDarkMode = useColorScheme() === 'dark';
  const mainStyles = MainStyle();
  const attandanceListStyles = TaskListStyle();
  const [selectedDate, setSelectedDate] = useState(moment().format('DD'));
  const [monthYear, setMonthYear] = useState(moment().format('YYYY-MM'));
  const [taskData, setTaskData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(true);
  const [loginUserRole, setLoginUserRole] = useState('');

  const handleDateSelected = (date: string) => {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    setSelectedDate(moment(date).format('DD'));
    worklogData(formattedDate);
  };

  const loginUser = async () => {
    let userdata = await AsyncStorage.getItem('userInfo');
    if (!userdata) return;
    setLoginUserRole(JSON.parse(userdata).role);
  };

  useEffect(() => {
    loginUser();
    worklogData(moment().format('YYYY-MM-DD'));
  }, []);

  const worklogData = async (date: string) => {
    try {
      const { success, data } = await getTaskByStatus('byDate', { date });

      if (success) {
        setTaskData(data);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log('Error fetching work logs:', error.message);
      }
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const renderJobInfo = ({ item }: { item: TaskData }) => {
    return (
      <TaskCard
        taskData={item}
        role={loginUserRole}
        key={item.id}
        navigation={navigation}
      />
    );
  };

  return (
    <ScreenWrapper
      withHeader
      statusBarTranslucent
      statusBarStyle={isDarkMode ? 'light-content' : 'dark-content'}
      backgroundColor={isDarkMode ? '#111827' : '#F7F8FA'}
    >
        <NetInfoComponent onReconnect={loginUser} />
      <View style={mainStyles.BottomView}>
        {/* Top Section */}
        <View style={mainStyles.topSection}>
          <DateScrollBar
            selectedDate={selectedDate}
            initialMonthYear={moment().format('YYYY-MM')}
            onDateSelected={handleDateSelected}
          />
        </View>

        {/* Main Content */}
        {loading ? (
          <View style={{ padding: 10 }}>
            <FlatList
              data={[1, 1, 1, 1, 1]}
              showsVerticalScrollIndicator={false}
              renderItem={() => <WorkLogCardSkeleton />}
            />
          </View>
        ) : taskData.length === 0 ? (
          <View style={mainStyles.noDataContainer}>
            <AppIcon
              name="FolderOpen"
              size={moderateScale(48)}
              color="#D1D5DB"
            />
            <Text style={mainStyles.noDataText}>No Data Found</Text>
          </View>
        ) : (
          <View style={attandanceListStyles.listBox}>
            <FlatList
              data={taskData}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderJobInfo}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: '55%' }}
              refreshControl={
                <RefreshControl
                  refreshing={!loading && refreshing}
                  onRefresh={() => {
                    const fullDate = `${monthYear}-${selectedDate}`;
                    const formattedDate = moment(fullDate, 'YYYY-MM-DD').format(
                      'YYYY-MM-DD',
                    );
                    worklogData(formattedDate);
                  }}
                />
              }
            />
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default WorkLog;
