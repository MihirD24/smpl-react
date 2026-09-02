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
import { moderateScale, verticalScale } from 'react-native-size-matters';

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
          isDarkMode ? styles.cardDark : styles.cardLight,
        ]}
      >
        {/* Left accent bar */}
        <View style={styles.accentBar} />

        {/* Left Icon */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: isDarkMode ? '#1E3A5F' : '#EFF6FF' },
          ]}
        >
          <AppIcon name="MessageSquareMore" size={moderateScale(20)} color="#2563EB" />
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              { color: isDarkMode ? '#F8FAFC' : '#0F172A' },
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          <Text
            style={[
              styles.description,
              { color: isDarkMode ? '#94A3B8' : '#64748B' },
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
      backgroundColor={isDarkMode ? '#0F172A' : '#F8FAFC'}
    >
      <NetInfoComponent onReconnect={handleNotificationData} />
      <View
        style={{
          flex: 1,
          backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
        }}
      >
        {loading ? (
          <FlatList
            contentContainerStyle={{ padding: moderateScale(16) }}
            data={[1, 2, 3, 4]}
            keyExtractor={(_, index) => index.toString()}
            renderItem={() => <NotificationCardSkeleton />}
          />
        ) : notificationList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrapper}>
              <AppIcon
                name="Bell"
                size={moderateScale(56)}
                color="#CBD5E1"
              />
            </View>
            <Text
              style={[
                styles.emptyTitle,
                { color: isDarkMode ? '#94A3B8' : '#64748B' },
              ]}
            >
              No Notifications
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                { color: isDarkMode ? '#475569' : '#94A3B8' },
              ]}
            >
              You're all caught up!
            </Text>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={{ padding: moderateScale(16) }}
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
    padding: moderateScale(14),
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(10),
    overflow: 'hidden',
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#94A3B8',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: moderateScale(8),
    elevation: 3,
  },
  cardDark: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  accentBar: {
    position: 'absolute',
    width: moderateScale(3),
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: moderateScale(3),
    backgroundColor: '#2563EB',
  },
  iconContainer: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: moderateScale(10),
    marginRight: moderateScale(12),
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    marginBottom: verticalScale(3),
  },
  description: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(19),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(32),
  },
  emptyIconWrapper: {
    marginBottom: verticalScale(16),
  },
  emptyTitle: {
    fontSize: moderateScale(17),
    fontWeight: '600',
    marginBottom: verticalScale(6),
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: moderateScale(13),
    textAlign: 'center',
  },
});
