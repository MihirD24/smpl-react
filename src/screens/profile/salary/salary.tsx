import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import AppIcon from '../../../components/appIcon';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import {
  getSalaryList,
  getSalaryPdf,
  SalaryRecord,
} from '../../../services/salaryService';
import SalarySkeleton from '../../../skeletonview/salarySkeleton';
import {
  formatShortDate,
  formatFullDate,
  formatMonthYear,
  formatCurrency,
} from '../../../utils/dateUtils';
import ScreenWrapper from '../../../components/screenWrapper';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { Platform, Alert } from 'react-native';
import ToastUtil from '../../../utils/toastAndroid';
import NetInfoComponent from '../../../components/netinfoComponent';

const dummySalaryData: SalaryRecord[] = [
  {
    id: 101,
    year_id: 1,
    company_id: 1,
    purchase_date: '2026-05-01',
    record_type: 'salary_voucher',
    purchase_no: 'SAL-101',
    ref_sale_no: null,
    ref_sale_date: null,
    ref_invoice_no: null,
    party_id: null,
    ledger_id: 33,
    invoice_type: null,
    gst_type: null,
    tax_type: null,
    gross_amount: '55000.00',
    tds_payable_id: null,
    with_tds: 'No',
    tds_pr: '0.0',
    tds_amount: '0.00',
    gst_amt: null,
    gst_5_amount: null,
    gst_18_amount: null,
    gst_40_amount: null,
    round_off: '0.00',
    total_amount: '58250.00',
    paid_amount: '58250.00',
    from_date: '2026-05-01',
    to_date: '2026-05-31',
    due_date: '2026-06-05',
    remarks: 'May Salary',
    narration: null,
    document: null,
    created_by: 1,
    updated_by: null,
    deleted_at: null,
    created_at: '2026-05-31T10:30:00.000000Z',
    updated_at: '2026-05-31T10:30:00.000000Z',

    salary_detail: {
      id: 1,
      purchase_id: 101,
      working_days: 31,
      actual_working_days: 29,
      leave_days: 2,
      holiday: 4,
      additional_amt: '4500.00',
      deduction_amt: '1250.00',
      allowed_leaves: 3,
      created_at: '2026-05-31T10:30:00.000000Z',
      updated_at: '2026-05-31T10:30:00.000000Z',
    },

    ledger: {
      id: 33,
      name: 'Rahul Sharma',
      account_group_id: 39,
      ledger_type: 'Employee',
      party_id: null,
      employee_id: 16,
      created_at: '2026-05-07T11:05:51.000000Z',
      updated_at: '2026-05-07T11:05:51.000000Z',
      deleted_at: null,
    },
  },

  // Pending Salary
  {
    id: 102,
    year_id: 1,
    company_id: 1,
    purchase_date: '2026-04-01',
    record_type: 'salary_voucher',
    purchase_no: 'SAL-102',
    ref_sale_no: null,
    ref_sale_date: null,
    ref_invoice_no: null,
    party_id: null,
    ledger_id: 34,
    invoice_type: null,
    gst_type: null,
    tax_type: null,
    gross_amount: '42000.00',
    tds_payable_id: null,
    with_tds: 'No',
    tds_pr: '0.0',
    tds_amount: '0.00',
    gst_amt: null,
    gst_5_amount: null,
    gst_18_amount: null,
    gst_40_amount: null,
    round_off: '0.00',
    total_amount: '39800.00',
    paid_amount: '0.00',
    from_date: '2026-04-01',
    to_date: '2026-04-30',
    due_date: '2026-05-05',
    remarks: 'April Salary',
    narration: null,
    document: null,
    created_by: 1,
    updated_by: null,
    deleted_at: null,
    created_at: '2026-04-30T10:30:00.000000Z',
    updated_at: '2026-04-30T10:30:00.000000Z',

    salary_detail: {
      id: 2,
      purchase_id: 102,
      working_days: 30,
      actual_working_days: 24,
      leave_days: 5,
      holiday: 2,
      additional_amt: '1800.00',
      deduction_amt: '4000.00',
      allowed_leaves: 2,
      created_at: '2026-04-30T10:30:00.000000Z',
      updated_at: '2026-04-30T10:30:00.000000Z',
    },

    ledger: {
      id: 34,
      name: 'Priya Mehta',
      account_group_id: 39,
      ledger_type: 'Employee',
      party_id: null,
      employee_id: 17,
      created_at: '2026-05-07T11:05:51.000000Z',
      updated_at: '2026-05-07T11:05:51.000000Z',
      deleted_at: null,
    },
  },

  // Heavy Deduction Case
  {
    id: 103,
    year_id: 1,
    company_id: 1,
    purchase_date: '2026-03-01',
    record_type: 'salary_voucher',
    purchase_no: 'SAL-103',
    ref_sale_no: null,
    ref_sale_date: null,
    ref_invoice_no: null,
    party_id: null,
    ledger_id: 35,
    invoice_type: null,
    gst_type: null,
    tax_type: null,
    gross_amount: '65000.00',
    tds_payable_id: null,
    with_tds: 'No',
    tds_pr: '0.0',
    tds_amount: '0.00',
    gst_amt: null,
    gst_5_amount: null,
    gst_18_amount: null,
    gst_40_amount: null,
    round_off: '0.00',
    total_amount: '51200.00',
    paid_amount: '51200.00',
    from_date: '2026-03-01',
    to_date: '2026-03-31',
    due_date: '2026-04-05',
    remarks: 'March Salary',
    narration: null,
    document: null,
    created_by: 1,
    updated_by: null,
    deleted_at: null,
    created_at: '2026-03-31T10:30:00.000000Z',
    updated_at: '2026-03-31T10:30:00.000000Z',

    salary_detail: {
      id: 3,
      purchase_id: 103,
      working_days: 31,
      actual_working_days: 20,
      leave_days: 8,
      holiday: 3,
      additional_amt: '2500.00',
      deduction_amt: '16300.00',
      allowed_leaves: 2,
      created_at: '2026-03-31T10:30:00.000000Z',
      updated_at: '2026-03-31T10:30:00.000000Z',
    },

    ledger: {
      id: 35,
      name: 'Amit Patel',
      account_group_id: 39,
      ledger_type: 'Employee',
      party_id: null,
      employee_id: 18,
      created_at: '2026-05-07T11:05:51.000000Z',
      updated_at: '2026-05-07T11:05:51.000000Z',
      deleted_at: null,
    },
  },
];
// ─── Compact Pill Badge ───────────────────────────────────────────────────────
const StatPill = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) => (
  <View style={styles.statPill}>
    <Text style={styles.statPillLabel} numberOfLines={2}>
      {label}
    </Text>

    <Text style={[styles.statPillValue, color ? { color } : null]}>
      {value}
    </Text>
  </View>
);

// ─── Inline breakdown row ─────────────────────────────────────────────────────
const BreakdownItem = ({
  label,
  value,
  color,
  isDarkMode,
}: {
  label: string;
  value: string;
  color?: string;
  isDarkMode: boolean;
}) => (
  <View style={styles.breakdownItem}>
    <Text style={styles.breakdownItemLabel}>{label}</Text>
    <Text
      style={[
        styles.breakdownItemValue,
        isDarkMode && styles.textDark,
        color ? { color } : null,
      ]}
    >
      {value}
    </Text>
  </View>
);

// ─── Divider ──────────────────────────────────────────────────────────────────
const VDivider = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <View
    style={[
      styles.vDivider,
      { backgroundColor: isDarkMode ? '#2A2A3E' : '#E5E7EB' },
    ]}
  />
);

// ─── SalaryCard ───────────────────────────────────────────────────────────────
const SalaryCard = ({
  item,
  isDarkMode,
  onDownload,
  downloading,
}: {
  item: SalaryRecord;
  isDarkMode: boolean;
  onDownload: (item: SalaryRecord) => void;
  downloading: boolean;
}) => {
  const { colors } = useTheme();
  const monthYear = formatMonthYear(item.from_date);
  const salaryDetail = item?.salary_detail;
  const isPaid = Number(item.total_amount) === Number(item.paid_amount);

  return (
    <View style={[styles.card, isDarkMode && styles.cardDark]}>
      {/* ── ROW 1: Header ──────────────────────────────────────── */}
      <View style={styles.headerRow}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: colors.primary + '15' },
          ]}
        >
          <AppIcon name="Wallet" size={moderateScale(15)} color="#1164e0" />
        </View>

        <View style={styles.headerMeta}>
          <Text
            style={[styles.employeeName, isDarkMode && styles.textDark]}
            numberOfLines={1}
          >
            {item?.ledger?.name}
          </Text>
          <Text style={styles.periodText}>
            {formatShortDate(item.from_date)} – {formatFullDate(item.to_date)}
          </Text>
        </View>

        {/* Net salary badge on the right */}
        <View style={styles.netBadge}>
          <Text style={styles.netBadgeLabel}>NET</Text>
          <Text style={styles.netBadgeAmount}>
            {formatCurrency(item.total_amount)}
          </Text>
        </View>
      </View>

      {/* ── DIVIDER ────────────────────────────────────────────── */}
      <View
        style={[
          styles.hDivider,
          { backgroundColor: isDarkMode ? '#2A2A3E' : '#F0F1F4' },
        ]}
      />

      {/* ── ROW 2: Attendance pills ────────────────────────────── */}
      <View style={styles.pillsRow}>
        <StatPill
          label="WORKING  DAYS"
          value={String(salaryDetail?.working_days || 0)}
          color="#1164E0"
        />

        <VDivider isDarkMode={isDarkMode} />

        <StatPill
          label="ACTUAL WORK DAYS"
          value={String(salaryDetail?.actual_working_days || 0)}
        />

        <VDivider isDarkMode={isDarkMode} />

        <StatPill
          label="LEAVE DAYS"
          value={String(salaryDetail?.leave_days || 0)}
        />

        <VDivider isDarkMode={isDarkMode} />

        <StatPill
          label="ALLOWED LEAVES"
          value={String(salaryDetail?.allowed_leaves || 0)}
          color="#16A34A"
        />

        <VDivider isDarkMode={isDarkMode} />

        <StatPill label="HOLIDAYS" value={String(salaryDetail?.holiday || 0)} />
      </View>

      {/* ── DIVIDER ────────────────────────────────────────────── */}
      <View
        style={[
          styles.hDivider,
          { backgroundColor: isDarkMode ? '#2A2A3E' : '#F0F1F4' },
        ]}
      />

      <View style={styles.bottomRow}>
        {/* LEFT CONTENT */}
        <View style={styles.bottomContent}>
          {/* ROW 1 */}
          <View style={styles.bottomSubRow}>
            <View style={styles.bottomItem}>
              <Text style={styles.salaryMetaLabel}>Gross</Text>

              <Text
                style={[styles.salaryMetaValue, isDarkMode && styles.textDark]}
              >
                {formatCurrency(item.gross_amount)}
              </Text>
            </View>

            <View style={styles.bottomItem}>
              <Text style={styles.salaryMetaLabel}>Deduction</Text>

              <Text style={[styles.salaryMetaValue, { color: '#DC2626' }]}>
                -{formatCurrency(salaryDetail?.deduction_amt || 0)}
              </Text>
            </View>
          </View>

          {/* ROW 2 */}
          <View style={styles.bottomSubRow}>
            <View style={styles.bottomItem}>
              <Text style={styles.salaryMetaLabel}>Additional</Text>

              <Text style={[styles.salaryMetaValue, { color: '#16A34A' }]}>
                +{formatCurrency(salaryDetail?.additional_amt || 0)}
              </Text>
            </View>

            <View style={styles.bottomItem}>
              <Text style={styles.salaryMetaLabel}>Paid</Text>

              <Text style={[styles.salaryMetaValue, { color: '#1164E0' }]}>
                {formatCurrency(item.paid_amount)}
              </Text>
            </View>
          </View>
        </View>

        {/* DOWNLOAD BUTTON */}
        {isPaid && (
          <TouchableOpacity
            style={[
              styles.downloadFab,
              {
                opacity: downloading ? 0.7 : 1,
              },
            ]}
            disabled={downloading}
            onPress={() => onDownload(item)}
            activeOpacity={0.8}
          >
            {downloading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <AppIcon
                name="Download"
                size={moderateScale(15)}
                color="#FFFFFF"
              />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────
const Salary = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [salaryData, setSalaryData] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const fetchSalary = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    const { success, data } = await getSalaryList();
    if (success) setSalaryData(data);
    else setError('Failed to load salary records. Please try again.');

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchSalary();
  }, []);

  const handleRefresh = () => fetchSalary(true);

  const handleDownload = async (item: SalaryRecord) => {
    if (downloadingId === item.id) return;
    try {
      setDownloadingId(item.id);
      const formData = new FormData();
      formData.append('id', item.id.toString());
      const response = await getSalaryPdf(formData);

      if (!response.pdf_url) {
        Alert.alert('Error', 'Unable to fetch PDF');
        return;
      }

      const pdfUrl = response.pdf_url;
      const fileName = `salary-slip-${item.id}.pdf`;

      if (Platform.OS === 'android') {
        const { config, fs } = ReactNativeBlobUtil;
        const downloadPath = fs.dirs.DownloadDir + `/${fileName}`;
        await config({
          fileCache: true,
          path: downloadPath,
          addAndroidDownloads: {
            useDownloadManager: true,
            notification: true,
            path: downloadPath,
            description: 'Downloading salary slip...',
          },
        }).fetch('GET', pdfUrl);
        ToastUtil.info('Downloading started...');
      } else {
        const { fs } = ReactNativeBlobUtil;
        const path = fs.dirs.DocumentDir + `/${fileName}`;
        await ReactNativeBlobUtil.config({ fileCache: true, path }).fetch(
          'GET',
          pdfUrl,
        );
        ReactNativeBlobUtil.ios.previewDocument(path);
        Alert.alert(
          'Download Successful',
          'PDF saved successfully in Files app',
        );
      }
    } catch (error) {
      console.log('PDF Download Error:', error);
      if (Platform.OS === 'android') ToastUtil.error('Failed to download PDF');
      else
        Alert.alert(
          'Download Failed',
          'Something went wrong while downloading PDF',
        );
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) return <SalarySkeleton />;

  if (error) {
    return (
      <View style={[styles.centered, isDarkMode && styles.screenDark]}>
        <AppIcon name="AlertCircle" size={moderateScale(40)} color="#FF4D4F" />
        <Text style={[styles.errorText, isDarkMode && styles.textMutedDark]}>
          {error}
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => fetchSalary()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScreenWrapper
      withHeader
      statusBarTranslucent
      statusBarStyle={isDarkMode ? 'light-content' : 'dark-content'}
      backgroundColor={isDarkMode ? '#0F172A' : '#F8FAFC'}
    >
      <NetInfoComponent onReconnect={fetchSalary} />
      <View style={[styles.screen, isDarkMode && styles.screenDark]}>
        <FlatList
          data={salaryData}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <SalaryCard
              item={item}
              isDarkMode={isDarkMode}
              onDownload={handleDownload}
              downloading={downloadingId === item.id}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            salaryData.length === 0 && { flex: 1 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#0040A1']}
              tintColor="#0040A1"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <AppIcon name="FileX" size={moderateScale(40)} color="#CCC" />
              <Text
                style={[styles.emptyText, isDarkMode && styles.textMutedDark]}
              >
                No salary records found
              </Text>
            </View>
          }
        />
      </View>
    </ScreenWrapper>
  );
};

export default Salary;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F5FA' },
  screenDark: { backgroundColor: '#12121E' },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: verticalScale(12),
    backgroundColor: '#F4F5FA',
  },
  listContent: {
    paddingHorizontal: scale(14),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(60),
    gap: verticalScale(10),
  },

  // ── Card ──────────────────────────────────────────────────
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(14),
    paddingHorizontal: moderateScale(14),
    paddingVertical: verticalScale(18),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
    overflow: 'hidden',
  },
  cardDark: {
    backgroundColor: '#1E1E2E',
    borderColor: '#2A2A3E',
    borderWidth: 1,
  },

  // ── Header Row ────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
    marginBottom: verticalScale(8),
  },
  iconCircle: {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMeta: {
    flex: 1,
  },
  employeeName: {
    fontSize: moderateScale(13),
    fontFamily: 'PTSans-Bold',
    color: isDarkMode ? '#F8FAFC' : '#0F172A',
  },
  periodText: {
    fontSize: moderateScale(10),
    color: '#9CA3AF',
    marginTop: verticalScale(1),
    fontFamily: 'PTSans-Regular',
  },
  netBadge: {
    alignItems: 'flex-end',
  },
  netBadgeLabel: {
    fontSize: moderateScale(8),
    color: '#9CA3AF',
    fontFamily: 'PTSans-Bold',
    letterSpacing: 0.8,
  },
  netBadgeAmount: {
    fontSize: moderateScale(14),
    fontFamily: 'PTSans-Bold',
    color: '#1164E0',
  },

  // ── Dividers ─────────────────────────────────────────────
  hDivider: {
    height: 1,
    marginVertical: verticalScale(8),
  },
  vDivider: {
    width: 1,
    height: '100%',
  },

  // ── Attendance Pills ─────────────────────────────────────
  pillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // ── Breakdown Row ─────────────────────────────────────────

  breakdownItem: {
    flex: 1,
    alignItems: 'center',
    gap: verticalScale(2),
  },
  breakdownItemLabel: {
    fontSize: moderateScale(8),
    fontFamily: 'PTSans-Bold',
    color: '#9CA3AF',
    letterSpacing: 0.3,
  },
  breakdownItemValue: {
    fontSize: moderateScale(11),
    fontFamily: 'PTSans-Bold',
    color: isDarkMode ? '#F8FAFC' : '#0F172A',
  },

  // ── Misc ──────────────────────────────────────────────────
  textDark: { color: '#F0F0F0' },
  textMutedDark: { color: '#9CA3AF' },
  errorText: {
    fontSize: moderateScale(12),
    fontFamily: 'PTSans-Regular',
    color: '#FF4D4F',
    textAlign: 'center',
    paddingHorizontal: scale(20),
  },
  retryBtn: {
    marginTop: verticalScale(8),
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(8),
    backgroundColor: '#0040A1',
    borderRadius: moderateScale(8),
  },
  retryText: {
    fontSize: moderateScale(12),
    fontFamily: 'PTSans-Bold',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: moderateScale(12),
    fontFamily: 'PTSans-Regular',
    color: '#9CA3AF',
  },

  salaryMetaLabel: {
    fontSize: moderateScale(10),
    color: '#9CA3AF',
    fontFamily: 'PTSans-Bold',
    letterSpacing: 0.3,
  },

  salaryMetaValue: {
    fontSize: moderateScale(11),
    color: isDarkMode ? '#F8FAFC' : '#0F172A',
    fontFamily: 'PTSans-Bold',
  },

  downloadFab: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#1164E0',
    alignItems: 'center',
    justifyContent: 'center',
    gap: verticalScale(2),
    shadowColor: '#1164E0',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },

  // UPDATED
  statPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(42),
    paddingHorizontal: scale(2),
  },

  statPillLabel: {
    fontSize: moderateScale(7),
    fontFamily: 'PTSans-Bold',
    color: '#9CA3AF',
    letterSpacing: 0.2,
    textAlign: 'center',
    lineHeight: moderateScale(9),
    minHeight: verticalScale(18),
  },

  statPillValue: {
    fontSize: moderateScale(11),
    fontFamily: 'PTSans-Bold',
    color: '#374151',
    marginTop: verticalScale(2),
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: verticalScale(10),
  },

  bottomContent: {
    flex: 1,
    gap: verticalScale(8),
    paddingRight: scale(12),
  },

  bottomSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  bottomItem: {
    width: '48%',
    gap: verticalScale(2),
  },
});
