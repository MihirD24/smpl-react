import React, { useEffect, useState } from 'react';
import { FlatList, Text, View, useColorScheme } from 'react-native';
import ProjectCard from './projectCard';
import MainStyle from '../../../assets/style/maincss';
import SearchBarComponent from '../../../components/searchBarComponent';
import ProjectCardSkeleton from '../../../skeletonview/projectCardSkeleton';
import { getAllotedProjectList } from '../../../services';
import { AppStackScreenProps } from '../../../navigation/navigationTypes';
import { StaffProject } from '../../../types/project';
import { moderateScale} from 'react-native-size-matters';
import ScreenWrapper from '../../../components/screenWrapper';
import AppIcon from '../../../components/appIcon';
import NetInfoComponent from '../../../components/netinfoComponent';

const ProjectList: React.FC<AppStackScreenProps<'Project'>> = ({
  navigation,
}) => {
  const MainStyles = MainStyle();
  const isDarkMode = useColorScheme() === 'dark';
  const theme = {
    screenBg: isDarkMode ? '#111827' : '#F6FAFF',
    text: isDarkMode ? '#F9FAFB' : '#1E293B',
  };
  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState<StaffProject[]>([]);
  const [masterData, setMasterData] = useState<StaffProject[]>([]);
  const [loading, setLoading] = useState(true);

  const searchFilter = (text: string) => {
    setSearch(text);

    if (!text) {
      setFilteredData(masterData);
      return;
    }

    const filtered = masterData.filter(item =>
      item?.stff_belongs_to_project?.project_name
        ?.toLowerCase()
        .includes(text.toLowerCase()),
    );

    setFilteredData(filtered);
  };

  const handleProjectData = async () => {
    try {
      const projectData = await getAllotedProjectList();
      setFilteredData(projectData);
      setMasterData(projectData);
    } catch (error) {
      console.log('Project List Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleProjectData();
  }, []);

  return (
    <ScreenWrapper
      withHeader
      statusBarTranslucent
      statusBarStyle={isDarkMode ? 'light-content' : 'dark-content'}
      backgroundColor={isDarkMode ? '#111827' : '#F7F8FA'}
    >
      <NetInfoComponent onReconnect={handleProjectData} />
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
          renderItem={() => <ProjectCardSkeleton />}
        />
      ) : filteredData.length === 0 ? (
        <View style={MainStyles.noDataContainer}>
          <AppIcon name="FileX" size={moderateScale(40)} color="#CCC" />
          <Text style={[MainStyles.noDataText, { color: theme.text }]}>
            No Projects Found
          </Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: moderateScale(3), }}
          data={filteredData}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <ProjectCard projectData={item} navigation={navigation} />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
    </ScreenWrapper>
  );
};

export default ProjectList;
