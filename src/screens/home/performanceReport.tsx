import React, { useEffect, useState, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { getPerformanceReport, getProjectPerformance } from '../../services';
import { convertMinutesToReadableFormat } from '../../utils';
import AppIcon from '../../components/appIcon';
import { moderateScale, verticalScale, scale } from 'react-native-size-matters';
import moment from 'moment';
import NetInfoComponent from '../../components/netinfoComponent';
import AppScreen from '../../components/ui/AppScreen';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PerformanceReportItem {
  actual_minuties: number | string;
  working_minuties: number | string;
  date: string; // e.g. "Mar-20", "Mar-9"
}

interface ProjectPerformanceItem {
  project_id: number;
  project_name: string;
  total_minutes: number;
}

interface ChartDataItem {
  value: number;
  displayValue: string;
  frontColor: string;
  gradientColor: string;
  spacing?: number;
  label?: string;
}

type FilterDays = 7 | 15 | 30;

// ─── Pure helpers ─────────────────────────────────────────────────────────────

const toMinutes = (v: number | string | undefined | null): number =>
  Number(v ?? 0);

const formatHours = (min: number): number => min / 60;

const formatHoursLabel = (min: number): string => `${(min / 60).toFixed(1)}h`;

/**
 * Parse API date strings like "Mar-20", "Mar-9".
 * 'MMM-D-YYYY' handles both single and double digit days correctly.
 */
const parseDateStr = (raw: string): moment.Moment =>
  moment(`${raw}-${moment().year()}`, 'MMM-D-YYYY', true);

const getAvgHours = (data: PerformanceReportItem[]): number => {
  if (!data.length) return 0;
  return (
    data.reduce((s, i) => s + toMinutes(i.actual_minuties), 0) /
    data.length /
    60
  );
};

const getTotalHours = (data: PerformanceReportItem[]): number => {
  if (!data.length) return 0;
  return data.reduce((s, i) => s + toMinutes(i.actual_minuties), 0) / 60;
};

const getEfficiencyRate = (data: PerformanceReportItem[]): number => {
  if (!data.length) return 0;
  const actual = data.reduce((s, i) => s + toMinutes(i.actual_minuties), 0);
  const working = data.reduce((s, i) => s + toMinutes(i.working_minuties), 0);
  if (working === 0) return 0;
  return Math.min(Math.round((actual / working) * 100), 100);
};

const getStatusLabel = (
  actual: number,
  working: number,
): { label: string; color: string; bg: string } => {
  if (actual === 0 && working === 0)
    return { label: 'NO DATA', color: '#9098B1', bg: '#F0F3FB' };
  if (working === 0)
    return { label: 'NO TARGET', color: '#FFA000', bg: '#FFF8E1' };
  const ratio = actual / working;
  if (actual > working)
    return { label: 'OVERTIME', color: '#EF4444', bg: '#FEE2E2' };
  if (ratio >= 0.95)
    return { label: 'TARGET MET', color: '#22C55E', bg: '#DCFCE7' };
  if (ratio >= 0.75)
    return { label: 'ON TRACK', color: '#3B6FD4', bg: '#EEF4FF' };
  return { label: 'BELOW TARGET', color: '#FFA000', bg: '#FFF8E1' };
};

const BAR_COLORS = ['#2563EB', '#5D8AED', '#84A6EE', '#A9C0EF', '#C7D8F8'];
const FILTER_OPTIONS: FilterDays[] = [7, 15, 30];

// ─── Component ────────────────────────────────────────────────────────────────

const PerformanceReport: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [reportData, setReportData] = useState<PerformanceReportItem[]>([]);
  const [projectData, setProjectData] = useState<ProjectPerformanceItem[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterDays>(7);

  // ── Theme ──────────────────────────────────────────────────────────────────
  const t = {
    bg: isDarkMode ? '#141518' : '#F5F7FB',
    card: isDarkMode ? '#1E2028' : '#FFFFFF',
    text: isDarkMode ? '#F0F0F0' : '#1A1D2E',
    sub: '#9098B1',
    border: isDarkMode ? '#2A2D38' : '#EAEDFF',
    primary: '#3B6FD4',
    headerBg: isDarkMode ? '#1E2028' : '#FFFFFF',
  };

  // ── Fetch project performance whenever filter changes ─────────────────────
  const fetchReport = async () => {
    try {
      const data = await getPerformanceReport();
      setReportData(data.final_array || []);
    } catch (e) {
      console.error('Error fetching performance report', e);
    }
  };

  const fetchProjects = async () => {
    try {
      setProjectLoading(true);

      const data = await getProjectPerformance(selectedFilter);

      setProjectData(data?.project_wise_work_hours || []);
    } catch (e) {
      console.error('Error fetching project performance', e);
      setProjectData([]);
    } finally {
      setProjectLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [selectedFilter]);
  // ── Filter staff report data by selected day window ───────────────────────
  const filteredData = useMemo<PerformanceReportItem[]>(() => {
    if (!reportData.length) return [];
    const cutoff = moment().startOf('day').subtract(selectedFilter, 'days');
    const result = reportData.filter(item => {
      const m = parseDateStr(item.date);
      return m.isValid() && m.isSameOrAfter(cutoff, 'day');
    });
    return result.length > 0 ? result : reportData;
  }, [reportData, selectedFilter]);

  // ── Dynamic chart ceiling ──────────────────────────────────────────────────
  const chartMaxValue = useMemo(() => {
    if (!filteredData.length) return 10;
    const maxMin = Math.max(
      ...filteredData.map(i => toMinutes(i.actual_minuties)),
      ...filteredData.map(i => toMinutes(i.working_minuties)),
    );
    return Math.max(Math.ceil(maxMin / 60), 10);
  }, [filteredData]);

  const yAxisLabels = useMemo(
    () => Array.from({ length: chartMaxValue + 1 }, (_, i) => `${i}h`),
    [chartMaxValue],
  );

  // ── Chart data ─────────────────────────────────────────────────────────────
  const chartData = useMemo<ChartDataItem[]>(() => {
    if (!filteredData.length) return [];
    const sorted = [...filteredData].sort((a, b) =>
      parseDateStr(a.date).diff(parseDateStr(b.date)),
    );
    return sorted.flatMap(item => [
      {
        value: formatHours(toMinutes(item.actual_minuties)),
        displayValue: convertMinutesToReadableFormat(
          toMinutes(item.actual_minuties),
        ),
        frontColor: isDarkMode ? '#5B8DF5' : '#93B4FF',
        gradientColor: isDarkMode ? '#5B8DF5' : '#93B4FF',
        spacing: scale(6),
        label: item.date,
      },
      {
        value: formatHours(toMinutes(item.working_minuties)),
        displayValue: convertMinutesToReadableFormat(
          toMinutes(item.working_minuties),
        ),
        frontColor: '#3B6FD4',
        gradientColor: '#3B6FD4',
      },
    ]);
  }, [filteredData, isDarkMode]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalHours = getTotalHours(filteredData);
  const avgHours = getAvgHours(filteredData);
  const efficiencyRate = getEfficiencyRate(filteredData);

  // ── Project distribution total (for % calculation) ────────────────────────
  const projectTotal = useMemo(
    () => projectData.reduce((s, p) => s + p.total_minutes, 0),
    [projectData],
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AppScreen padding={false}>
      <NetInfoComponent onReconnect={fetchReport} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Chart Card ───────────────────────────────────────────────────── */}
        <View style={[styles.chartCard, { backgroundColor: t.card }]}>
          <Text style={[styles.chartSubLabel, { color: t.sub }]}>
            Hours Worked
          </Text>

          <View style={styles.chartTotalRow}>
            <Text style={[styles.chartTotalValue, { color: t.text }]}>
              {totalHours.toFixed(1)}hr
            </Text>
            <View style={styles.trendBadge}>
              <AppIcon
                name="TrendingUp"
                color="#22C55E"
                size={moderateScale(13)}
              />
              <Text style={styles.trendText}>+12%</Text>
            </View>
          </View>

          {/* Filter pills */}
          <View style={styles.filterRow}>
            {FILTER_OPTIONS.map(days => {
              const active = selectedFilter === days;
              return (
                <TouchableOpacity
                  key={days}
                  onPress={() => setSelectedFilter(days)}
                  style={[
                    styles.filterPill,
                    { backgroundColor: active ? t.primary : t.border },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      { color: active ? '#FFFFFF' : t.sub },
                    ]}
                  >
                    {days}D
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: isDarkMode ? '#5B8DF5' : '#93B4FF' },
                ]}
              />
              <Text style={[styles.legendText, { color: t.sub }]}>
                Actual Time
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: '#3B6FD4' }]}
              />
              <Text style={[styles.legendText, { color: t.sub }]}>
                Working Time
              </Text>
            </View>
          </View>

          {/* Bar chart */}
          {chartData.length > 0 ? (
            <View style={styles.chartWrapper}>
              <BarChart
                data={chartData}
                barWidth={scale(14)}
                spacing={scale(18)}
                initialSpacing={scale(8)}
                roundedTop
                roundedBottom
                hideRules
                isAnimated
                animationDuration={400}
                noOfSections={chartMaxValue}
                maxValue={chartMaxValue}
                yAxisLabelTexts={yAxisLabels}
                yAxisTextStyle={{ color: t.sub, fontSize: moderateScale(10) }}
                xAxisLabelTextStyle={{
                  color: t.sub,
                  fontSize: moderateScale(9),
                  width: scale(44),
                  textAlign: 'center',
                }}
                renderTooltip={(item: ChartDataItem) => (
                  <View style={styles.tooltip}>
                    <Text style={styles.tooltipText}>{item.displayValue}</Text>
                  </View>
                )}
              />
            </View>
          ) : (
            <View style={styles.emptyChart}>
              <AppIcon
                name="BarChart2"
                color={t.sub}
                size={moderateScale(36)}
              />
              <Text style={[styles.emptyText, { color: t.sub }]}>
                No data for last {selectedFilter} days
              </Text>
            </View>
          )}
        </View>

        {/* ── Summary Card ─────────────────────────────────────────────────── */}
        <View style={[styles.summaryCard, { backgroundColor: t.primary }]}>
          <View style={styles.summaryTop}>
            <AppIcon
              name="TrendingUp"
              color="rgba(255,255,255,0.8)"
              size={moderateScale(18)}
            />
            <Text style={styles.summaryTitle}>
              {selectedFilter}-Day Summary
            </Text>
          </View>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>
                {avgHours.toFixed(2)}hr
              </Text>
              <Text style={styles.summaryStatLabel}>Daily Avg</Text>
            </View>
            <View style={styles.summaryStatDivider} />
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>
                {totalHours.toFixed(1)}hr
              </Text>
              <Text style={styles.summaryStatLabel}>Total Hours</Text>
            </View>
            <View style={styles.summaryStatDivider} />
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>{efficiencyRate}%</Text>
              <Text style={styles.summaryStatLabel}>Efficiency</Text>
            </View>
          </View>
        </View>

        {/* ── Project Distribution ──────────────────────────────────────────── */}
        <View style={[styles.sectionCard, { backgroundColor: t.card }]}>
          <View style={styles.sectionHeaderRow}>
            <AppIcon
              name="PieChart"
              color={t.primary}
              size={moderateScale(16)}
            />
            <Text style={[styles.sectionTitle, { color: t.text }]}>
              Project Distribution
            </Text>
            {/* Date range label from API */}
            <Text style={[styles.dateRangeLabel, { color: t.sub }]}>
              Last {selectedFilter}D
            </Text>
          </View>

          {projectLoading ? (
            // ── Loading spinner while fetching project data ──
            <View style={styles.projectLoadingContainer}>
              <ActivityIndicator color={t.primary} size="small" />
              <Text style={[styles.projectLoadingText, { color: t.sub }]}>
                Loading projects...
              </Text>
            </View>
          ) : projectData.length > 0 ? (
            projectData.map((item, index) => {
              const pct =
                projectTotal > 0
                  ? (item.total_minutes / projectTotal) * 100
                  : 0;
              const color = BAR_COLORS[index % BAR_COLORS.length];

              return (
                <View key={item.project_id} style={styles.distItem}>
                  <View style={styles.distTopRow}>
                    {/* Project name from API */}
                    <Text
                      style={[styles.distProjectName, { color: t.text }]}
                      numberOfLines={1}
                    >
                      {item.project_name}
                    </Text>
                    {/* Hours from API total_minutes */}
                    <Text style={[styles.distHoursValue, { color: color }]}>
                      {formatHoursLabel(item.total_minutes)}
                    </Text>
                  </View>

                  {/* Progress bar */}
                  <View
                    style={[styles.distBarBg, { backgroundColor: t.border }]}
                  >
                    <View
                      style={[
                        styles.distBar,
                        {
                          width: `${Math.max(pct, 2)}%`,
                          backgroundColor: color,
                        },
                      ]}
                    />
                  </View>

                  {/* Percentage label */}
                  <Text style={[styles.distPctLabel, { color: t.sub }]}>
                    {pct.toFixed(1)}% of total
                  </Text>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyChart}>
              <AppIcon name="PieChart" color={t.sub} size={moderateScale(36)} />
              <Text style={[styles.emptyText, { color: t.sub }]}>
                No project data for last {selectedFilter} days
              </Text>
            </View>
          )}
        </View>

        {/* ── Daily Breakdown ───────────────────────────────────────────────── */}
        {/* <View style={[styles.sectionCard, { backgroundColor: t.card }]}>
          <View style={styles.sectionHeaderRow}>
            <AppIcon
              name="Calendar"
              color={t.primary}
              size={moderateScale(16)}
            />
            <Text style={[styles.sectionTitle, { color: t.text }]}>
              Daily Breakdown
            </Text>
          </View>

          {filteredData.length > 0 ? (
            [...filteredData]
              .sort((a, b) =>
                parseDateStr(b.date).diff(parseDateStr(a.date)),
              )
              .map((item, index, arr) => {
                const dateInfo = formatDisplayDate(item.date);
                const status = getStatusLabel(
                  toMinutes(item.actual_minuties),
                  toMinutes(item.working_minuties),
                );
                const m = parseDateStr(item.date);
                const dayNum = m.isValid() ? m.format('D') : '--';
                const monthShort = m.isValid()
                  ? m.format('MMM').toUpperCase()
                  : '--';

                return (
                  <View
                    key={index}
                    style={[
                      styles.dailyRow,
                      index < arr.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: t.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.dateChip,
                        { backgroundColor: t.primary },
                      ]}
                    >
                      <Text style={styles.dateChipMonth}>{monthShort}</Text>
                      <Text style={styles.dateChipDay}>{dayNum}</Text>
                    </View>

                    <View style={styles.dailyInfo}>
                      <Text style={[styles.dailyWeekday, { color: t.text }]}>
                        {dateInfo.weekday}
                      </Text>
                      <Text style={[styles.dailyHours, { color: t.sub }]}>
                        {formatMinutes(toMinutes(item.actual_minuties))} logged
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: status.bg },
                      ]}
                    >
                      <Text
                        style={[styles.statusText, { color: status.color }]}
                      >
                        {status.label}
                      </Text>
                    </View>
                  </View>
                );
              })
          ) : (
            <View style={styles.emptyChart}>
              <AppIcon
                name="Calendar"
                color={t.sub}
                size={moderateScale(36)}
              />
              <Text style={[styles.emptyText, { color: t.sub }]}>
                No daily data for last {selectedFilter} days
              </Text>
            </View>
          )}
        </View> */}

        {/* Branding */}
        <Text style={[styles.brandName, { color: t.border }]}>
          JATAYU{'\n'}Technologies
        </Text>
      </ScrollView>
    </AppScreen>
  );
};

export default PerformanceReport;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(18),
    paddingBottom: verticalScale(80),
  },

  // ── Chart card ──
  chartCard: {
    borderRadius: moderateScale(18),
    padding: moderateScale(18),
    marginBottom: verticalScale(14),
    shadowColor: '#3B6FD4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  chartSubLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: verticalScale(4),
  },
  chartTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    marginBottom: verticalScale(12),
  },
  chartTotalValue: {
    fontSize: moderateScale(36),
    fontWeight: '900',
    letterSpacing: -1,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    backgroundColor: '#DCFCE7',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(20),
  },
  trendText: {
    color: '#22C55E',
    fontSize: moderateScale(12),
    fontWeight: '700',
  },

  // ── Filter pills ──
  filterRow: {
    flexDirection: 'row',
    gap: scale(8),
    marginBottom: verticalScale(14),
  },
  filterPill: {
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(7),
    borderRadius: moderateScale(20),
  },
  filterPillText: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Legend ──
  legendRow: {
    flexDirection: 'row',
    gap: scale(16),
    marginBottom: verticalScale(12),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  legendDot: {
    width: moderateScale(10),
    height: moderateScale(10),
    borderRadius: moderateScale(3),
  },
  legendText: {
    fontSize: moderateScale(12),
    fontWeight: '500',
  },

  // ── Chart ──
  chartWrapper: { marginLeft: -scale(8) },
  tooltip: {
    backgroundColor: '#3B6FD4',
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(4),
  },
  tooltipText: {
    color: '#fff',
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  emptyChart: {
    alignItems: 'center',
    paddingVertical: verticalScale(36),
    gap: verticalScale(10),
  },
  emptyText: {
    fontSize: moderateScale(13),
    fontWeight: '500',
  },

  // ── Summary card ──
  summaryCard: {
    borderRadius: moderateScale(18),
    padding: moderateScale(20),
    marginBottom: verticalScale(14),
    shadowColor: '#3B6FD4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginBottom: verticalScale(18),
  },
  summaryTitle: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryStat: {
    flex: 1,
    alignItems: 'center',
  },
  summaryStatValue: {
    color: '#FFFFFF',
    fontSize: moderateScale(22),
    fontWeight: '900',
    marginBottom: verticalScale(4),
  },
  summaryStatLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  summaryStatDivider: {
    width: 1,
    height: verticalScale(40),
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // ── Section cards ──
  sectionCard: {
    borderRadius: moderateScale(18),
    padding: moderateScale(18),
    marginBottom: verticalScale(14),
    shadowColor: '#3B6FD4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginBottom: verticalScale(18),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    letterSpacing: 0.1,
    flex: 1,
  },
  dateRangeLabel: {
    fontSize: moderateScale(11),
    fontWeight: '600',
  },

  // ── Project distribution ──
  projectLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
    paddingVertical: verticalScale(24),
  },
  projectLoadingText: {
    fontSize: moderateScale(13),
    fontWeight: '500',
  },
  distItem: {
    marginBottom: verticalScale(16),
  },
  distTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(6),
  },
  distProjectName: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    flex: 1,
    marginRight: scale(8),
  },
  distHoursValue: {
    fontSize: moderateScale(14),
    fontWeight: '800',
  },
  distBarBg: {
    width: '100%',
    height: verticalScale(7),
    borderRadius: moderateScale(4),
    overflow: 'hidden',
    marginBottom: verticalScale(4),
  },
  distBar: {
    height: '100%',
    borderRadius: moderateScale(4),
  },
  distPctLabel: {
    fontSize: moderateScale(11),
    fontWeight: '500',
  },

  // ── Branding ──
  brandName: {
    fontSize: moderateScale(32),
    fontWeight: '900',
    fontStyle: 'italic',
    lineHeight: moderateScale(38),
    marginTop: verticalScale(16),
    marginBottom: verticalScale(8),
    textAlign: 'right',
  },
});
