import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Platform,
  useColorScheme,
  KeyboardAvoidingView,
} from 'react-native';
import CustomInput from '../../../../components/formComponent/customInput';
import CustomButton from '../../../../components/button/customButton';
import { addModule } from '../../../../services';
import { AppStackScreenProps } from '../../../../navigation/navigationTypes';
import ToastUtil from '../../../../utils/toastAndroid';
import { formStyles, getFormTheme } from '../../../../assets/style/formStyles';
import ScreenWrapper from '../../../../components/screenWrapper';
import NetInfoComponent from '../../../../components/netinfoComponent';

const AddModule: React.FC<AppStackScreenProps<'AddModule'>> = ({
  navigation,
  route,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const theme = getFormTheme(isDarkMode);

  const [moduleName, setModuleName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddModule = async () => {
    if (!moduleName.trim()) {
      ToastUtil.error('Module name is required');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('project_id', route.params.ProjectId);
      formData.append('name', moduleName.trim());

      const { success, message } = await addModule(formData);

      if (success) {
        ToastUtil.success(message);
        navigation.goBack();
      } else {
        ToastUtil.error(message);
      }
    } catch (error: any) {
      ToastUtil.error(
        error?.response?.data?.message || 'Please try again later.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper
      withHeader
      statusBarTranslucent
      statusBarStyle={isDarkMode ? 'light-content' : 'dark-content'}
      backgroundColor={isDarkMode ? '#111827' : '#F7F8FA'}
    >
      <NetInfoComponent onReconnect={handleAddModule} />
    <KeyboardAvoidingView
      style={[
        formStyles.keyboardContainer,
        { backgroundColor: theme.background },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
    

      <ScrollView
        contentContainerStyle={[
          formStyles.scrollContent,
          { flexGrow: 1, justifyContent: 'center' },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Form Card ────────────────────────────────────────────────── */}
        <View
          style={[
            formStyles.formCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          {/* Header */}
          <View style={formStyles.formHeader}>
            <Text style={[formStyles.formTitle, { color: theme.label }]}>
              Create New Module
            </Text>
            <Text style={[formStyles.formSubtitle, { color: theme.subText }]}>
              Add a module to this project so tasks can be grouped properly.
            </Text>
          </View>

          <CustomInput
            label="Module Name"
            value={moduleName}
            onChangeText={setModuleName}
            placeholder="Enter module name"
          />

          <CustomButton
            label="Create Module"
            onPress={handleAddModule}
            disabled={loading || !moduleName.trim()}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default AddModule;
