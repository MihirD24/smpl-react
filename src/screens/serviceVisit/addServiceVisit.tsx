import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  useColorScheme,
  StatusBar,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { moderateScale, verticalScale } from 'react-native-size-matters';

import CustomDropdown from '../../components/formComponent/customDropdown';
import CustomInput from '../../components/formComponent/customInput';
import CustomButton from '../../components/button/customButton';
import CalendarPickerModal from '../../components/formComponent/calendarpickermodal';
import CustomRadioGroup from '../../components/formComponent/customRadioGroup';
import FormLabel from '../../components/formComponent/formLabel';
import AppIcon from '../../components/appIcon';
import ToastUtil from '../../utils/toastAndroid';
import { useAuth } from '../../context/authContext';
import { formStyles, getFormTheme } from '../../assets/style/formStyles';
import { formatDate } from '../../utils/dateUtils';

import {
  getBranchList,
  getEmployeeList,
  getMachineModelsList,
  getPartyList,
  getPartyByMachine,
  storeMachine,
  getDaAmount,
  addServiceVisit,
} from '../../services/serviceVisitServices';

const AddServiceVisit = ({ navigation }: any) => {
  const { colors } = useTheme();
  const isDarkMode = useColorScheme() === 'dark';
  const theme = getFormTheme(isDarkMode);
  const { userInfo } = useAuth();

  // Loading States
  const [loading, setLoading] = useState(false);
  const [searchingMachine, setSearchingMachine] = useState(false);
  const [calculatingDa, setCalculatingDa] = useState(false);

  // Form State Variables
  const [branchId, setBranchId] = useState<number | null>(null);
  const [visitDate, setVisitDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [companyVehicle, setCompanyVehicle] = useState<'yes' | 'no'>('no');
  const [noOfEmployee, setNoOfEmployee] = useState<number>(1);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [isEngineer, setIsEngineer] = useState<'Yes' | 'No'>('No');
  const [additionalEmployeeIds, setAdditionalEmployeeIds] = useState<number[]>([]);
  const [engineerId, setEngineerId] = useState<number | null>(null);
  const [partyIdDriver, setPartyIdDriver] = useState<number | null>(null);
  const [salesPartyName, setSalesPartyName] = useState('');
  const [machineNumber, setMachineNumber] = useState('');
  const [machineId, setMachineId] = useState<number | null>(null);
  const [partyId, setPartyId] = useState<number | null>(null);
  const [partyName, setPartyName] = useState('');
  const [visitCategory, setVisitCategory] = useState<string | null>(null);
  const [workDescription, setWorkDescription] = useState('');
  const [location, setLocation] = useState('');
  const [complain, setComplain] = useState('');
  const [remarks, setRemarks] = useState('');
  const [hmr, setHmr] = useState<number>(0);
  const [svr, setSvr] = useState<number>(0);
  
  // File Attachment State
  const [svrFile, setSvrFile] = useState<any>(null);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);

  const [callCount, setCallCount] = useState<number>(0);
  const [km, setKm] = useState<number>(0);
  const [nightStay, setNightStay] = useState<'None' | 'Late night' | 'Full night'>('None');

  // Amount States
  const [taAmount, setTaAmount] = useState<number>(0);
  const [stayAmount, setStayAmount] = useState<number>(0);
  const [daAmount, setDaAmount] = useState<number>(0);

  // Master Data Dropdowns
  const [branches, setBranches] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [machineModels, setMachineModels] = useState<any[]>([]);

  // Add Machine Modal State
  const [addMachineVisible, setAddMachineVisible] = useState(false);
  const [newMachineName, setNewMachineName] = useState('');
  const [newMachineModelId, setNewMachineModelId] = useState<number | null>(null);
  const [newMachinePartyId, setNewMachinePartyId] = useState<number | null>(null);
  const [savingMachine, setSavingMachine] = useState(false);
  console.log('part',partyName)
  // Load Dropdown Data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [branchRes, empRes, partyRes, modelRes] = await Promise.all([
          getBranchList(),
          getEmployeeList(),
          getPartyList(),
          getMachineModelsList(),
        ]);

        if (branchRes.success) setBranches(branchRes.data || []);
        if (empRes.success) {
          const empList = empRes.data || [];
          setEmployees(empList);
          
          // Set current user as default logged-in employee if match found
          if (userInfo?.name) {
            const foundUser = empList.find(
              (e: any) => e.name?.toLowerCase() === userInfo.name?.toLowerCase()
            );
            if (foundUser) {
              setEmployeeId(foundUser.id);
            }
          }
        }
        if (partyRes.success) setParties(partyRes.data || []);
        if (modelRes.success) setMachineModels(modelRes.data || []);
      } catch (err) {
        console.error('Initial data load error:', err);
        ToastUtil.error('Failed to load master data dropdowns.');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [userInfo]);

  // Determine selected employee details
  const selectedEmployee = useMemo(() => {
    if (!employeeId) return null;
    return employees.find((e: any) => e.id === employeeId);
  }, [employeeId, employees]);

  const selectedBranch = useMemo(() => {
    if (!branchId) return null;
    return branches.find((b: any) => b.id === branchId);
  }, [branchId, branches]);

  // Department Code rules logic:
  // - If employee department is 5 (Driver) -> type = 'ADMIN'
  // - If employee department is 6 (Sales) -> type = 'Sales'
  // - Else -> type = 'SERVICE'
  const userType = useMemo<'SERVICE' | 'Sales' | 'ADMIN'>(() => {
    if (!selectedEmployee) return 'SERVICE';
    const deptId = Number(selectedEmployee.department_id || selectedEmployee.department);
    if (deptId === 5) return 'ADMIN';
    if (deptId === 6) return 'Sales';
    return 'SERVICE';
  }, [selectedEmployee]);

  // Handle Dynamic Additional Employee list updates
  useEffect(() => {
    const countNeeded = Math.max(0, noOfEmployee - 1);
    setAdditionalEmployeeIds((prev) => {
      const copy = [...prev];
      if (copy.length < countNeeded) {
        while (copy.length < countNeeded) {
          copy.push(0);
        }
      } else if (copy.length > countNeeded) {
        copy.splice(countNeeded);
      }
      return copy;
    });
  }, [noOfEmployee]);

  // 1. Travel Allowance (TA) Calculation
  // - If company_vehicle == 'no' AND employee is NOT Sales (6) AND employee is NOT Driver (5) AND branch is NOT 'Khavda':
  //   - ta_amount = km * 3.50
  // - Else: ta_amount = 0
  useEffect(() => {
    const isSales = userType === 'Sales';
    const isDriver = userType === 'ADMIN';
    const branchName = selectedBranch?.name || selectedBranch?.title || '';
    const isKhavda = branchName.toLowerCase().includes('khavda');

    if (companyVehicle === 'no' && !isSales && !isDriver && !isKhavda) {
      setTaAmount(Number((km * 3.50).toFixed(2)));
    } else {
      setTaAmount(0);
    }
  }, [companyVehicle, userType, selectedBranch, km]);

  // 2. Stay Amount Calculation
  // - If night_stay == 'Late night' -> stay_amount = 350
  // - Else if night_stay == 'Full night' -> stay_amount = 450
  // - Else -> stay_amount = 0
  useEffect(() => {
    if (nightStay === 'Late night') {
      setStayAmount(350);
    } else if (nightStay === 'Full night') {
      setStayAmount(450);
    } else {
      setStayAmount(0);
    }
  }, [nightStay]);

  // 3. Daily Allowance (DA) Calculation
  // - If Sales (6): User enters manually
  // - If Driver (5): da_amount = 50
  // - For Service: Call API
  useEffect(() => {
    if (userType === 'Sales') {
      // Editable by user, don't override unless changing to sales
    } else if (userType === 'ADMIN') {
      setDaAmount(50);
    } else if (userType === 'SERVICE' && employeeId && branchId) {
      const fetchDa = async () => {
        setCalculatingDa(true);
        try {
          const res = await getDaAmount({
            km,
            employee_id: employeeId,
            visit_date: formatDate(visitDate, 'api') || formatDate(new Date(), 'api'),
            branch_id: branchId,
          });
          if (res && res.data?.rate !== undefined) {
            setDaAmount(Number(res.data.rate));
          } else {
            setDaAmount(0);
          }
        } catch (err) {
          console.error(err);
          setDaAmount(0);
        } finally {
          setCalculatingDa(false);
        }
      };
      // Fetch only if valid parameters
      fetchDa();
    } else {
      setDaAmount(0);
    }
  }, [userType, employeeId, branchId, km, visitDate]);

  // 4. Total Amount Calculation
  const totalAmount = useMemo(() => {
    return taAmount + stayAmount + daAmount;
  }, [taAmount, stayAmount, daAmount]);

  // Date Pickers
  const handleDateSelect = (date: Date) => {
    setVisitDate(date);
    setShowDatePicker(false);
  };

  // Machine Search Trigger
  const handleMachineSearch = async () => {
    if (!machineNumber.trim()) {
      ToastUtil.info('Please enter a machine number first');
      return;
    }
    setSearchingMachine(true);
    try {
      const res = await getPartyByMachine(machineNumber);
      if (res.data) {
        setMachineId(res.data.machine?.id || null);
        setPartyId(res.data.party?.id || null);
        setPartyName(res.data.party?.name || '');
        ToastUtil.success(res.message || 'Machine and Customer found!');
      } else {
        ToastUtil.info(res.message || 'Machine not found. You can add it manually.');
        setMachineId(null);
        setPartyId(null);
        setPartyName('');
      }
    } catch (err) {
      console.error(err);
      ToastUtil.error('Failed to check machine status.');
    } finally {
      setSearchingMachine(false);
    }
  };

  // Store Machine Trigger
  const handleAddMachineSubmit = async () => {
    if (!newMachineName.trim() || !newMachineModelId || !newMachinePartyId) {
      ToastUtil.info('All fields in Add Machine modal are required.');
      return;
    }
    setSavingMachine(true);
    try {
      const res = await storeMachine({
        name: newMachineName,
        machine_model_id: newMachineModelId,
        party_id: newMachinePartyId,
      });

      if (res.success) {
        setMachineNumber(newMachineName);
        setMachineId(res.data?.id || res.machine?.id || null);
        setPartyId(newMachinePartyId);
        
        // Find party name
        const p = parties.find((x) => x.id === newMachinePartyId);
        setPartyName(p ? p.name : '');

        setAddMachineVisible(false);
        setNewMachineName('');
        setNewMachineModelId(null);
        setNewMachinePartyId(null);
        ToastUtil.success('Machine stored successfully.');
      } else {
        ToastUtil.error(res.message || 'Failed to save machine.');
      }
    } catch (err) {
      console.error(err);
      ToastUtil.error('Failed to create new machine.');
    } finally {
      setSavingMachine(false);
    }
  };

  // Handle Photo attachment
  const handleFileAttach = (method: 'camera' | 'library') => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.8,
    };
    const callback = (res: any) => {
      setShowAttachmentOptions(false);
      if (res.didCancel) return;
      if (res.errorCode) {
        ToastUtil.error('Image picker error: ' + res.errorMessage);
        return;
      }
      if (res.assets && res.assets[0]) {
        const file = res.assets[0];
        setSvrFile({
          uri: file.uri,
          name: file.fileName || 'svr_attachment.jpg',
          type: file.type || 'image/jpeg',
        });
      }
    };

    if (method === 'camera') {
      launchCamera(options, callback);
    } else {
      launchImageLibrary(options, callback);
    }
  };

  // Form Submit Handler
  const handleFormSubmit = async () => {
    // Validate Required parameters
    if (!branchId) return ToastUtil.info('Branch is required');
    if (!employeeId) return ToastUtil.info('Visiting Employee is required');
    if (!location.trim()) return ToastUtil.info('Location is required');
    if (km === undefined || km === null || isNaN(km)) return ToastUtil.info('KM is required');

    // Setup FormData
    const formData = new FormData();
    formData.append('branch_id', String(branchId));
    formData.append('visit_date', formatDate(visitDate, 'api'));
    formData.append('company_vehicle', companyVehicle);
    formData.append('no_of_employe', String(noOfEmployee));
    formData.append('employee_id', String(employeeId));
    formData.append('is_engineer', isEngineer);
    formData.append('location', location);
    formData.append('remarks', remarks);
    formData.append('ta_amount', String(taAmount));
    formData.append('stay_amount', String(stayAmount));
    formData.append('da_amount', String(daAmount));
    formData.append('total_amount', String(totalAmount));
    formData.append('km', String(km));
    formData.append('night_stay', nightStay);

    // Visibility specific values
    if (userType === 'SERVICE') {
      if (machineId) formData.append('machine_id', String(machineId));
      if (partyId) formData.append('party_id', String(partyId));
      formData.append('visit_category', visitCategory || '');
      formData.append('work_description', workDescription);
      formData.append('complain', complain);
      formData.append('hmr', String(hmr));
      formData.append('svr', String(svr));
      formData.append('call_count', String(callCount));
    } else if (userType === 'Sales') {
      formData.append('sales_party_name', salesPartyName);
    } else if (userType === 'ADMIN') {
      if (isEngineer === 'Yes') {
        if (engineerId) formData.append('engineer_id', String(engineerId));
        if (partyIdDriver) formData.append('party_id', String(partyIdDriver));
      } else {
        formData.append('work_description', workDescription);
      }
    }

    // Append additional employees
    additionalEmployeeIds.forEach((id) => {
      if (id) formData.append('additional_employee_ids[]', String(id));
    });

    // File attachments
    if (svrFile) {
      formData.append('svr_file', {
        uri: svrFile.uri,
        name: svrFile.name,
        type: svrFile.type,
      } as any);
    }

    setLoading(true);
    try {
      const res = await addServiceVisit(formData);
      if (res.success) {
        ToastUtil.success(res.message || 'Service visit form submitted successfully!');
        navigation.goBack();
      } else {
        ToastUtil.error(res.message || 'Failed to submit form.');
      }
    } catch (err) {
      console.error(err);
      ToastUtil.error('Failed to submit form.');
    } finally {
      setLoading(false);
    }
  };

  // Render items in dropdowns
  const renderItem = (item: any) => (
    <View style={formStyles.dropdownItemContainer}>
      <Text style={formStyles.dropdownItemText}>{item.name || item.title || 'Unknown'}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[formStyles.keyboardContainer, { backgroundColor: theme.background }]}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 120}
    >
      <StatusBar translucent barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {loading && (
        <View style={styles.overlayLoading}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      )}

      <ScrollView
        style={formStyles.container}
        contentContainerStyle={formStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[formStyles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          
          {/* Group 1: General Details */}
          <View style={styles.sectionHeader}>
            <AppIcon name="FileText" size={18} color="#3B82F6" />
            <Text style={[styles.sectionTitle, { color: theme.label }]}>General Details</Text>
          </View>

          {/* Branch Dropdown */}
          <View style={formStyles.fieldContainer}>
            <FormLabel label="Branch" required color={theme.label} />
            <CustomDropdown
              label=""
              data={branches}
              value={branchId}
              placeholder="Select Branch"
              onChange={(item) => setBranchId(item.id)}
              labelField="name"
              valueField="id"
              renderItem={renderItem}
              colors={colors}
            />
          </View>

          {/* Date Row */}
          <View style={formStyles.dateRow}>
            <View style={formStyles.dateFieldHalf}>
              <FormLabel label="Visit Date" required color={theme.label} />
              <TouchableOpacity
                style={[formStyles.dateInput, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[formStyles.dateInputText, { color: theme.inputText }]}>
                  {formatDate(visitDate, 'display')}
                </Text>
                <AppIcon name="Calendar" size={18} color={theme.placeholder} />
              </TouchableOpacity>
            </View>

            <View style={formStyles.dateFieldHalf}>
              <FormLabel label="Company Vehicle" color={theme.label} />
              <CustomRadioGroup
                options={[
                  { label: 'Yes', value: 'yes' },
                  { label: 'No', value: 'no' },
                ]}
                value={companyVehicle}
                onChange={(val) => setCompanyVehicle(val as 'yes' | 'no')}
              />
            </View>
          </View>

          {/* Employee & Count */}
          <View style={formStyles.fieldContainer}>
            <FormLabel label="No of Employees" color={theme.label} />
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={[styles.stepperButton, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}
                onPress={() => setNoOfEmployee((prev) => Math.max(1, prev - 1))}
                activeOpacity={0.7}
              >
                <AppIcon name="Minus" size={16} color={theme.inputText} />
              </TouchableOpacity>
              <View style={[styles.stepperValueContainer, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
                <Text style={[styles.stepperValue, { color: theme.inputText }]}>{noOfEmployee}</Text>
              </View>
              <TouchableOpacity
                style={[styles.stepperButton, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}
                onPress={() => setNoOfEmployee((prev) => prev + 1)}
                activeOpacity={0.7}
              >
                <AppIcon name="Plus" size={16} color={theme.inputText} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={formStyles.fieldContainer}>
            <FormLabel label="Visiting Employee" required color={theme.label} />
            <CustomDropdown
              label=""
              data={employees}
              value={employeeId}
              placeholder="Select Employee"
              onChange={(item) => setEmployeeId(item.id)}
              labelField="name"
              valueField="id"
              renderItem={renderItem}
              colors={colors}
              search
              searchPlaceholder="Search employee..."
            />
          </View>

          {/* Dynamic Extra Employees Dropdowns */}
          {additionalEmployeeIds.map((val, idx) => (
            <View key={`emp-extra-${idx}`} style={formStyles.fieldContainer}>
              <FormLabel label={`Visiting Employee ${idx + 2}`} color={theme.label} />
              <CustomDropdown
                label=""
                data={employees.filter((e) => e.id !== employeeId)}
                value={val || null}
                placeholder="Select Employee"
                onChange={(item) => {
                  setAdditionalEmployeeIds((prev) => {
                    const next = [...prev];
                    next[idx] = item.id;
                    return next;
                  });
                }}
                labelField="name"
                valueField="id"
                renderItem={renderItem}
                colors={colors}
                search
                searchPlaceholder="Search employee..."
              />
            </View>
          ))}

          {/* Group 2: Role Based UI Visibility Fields */}
          {userType === 'SERVICE' && (
            <>
              <View style={styles.sectionHeader}>
                <AppIcon name="Settings" size={18} color="#10B981" />
                <Text style={[styles.sectionTitle, { color: theme.label }]}>Service Visit Specifications</Text>
              </View>

              {/* Machine Search input with search/add buttons */}
              <FormLabel label="Machine Number" color={theme.label} />
              <View style={styles.searchRow}>
                <View style={{ flex: 1 }}>
                  <CustomInput
                    value={machineNumber}
                    onChangeText={(text) => {
                      setMachineNumber(text)
                    }}
                    placeholder="Enter Machine Number"
                  />
                </View>
                <TouchableOpacity
                  style={[styles.searchIconButton, { backgroundColor: '#3B82F6' }]}
                  onPress={handleMachineSearch}
                  disabled={searchingMachine}
                >
                  {searchingMachine ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <AppIcon name="Search" size={18} color="#FFF" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.searchIconButton, { backgroundColor: '#10B981' }]}
                  onPress={() => setAddMachineVisible(true)}
                >
                  <AppIcon name="Plus" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>

              <CustomInput
                label="Customer (Party Name)"
                value={partyName}
                onChangeText={() => {}}
                placeholder="Autofilled from Machine search"
                style={{ opacity: 0.85 }}
              />

              <View style={formStyles.fieldContainer}>
                <FormLabel label="Visit Category" color={theme.label} />
                <CustomDropdown
                  label=""
                  data={[
                    { name: 'ASC', id: 'ASC' },
                    { name: 'U/W', id: 'U/W' },
                    { name: 'B/W', id: 'B/W' },
                    { name: 'Gw', id: 'Gw' },
                    { name: 'V/Extended', id: 'V/Extended' },
                    { name: 'Warranty', id: 'Warranty' },
                  ]}
                  value={visitCategory}
                  placeholder="Select Category"
                  onChange={(item) => setVisitCategory(item.id)}
                  labelField="name"
                  valueField="id"
                  renderItem={renderItem}
                  colors={colors}
                />
              </View>

              <CustomInput
                label="Complain"
                value={complain}
                onChangeText={setComplain}
                placeholder="Enter complain detail..."
                isMultiline
              />

              <CustomInput
                label="Work Description"
                value={workDescription}
                onChangeText={setWorkDescription}
                placeholder="Describe work completed..."
                isMultiline
              />

              <View style={formStyles.row}>
                <View style={formStyles.half}>
                  <CustomInput
                    label="HMR"
                    value={String(hmr)}
                    onChangeText={(val) => setHmr(Number(val) || 0)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={formStyles.half}>
                  <CustomInput
                    label="SVR"
                    value={String(svr)}
                    onChangeText={(val) => setSvr(Number(val) || 0)}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={formStyles.row}>
                <View style={formStyles.half}>
                  <CustomInput
                    label="Call Count"
                    value={String(callCount)}
                    onChangeText={(val) => setCallCount(Number(val) || 0)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={formStyles.half}>
                  <FormLabel label="SVR File Attachment" color={theme.label} />
                  <TouchableOpacity
                    style={[
                      formStyles.attachmentContainer,
                      {
                        backgroundColor: theme.attachmentBackground,
                        borderColor: theme.border,
                        paddingVertical: verticalScale(10),
                      },
                    ]}
                    onPress={() => setShowAttachmentOptions(true)}
                  >
                    {svrFile ? (
                      <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: svrFile.uri }} style={styles.imagePreview} />
                        <Text style={[styles.attachmentName, { color: theme.inputText }]} numberOfLines={1}>
                          {svrFile.name}
                        </Text>
                      </View>
                    ) : (
                      <View style={formStyles.attachmentContent}>
                        <View style={[formStyles.attachmentIconContainer, { backgroundColor: theme.attachmentIconBackground }]}>
                          <AppIcon name="UploadCloud" size={20} color="#3B82F6" />
                        </View>
                        <Text style={[formStyles.attachmentText, { color: theme.subText }]}>Attach SVR Image</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          {userType === 'Sales' && (
            <>
              <View style={styles.sectionHeader}>
                <AppIcon name="DollarSign" size={18} color="#F59E0B" />
                <Text style={[styles.sectionTitle, { color: theme.label }]}>Sales Visit Specifications</Text>
              </View>

              <CustomInput
                label="Sales Party Name"
                value={salesPartyName}
                onChangeText={setSalesPartyName}
                placeholder="Enter Sales Party Name"
              />
            </>
          )}

          {userType === 'ADMIN' && (
            <>
              <View style={styles.sectionHeader}>
                <AppIcon name="ShieldAlert" size={18} color="#EF4444" />
                <Text style={[styles.sectionTitle, { color: theme.label }]}>Driver/Admin Specifications</Text>
              </View>

              <View style={formStyles.fieldContainer}>
                <FormLabel label="Engineer Required" color={theme.label} />
                <CustomRadioGroup
                  options={[
                    { label: 'Yes', value: 'Yes' },
                    { label: 'No', value: 'No' },
                  ]}
                  value={isEngineer}
                  onChange={(val) => setIsEngineer(val as 'Yes' | 'No')}
                />
              </View>

              {isEngineer === 'Yes' ? (
                <>
                  <View style={formStyles.fieldContainer}>
                    <FormLabel label="Select Engineer" color={theme.label} />
                    <CustomDropdown
                      label=""
                      data={employees}
                      value={engineerId}
                      placeholder="Select Engineer"
                      onChange={(item) => setEngineerId(item.id)}
                      labelField="name"
                      valueField="id"
                      renderItem={renderItem}
                      colors={colors}
                      search
                    />
                  </View>

                  <View style={formStyles.fieldContainer}>
                    <FormLabel label="Customer (Party List)" color={theme.label} />
                    <CustomDropdown
                      label=""
                      data={parties}
                      value={partyIdDriver}
                      placeholder="Select Customer Party"
                      onChange={(item) => setPartyIdDriver(item.id)}
                      labelField="name"
                      valueField="id"
                      renderItem={renderItem}
                      colors={colors}
                      search
                    />
                  </View>
                </>
              ) : (
                <CustomInput
                  label="Work Description"
                  value={workDescription}
                  onChangeText={setWorkDescription}
                  placeholder="Describe work completed..."
                  isMultiline
                />
              )}
            </>
          )}

          {/* Group 3: Location, Travel & Expenses */}
          <View style={styles.sectionHeader}>
            <AppIcon name="MapPin" size={18} color="#EC4899" />
            <Text style={[styles.sectionTitle, { color: theme.label }]}>Travel & Expense Allowances</Text>
          </View>

          <CustomInput
            label="Location"
            required
            value={location}
            onChangeText={setLocation}
            placeholder="Enter location address"
          />

          <View style={formStyles.row}>
            <View style={formStyles.half}>
              <CustomInput
                label="KM Traveled"
                value={String(km)}
                onChangeText={(val) => setKm(Number(val) || 0)}
                keyboardType="numeric"
              />
            </View>

            <View style={formStyles.half}>
              <FormLabel label="Night Stay" color={theme.label} />
              <CustomDropdown
                label=""
                data={[
                  { name: 'None', id: 'None' },
                  { name: 'Late night', id: 'Late night' },
                  { name: 'Full night', id: 'Full night' },
                ]}
                value={nightStay}
                placeholder="Select Night Stay"
                onChange={(item) => setNightStay(item.id as any)}
                labelField="name"
                valueField="id"
                renderItem={renderItem}
                colors={colors}
              />
            </View>
          </View>

          {/* Financial calculations displays */}
          <View style={styles.financialCard}>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Travel Allowance (TA):</Text>
              <Text style={styles.financialValue}>₹{taAmount.toFixed(2)}</Text>
            </View>

            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Night Stay Allowance:</Text>
              <Text style={styles.financialValue}>₹{stayAmount.toFixed(2)}</Text>
            </View>

            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Daily Allowance (DA):</Text>
              {userType === 'Sales' ? (
                <View style={{ width: 100, marginBottom: -16 }}>
                  <CustomInput
                    value={String(daAmount)}
                    onChangeText={(val) => setDaAmount(Number(val) || 0)}
                    keyboardType="numeric"
                  />
                </View>
              ) : calculatingDa ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <Text style={styles.financialValue}>₹{daAmount.toFixed(2)}</Text>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.financialRow}>
              <Text style={[styles.financialLabel, styles.totalLabel]}>Total Expenses:</Text>
              <Text style={[styles.financialValue, styles.totalValue]}>₹{totalAmount.toFixed(2)}</Text>
            </View>
          </View>

          <CustomInput
            label="Remarks"
            value={remarks}
            onChangeText={setRemarks}
            placeholder="Add any extra remarks..."
            isMultiline
          />

          <View style={formStyles.submitWrapper}>
            <CustomButton
              label="SUBMIT FORM"
              onPress={handleFormSubmit}
              disabled={loading}
            />
          </View>

        </View>
      </ScrollView>

      {/* Calendar Date Picker Modal */}
      <CalendarPickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={handleDateSelect}
        selectedDate={visitDate}
      />

      {/* Image Picker Action Sheet Modal */}
      <Modal visible={showAttachmentOptions} transparent animationType="fade">
        <TouchableOpacity style={formStyles.modalOverlay} onPress={() => setShowAttachmentOptions(false)}>
          <View style={[formStyles.modalContent, { backgroundColor: theme.modalBackground }]}>
            <View style={formStyles.modalHeader}>
              <Text style={[formStyles.modalTitle, { color: theme.label }]}>Choose Photo Source</Text>
            </View>
            <TouchableOpacity style={[formStyles.modalOption, { backgroundColor: theme.modalOptionBackground }]} onPress={() => handleFileAttach('camera')}>
              <View style={formStyles.modalOptionIconContainer}>
                <AppIcon name="Camera" size={22} color="#3B82F6" />
              </View>
              <View style={formStyles.modalOptionTextContainer}>
                <Text style={[formStyles.modalOptionText, { color: theme.label }]}>Camera</Text>
                <Text style={[formStyles.modalOptionSubtext, { color: theme.subText }]}>Take photo from device camera</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[formStyles.modalOption, { backgroundColor: theme.modalOptionBackground }]} onPress={() => handleFileAttach('library')}>
              <View style={formStyles.modalOptionIconContainer}>
                <AppIcon name="Image" size={22} color="#3B82F6" />
              </View>
              <View style={formStyles.modalOptionTextContainer}>
                <Text style={[formStyles.modalOptionText, { color: theme.label }]}>Photo Library</Text>
                <Text style={[formStyles.modalOptionSubtext, { color: theme.subText }]}>Choose photo from gallery</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[formStyles.modalCancelButton, { backgroundColor: theme.cancelBackground }]} onPress={() => setShowAttachmentOptions(false)}>
              <Text style={[formStyles.modalCancelText, { color: theme.label }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add New Machine Modal */}
      <Modal visible={addMachineVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.modalTitleText, { color: theme.label }]}>Add New Machine</Text>
            
            <CustomInput
              label="Machine Name / Serial Number"
              value={newMachineName}
              onChangeText={setNewMachineName}
              placeholder="e.g. MC-XYZ-123"
            />

            <View style={formStyles.fieldContainer}>
              <FormLabel label="Machine Model" color={theme.label} />
              <CustomDropdown
                label=""
                data={machineModels}
                value={newMachineModelId}
                placeholder="Select Model"
                onChange={(item) => setNewMachineModelId(item.id)}
                labelField="name"
                valueField="id"
                renderItem={renderItem}
                colors={colors}
                search
              />
            </View>

            <View style={formStyles.fieldContainer}>
              <FormLabel label="Select Customer Party" color={theme.label} />
              <CustomDropdown
                label=""
                data={parties}
                value={newMachinePartyId}
                placeholder="Select Party"
                onChange={(item) => setNewMachinePartyId(item.id)}
                labelField="name"
                valueField="id"
                renderItem={renderItem}
                colors={colors}
                search
              />
            </View>

            <View style={styles.modalActionButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.cancelBackground }]}
                onPress={() => setAddMachineVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.label }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#3B82F6' }]}
                onPress={handleAddMachineSubmit}
                disabled={savingMachine}
              >
                {savingMachine ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={[styles.modalButtonText, { color: '#FFF' }]}>Save Machine</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default AddServiceVisit;

const styles = StyleSheet.create({
  overlayLoading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
    marginTop: verticalScale(10),
    marginBottom: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: verticalScale(6),
  },
  sectionTitle: {
    fontSize: moderateScale(15),
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: moderateScale(8),
    marginBottom: verticalScale(10),
  },
  searchIconButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    width: '100%',
  },
  imagePreview: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(6),
    marginBottom: verticalScale(4),
  },
  attachmentName: {
    fontSize: moderateScale(11),
    fontWeight: '500',
  },
  financialCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
    borderWidth: 1,
    borderRadius: moderateScale(12),
    padding: moderateScale(14),
    marginVertical: verticalScale(12),
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(4),
  },
  financialLabel: {
    fontSize: moderateScale(13),
    color: '#1E40AF',
    fontWeight: '500',
  },
  financialValue: {
    fontSize: moderateScale(14),
    color: '#1E3A8A',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#DBEAFE',
    marginVertical: verticalScale(8),
  },
  totalLabel: {
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
  totalValue: {
    fontSize: moderateScale(16),
    color: '#3B82F6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(20),
  },
  modalCard: {
    width: '100%',
    maxWidth: moderateScale(340),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    padding: moderateScale(18),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitleText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    marginBottom: verticalScale(16),
    textAlign: 'center',
  },
  modalActionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: moderateScale(12),
    marginTop: verticalScale(20),
  },
  modalButton: {
    paddingVertical: verticalScale(10),
    paddingHorizontal: moderateScale(18),
    borderRadius: moderateScale(8),
    minWidth: moderateScale(90),
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    marginTop: verticalScale(4),
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperValueContainer: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: moderateScale(8),
  },
  stepperValue: {
    fontSize: moderateScale(15),
    fontWeight: '700',
  },
});
