import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import AppIcon from '../../components/appIcon';
import SearchBarComponent from '../../components/searchBarComponent';
import {
  getDevelopersList,
  Developer,
  getStaffSalaryList,
} from '../../services/salaryService';
import FilterBottomSheet, {
  FilterBottomSheetHandle,
} from '../../components/filterBottomSheet/filterBottomSheet';
import ActiveFilterChips from '../../components/filterBottomSheet/activeFilterChips';
import commonFilterStyles from '../../assets/style/commonFilter';
import { formatDate } from '../../utils/dateUtils';
import ScreenWrapper from '../../components/screenWrapper';
import NetInfoComponent from '../../components/netinfoComponent';

// ─── Responsive scaling ───────────────────────────────────────────────────────
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DESIGN_WIDTH = 375;
const scaleLocal = (size: number): number =>
  (SCREEN_WIDTH / DESIGN_WIDTH) * size;
const modScaleLocal = (size: number, factor = 0.5): number =>
  size + (scaleLocal(size) - size) * factor;

// ─── Constants ────────────────────────────────────────────────────────────────
const PAYMENT_STATUSES = [
  { label: 'Paid', value: 'PAID', color: '#10B981' },
  { label: 'Pending', value: 'PENDING', color: '#EF4444' },
] as const;

type PaymentStatus = 'PAID' | 'DRAFT' | 'PENDING';

const MONTHS = [
  { abbr: 'JAN', num: '01' },
  { abbr: 'FEB', num: '02' },
  { abbr: 'MAR', num: '03' },
  { abbr: 'APR', num: '04' },
  { abbr: 'MAY', num: '05' },
  { abbr: 'JUN', num: '06' },
  { abbr: 'JUL', num: '07' },
  { abbr: 'AUG', num: '08' },
  { abbr: 'SEP', num: '09' },
  { abbr: 'OCT', num: '10' },
  { abbr: 'NOV', num: '11' },
  { abbr: 'DEC', num: '12' },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface EmployeeRecord {
  id: string | number;
  name: string;
  ledger: {
    name: string;
  };
  amount: number;
  status: PaymentStatus;
  entry_date: string;
  working_days: number;
  holidays: number;
  allowed_leaves: number;
  actual_work_days: number;
  total_leaves: number;
  additional_amt: number;
  paid_amt: number;
}

// ─── Map API → display ────────────────────────────────────────────────────────
const mapToEmployeeRecord = (rec: any): EmployeeRecord => {
  const workingDays = parseInt(rec?.salary_detail?.working_days || '0', 10);
  const leaveDays = parseInt(rec?.salary_detail?.leave_days || '0', 10);
  const paidAmount = parseFloat(rec.paid_amount || '0');
  const salary = parseFloat(rec.salary || '0');

  const status: PaymentStatus = paidAmount > 0 ? 'PAID' : 'PENDING';

  return {
    id: rec?.ledger?.id || '',
    name: rec?.ledger?.name ?? `Staff #${rec?.ledger?.id}`,
    amount: salary,
    status,
    entry_date: rec.purchase_date ?? new Date().toISOString(),
    working_days: workingDays,
    holidays: rec?.salary_detail?.holiday ?? 0,
    allowed_leaves: rec?.salary_detail?.allowed_leaves ?? 0,
    actual_work_days: rec?.salary_detail?.actual_working_days ?? 0,
    total_leaves: leaveDays,
    additional_amt: rec?.salary_detail?.additional_amt ?? 0,
    paid_amt: paidAmount,
  };
};

const formatCurrency = (val: number): string =>
  `₹${val.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const padTwo = (n: number): string => String(n).padStart(2, '0');

const ALL_STATUS_META = [
  { label: 'Paid', value: 'PAID', color: '#10B981' },
  { label: 'Pending', value: 'PENDING', color: '#EF4444' },
] as const;

// ─── Pure filter function (no state reads) ────────────────────────────────────
const applyFiltersToData = (
  data: EmployeeRecord[],
  searchText: string,
  statuses: PaymentStatus[],
): EmployeeRecord[] => {
  let result = data;
  if (searchText) {
    const q = searchText.toLowerCase();
    result = result.filter(item => item.name.toLowerCase().includes(q));
  }
  if (statuses.length > 0) {
    result = result.filter(item => statuses.includes(item.status));
  }
  return result;
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
const AvatarPlaceholder = ({
  name,
  size = 40,
}: {
  name: string;
  size?: number;
}) => {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('');
  return (
    <View
      style={[
        avatarStyles.circle,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={avatarStyles.initials}>{initials}</Text>
    </View>
  );
};
const avatarStyles = StyleSheet.create({
  circle: {
    backgroundColor: '#E8EDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: '#4A6CF7',
  },
});

// ─── Info Cell ────────────────────────────────────────────────────────────────
const InfoCell = ({
  label,
  value,
  valueColor,
  isDarkMode,
}: {
  label: string;
  value: string;
  valueColor?: string;
  isDarkMode: boolean;
}) => (
  <View style={styles.infoCell}>
    <Text style={styles.infoCellLabel}>{label}</Text>
    <Text
      style={[
        styles.infoCellValue,
        isDarkMode && styles.textDark,
        valueColor ? { color: valueColor } : null,
      ]}
    >
      {value}
    </Text>
  </View>
);

// ─── Employee Row ─────────────────────────────────────────────────────────────
const EmployeeRow = ({
  item,
  isDarkMode,
}: {
  item: EmployeeRecord;
  isDarkMode: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);
  const statusMeta = ALL_STATUS_META.find(s => s.value === item.status);

  return (
    <View style={[styles.employeeCard, isDarkMode && styles.employeeCardDark]}>
      <TouchableOpacity
        style={styles.employeeRow}
        onPress={() => setExpanded(v => !v)}
        activeOpacity={0.75}
      >
        <AvatarPlaceholder name={item?.name} size={moderateScale(42)} />
        <View style={styles.employeeInfo}>
          <Text style={[styles.employeeName, isDarkMode && styles.textDark]}>
            {item.name}
          </Text>
        </View>
        <View style={styles.employeeRight}>
          {statusMeta && (
            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor: statusMeta.color + '18',
                  borderColor: statusMeta.color,
                },
              ]}
            >
              <View
                style={[
                  styles.statusDotSmall,
                  { backgroundColor: statusMeta.color },
                ]}
              />
              <Text
                style={[styles.statusPillText, { color: statusMeta.color }]}
              >
                {statusMeta.label}
              </Text>
            </View>
          )}
          <Text style={[styles.employeeAmount, isDarkMode && styles.textDark]}>
            {formatCurrency(item.amount)}
          </Text>
          <AppIcon
            name={expanded ? 'ChevronUp' : 'ChevronDown'}
            size={moderateScale(14)}
            color={isDarkMode ? '#AAA' : '#9CA3AF'}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View
          style={[styles.expandedPanel, isDarkMode && styles.expandedPanelDark]}
        >
          <View style={styles.infoGrid}>
            <InfoCell
              label="ENTRY DATE"
              value={formatDate(item.entry_date, 'display')}
              isDarkMode={isDarkMode}
            />
            <InfoCell
              label="WORKING DAYS"
              value={`${item.working_days}`}
              isDarkMode={isDarkMode}
            />
            <InfoCell
              label="HOLIDAYS"
              value={padTwo(item.holidays)}
              isDarkMode={isDarkMode}
            />
            <InfoCell
              label="ALLOWED LEAVES"
              value={padTwo(item.allowed_leaves)}
              isDarkMode={isDarkMode}
            />
            <InfoCell
              label="ACTUAL WORK DAYS"
              value={`${item.actual_work_days || '-'}`}
              isDarkMode={isDarkMode}
            />
            <InfoCell
              label="TOTAL LEAVES"
              value={padTwo(item.total_leaves)}
              isDarkMode={isDarkMode}
              valueColor="#EF4444"
            />
          </View>
          <View
            style={[
              styles.additionalRow,
              isDarkMode && styles.additionalRowDark,
            ]}
          >
            <Text
              style={[
                styles.additionalLabel,
                isDarkMode && styles.textMutedDark,
              ]}
            >
              Additional Amt
            </Text>
            <Text
              style={[styles.additionalValue, isDarkMode && styles.textDark]}
            >
              {item.additional_amt > 0
                ? `+${formatCurrency(item.additional_amt)}`
                : formatCurrency(item.additional_amt)}
            </Text>
          </View>
          <View
            style={[
              styles.additionalRow,
              isDarkMode && styles.additionalRowDark,
            ]}
          >
            <Text
              style={[
                styles.additionalLabel,
                isDarkMode && styles.textMutedDark,
              ]}
            >
              Paid Amt
            </Text>
            <Text
              style={[styles.additionalValue, isDarkMode && styles.textDark]}
            >
              {item.paid_amt > 0
                ? `+${formatCurrency(item.paid_amt)}`
                : formatCurrency(item.paid_amt)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const StaffSalary = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const today = new Date();

  const [masterData, setMasterData] = useState<EmployeeRecord[]>([]);
  const [filteredData, setFilteredData] = useState<EmployeeRecord[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<PaymentStatus[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedDeveloperId, setSelectedDeveloperId] = useState<number | null>(
    null,
  );
  const [pendingMonth, setPendingMonth] = useState<number>(today.getMonth());
  const [pendingYear, setPendingYear] = useState<number>(today.getFullYear());
  const [pendingDeveloperId, setPendingDeveloperId] = useState<number | null>(
    null,
  );
  const [pendingStatuses, setPendingStatuses] = useState<PaymentStatus[]>([]);
  const [staffSearchQuery, setStaffSearchQuery] = useState('');

  // ── Refs ──────────────────────────────────────────────────────────────────
  const filterSheetRef = useRef<FilterBottomSheetHandle>(null);

  // ── Fetch developers once ─────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const result = await getDevelopersList();
      if (result.success) setDevelopers(result.data);
    })();
  }, []);

  // ── Core fetch — returns the fresh mapped data so callers can use it directly ──
  // FIX: returns fresh data instead of relying on state update timing
  const fetchSalary = useCallback(
    async (
      month: number,
      year: number,
      emp_id: number | null,
    ): Promise<EmployeeRecord[]> => {
      setLoading(true);
      try {
        const result = await getStaffSalaryList({
          month: month + 1,
          year,
          emp_id,
        });
        if (result.success) {
          const mapped = result.data.map(mapToEmployeeRecord);
          setMasterData(mapped);
          return mapped; // ← return fresh data to caller
        }
        setMasterData([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Initial fetch
  useEffect(() => {
    fetchSalary(selectedMonth, selectedYear, selectedDeveloperId).then(
      fresh => {
        // Apply any pre-existing filters to the fresh data
        const result = applyFiltersToData(fresh, search, selectedStatuses);
        setFilteredData(result);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Local search filter (client-side, uses masterData) ────────────────────
  const searchFilter = (text: string) => {
    setSearch(text);
    const result = applyFiltersToData(masterData, text, selectedStatuses);
    setFilteredData(result);
  };

  const togglePendingStatus = (value: PaymentStatus) =>
    setPendingStatuses(prev =>
      prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value],
    );

  // ── Sheet open ────────────────────────────────────────────────────────────
  const openFilterSheet = () => {
    setPendingMonth(selectedMonth);
    setPendingYear(selectedYear);
    setPendingDeveloperId(selectedDeveloperId);
    setPendingStatuses(selectedStatuses);

    filterSheetRef.current?.expand();
  };

  // ── Apply filters ─────────────────────────────────────────────────────────
  // FIX: fetchSalary now returns fresh data, so we filter that directly
  // instead of reading stale masterData from the closure
  const applyFilters = async () => {
    filterSheetRef.current?.close();

    // Commit pending → selected
    setSelectedMonth(pendingMonth);
    setSelectedYear(pendingYear);
    setSelectedDeveloperId(pendingDeveloperId);
    setSelectedStatuses(pendingStatuses);
    setSearch('');

    // Fetch fresh data for new month/year/staff
    const freshData = await fetchSalary(
      pendingMonth,
      pendingYear,
      pendingDeveloperId,
    );

    // FIX: apply status filter directly on freshData (not stale masterData)
    const result = applyFiltersToData(freshData, '', pendingStatuses);
    setFilteredData(result);
  };

  // ── Reset filters ─────────────────────────────────────────────────────────
  const resetFilters = async () => {
    const m = today.getMonth();
    const y = today.getFullYear();
    setPendingMonth(m);
    setPendingYear(y);
    setPendingDeveloperId(null);
    setPendingStatuses([]);
    setSelectedMonth(m);
    setSelectedYear(y);
    setSelectedDeveloperId(null);
    setSelectedStatuses([]);
    setStaffSearchQuery('');
    setSearch('');
    filterSheetRef.current?.close();

    const freshData = await fetchSalary(m, y, null);
    setFilteredData(freshData); // no filters to apply
  };

  // ── Remove individual active chip ─────────────────────────────────────────
  const removeMonthYearFilter = async () => {
    const m = today.getMonth();
    const y = today.getFullYear();
    setSelectedMonth(m);
    setSelectedYear(y);
    const freshData = await fetchSalary(m, y, selectedDeveloperId);
    const result = applyFiltersToData(freshData, search, selectedStatuses);
    setFilteredData(result);
  };

  const removeDeveloperFilter = async () => {
    setSelectedDeveloperId(null);
    const freshData = await fetchSalary(selectedMonth, selectedYear, null);
    const result = applyFiltersToData(freshData, search, selectedStatuses);
    setFilteredData(result);
  };

  const removeStatusFilter = (v: PaymentStatus) => {
    const next = selectedStatuses.filter(x => x !== v);
    setSelectedStatuses(next);
    const result = applyFiltersToData(masterData, search, next);
    setFilteredData(result);
  };

  const chipSections = [
    {
      title: 'Developers',
      items: developers.map(d => ({
        id: String(d.id),
        name: d.name,
      })),
      selectedIds: pendingDeveloperId ? [String(pendingDeveloperId)] : [],
      onToggle: (id: string) => {
        setPendingDeveloperId(prev =>
          prev === Number(id) ? null : Number(id),
        );
      },
    },
  ];

  // ── Derived ───────────────────────────────────────────────────────────────
  const hasActiveFilters =
    selectedStatuses.length > 0 ||
    selectedDeveloperId !== null ||
    selectedMonth !== today.getMonth() ||
    selectedYear !== today.getFullYear();

  const totalActiveFilters =
    selectedStatuses.length +
    (selectedDeveloperId !== null ? 1 : 0) +
    (selectedMonth !== today.getMonth() || selectedYear !== today.getFullYear()
      ? 1
      : 0);

  const selectedDeveloperName = useMemo(() => {
    if (selectedDeveloperId === null) return null;
    return developers.find(d => d.id === selectedDeveloperId)?.name ?? null;
  }, [selectedDeveloperId, developers]);

  const monthYearLabel =
    selectedMonth !== today.getMonth() || selectedYear !== today.getFullYear()
      ? `${MONTHS[selectedMonth].abbr} ${selectedYear}`
      : null;

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <ScreenWrapper
      withHeader={false}
      statusBarTranslucent
      statusBarStyle={isDarkMode ? 'light-content' : 'dark-content'}
      backgroundColor={isDarkMode ? '#0E1420' : '#F5F7FB'}
    >
      <NetInfoComponent onReconnect={fetchSalary as any} />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={[styles.screen, isDarkMode && styles.screenDark]}>
          <View style={styles.salaryHero}>
            <View style={styles.salaryBrandRow}>
              <View style={styles.salaryIcon}><AppIcon name="WalletCards" size={moderateScale(20)} color="#2563EB" /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.salaryEyebrow}>PAYROLL</Text>
                <Text style={styles.salaryTitle}>Staff salary</Text>
                <Text style={styles.salarySub}>{MONTHS[selectedMonth].abbr} {selectedYear} · {filteredData.length} employees</Text>
              </View>
              <TouchableOpacity onPress={openFilterSheet} style={styles.salaryFilterBtn}>
                <AppIcon name="SlidersHorizontal" size={moderateScale(18)} color="#0F172A" />
                {totalActiveFilters > 0 ? <View style={styles.filterDot}><Text style={styles.filterDotText}>{totalActiveFilters}</Text></View> : null}
              </TouchableOpacity>
            </View>
            <View style={styles.salaryTotals}>
              <View style={styles.totalBlock}>
                <Text style={styles.totalLabel}>RUN TOTAL</Text>
                <Text style={styles.totalAmount}>{formatCurrency(filteredData.reduce((acc, e) => acc + e.amount, 0))}</Text>
              </View>
              <View style={styles.totalDivider} />
              <View style={styles.totalBlock}>
                <Text style={styles.totalLabel}>STATUS</Text>
                <Text style={styles.totalStatus}>{filteredData.filter(e => e.status === 'PAID').length} paid</Text>
              </View>
            </View>
          </View>

          <View style={styles.searchRow}>
            <View style={{ flex: 1 }}><SearchBarComponent onChangeText={searchFilter} value={search} /></View>
            <TouchableOpacity onPress={openFilterSheet} style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}>
              <AppIcon name="ListFilter" size={moderateScale(18)} color={hasActiveFilters ? '#FFF' : '#2563EB'} />
            </TouchableOpacity>
          </View>

          <ActiveFilterChips
            chips={[
              ...(monthYearLabel ? [{ key: 'month', label: monthYearLabel, onRemove: removeMonthYearFilter }] : []),
              ...(selectedDeveloperName ? [{ key: 'developer', label: selectedDeveloperName, onRemove: removeDeveloperFilter }] : []),
              ...selectedStatuses.map(status => { const meta = ALL_STATUS_META.find(s => s.value === status); return { key: status, label: meta?.label || status, color: meta?.color, onRemove: () => removeStatusFilter(status) }; }),
            ]}
            onClearAll={resetFilters}
          />

          <View style={styles.listMeta}>
            <View>
              <Text style={[styles.listMetaTitle, isDarkMode && styles.textDark]}>Payroll records</Text>
              <Text style={[styles.listMetaSub, isDarkMode && styles.textMutedDark]}>{filteredData.length} of {masterData.length} employees</Text>
            </View>
            <View style={styles.paidChip}><View style={styles.paidDot} /><Text style={styles.paidChipText}>Live data</Text></View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {loading ? (
              <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#2563EB" /></View>
            ) : filteredData.length === 0 ? (
              <View style={styles.noDataContainer}>
                <View style={styles.emptyIcon}><AppIcon name="WalletCards" color="#94A3B8" size={28} /></View>
                <Text style={[styles.noDataText, isDarkMode && styles.textDark]}>No payroll records</Text>
                <Text style={commonFilterStyles.noDataSub}>{search ? 'No employees match your search.' : 'Try a different month or filter.'}</Text>
              </View>
            ) : (
              <View style={styles.employeeList}>
                {filteredData.map((item, index) => <EmployeeRow key={`${item.id}-${index}`} item={item} isDarkMode={isDarkMode} />)}
              </View>
            )}
          </ScrollView>
        </View>
        <FilterBottomSheet
          ref={filterSheetRef}
          statusOptions={PAYMENT_STATUSES.map(s => ({ label: s.value, color: s.color }))}
          selectedStatuses={pendingStatuses}
          onToggleStatus={togglePendingStatus}
          chipSections={chipSections}
          onApply={applyFilters}
          onReset={resetFilters}
        />
      </GestureHandlerRootView>
    </ScreenWrapper>
  );
};


// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FB' },
  screenDark: { backgroundColor: '#0E1420' },
  salaryHero: { backgroundColor: '#FFFFFF', paddingHorizontal: moderateScale(18), paddingTop: verticalScale(7), paddingBottom: verticalScale(16), borderBottomLeftRadius: moderateScale(22), borderBottomRightRadius: moderateScale(22) },
  salaryBrandRow: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(11) },
  salaryIcon: { width: moderateScale(44), height: moderateScale(44), borderRadius: moderateScale(14), backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center' },
  salaryEyebrow: { fontSize: moderateScale(7.5), fontWeight: '900', letterSpacing: 1.5, color: '#64748B' },
  salaryTitle: { fontSize: moderateScale(21), fontWeight: '800', color: '#0F172A', letterSpacing: -0.5, marginTop: 2 },
  salarySub: { fontSize: moderateScale(9), color: '#64748B', marginTop: 2 },
  salaryFilterBtn: { width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(13), backgroundColor: '#F7F9FC', borderWidth: 1, borderColor: '#E5EAF2', alignItems: 'center', justifyContent: 'center' },
  filterDot: { position: 'absolute', top: -3, right: -3, width: 16, height: 16, borderRadius: 8, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center' },
  filterDotText: { color: '#FFF', fontSize: 8, fontWeight: '800' },
  salaryTotals: { flexDirection: 'row', alignItems: 'center', marginTop: verticalScale(15), paddingTop: verticalScale(13), borderTopWidth: 1, borderTopColor: '#EEF2F7' },
  totalBlock: { flex: 1 },
  totalDivider: { width: 1, height: 32, backgroundColor: '#E7ECF3', marginHorizontal: moderateScale(13) },
  totalLabel: { fontSize: moderateScale(7.5), color: '#94A3B8', fontWeight: '900', letterSpacing: 1.2 },
  totalAmount: { fontSize: moderateScale(16), fontWeight: '900', color: '#0F172A', marginTop: 3 },
  totalStatus: { fontSize: moderateScale(13), fontWeight: '800', color: '#059669', marginTop: 3 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(8), paddingHorizontal: moderateScale(16), paddingTop: verticalScale(12) },
  filterButton: { width: moderateScale(43), height: moderateScale(43), borderRadius: moderateScale(14), backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DCE5F2', alignItems: 'center', justifyContent: 'center' },
  filterButtonActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  listMeta: { paddingHorizontal: moderateScale(18), paddingTop: verticalScale(14), paddingBottom: verticalScale(8), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  listMetaTitle: { fontSize: moderateScale(15), fontWeight: '800', color: '#0F172A' },
  listMetaSub: { fontSize: moderateScale(8.5), color: '#64748B', marginTop: 2 },
  paidChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: moderateScale(9), paddingVertical: verticalScale(6), borderRadius: 99, backgroundColor: '#ECFDF5' },
  paidDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 5 },
  paidChipText: { fontSize: 8, fontWeight: '800', color: '#047857' },
  scrollContent: { paddingHorizontal: moderateScale(16), paddingBottom: verticalScale(100) },
  loaderContainer: { alignItems: 'center', paddingTop: verticalScale(80) },
  employeeList: { gap: verticalScale(10) },
  employeeCard: { backgroundColor: '#FFF', borderRadius: moderateScale(18), overflow: 'hidden', borderWidth: 1, borderColor: '#E7ECF3', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.035, shadowRadius: 14, elevation: 1 },
  employeeCardDark: { backgroundColor: '#171E2B', borderColor: '#273143' },
  employeeRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: moderateScale(13), paddingVertical: moderateScale(13), gap: moderateScale(10) },
  employeeInfo: { flex: 1, gap: 2 },
  employeeName: { fontSize: moderateScale(13), fontWeight: '800', color: '#0F172A' },
  employeeRight: { alignItems: 'flex-end', gap: 4 },
  employeeAmount: { fontSize: moderateScale(14), fontWeight: '900', color: '#0F172A' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99, borderWidth: 0 },
  statusDotSmall: { width: 5, height: 5, borderRadius: 3 },
  statusPillText: { fontSize: 8.5, fontWeight: '800' },
  expandedPanel: { backgroundColor: '#F8FAFC', paddingHorizontal: moderateScale(13), paddingVertical: moderateScale(13), gap: verticalScale(10), borderTopWidth: 1, borderTopColor: '#EEF2F7' },
  expandedPanelDark: { backgroundColor: '#121925', borderTopColor: '#273143' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: verticalScale(10) },
  infoCell: { width: '47%', gap: 3 },
  infoCellLabel: { fontSize: 8, color: '#94A3B8', letterSpacing: 0.6, fontWeight: '800' },
  infoCellValue: { fontSize: 11.5, fontWeight: '800', color: '#0F172A' },
  additionalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: '#EEF2F7' },
  additionalRowDark: { backgroundColor: '#171E2B', borderColor: '#273143' },
  additionalLabel: { fontSize: 11.5, color: '#64748B' },
  additionalValue: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  noDataContainer: { alignItems: 'center', paddingTop: verticalScale(115), paddingHorizontal: moderateScale(34) },
  emptyIcon: { width: 58, height: 58, borderRadius: 20, backgroundColor: '#EEF3FA', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  noDataText: { fontSize: moderateScale(17), fontWeight: '800', color: '#1E293B', marginBottom: 6 },
  textDark: { color: '#F0F0F0' },
  textMutedDark: { color: '#9CA3AF' },
});


export default StaffSalary;
