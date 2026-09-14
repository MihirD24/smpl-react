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

  const notificationCount = notificationList.length;

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
        <View style={styles.iconContainer}>
          <AppIcon name="Bell" size={21} color="#111111" />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.title, { color: isDarkMode ? '#FFFFFF' : '#171717' }]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            <View style={styles.unreadDot} />
          </View>

          <Text
            style={[
              styles.description,
              { color: isDarkMode ? '#B9BEC7' : '#5F6368' },
            ]}
            numberOfLines={3}
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
            contentContainerStyle={styles.listContent}
            data={[1, 2, 3, 4, 5]}
            keyExtractor={(_, index) => index.toString()}
            renderItem={() => <NotificationCardSkeleton />}
          />
        ) : notificationCount === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <AppIcon name="BellOff" size={30} color="#111111" />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Notifications</Text>
            <Text style={[styles.emptyText, { color: isDarkMode ? '#AEB4BD' : '#73777D' }]}>
              You're all caught up. New updates will appear here.
            </Text>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={styles.listContent}
            data={notificationList}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleNotificationData}
                tintColor={isDarkMode ? '#F9C900' : '#111111'}
              />
            }
            ListHeaderComponent={
              <View style={styles.summaryCard}>
                <View>
                  <Text style={styles.summaryEyebrow}>NOTIFICATIONS</Text>
                  <Text style={styles.summaryTitle}>Stay updated</Text>
                  <Text style={styles.summarySub}>Latest HRMS updates and alerts</Text>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{notificationCount}</Text>
                </View>
              </View>
            }
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
  },
  summaryCard: {
    backgroundColor: '#F9C900',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryEyebrow: {
    color: '#111111',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  summaryTitle: {
    color: '#111111',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 3,
  },
  summarySub: {
    color: '#3F3A18',
    fontSize: 12,
    marginTop: 4,
  },
  countBadge: {
    minWidth: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: '#F9C900',
    fontSize: 19,
    fontWeight: '800',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#F9C900',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    paddingRight: 6,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F9C900',
    marginTop: 6,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: '#F9C900',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 6,
  },
});
