import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Platform, useColorScheme } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import CustomDropdown from '../../../components/formComponent/customDropdown';
import CustomInput from '../../../components/formComponent/customInput';
import CustomButton from '../../../components/button/customButton';
import AppIcon from '../../../components/appIcon';
import ToastUtil from '../../../utils/toastAndroid';
import {
  addProjectRemainPoint,
  getEmployeeByProject,
} from '../../../services/projectRemainingService';
import {
  ProjectOption,
  ProjectRemaining,
  ProjectRemainingStatus,
} from './projectRemainingCard';
import { getAllotedProjectList } from '../../../services';
import CustomRadioGroup from '../../../components/formComponent/customRadioGroup';
import FormLabel from '../../../components/formComponent/formLabel';
import { formStyles, getFormTheme } from '../../../assets/style/formStyles';
import ScreenWrapper from '../../../components/screenWrapper';
import NetInfoComponent from '../../../components/netinfoComponent';

// ─── Screen ───────────────────────────────────────────────────────────────────

const AddProjectRemainingScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const isDarkMode = useColorScheme() === 'dark';
  const theme = getFormTheme(isDarkMode);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [project, setProject] = useState<string | number | null>(null);
  const [status, setStatus] = useState<string>('Pending');
  const [details, setDetails] = useState('');
  const [disableBtn, setDisableBtn] = useState(false);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [employees, setEmployees] = useState<ProjectOption[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await getAllotedProjectList();
      const projectList = response?.data ?? response ?? [];
      const formattedProjects = projectList.map((item: any) => ({
        id: item?.project?.id || '',
        name: item?.project?.project_name || '',
      }));
      setProjects(formattedProjects);
    } catch (error) {
      console.error('Project list error:', error);
      ToastUtil.error('Failed to load projects');
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchEmployees = async (id: number) => {
    const formData = new FormData();
    formData.append('project_id', String(id));
    try {
      const response = await getEmployeeByProject(formData);
      const developerList = response ?? [];

      setEmployees(developerList);
    } catch (error) {
      console.error('Employee list error:', error);
      ToastUtil.error('Failed to load employees');
    }
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!project) {
      ToastUtil.info('Please select a project');
      return;
    }
    if (selectedEmployees.length === 0) {
      ToastUtil.info('Please select a employee');
      return;
    }
    if (!status) {
      ToastUtil.info('Please select a status');
      return;
    }
    if (!details.trim()) {
      ToastUtil.info('Please provide details');
      return;
    }

    try {
      setDisableBtn(true);

      const { success, message } = await addProjectRemainPoint({
        project_id: project,
        employee_ids: selectedEmployees,
        status: status as ProjectRemainingStatus,
        details,
      });

      console.log('API Responseeeeeeeeeeeeeeee:', {success, message});

      if (success) {
        const selectedProject = projects.find(
          p => String(p.id) === String(project),
        );
        const selectedEmployeeObjects = employees.filter(emp =>
          selectedEmployees.includes(String(emp.id)),
        );

        const newItem: ProjectRemaining = {
          id: Date.now(),
          project: selectedProject || { id: project, name: '' },
          status: status as ProjectRemainingStatus,
          details,
          createdAt: new Date().toISOString(),
          employees: selectedEmployeeObjects,
        };

        ToastUtil.success(message);
        navigation.replace('ProjectRemainingScreen', { newItem });
        navigation.goBack();
      } else {
        ToastUtil.error(message);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Add project remaining error:', error.message);
        ToastUtil.error('An error occurred while saving');
      }
    } finally {
      setDisableBtn(false);
    }
  };

  // ── Dropdown item renderer ──────────────────────────────────────────────────
  const renderDropdownItem = (item: any) => (
    <View style={formStyles.dropdownItemContainer}>
      {item.icon && (
        <AppIcon
          name={item.icon}
          size={moderateScale(18)}
          color="#6B7280"
          style={formStyles.dropdownItemIcon}
        />
      )}
      <Text style={formStyles.dropdownItemText}>{item.name}</Text>
    </View>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <ScreenWrapper
      withHeader
      statusBarTranslucent
      statusBarStyle={isDarkMode ? 'light-content' : 'dark-content'}
      backgroundColor={isDarkMode ? '#111827' : '#F7F8FA'}
    >
      <NetInfoComponent onReconnect={fetchEmployees} />
      <KeyboardAvoidingView
        style={[
          formStyles.keyboardContainer,
          { backgroundColor: theme.background },
        ]}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 120}
      >
        <ScrollView
          style={formStyles.container}
          contentContainerStyle={formStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={formStyles.formContainer}>
            {/* ── Project ────────────────────────────────────────────────── */}
            <View style={formStyles.fieldContainer}>
              <FormLabel label="Project" required color={theme.label} />
              <CustomDropdown
                data={projects}
                value={project}
                placeholder={loadingProjects ? 'Loading...' : 'Select Project'}
                onChange={item => {
                  setProject(item.id);
                  fetchEmployees(item.id);
                }}
                labelField="name"
                valueField="id"
                colors={colors}
                label=""
                searchPlaceholder="Search project..."
                renderItem={renderDropdownItem}
                search
              />
            </View>

            <View style={formStyles.fieldContainer}>
              <FormLabel label="Employee" required color={theme.label} />
              <CustomDropdown
                data={employees}
                value={selectedEmployees}
                placeholder={loadingProjects ? 'Loading...' : 'Select Employee'}
                onChange={selectedValues =>
                  setSelectedEmployees(selectedValues)
                }
                labelField="name"
                valueField="id"
                colors={colors}
                multiselect
                label=""
                searchPlaceholder="Search project..."
                renderItem={renderDropdownItem}
                search
              />
            </View>

            {/* ── Status ─────────────────────────────────────────────────── */}
            <View style={formStyles.fieldContainer}>
              <FormLabel label="Status" required color={theme.label} />
              <CustomRadioGroup
                options={[
                  { label: 'Pending', value: 'Pending' },
                  { label: 'Completed', value: 'Completed' },
                ]}
                value={status}
                onChange={setStatus}
              />
            </View>

            {/* ── Details ────────────────────────────────────────────────── */}
            <View style={formStyles.fieldContainer}>
              <FormLabel label="Details" required color={theme.label} />
              <CustomInput
                value={details}
                onChangeText={setDetails}
                placeholder="Provide details about the remaining work..."
                isMultiline
                numberOfLines={5}
                style={{ minHeight: verticalScale(110) }}
              />
            </View>

            {/* ── Submit ─────────────────────────────────────────────────── */}
            <View style={formStyles.submitWrapper}>
              <CustomButton
                label="SAVE"
                onPress={handleSave}
                disabled={disableBtn || !project || !status || !details.trim()}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default AddProjectRemainingScreen;
