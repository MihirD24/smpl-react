import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { useIsFocused, useTheme } from '@react-navigation/native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

import AppIcon from '../../components/appIcon';
import AddButton from '../../components/button/addButton';
import CustomInput from '../../components/formComponent/customInput';
import ToastUtil from '../../utils/toastAndroid';
import { getServiceVisitsList } from '../../services/serviceVisitServices';
import { formatDate } from '../../utils/dateUtils';

const ServiceVisitList = ({ navigation }: any) => {
  const isFocused = useIsFocused();
  const { colors } = useTheme();
  const isDarkMode = useColorScheme() === 'dark';

  const theme = {
    screenBg: isDarkMode ? '#111827' : '#F6FAFF',
    cardBg: isDarkMode ? '#1F2937' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    text: isDarkMode ? '#F9FAFB' : '#1E293B',
    subText: isDarkMode ? '#94A3B8' : '#64748B',
  };

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [visits, setVisits] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchList = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await getServiceVisitsList();
      if (res.success) {
        setVisits(res.data || []);
      } else {
        ToastUtil.error(res.message || 'Failed to load service visits list.');
      }
    } catch (err) {
      console.error(err);
      ToastUtil.error('Failed to load service visits.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchList();
    }
  }, [isFocused]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchList(false);
  };

  const filteredVisits = visits.filter((item: any) => {
    const q = searchQuery.toLowerCase();
    const empName = (item.employee?.name || '').toLowerCase();
    const loc = (item.location || '').toLowerCase();
    const party = (item.party?.name || item.sales_party_name || '').toLowerCase();
    const machine = (item.machine_number || '').toLowerCase();
    const cat = (item.visit_category || '').toLowerCase();

    return empName.includes(q) || loc.includes(q) || party.includes(q) || machine.includes(q) || cat.includes(q);
  });

  const renderVisitCard = ({ item }: { item: any }) => {
    // Show appropriate display category based on type (Sales/Service/Driver)
    const displayCategory = item.visit_category || (item.sales_party_name ? 'Sales' : 'Admin/Driver');
    
    // Amount status color
    const isHighExpense = (item.total_amount || 0) > 1000;

    return (
      <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        
        {/* Header row */}
        <View style={styles.cardHeader}>
          <View style={styles.badgeContainer}>
            <View style={[styles.badge, { backgroundColor: item.sales_party_name ? '#EFF6FF' : '#ECFDF5' }]}>
              <Text style={[styles.badgeText, { color: item.sales_party_name ? '#3B82F6' : '#10B981' }]}>
                {displayCategory}
              </Text>
            </View>
            {item.night_stay && item.night_stay !== 'None' && (
              <View style={[styles.badge, { backgroundColor: '#FFF7ED' }]}>
                <Text style={[styles.badgeText, { color: '#F97316' }]}>
                  🏠 {item.night_stay}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.amountText, { color: isHighExpense ? '#EF4444' : '#10B981' }]}>
            ₹{item.total_amount || 0}
          </Text>
        </View>

        {/* Content detail rows */}
        <View style={styles.detailRow}>
          <AppIcon name="User" size={16} color={theme.subText} style={styles.detailIcon} />
          <Text style={[styles.detailText, { color: theme.text }]} numberOfLines={1}>
            {item.employee?.name || 'Unknown Employee'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <AppIcon name="MapPin" size={16} color={theme.subText} style={styles.detailIcon} />
          <Text style={[styles.detailText, { color: theme.text }]} numberOfLines={1}>
            {item.location || 'No Location'} {item.km ? `(${item.km} KM)` : ''}
          </Text>
        </View>

        {/* Customer / Party details */}
        {(item.party?.name || item.sales_party_name) && (
          <View style={styles.detailRow}>
            <AppIcon name="Building2" size={16} color={theme.subText} style={styles.detailIcon} />
            <Text style={[styles.detailText, { color: theme.text }]} numberOfLines={1}>
              {item.party?.name || item.sales_party_name}
            </Text>
          </View>
        )}

        {/* Machine details if service visit */}
        {item.machine_number && (
          <View style={styles.detailRow}>
            <AppIcon name="Cpu" size={16} color={theme.subText} style={styles.detailIcon} />
            <Text style={[styles.detailText, { color: theme.text }]} numberOfLines={1}>
              Machine: {item.machine_number}
            </Text>
          </View>
        )}

        <View style={styles.divider} />

        {/* Footer row */}
        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <AppIcon name="Calendar" size={14} color={theme.subText} style={styles.footerIcon} />
            <Text style={[styles.footerText, { color: theme.subText }]}>
              {item.visit_date ? formatDate(new Date(item.visit_date), 'display') : ''}
            </Text>
          </View>

          {item.remarks ? (
            <Text style={[styles.remarksText, { color: theme.subText }]} numberOfLines={1}>
              💬 {item.remarks}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBg }]}>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <CustomInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by employee, location, category..."
          iconName="Search"
        />
      </View>

      {/* List content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={filteredVisits}
          renderItem={renderVisitCard}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#3B82F6']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <AppIcon name="ClipboardList" size={48} color={theme.subText} />
              <Text style={[styles.emptyText, { color: theme.text }]}>No service visits found.</Text>
            </View>
          }
        />
      )}

      {/* Floating Add Button */}
      <AddButton onPress={() => navigation.navigate('AddServiceVisit')} />
    </View>
  );
};

export default ServiceVisitList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: moderateScale(16),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(4),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: moderateScale(16),
    paddingBottom: verticalScale(100),
  },
  card: {
    borderWidth: 1,
    borderRadius: moderateScale(14),
    padding: moderateScale(14),
    marginBottom: verticalScale(14),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: moderateScale(6),
  },
  badge: {
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(6),
  },
  badgeText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
  },
  amountText: {
    fontSize: moderateScale(16),
    fontWeight: '800',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: verticalScale(3),
  },
  detailIcon: {
    marginRight: moderateScale(8),
  },
  detailText: {
    fontSize: moderateScale(13),
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: verticalScale(10),
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerIcon: {
    marginRight: moderateScale(4),
  },
  footerText: {
    fontSize: moderateScale(11),
    fontWeight: '500',
  },
  remarksText: {
    fontSize: moderateScale(11),
    maxWidth: '60%',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(100),
    gap: verticalScale(12),
  },
  emptyText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
  },
});
