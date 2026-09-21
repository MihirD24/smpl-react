import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import AppIcon from '../../../components/appIcon';
import NetInfoComponent from '../../../components/netinfoComponent';
import {getEmployeeList} from '../../../services/serviceVisitServices';

const YELLOW = '#F9C900';

type Employee = Record<string, any>;

const pick = (item: Employee, keys: string[], fallback = '') => {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null && String(item[key]).trim() !== '') {
      return String(item[key]);
    }
  }
  return fallback;
};

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase() || 'E';

const extractEmployees = (response: any): Employee[] => {
  const candidates = [
    response?.data,
    response?.data?.data,
    response?.employees,
    response?.data?.employees,
    response,
  ];
  const value = candidates.find(Array.isArray);
  return Array.isArray(value) ? value : [];
};

const AdminEmployees: React.FC = () => {
  const isDark = useColorScheme() === 'dark';
  const {width} = useWindowDimensions();
  const isTablet = width >= 768;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const colors = {
    page: isDark ? '#0B0D0F' : '#F5F6F7',
    card: isDark ? '#15181B' : '#FFFFFF',
    border: isDark ? '#2A2F34' : '#E2E5E8',
    text: isDark ? '#F5F6F7' : '#171717',
    muted: isDark ? '#9AA1A8' : '#69727B',
    soft: isDark ? '#1E2226' : '#F1F3F4',
  };

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getEmployeeList();
      setEmployees(extractEmployees(response));
    } catch (error) {
      console.error('Admin employee list error:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await getEmployeeList();
      console.log('Admin employee refresh response:', response);
      setEmployees(extractEmployees(response));
    } catch (error) {
      console.error('Admin employee refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return employees;
    return employees.filter(item => {
      const haystack = [
        pick(item, ['name', 'employee_name', 'full_name', 'username']),
        pick(item, ['employee_id', 'employeeId', 'id']),
        pick(item?.branch, ['branch', 'branch_name']),
        pick(item?.department, ['department', 'department_name']),
        pick(item?.designation, ['designation', 'designation_name', 'role']),
        pick(item, ['mobile', 'phone', 'contact_no']),
        pick(item, ['email', 'email_id']),
      ].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [employees, search]);

  return (
    <View style={[styles.root, {backgroundColor: colors.page}]}>
      <NetInfoComponent onReconnect={loadEmployees} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, isTablet && styles.contentTablet]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[YELLOW]}
            tintColor={YELLOW}
          />
        }>
        <View style={[styles.container, isTablet && styles.containerTablet]}>
          <View style={styles.headerRow}>
            <View style={styles.headerAccent} />
            <View style={{flex: 1}}>
              <Text style={[styles.eyebrow, {color: colors.muted}]}>PEOPLE DIRECTORY</Text>
              <Text style={[styles.title, {color: colors.text}]}>Employee Management</Text>
              <Text style={[styles.subtitle, {color: colors.muted}]}>Manage your workforce in one place</Text>
            </View>
            <View style={[styles.countBadge, {backgroundColor: colors.card, borderColor: colors.border}]}>
              <Text style={[styles.countValue, {color: colors.text}]}>{employees.length}</Text>
              <Text style={[styles.countLabel, {color: colors.muted}]}>TOTAL</Text>
            </View>
          </View>

          <View style={[styles.searchBox, {backgroundColor: colors.card, borderColor: colors.border}]}>
            <AppIcon name="Search" size={20} color={colors.muted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search employee, ID, branch..."
              placeholderTextColor={colors.muted}
              style={[styles.searchInput, {color: colors.text}]}
              returnKeyType="search"
            />
            {!!search && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={10}>
                <AppIcon name="X" size={18} color={colors.muted} />
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.sectionBar, {borderBottomColor: colors.border}]}>
            <Text style={[styles.sectionTitle, {color: colors.text}]}>All Employees</Text>
            <Text style={[styles.resultText, {color: colors.muted}]}>{filteredEmployees.length} results</Text>
          </View>

          {loading ? (
            <View style={[styles.loadingCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
              <ActivityIndicator color={YELLOW} size="small" />
              <Text style={[styles.loadingText, {color: colors.muted}]}>Loading employees...</Text>
            </View>
          ) : filteredEmployees.length === 0 ? (
            <View style={[styles.emptyCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
              <View style={[styles.emptyIcon, {backgroundColor: isDark ? '#292400' : '#FFF7CC'}]}>
                <AppIcon name="Users" size={28} color={isDark ? YELLOW : '#8A6A00'} />
              </View>
              <Text style={[styles.emptyTitle, {color: colors.text}]}>No employees found</Text>
              <Text style={[styles.emptyText, {color: colors.muted}]}>
                {search ? 'Try another name, ID, branch or department.' : 'Employee data is currently empty.'}
              </Text>
            </View>
          ) : (
            <View style={isTablet ? styles.grid : undefined}>
              {filteredEmployees.map((item, index) => {
                const name = pick(item, ['name', 'employee_name', 'full_name', 'username'], 'Employee');
                const id = pick(item, ['employee_code', 'employee_code', 'employee_code'], '--');
                const designation = pick(item?.designation, ['designation', 'designation_name', 'role'], 'Team Member');
                const branch = pick(item?.branch, ['branch', 'branch_name'], 'Branch not assigned');
                const department = pick(item?.department, ['department', 'department_name'], 'Department not assigned');
                const mobile = pick(item, ['mobile', 'phone', 'contact_no']);
                const email = pick(item, ['email', 'email_id']);
                const status = pick(item, ['status', 'employee_status'], 'Active');
                const active = status.toLowerCase() === 'active';
                return (
                  <View
                    key={`${id}-${index}`}
                    style={[styles.employeeCard, isTablet && styles.employeeCardTablet, {backgroundColor: colors.card, borderColor: colors.border}]}>
                    <View style={styles.cardTop}>
                      <View style={[styles.avatar, {backgroundColor: YELLOW}]}>
                        <Text style={styles.avatarText}>{initials(name)}</Text>
                      </View>
                      <View style={{flex: 1, minWidth: 0}}>
                        <Text numberOfLines={1} style={[styles.employeeName, {color: colors.text}]}>{name}</Text>
                        <Text numberOfLines={1} style={[styles.employeeRole, {color: colors.muted}]}>{designation}</Text>
                      </View>
                      <View style={[styles.status, {backgroundColor: active ? (isDark ? '#12301E' : '#E8F6ED') : (isDark ? '#32191A' : '#FDECEC')}]}>
                        <View style={[styles.statusDot, {backgroundColor: active ? '#16803C' : '#C62828'}]} />
                        <Text style={[styles.statusText, {color: active ? '#16803C' : '#C62828'}]}>{active ? 'Active' : status}</Text>
                      </View>
                    </View>

                    <View style={[styles.idRow, {backgroundColor: colors.soft}]}>
                      <Text style={[styles.idLabel, {color: colors.muted}]}>EMPLOYEE ID</Text>
                      <Text style={[styles.idValue, {color: colors.text}]}>{id}</Text>
                    </View>

                    <View style={styles.metaGrid}>
                      <View style={styles.metaItem}>
                        <AppIcon name="Building2" size={16} color={YELLOW} />
                        <View style={{flex: 1}}><Text style={[styles.metaLabel, {color: colors.muted}]}>Branch</Text><Text numberOfLines={1} style={[styles.metaValue, {color: colors.text}]}>{branch}</Text></View>
                      </View>
                      <View style={styles.metaItem}>
                        <AppIcon name="Briefcase" size={16} color={YELLOW} />
                        <View style={{flex: 1}}><Text style={[styles.metaLabel, {color: colors.muted}]}>Department</Text><Text numberOfLines={1} style={[styles.metaValue, {color: colors.text}]}>{department}</Text></View>
                      </View>
                    </View>

                    {(mobile || email) && (
                      <View style={[styles.contactRow, {borderTopColor: colors.border}]}>
                        {mobile ? <View style={styles.contactItem}><AppIcon name="Phone" size={15} color={colors.muted} /><Text numberOfLines={1} style={[styles.contactText, {color: colors.muted}]}>{mobile}</Text></View> : null}
                        {email ? <View style={styles.contactItem}><AppIcon name="Mail" size={15} color={colors.muted} /><Text numberOfLines={1} style={[styles.contactText, {color: colors.muted}]}>{email}</Text></View> : null}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1},
  content: {paddingBottom: 32},
  contentTablet: {paddingBottom: 48},
  container: {width: '100%', maxWidth: 620, alignSelf: 'center', padding: 16},
  containerTablet: {maxWidth: 1120, paddingHorizontal: 28, paddingTop: 24},
  headerRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 18},
  headerAccent: {width: 5, height: 66, borderRadius: 3, backgroundColor: YELLOW, marginRight: 12},
  eyebrow: {fontSize: 10, fontWeight: '800', letterSpacing: 1.1, marginBottom: 3},
  title: {fontSize: 25, lineHeight: 31, fontWeight: '800', letterSpacing: -0.4},
  subtitle: {fontSize: 13, lineHeight: 18, fontWeight: '500', marginTop: 2},
  countBadge: {minWidth: 70, borderWidth: 1, borderRadius: 14, paddingVertical: 9, paddingHorizontal: 10, alignItems: 'center', marginLeft: 10},
  countValue: {fontSize: 22, lineHeight: 26, fontWeight: '800'},
  countLabel: {fontSize: 8, fontWeight: '800', letterSpacing: 1},
  searchBox: {minHeight: 50, borderWidth: 1, borderRadius: 15, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginBottom: 18},
  searchInput: {flex: 1, minWidth: 0, fontSize: 14, paddingVertical: 10, marginLeft: 10},
  sectionBar: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottomWidth: 1, marginBottom: 12},
  sectionTitle: {fontSize: 17, fontWeight: '800'},
  resultText: {fontSize: 12, fontWeight: '600'},
  loadingCard: {minHeight: 160, borderWidth: 1, borderRadius: 18, alignItems: 'center', justifyContent: 'center'},
  loadingText: {marginTop: 10, fontSize: 13, fontWeight: '600'},
  emptyCard: {minHeight: 250, borderWidth: 1, borderRadius: 20, alignItems: 'center', justifyContent: 'center', padding: 28},
  emptyIcon: {width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 14},
  emptyTitle: {fontSize: 18, fontWeight: '800'},
  emptyText: {fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 5, maxWidth: 340},
  grid: {flexDirection: 'row', flexWrap: 'wrap', gap: 14},
  employeeCard: {borderWidth: 1, borderRadius: 18, padding: 15, marginBottom: 12},
  employeeCardTablet: {width: '48.9%', marginBottom: 0},
  cardTop: {flexDirection: 'row', alignItems: 'center'},
  avatar: {width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 11},
  avatarText: {fontSize: 15, fontWeight: '900', color: '#111111'},
  employeeName: {fontSize: 16, lineHeight: 21, fontWeight: '800'},
  employeeRole: {fontSize: 12, lineHeight: 17, marginTop: 1},
  status: {flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 5, marginLeft: 8},
  statusDot: {width: 6, height: 6, borderRadius: 3, marginRight: 5},
  statusText: {fontSize: 10, fontWeight: '800'},
  idRow: {marginTop: 14, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  idLabel: {fontSize: 8, fontWeight: '800', letterSpacing: 0.8},
  idValue: {fontSize: 12, fontWeight: '800'},
  metaGrid: {flexDirection: 'row', gap: 10, marginTop: 13},
  metaItem: {flex: 1, flexDirection: 'row', alignItems: 'center', minWidth: 0},
  metaLabel: {fontSize: 9, fontWeight: '600'},
  metaValue: {fontSize: 12, fontWeight: '700', marginTop: 1},
  contactRow: {borderTopWidth: 1, marginTop: 13, paddingTop: 11, gap: 8},
  contactItem: {flexDirection: 'row', alignItems: 'center', minWidth: 0},
  contactText: {fontSize: 11, marginLeft: 7, flexShrink: 1},
});

export default AdminEmployees;
