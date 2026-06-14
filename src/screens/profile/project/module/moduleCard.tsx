import React from 'react';
import { View, Text, Pressable, useColorScheme } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../../navigation/navigationTypes';
import AppIcon from '../../../../components/appIcon';
import moduleCardStyles from '../../../../assets/style/moduelCardStyle';
type ModuleCardProps = {
  modulesData: { id: number; name: string };
  navigation: NativeStackNavigationProp<AppStackParamList, 'ModuleList'>;
};
import { useNavigation } from '@react-navigation/native';

export default function ModuleCard({
  modulesData,
}: 
ModuleCardProps) {
  const navigation = useNavigation();
  const isDarkMode = useColorScheme() === 'dark';
  const theme = {
    cardBg: isDarkMode ? '#1F2937' : '#FFFFFF',
    cardBorder: isDarkMode ? '#334155' : '#E2E8F0',
    iconBg: isDarkMode ? '#172554' : '#E8F0FE',
    title: isDarkMode ? '#F9FAFB' : '#222222',
    muted: isDarkMode ? '#94A3B8' : '#64748B',
  };

  return (
    <Pressable
      style={({ pressed }) => [
        moduleCardStyles.card,
        {
          backgroundColor: theme.cardBg,
          borderColor: theme.cardBorder,
        },
        { opacity: pressed ? 0.85 : 1 },
      ]}
      onPress={() => {
        navigation.navigate('ModuleTaskList', {
          module_id: modulesData?.id,
        });
      }}
    >
      {/* Left Icon */}
      <View
        style={[
          moduleCardStyles.iconContainer,
          { backgroundColor: theme.iconBg },
        ]}
      >
        <AppIcon name="Layers2" size={22} color="#4A90E2" />
      </View>

      {/* Content */}
      <View style={moduleCardStyles.content}>
        <Text
          style={[moduleCardStyles.projectName, { color: theme.title }]}
          numberOfLines={1}
        >
          {modulesData?.name}
        </Text>

        <Text style={moduleCardStyles.subText}>Tap to manage work logs</Text>
      </View>
    </Pressable>
  );
}

