import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import MainStyle from '../../../../assets/style/maincss';
import { useIsFocused } from '@react-navigation/native';
import ModuleCard from './moduleCard';
import SearchBarComponent from '../../../../components/searchBarComponent';
import ModuleCardSkeleton from '../../../../skeletonview/moduleCardSkeleton';
import { getModuleList } from '../../../../services';
import { AppStackScreenProps } from '../../../../navigation/navigationTypes';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import AddButton from '../../../../components/button/addButton';
import ScreenWrapper from '../../../../components/screenWrapper';
import NetInfoComponent from '../../../../components/netinfoComponent';

const ModuleList: React.FC<AppStackScreenProps<'ModuleList'>> = ({
  navigation,
  route,
}) => {
  const MainStyles = MainStyle();
  const isFocused = useIsFocused();
  const isDarkMode = useColorScheme() === 'dark';
  const theme = {
    screenBg: isDarkMode ? '#111827' : '#F6FAFF',
    text: isDarkMode ? '#F9FAFB' : '#1E293B',
  };

  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [masterData, setMasterData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleModuleList = async () => {
    try {
      const modules = await getModuleList(
        route?.params?.projectData?.project_id,
      );
      setFilteredData(modules);
      setMasterData(modules);
    } catch (error) {
      console.log('Module List Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchFilter = (text: string) => {
    setSearch(text);

    if (!text) {
      setFilteredData(masterData);
      return;
    }

    const filtered = masterData.filter(item =>
      item?.name?.toLowerCase().includes(text.toLowerCase()),
    );

    setFilteredData(filtered);
  };

  useEffect(() => {
    handleModuleList();
  }, [isFocused]);

  return (
    <ScreenWrapper
      withHeader
      statusBarTranslucent
      statusBarStyle={isDarkMode ? 'light-content' : 'dark-content'}
      backgroundColor={isDarkMode ? '#111827' : '#F7F8FA'}
    >
      <NetInfoComponent onReconnect={handleModuleList} />
      <View
        style={[
          MainStyles.mainContainer,
          { backgroundColor: theme.screenBg, paddingTop: 10 },
        ]}
      >
        <SearchBarComponent onChangeText={searchFilter} value={search} />

        {loading ? (
          <FlatList
            contentContainerStyle={{ padding: moderateScale(3), flex: 1 }}
            data={[1, 2, 3, 4]}
            keyExtractor={(_, index) => index.toString()}
            renderItem={() => <ModuleCardSkeleton />}
          />
        ) : filteredData.length === 0 ? (
          <View style={MainStyles.noDataContainer}>
            <Text style={[MainStyles.noDataText, { color: theme.text }]}>
              No Modules Found
            </Text>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={{
              padding: moderateScale(3),
              paddingBottom: verticalScale(90),
            }}
            data={filteredData}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <ModuleCard modulesData={item} navigation={navigation} />
            )}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Floating Button */}
        <AddButton
          onPress={() =>
            navigation.navigate('AddModule', {
              ProjectId: route.params.projectData.project_id,
            })
          }
        />
      </View>
    </ScreenWrapper>
  );
};

export default ModuleList;
