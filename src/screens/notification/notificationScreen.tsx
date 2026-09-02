import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useIsFocused, useTheme } from '@react-navigation/native';
import { getNotificationData } from '../../services';
import { AppStackScreenProps } from '../../navigation/navigationTypes';
import AppIcon from '../../components/appIcon';
import NotificationCardSkeleton from '../../skeletonview/notificationCardSkeleton';
import ScreenWrapper from '../../components/screenWrapper';
import NetInfoComponent from '../../components/netinfoComponent';

type NotificationItem = {
  id: number;
  title: string;
  description: string;
};

const NotificationScreen: React.FC<
  AppStackScreenProps<'NotificationScreen'>
> = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { colors } = useTheme();
  const isFocused = useIsFocused();

  const [notificationList, setNotificationList] = useState<NotificationItem[]>(
    [],
  );
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleNotificationData = async () => {
    try {
      setRefreshing(true);
      const response = await getNotificationData();
      setNotificationList(response);
    } catch (error) {
      console.log('Notification Error:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    handleNotificationData();
  }, [isFocused]);

  const renderItem = ({ item }: { item: NotificationItem }) => {
    return (
      <View
        style={[
          styles.card,
          { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' },
        ]}
      >
        {/* Left Icon */}
        <View style={styles.iconContainer}>
          <AppIcon name="MessageSquareMore" size={20} color="#4A90E2" />
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text
            style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#222' }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          <Text
            style={[
              styles.description,
              { color: isDarkMode ? '#BBBBBB' : '#555' },
            ]}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper
      withHeader
      statusBarTranslucent
      statusBarStyle={isDarkMode ? 'light-content' : 'dark-content'}
      backgroundColor={isDarkMode ? '#111827' : '#F7F8FA'}
    >
      <NetInfoComponent onReconnect={handleNotificationData} />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {loading ? (
          <FlatList
            contentContainerStyle={{ padding: 16 }}
            data={[1, 2, 3, 4]}
            keyExtractor={(_, index) => index.toString()}
            renderItem={() => <NotificationCardSkeleton />}
          />
        ) : notificationList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ color: colors.text }}>No Notifications Found</Text>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={{ padding: 16 }}
            data={notificationList}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleNotificationData}
              />
            }
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
