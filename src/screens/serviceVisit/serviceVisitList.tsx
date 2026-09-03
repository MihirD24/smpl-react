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
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import { useIsFocused, useTheme } from '@react-navigation/native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

import AppIcon from '../../components/appIcon';
import AddButton from '../../components/button/addButton';
import CustomInput from '../../components/formComponent/customInput';
import ToastUtil from '../../utils/toastAndroid';
import { getServiceVisitsList, bulkApproveServiceVisits } from '../../services/serviceVisitServices';
import { formatDate } from '../../utils/dateUtils';
import { useAuth } from '../../context/authContext';

const ServiceVisitList = ({ navigation }: any) => {
  const isFocused = useIsFocused();
  const { colors } = useTheme();
  const isDarkMode = useColorScheme() === 'dark';
  const { userInfo } = useAuth();

  const theme = {
    screenBg: isDarkMode ? '#111827' : '#F6FAFF',
    cardBg: isDarkMode ? '#1F2937' : '#FFFFFF',
    border: isDarkMode ? '#334155' : '#E2E8F0',
    text: isDarkMode ? '#F9FAFB' : '#1E293B',
    subText: isDarkMode ? '#94A3B8' : '#64748B',
    primary: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
  };

  const isAdmin = userInfo?.role === 'Owner' || userInfo?.role === 'Admin';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingApproval, setSubmittingApproval] = useState(false);
  const [visits, setVisits] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New States for approval flows
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved'>('All');
  const [selectedVisitIds, setSelectedVisitIds] = useState<number[]>([]);
  const [isApprovalModalVisible, setIsApprovalModalVisible] = useState(false);
  const [deductionAmount, setDeductionAmount] = useState('0');
  const [approvalRemarks, setApprovalRemarks] = useState('');

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
      setSelectedVisitIds([]);
    }
  }, [isFocused]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchList(false);
    setSelectedVisitIds([]);
  };

  const filteredVisits = visits.filter((item: any) => {
    // 1. Filter by Status
    if (statusFilter === 'Pending' && item.status !== 0) return false;
    if (statusFilter === 'Approved' && item.status !== 1) return false;

    // 2. Filter by Search Query
    const q = searchQuery.toLowerCase();
    const empName = (item.employee?.name || '').toLowerCase();
    const loc = (item.location || '').toLowerCase();
    const party = (item.party?.name || item.sales_party_name || '').toLowerCase();
    const machine = (item.machine_number || '').toLowerCase();
    const cat = (item.visit_category || '').toLowerCase();

    return empName.includes(q) || loc.includes(q) || party.includes(q) || machine.includes(q) || cat.includes(q);
  });

  // Toggle selection for a single visit
  const handleToggleSelect = (id: number) => {
    setSelectedVisitIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select/Deselect all pending visible visits
  const pendingVisits = filteredVisits.filter((item: any) => item.status === 0);
  const isAllSelected = pendingVisits.length > 0 && pendingVisits.every((v) => selectedVisitIds.includes(v.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      // Remove all pending visits currently shown
      const pendingIds = pendingVisits.map((v) => v.id);
      setSelectedVisitIds((prev) => prev.filter((id) => !pendingIds.includes(id)));
    } else {
      // Add all pending visits currently shown
      const pendingIds = pendingVisits.map((v) => v.id);
      setSelectedVisitIds((prev) => {
        const next = [...prev];
        pendingIds.forEach((id) => {
          if (!next.includes(id)) {
            next.push(id);
          }
        });
        return next;
      });
    }
  };

  // Submit Bulk Approval
  const handleBulkApprove = async () => {
    if (selectedVisitIds.length === 0) return;
    
    setSubmittingApproval(true);
    try {
      const updates = selectedVisitIds.map((id) => ({
        id,
        status: 1, // Approved
        deduction_amount: Number(deductionAmount) || 0,
        approval_remarks: approvalRemarks.trim(),
      }));

      const res = await bulkApproveServiceVisits({ updates });
      if (res.success) {
        ToastUtil.success(res.message || 'Service visits approved successfully.');
        setSelectedVisitIds([]);
        setIsApprovalModalVisible(false);
        setDeductionAmount('0');
        setApprovalRemarks('');
        fetchList(false);
      } else {
        ToastUtil.error(res.message || 'Failed to approve visits.');
      }
    } catch (err) {
      console.error(err);
      ToastUtil.error('Failed to submit bulk approval.');
    } finally {
      setSubmittingApproval(false);
    }
  };

  const renderVisitCard = ({ item }: { item: any }) => {
    const displayCategory = item.visit_category || (item.sales_party_name ? 'Sales' : 'Admin/Driver');
    
    // Net Amount = total_amount - deduction_amount
    const netAmount = (item.total_amount || 0) - (item.deduction_amount || 0);
    const isSelected = selectedVisitIds.includes(item.id);

    return (
      <View style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
        <View style={styles.cardMainRow}>
          {/* Checkbox for Owners to approve pending visits */}
          {isAdmin && item.status === 0 && (
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => handleToggleSelect(item.id)}
              activeOpacity={0.7}
            >
              <AppIcon
                name={isSelected ? 'CheckSquare' : 'Square'}
                size={22}
                color={isSelected ? theme.primary : theme.subText}
              />
            </TouchableOpacity>
          )}

          {/* Details Column */}
          <View style={{ flex: 1 }}>
            {/* Header row */}
            <View style={styles.cardHeader}>
              <View style={styles.badgeContainer}>
                <View style={[styles.badge, { backgroundColor: item.sales_party_name ? '#EFF6FF' : '#ECFDF5' }]}>
                  <Text style={[styles.badgeText, { color: item.sales_party_name ? '#3B82F6' : '#10B981' }]}>
                    {displayCategory}
                  </Text>
                </View>
                {/* Status Badge */}
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: item.status === 1 ? '#ECFDF5' : '#FFFBEB' },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: item.status === 1 ? theme.success : theme.warning }]}>
                    {item.status === 1 ? 'Approved' : 'Pending'}
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
              <View style={styles.amountContainer}>
                {item.deduction_amount > 0 && (
                  <Text style={styles.deductionText}>
                    -₹{item.deduction_amount}
                  </Text>
                )}
                <Text style={[styles.amountText, { color: theme.text }]}>
                  ₹{netAmount}
                </Text>
              </View>
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

            {/* Remarks Display */}
            {item.approval_remarks ? (
              <View style={[styles.remarksRow, { backgroundColor: isDarkMode ? '#374151' : '#F8FAFC' }]}>
                <Text style={[styles.remarksText, { color: theme.subText }]} numberOfLines={2}>
                  Approval Remark: {item.approval_remarks}
                </Text>
              </View>
            ) : null}

            <View style={styles.divider} />

            {/* Footer row */}
            <View style={styles.cardFooter}>
              <View style={styles.footerItem}>
                <AppIcon name="Calendar" size={14} color={theme.subText} style={styles.footerIcon} />
                <Text style={[styles.footerText, { color: theme.subText }]}>
                  {item.visit_date ? formatDate(new Date(item.visit_date), 'display') : ''}
                </Text>
              </View>

              <View style={styles.footerRight}>
                {item.remarks ? (
                  <Text style={[styles.notesText, { color: theme.subText }]} numberOfLines={1}>
                    💬 {item.remarks}
                  </Text>
                ) : null}

                {/* SVR File Download button */}
                {item.svr_file ? (
                  <TouchableOpacity
                    style={[styles.svrButton, { borderColor: theme.border }]}
                    onPress={() => {
                      Linking.openURL(item.svr_file).catch((e) => {
                        console.error('Error opening SVR URL:', e);
                        ToastUtil.error('Failed to open SVR attachment.');
                      });
                    }}
                    activeOpacity={0.7}
                  >
                    <AppIcon name="DownloadCloud" size={14} color={theme.primary} />
                    <Text style={[styles.svrText, { color: theme.primary }]}>SVR</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.screenBg }]}>
      {/* Filters & Actions Header */}
      <View style={styles.headerContainer}>
        <View style={styles.serviceHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.serviceEyebrow}>FIELD OPERATIONS</Text>
            <Text style={styles.serviceTitle}>Service visits</Text>
            <Text style={styles.serviceSub}>{filteredVisits.length} visible · {statusFilter}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('AddServiceVisit')} style={styles.serviceAddBtn}>
            <AppIcon name="Plus" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        {/* Search Bar */}
        <CustomInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by employee, customer, machine..."
          iconName="Search"
        />

        {/* Status Filter Row */}
        <View style={styles.filterRow}>
          {(['All', 'Pending', 'Approved'] as const).map((filter) => {
            const isSelected = statusFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterTab,
                  isSelected && {
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
                  },
                  { borderColor: theme.border },
                ]}
                onPress={() => {
                  setStatusFilter(filter);
                  setSelectedVisitIds([]);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    isSelected ? { color: '#FFF', fontWeight: '700' } : { color: theme.subText },
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Select All Row for Admin */}
        {isAdmin && statusFilter !== 'Approved' && pendingVisits.length > 0 && (
          <View style={styles.selectAllRow}>
            <TouchableOpacity
              style={styles.selectAllButton}
              onPress={handleSelectAll}
              activeOpacity={0.7}
            >
              <AppIcon
                name={isAllSelected ? 'CheckSquare' : 'Square'}
                size={20}
                color={isAllSelected ? theme.primary : theme.subText}
                style={{ marginRight: scale(8) }}
              />
              <Text style={[styles.selectAllText, { color: theme.text }]}>
                {isAllSelected ? 'Deselect All' : 'Select All Pending'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* List content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredVisits}
          renderItem={renderVisitCard}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[
            styles.listContent,
            selectedVisitIds.length > 0 && { paddingBottom: verticalScale(160) },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.primary]} />
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

      {/* Sticky Bottom Action Bar for Admin Bulk Approval */}
      {isAdmin && selectedVisitIds.length > 0 && (
        <View style={[styles.actionBar, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <View style={styles.actionBarLeft}>
            <Text style={[styles.selectedCountText, { color: theme.text }]}>
              {selectedVisitIds.length} visits selected
            </Text>
          </View>
          <View style={styles.actionBarButtons}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.deselectBtn, { borderColor: theme.border }]}
              onPress={() => setSelectedVisitIds([])}
            >
              <Text style={[styles.deselectBtnText, { color: theme.text }]}>Deselect</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.approveBtn, { backgroundColor: theme.primary }]}
              onPress={() => setIsApprovalModalVisible(true)}
            >
              <Text style={styles.approveBtnText}>Approve</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Bulk Approval Modal */}
      <Modal
        visible={isApprovalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsApprovalModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Bulk Approve Service Visits</Text>
            
            <Text style={[styles.modalSubText, { color: theme.subText }]}>
              You are approving {selectedVisitIds.length} pending service visit logs.
            </Text>

            {/* Deduction Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Deduction Amount (₹)</Text>
              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: isDarkMode ? '#374151' : '#F8FAFC',
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                value={deductionAmount}
                onChangeText={setDeductionAmount}
                keyboardType="numeric"
                placeholder="Enter amount to deduct"
                placeholderTextColor={theme.subText}
              />
            </View>

            {/* Remarks Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.text }]}>Approval Remarks</Text>
              <TextInput
                style={[
                  styles.modalInput,
                  styles.modalTextArea,
                  {
                    backgroundColor: isDarkMode ? '#374151' : '#F8FAFC',
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                value={approvalRemarks}
                onChangeText={setApprovalRemarks}
                multiline
                numberOfLines={3}
                placeholder="Add comments or justification..."
                placeholderTextColor={theme.subText}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn, { borderColor: theme.border }]}
                onPress={() => {
                  setIsApprovalModalVisible(false);
                  setDeductionAmount('0');
                  setApprovalRemarks('');
                }}
                disabled={submittingApproval}
              >
                <Text style={[styles.cancelBtnText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.confirmBtn, { backgroundColor: theme.primary }]}
                onPress={handleBulkApprove}
                disabled={submittingApproval}
              >
                {submittingApproval ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.confirmBtnText}>Approve Logs</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { paddingHorizontal: moderateScale(16), paddingTop: verticalScale(7), paddingBottom: verticalScale(3) },
  serviceHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(10) },
  serviceEyebrow: { fontSize: 7.5, fontWeight: '900', letterSpacing: 1.5, color: '#64748B' },
  serviceTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5, marginTop: 2 },
  serviceSub: { fontSize: 9, color: '#64748B', marginTop: 2, fontWeight: '600' },
  serviceAddBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', marginLeft: 10, shadowColor: '#2563EB', shadowOpacity: 0.16, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  filterRow: { flexDirection: 'row', gap: moderateScale(8), marginTop: verticalScale(8), marginBottom: verticalScale(4) },
  filterTab: { flex: 1, paddingVertical: verticalScale(9), alignItems: 'center', borderRadius: moderateScale(12), borderWidth: 1, backgroundColor: '#FFFFFF' },
  filterTabText: { fontSize: moderateScale(11.5), fontWeight: '800' },
  selectAllRow: { flexDirection: 'row', alignItems: 'center', marginTop: verticalScale(7), paddingVertical: verticalScale(4) },
  selectAllButton: { flexDirection: 'row', alignItems: 'center' },
  selectAllText: { fontSize: moderateScale(11.5), fontWeight: '700' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: moderateScale(16), paddingBottom: verticalScale(110), paddingTop: verticalScale(5) },
  card: { backgroundColor: '#FFFFFF', borderRadius: moderateScale(19), borderWidth: 1, padding: moderateScale(14), marginBottom: verticalScale(12), borderColor: '#E5EBF3', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.035, shadowRadius: 15, elevation: 1 },
  cardMainRow: { flexDirection: 'row', alignItems: 'flex-start' },
  checkboxContainer: { marginRight: moderateScale(10), marginTop: verticalScale(2) },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: verticalScale(11) },
  badgeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: moderateScale(5), flex: 1, paddingRight: moderateScale(8) },
  badge: { paddingHorizontal: moderateScale(8), paddingVertical: verticalScale(4), borderRadius: 99 },
  badgeText: { fontSize: moderateScale(8.5), fontWeight: '800' },
  amountContainer: { alignItems: 'flex-end' },
  deductionText: { fontSize: 8.5, color: '#EF4444', fontWeight: '700' },
  amountText: { fontSize: moderateScale(17), fontWeight: '900' },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginVertical: verticalScale(4) },
  detailIcon: { marginRight: moderateScale(8) },
  detailText: { fontSize: moderateScale(12), fontWeight: '600' },
  remarksRow: { marginTop: verticalScale(8), padding: moderateScale(9), borderRadius: moderateScale(10) },
  remarksText: { fontSize: 9.5, fontStyle: 'italic', lineHeight: 13 },
  divider: { height: 1, backgroundColor: '#EEF2F7', marginVertical: verticalScale(11) },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerItem: { flexDirection: 'row', alignItems: 'center' },
  footerIcon: { marginRight: 4 },
  footerText: { fontSize: moderateScale(9.5), fontWeight: '600' },
  footerRight: { flexDirection: 'row', alignItems: 'center', gap: 8, maxWidth: '60%' },
  notesText: { fontSize: 9.5, maxWidth: 95 },
  svrButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 10 },
  svrText: { fontSize: 9.5, fontWeight: '800', marginLeft: 3 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: verticalScale(95), gap: 10 },
  emptyText: { fontSize: 15, fontWeight: '800' },
  actionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopWidth: 1, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#0F172A', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.08, shadowRadius: 15, elevation: 10 },
  actionBarLeft: { flex: 1 },
  selectedCountText: { fontSize: 13, fontWeight: '800' },
  actionBarButtons: { flexDirection: 'row', gap: 8 },
  actionBtn: { minWidth: 86, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 11, borderWidth: 1 },
  deselectBtn: { backgroundColor: '#FFFFFF' },
  deselectBtnText: { fontSize: 11, fontWeight: '800' },
  approveBtn: { borderColor: '#2563EB' },
  approveBtnText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.55)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 400, padding: 22, borderRadius: 24 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  modalSubText: { fontSize: 11, lineHeight: 16, marginTop: 6, marginBottom: 14 },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 11, fontWeight: '800', marginBottom: 6 },
  modalInput: { minHeight: 44, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, fontSize: 12 },
  modalTextArea: { minHeight: 78, textAlignVertical: 'top', paddingTop: 10 },
  modalActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  modalBtn: { flex: 1, minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  cancelBtn: { backgroundColor: '#FFF' },
  cancelBtnText: { fontSize: 11, fontWeight: '800' },
  confirmBtn: { borderColor: '#2563EB' },
  confirmBtnText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
});

export default ServiceVisitList;
