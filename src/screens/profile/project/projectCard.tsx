import React from 'react';
import { View, Text, Pressable, useColorScheme } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/navigationTypes';
import { StaffProject } from '../../../types/project';
import AppIcon from '../../../components/appIcon';
import moduleCardStyles from '../../../assets/style/moduelCardStyle';
type ProjectCardProps = {
  projectData: StaffProject;
  navigation: NativeStackNavigationProp<AppStackParamList, 'Project'>;
};

export default function ProjectCard({
  navigation,
  projectData,
}: ProjectCardProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const theme = {
    cardBg: isDarkMode ? '#1F2937' : '#FFFFFF',
    cardBorder: isDarkMode ? '#334155' : '#E2E8F0',
    iconBg: isDarkMode ? '#172554' : '#E8F0FE',
    title: isDarkMode ? '#F9FAFB' : '#222222',
    muted: isDarkMode ? '#94A3B8' : '#777777',
    chevron: isDarkMode ? '#64748B' : '#999999',
  };

  return (
    <Pressable
      style={({ pressed }) => [
        moduleCardStyles.card,
        {
          backgroundColor: theme.cardBg,
          borderColor: theme.cardBorder,
        },
        { opacity: pressed ? 0.8 : 1 },
      ]}
      onPress={() =>
        navigation.navigate('ModuleList', {
          projectData: projectData,
        })
      }
    >
      {/* Left Icon */}
      <View
        style={[
          moduleCardStyles.iconContainer,
          { backgroundColor: theme.iconBg },
        ]}
      >
        <AppIcon name="FolderOpen" size={22} color="#4A90E2" />
      </View>

      {/* Content */}
      <View style={moduleCardStyles.content}>
        <Text
          style={[moduleCardStyles.projectName, { color: theme.title }]}
          numberOfLines={1}
        >
          {projectData?.project?.project_name}
        </Text>

        <Text
          style={[moduleCardStyles.subText, { color: theme.muted }]}
          numberOfLines={1}
        >
          Tap to view modules
        </Text>
      </View>

      {/* Arrow */}
      <AppIcon name="ChevronRight" size={20} color={theme.chevron} />
    </Pressable>
  );
}
