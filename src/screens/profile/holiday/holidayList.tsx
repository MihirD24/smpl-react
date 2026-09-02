import {
  View,
  Text,
  RefreshControl,
  FlatList,
  ListRenderItem,
  useColorScheme,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import SearchBarComponent from '../../../components/searchBarComponent';
import { useIsFocused } from '@react-navigation/native';
import LeaveCardSkeleton from '../../../skeletonview/leaveCardSkeleton';
import HolidayCard from './holidayCard';
import { getHolidayList } from '../../../services';
import { AppStackScreenProps } from '../../../navigation/navigationTypes';
import MainStyle from '../../../assets/style/maincss';
import ScreenWrapper from '../../../components/screenWrapper';
import AppIcon from '../../../components/appIcon';
import { moderateScale } from 'react-native-size-matters';

import { Holiday } from '../../../types/holiday';
import NetInfoComponent from '../../../components/netinfoComponent';
const HolidayList: React.FC<AppStackScreenProps<'HolidayList'>> = ({}) => {
  const MainStyles = MainStyle();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(true);
  const [filterHolidayData, setFilterHolidayData] = useState<Holiday[]>([]);
  const [masterHolidayData, setMasterHolidayData] = useState<Holiday[]>([]);
  const [search, setSearch] = useState<string>('');


  const getHolidayData = async () => {
    try {
      const response = await getHolidayList();
      setFilterHolidayData(response);
      setMasterHolidayData(response);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const searchFilter = (text: string) => {
    if (text) {
      const newData = masterHolidayData.filter(item => {
        const holidayData = item?.date;
        const holidayName = item?.name;

        const reasonData = holidayData ? String(holidayData).toLowerCase() : '';
        const userNameData = holidayName
          ? String(holidayName).toLowerCase()
          : '';

        const textData = text.toLowerCase();
        return (
          reasonData.indexOf(textData) > -1 ||
          userNameData.indexOf(textData) > -1
        );
      });
      setFilterHolidayData(newData);
      setSearch(text);
    } else {
      setFilterHolidayData(masterHolidayData);
      setSearch(text);
    }
  };

  useEffect(() => {
    if (isFocused) {
      getHolidayData();
    }

    return () => {};
  }, [isFocused]);

  const renderJobInfo: ListRenderItem<Holiday> = ({ item }) => {
    return <HolidayCard holidayData={item} />;
  };
  return (
    <ScreenWrapper
      withHeader
      statusBarTranslucent
      statusBarStyle={isDarkMode ? 'light-content' : 'dark-content'}
      backgroundColor={isDarkMode ? '#0F172A' : '#F8FAFC'}
    >
      <NetInfoComponent onReconnect={getHolidayData} />
      <View style={MainStyles.mainContainer}>
        <SearchBarComponent onChangeText={searchFilter} value={search} />
        {/* {!loading && filterHolidayData.length === 0 && (
        <View style={MainStyles.noDataContainer}>
          <Text style={MainStyles.noDataText}>No Holiday Data Found</Text>
        </View>
      )} */}
        {loading ? (
          <FlatList
            data={[1, 2, 3, 4, 5]}
            keyExtractor={(_, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={() => <LeaveCardSkeleton />}
          />
        ) : (
          <FlatList
            data={filterHolidayData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderJobInfo}
            horizontal={false}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={getHolidayData}
                tintColor={isDarkMode ? '#93C5FD' : '#2563EB'}
              />
            }
            contentContainerStyle={{
              flexGrow: 1,
            }}
            ListEmptyComponent={
              <View style={MainStyles.noDataContainer}>
                <AppIcon
                  name="PartyPopper"
                  size={moderateScale(48)}
                  color="#D1D5DB"
                />

                <Text style={MainStyles.noDataText}>No Holiday Data Found</Text>
              </View>
            }
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

export default HolidayList;


