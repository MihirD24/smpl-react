import React, { useContext, useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StyleSheet,
  StatusBar,
  ScrollView,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import VersionCheck from 'react-native-version-check';
import { AuthContext } from '../../context/authContext';
import { AuthStackScreenProps } from '../../navigation/navigationTypes';
import MainStyle from '../../assets/style/maincss';
import {
} from 'react-native-size-matters';
import { Eye, EyeOff } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import ToastUtil from '../../utils/toastAndroid';
import BrandLogo from '../../components/brandLogo';
import { BRAND, isTabletWidth, contentMaxWidth } from '../../assets/style/brandTheme';

const SignIn: React.FC<AuthStackScreenProps<'signIn'>> = ({ navigation }) => {
  const { login } = useContext(AuthContext) as {
    login: (mobileNo: number, password: string) => Promise<{ userId: number }>;
    loginError: string;
  };

  const [mobileNo, setMobileNo] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [secure, setSecure] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const isDarkMode = useColorScheme() === 'dark';
  const { width } = useWindowDimensions();
  const tablet = isTabletWidth(width);
  const mainStyles = MainStyle();
  const theme = {
    screenBg: isDarkMode ? '#111827' : '#F6FAFF',
    logoCard: isDarkMode ? '#1F2937' : '#FFFFFF',
    title: isDarkMode ? '#F9FAFB' : '#111827',
    subtitle: isDarkMode ? '#9CA3AF' : '#6B7280',
    card: isDarkMode ? '#1F2937' : '#FFFFFF',
    label: isDarkMode ? '#94A3B8' : '#9CA3AF',
    inputBg: isDarkMode ? '#0F172A' : '#F9FAFB',
    inputText: isDarkMode ? '#F9FAFB' : '#111827',
    placeholder: isDarkMode ? '#64748B' : '#9CA3AF',
    button: '#2563EB',
    forgot: '#60A5FA',
    version: isDarkMode ? '#64748B' : '#CBD5E1',
    inputBorder: isDarkMode ? '#334155' : '#E2E8F0',
    cardBorder: isDarkMode ? '#1E293B' : '#E2E8F0',
  };
  const handleLogin = async () => {
    if (!mobileNo || !password) {
      ToastUtil.info('Please enter mobile number and password');
      return;
    }

    if (!mobileNo) {
      ToastUtil.info('Please enter mobile number');
      return;
    }

    if (!password) {
      ToastUtil.info('Please enter password');
      return;
    }

    setLoading(true);
    try {
        const { userId } = await login(Number(mobileNo), password);
      // Navigate to OTP screen after successful login
      console.log('LOGIN SUCCESS - Navigating to OTP with mobile:', mobileNo);
      console.log('LOGIN SUCCESS - Navigating to OTP with userId:', userId);
      setTimeout(() => {
        navigation.navigate('otp', { mobileNumber: mobileNo , userId: userId });
      }, 300);
    } catch (error) {
      const msg =
        error instanceof Error && error.message
          ? error.message
          : 'Login Failed';
      console.error('Login Error:', msg);
      ToastUtil.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.screenBg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
        style={styles.flex}
      >
        <StatusBar
          backgroundColor={theme.screenBg}
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        />
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { minHeight: tablet ? '100%' : undefined },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View
            style={[
              styles.page,
              { maxWidth: contentMaxWidth(width) },
              tablet && styles.pageTablet,
            ]}
          >
            {tablet && (
              <View style={[styles.brandPanel, { backgroundColor: BRAND.black }]}>
                <View style={styles.yellowAccent} />
                <BrandLogo width="92%" height={Math.min(width * 0.12, 100)} />
                <Text style={styles.brandPanelTitle}>WORKFORCE</Text>
                <Text style={styles.brandPanelSubtitle}>
                  Secure employee access to attendance, leave, salary and field operations.
                </Text>
                <View style={styles.brandPill}>
                  <View style={styles.brandPillDot} />
                  <Text style={styles.brandPillText}>ENTERPRISE HRMS</Text>
                </View>
              </View>
            )}

            <View style={[styles.formColumn, tablet && styles.formColumnTablet]}>
              {!tablet && (
                <View style={styles.mobileLogoWrap}>
                  <BrandLogo width="100%" height={64} />
                </View>
              )}

              <Text style={[styles.eyebrow, { color: BRAND.slate }]}>EMPLOYEE PORTAL</Text>
              <Text style={[styles.title, { color: theme.title }]}>Welcome back</Text>
              <Text style={[styles.subtitle, { color: theme.subtitle }]}>
                Sign in to continue to Shantinath JCB HRMS
              </Text>

              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                <Text style={[styles.label, { color: theme.label }]}>MOBILE NUMBER</Text>
                <View
                  style={[
                    styles.inputShell,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: theme.inputBorder,
                    },
                  ]}
                >
                  <Text style={[styles.prefix, { color: theme.placeholder }]}>+91</Text>
                  <TextInput
                    placeholder="Enter mobile number"
                    style={[styles.input, { color: theme.inputText }]}
                    placeholderTextColor={theme.placeholder}
                    value={mobileNo}
                    onChangeText={setMobileNo}
                    keyboardType="number-pad"
                    maxLength={10}
                    returnKeyType="next"
                  />
                </View>

                <Text style={[styles.label, { color: theme.label }]}>PASSWORD</Text>
                <View
                  style={[
                    styles.passwordWrapper,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: theme.inputBorder,
                    },
                  ]}
                >
                  <TextInput
                    placeholder="Enter password"
                    style={[styles.passwordInput, { color: theme.inputText }]}
                    placeholderTextColor={theme.placeholder}
                    secureTextEntry={secure}
                    value={password ?? ''}
                    onChangeText={setPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity
                    onPress={() => setSecure(!secure)}
                    style={styles.eyeButton}
                    activeOpacity={0.7}
                  >
                    {secure ? (
                      <Eye size={20} color={theme.placeholder} />
                    ) : (
                      <EyeOff size={20} color={theme.placeholder} />
                    )}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.signInButton, { backgroundColor: BRAND.yellow }]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.82}
                >
                  <Text style={styles.signInText}>Sign In</Text>
                  <Text style={styles.signInArrow}>→</Text>
                </TouchableOpacity>

                <View style={styles.secureRow}>
                  <View style={styles.secureDot} />
                  <Text style={[styles.secureText, { color: theme.subtitle }]}>
                    Secure company login
                  </Text>
                </View>
              </View>

              <Text style={[styles.version, { color: theme.version }]}>
                VERSION {VersionCheck.getCurrentVersion()} • SHANTINATH MOTORS PVT. LTD.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {loading && (
        <View style={mainStyles.loadingOverlay}>
          <ActivityIndicator size="large" color={BRAND.yellow} />
        </View>
      )}
    </SafeAreaView>
  );

};

export default SignIn;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 28,
  },
  page: {
    width: '100%',
    alignSelf: 'center',
  },
  pageTablet: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 560,
    borderRadius: 28,
    overflow: 'hidden',
  },
  brandPanel: {
    flex: 1,
    minHeight: 560,
    padding: 34,
    justifyContent: 'center',
  },
  yellowAccent: {
    width: 54,
    height: 6,
    borderRadius: 3,
    backgroundColor: BRAND.yellow,
    marginBottom: 28,
  },
  brandPanelTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 34,
  },
  brandPanelSubtitle: {
    color: '#C7CBD0',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
    maxWidth: 360,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 28,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#262626',
  },
  brandPillDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: BRAND.yellow,
    marginRight: 8,
  },
  brandPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  formColumn: {
    width: '100%',
    alignItems: 'center',
  },
  formColumnTablet: {
    flex: 1,
    width: undefined,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 44,
    justifyContent: 'center',
  },
  mobileLogoWrap: {
    width: '92%',
    marginBottom: 24,
  },
  eyebrow: {
    width: '90%',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: 1.8,
    marginBottom: 8,
  },
  title: {
    width: '90%',
    fontSize: 30,
    fontWeight: '800',
    fontFamily: 'Poppins-SemiBold',
    letterSpacing: -0.7,
  },
  subtitle: {
    width: '90%',
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 22,
  },
  card: {
    width: '90%',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    shadowColor: BRAND.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  label: {
    fontSize: 10,
    marginBottom: 7,
    marginTop: 3,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  inputShell: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F7F8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  prefix: {
    fontSize: 14,
    fontWeight: '700',
    paddingLeft: 14,
    paddingRight: 8,
  },
  input: {
    flex: 1,
    height: 54,
    paddingHorizontal: 8,
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
  },
  passwordWrapper: {
    height: 54,
    justifyContent: 'center',
    backgroundColor: '#F6F7F8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  passwordInput: {
    height: 54,
    paddingHorizontal: 14,
    paddingRight: 48,
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    width: 34,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInButton: {
    marginTop: 20,
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  signInText: {
    color: BRAND.black,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  signInArrow: {
    color: BRAND.black,
    fontSize: 21,
    fontWeight: '800',
    marginLeft: 10,
    marginTop: -2,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  secureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BRAND.success,
    marginRight: 7,
  },
  secureText: {
    fontSize: 11,
    fontWeight: '500',
  },
  version: {
    width: '90%',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 9,
    letterSpacing: 0.8,
    fontWeight: '600',
  },
});
