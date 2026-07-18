import React, { useContext, useState } from 'react';
import {
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StyleSheet,
  StatusBar,
  ScrollView,
  useColorScheme,
} from 'react-native';
import VersionCheck from 'react-native-version-check';
import { AuthContext } from '../../context/authContext';
import { AuthStackScreenProps } from '../../navigation/navigationTypes';
import MainStyle from '../../assets/style/maincss';
import {
  moderateScale,
  moderateVerticalScale,
  scale,
  verticalScale,
} from 'react-native-size-matters';
import { Eye, EyeOff } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import ToastUtil from '../../utils/toastAndroid';

const SignIn: React.FC<AuthStackScreenProps<'signIn'>> = ({ navigation }) => {
  const { login } = useContext(AuthContext) as {
    login: (mobileNo: number, password: string) => Promise<void>;
    loginError: string;
  };

  const [mobileNo, setMobileNo] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [secure, setSecure] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const isDarkMode = useColorScheme() === 'dark';
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
      const userId = await login(Number(mobileNo), password);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.screenBg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
        style={{ flex: 1 }}
      >
        <StatusBar
          backgroundColor={'transparent'}
          translucent
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.wrapper}>
            {/* Logo */}
            <View
              style={[
                styles.logoContainer,
                { backgroundColor: theme.logoCard },
              ]}
            >
              <Image
                source={require('../../assets/images/login_logo.jpeg')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Title */}
            <Text style={styles.title}>
              <Text style={[styles.titleBold, { color: theme.title }]}>
                Shantinath Motors Pvt Ltd{' '}
              </Text>
            </Text>
            <Text style={[styles.subtitle, { color: theme.subtitle }]}>
              Workforce App
            </Text>

            {/* Card */}
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder, borderWidth: 1 }]}>
              <Text style={[styles.label, { color: theme.label }]}>
                MOBILE NUMBER
              </Text>
              <TextInput
                placeholder="mobile number"
                style={[
                  styles.input,
                  { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.inputBorder, borderWidth: 1 },
                ]}
                placeholderTextColor={theme.placeholder}
                value={mobileNo}
                onChangeText={setMobileNo}
                keyboardType="numeric"
                maxLength={10}
              />

              <Text style={[styles.label, { color: theme.label }]}>
                PASSWORD
              </Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  placeholder="••••••••"
                  style={[
                    styles.passwordInput,
                    { backgroundColor: theme.inputBg, color: theme.inputText, borderColor: theme.inputBorder, borderWidth: 1 },
                  ]}
                  placeholderTextColor={theme.placeholder}
                  secureTextEntry={secure}
                  value={password ?? ''}
                  onChangeText={setPassword}
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
                style={[styles.signInButton, { backgroundColor: theme.button }]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.signInText}>Sign In</Text>
              </TouchableOpacity>
            </View>

            {/* <TouchableOpacity>
              <Text style={[styles.forgot, { color: theme.forgot }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity> */}

            <Text style={[styles.version, { color: theme.version }]}>
              VERSION {VersionCheck.getCurrentVersion()} • ENTERPRISE EDITION
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {loading && (
        <View style={mainStyles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      )}
    </SafeAreaView>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  wrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(30),
  },
  logoContainer: {
    width: moderateScale(96),
    height: moderateVerticalScale(96),
    borderRadius: moderateScale(24),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(20),
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  logo: {
    width: moderateScale(76),
    height: moderateVerticalScale(76),
  },
  title: {
    fontSize: moderateScale(22),
    letterSpacing: 0.5,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  titleBold: {
    fontWeight: '800',
    color: '#0F172A',
  },
  titleLight: {
    fontWeight: '400',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: scale(13),
    color: '#64748B',
    marginBottom: verticalScale(28),
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  card: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  label: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 8,
    marginTop: 14,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 15,
    color: '#0F172A',
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingRight: 48,
    height: 52,
    fontSize: 15,
    color: '#0F172A',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    height: '100%',
    justifyContent: 'center',
  },
  signInButton: {
    marginTop: 24,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  signInText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  forgot: {
    color: '#2563EB',
    marginVertical: 14,
    fontSize: scale(13),
    fontWeight: '600',
  },
  version: {
    marginTop: verticalScale(30),
    fontSize: scale(10),
    color: '#94A3B8',
    letterSpacing: 1.5,
    fontWeight: '500',
  },
});
