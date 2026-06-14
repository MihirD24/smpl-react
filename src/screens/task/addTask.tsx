import React, { useState, useEffect } from 'react';
import { View, Text, Platform, useColorScheme } from 'react-native';
import { useTheme } from '@react-navigation/native';
import {
  getAllotedProjectList,
  getModuleList,
  createTask,
} from '../../services';
import CustomDropdown from '../../components/formComponent/customDropdown';
import CustomInput from '../../components/formComponent/customInput';
import CustomButton from '../../components/button/customButton';
import ToastUtil from '../../utils/toastAndroid';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import FormLabel from '../../components/formComponent/formLabel';
import { formStyles, getFormTheme } from '../../assets/style/formStyles';
import { verticalScale } from 'react-native-size-matters';
import ScreenWrapper from '../../components/screenWrapper';
import NetInfoComponent from '../../components/netinfoComponent';

interface FormErrors {
  projectId?: string;
  moduleId?: string;
  workType?: string;
  taskPriorityStatus?: string;
  estimatedTime?: string;
  taskDesc?: string;
}

const AddTask = ({ navigation }) => {
  const { colors } = useTheme();
  const isDarkMode = useColorScheme() === 'dark';

  const theme = getFormTheme(isDarkMode);

  const [projectList, setProjectList] = useState([]);
  const [moduleList, setModuleList] = useState([]);
  const [disableBtn, setDisableBtn] = useState(false);

  const [projectId, setProjectId] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [workType, setWorkType] = useState('');
  const [taskPriorityStatus, setTaskPriorityStatus] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [remarks, setRemarks] = useState('');

  const [errors, setErrors] = useState<FormErrors>({});

  const priorityOptions = [
    { id: 'High', name: 'High' },
    { id: 'Medium', name: 'Medium' },
    { id: 'Low', name: 'Low' },
  ];

  const workTypeOptions = [
    { id: 'New Development', name: 'New Development' },
    { id: 'Client Changes', name: 'Client Changes' },
    { id: 'Bugs', name: 'Bugs' },
  ];

  // ─── Validation ─────────

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!projectId) newErrors.projectId = 'Please select a project.';

    if (!moduleId) newErrors.moduleId = 'Please select a module.';

    if (!workType) newErrors.workType = 'Please select a work type.';

    if (!taskPriorityStatus)
      newErrors.taskPriorityStatus = 'Please select a priority.';

    if (!estimatedTime.trim()) {
      newErrors.estimatedTime = 'Estimated minutes is required.';
    } else if (isNaN(Number(estimatedTime)) || Number(estimatedTime) <= 0) {
      newErrors.estimatedTime = 'Please enter a valid positive number.';
    }

    if (!taskDesc.trim()) newErrors.taskDesc = 'Task description is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  const handleModuleList = async (selectedProjectId: number) => {
    const modules = await getModuleList(selectedProjectId);
    setModuleList(modules);
    setModuleId('');
  };

  const handleCreateTask = async () => {
    if (!validate()) return;

    try {
      setDisableBtn(true);

      let formData = new FormData();
      formData.append('project_id', projectId);
      formData.append('description', taskDesc);
      formData.append('priority', taskPriorityStatus);
      formData.append('estimated_minutes', estimatedTime);
      formData.append('module_id', moduleId);
      formData.append('work_type', workType);
      formData.append('remarks', remarks);

      const { success, message } = await createTask(formData);

      if (success) {
        navigation.replace('TaskList');
      } else {
        ToastUtil.error(message);
      }
    } finally {
      setDisableBtn(false);
    }
  };

  const fetchProjectList = async () => {
    try {
      const projects = await getAllotedProjectList();
      setProjectList(projects);
    } catch (error) {
      ToastUtil.error(error?.message);
    }
  };

  useEffect(() => {
    fetchProjectList();
  }, []);

  // ─── Render ────────

  return (
    <ScreenWrapper
      withHeader
      statusBarTranslucent
      statusBarStyle={isDarkMode ? 'light-content' : 'dark-content'}
      backgroundColor={isDarkMode ? '#111827' : '#F7F8FA'}
    >
      <NetInfoComponent onReconnect={fetchProjectList} />
      <KeyboardAwareScrollView
        contentContainerStyle={[
          formStyles.scrollContent,
          { backgroundColor: theme.background },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={Platform.OS === 'ios' ? 100 : 80}
        extraHeight={120}
      >
        {/* <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      /> */}

        <View style={formStyles.formContainer}>
          {/* ── Project ────────── */}
          <View style={formStyles.fieldContainer}>
            <FormLabel label="Project" required color={theme.label} />
            <CustomDropdown
              data={projectList}
              value={projectId}
              placeholder="Select Project"
              search
              searchPlaceholder="Search project..."
              onChange={item => {
                setProjectId(item.project_id);
                handleModuleList(item.project_id);
                clearError('projectId');
              }}
              labelField="project.project_name"
              valueField="project_id"
              colors={colors}
              label={''}
            />
            {errors.projectId && (
              <Text style={formStyles.errorText}>{errors.projectId}</Text>
            )}
          </View>
          {/* ── Module ───────*/}
          <View style={formStyles.fieldContainer}>
            <FormLabel label="Module" required color={theme.label} />
            <CustomDropdown
              data={moduleList}
              value={moduleId}
              placeholder={projectId ? 'Select Module' : 'Select project first'}
              search
              searchPlaceholder="Search module..."
              disable={!projectId}
              onChange={item => {
                setModuleId(item.id);
                clearError('moduleId');
              }}
              labelField="name"
              valueField="id"
              colors={colors}
              label={''}
            />
            {errors.moduleId && (
              <Text style={formStyles.errorText}>{errors.moduleId}</Text>
            )}
          </View>
          {/* ── Work Type + Priority (side by side) ────*/}
          <View style={formStyles.row}>
            <View style={formStyles.half}>
              <View style={formStyles.dateFieldHalf}>
                <FormLabel label="Work Type" required color={theme.label} />
                <CustomDropdown
                  data={workTypeOptions}
                  value={workType}
                  placeholder="Type"
                  onChange={item => {
                    setWorkType(item.id);
                    clearError('workType');
                  }}
                  labelField="name"
                  valueField="id"
                  colors={colors}
                  label={''}
                />
                {errors.workType && (
                  <Text style={formStyles.errorText}>{errors.workType}</Text>
                )}
              </View>
            </View>
            <View style={formStyles.half}>
              <View style={formStyles.dateFieldHalf}>
                <FormLabel label="Task Priority" required color={theme.label} />
                <CustomDropdown
                  data={priorityOptions}
                  value={taskPriorityStatus}
                  placeholder="Priority"
                  onChange={item => {
                    setTaskPriorityStatus(item.id);
                    clearError('taskPriorityStatus');
                  }}
                  labelField="name"
                  valueField="id"
                  colors={colors}
                  label={''}
                />
                {errors.taskPriorityStatus && (
                  <Text style={formStyles.errorText}>
                    {errors.taskPriorityStatus}
                  </Text>
                )}
              </View>
            </View>
          </View>
          {/* ── Estimated Minutes ─── */}
          <View style={formStyles.fieldContainer}>
            <FormLabel label="Estimated Minutes" required color={theme.label} />
            <CustomInput
              value={estimatedTime}
              onChangeText={val => {
                setEstimatedTime(val);
                clearError('estimatedTime');
              }}
              placeholder="e.g., 60"
              keyboardType="numeric"
              iconName="Timer"
              style={{ height: 50 }}
            />
            {errors.estimatedTime && (
              <Text style={formStyles.errorText}>{errors.estimatedTime}</Text>
            )}
          </View>
          {/* ── Task Description ───── */}
          <View
            style={[
              formStyles.fieldContainer,
              { marginTop: verticalScale(-12) },
            ]}
          >
            <FormLabel label="Task Description" required color={theme.label} />
            <CustomInput
              value={taskDesc}
              onChangeText={setTaskDesc}
              placeholder="What needs to be done?"
              isMultiline
            />
            {errors.taskDesc && (
              <Text style={formStyles.errorText}>{errors.taskDesc}</Text>
            )}
          </View>
          {/* ── Remarks ────*/}
          <View
            style={[
              formStyles.fieldContainer,
              { marginTop: verticalScale(-12) },
            ]}
          >
            <FormLabel label="Remarks" color={theme.label} />
            <CustomInput
              value={remarks}
              onChangeText={setRemarks}
              placeholder="Any additional notes..."
              isMultiline
            />
          </View>
          {/*--    // Submit Button */}
          <View style={formStyles.submitWrapper}>
            <CustomButton
              label="Save Task"
              onPress={handleCreateTask}
              disabled={disableBtn}
            />
          </View>
          <View style={formStyles.bottomSpacer} />
        </View>
      </KeyboardAwareScrollView>
    </ScreenWrapper>
  );
};

export default AddTask;
