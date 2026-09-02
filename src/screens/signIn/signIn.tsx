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
  verticalScale,
} from 'react-native-size-matters';
import { Eye, EyeOff } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import ToastUtil from '../../utils/toastAndroid';

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
  const mainStyles = MainStyle();

  const theme = {
    screenBg: isDarkMode ? '#0F172A' : '#F8FAFC',
    heroBg: isDarkMode ? '#1E3A8A' : '#1D4ED8',
    cardBg: isDarkMode ? '#1E293B' : '#FFFFFF',
    textPrimary: isDarkMode ? '#F8FAFC' : '#0F172A',
    textSecondary: isDarkMode ? '#94A3B8' : '#64748B',
    inputBg: isDarkMode ? '#0F172A' : '#F8FAFC',
    inputBorder: isDarkMode ? '#334155' : '#E2E8F0',
    button: '#2563EB',
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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.heroBg }} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? verticalScale(80) : verticalScale(20)}
        style={{ flex: 1, backgroundColor: theme.screenBg }}
      >
        <StatusBar
          backgroundColor={'transparent'}
          translucent
          barStyle={'light-content'}
        />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.wrapper}>
            {/* Hero Section */}
            <View style={[styles.heroSection, { backgroundColor: theme.heroBg }]}>
              {/* Decorative circles */}
              <View style={styles.circle1} />
              <View style={styles.circle2} />

              {/* Logo */}
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../assets/images/login_logo.jpeg')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              {/* Title */}
              <Text style={styles.companyName}>Shantinath Motors Pvt Ltd</Text>
              <Text style={styles.heroSubtitle}>Workforce Management Platform</Text>
            </View>

            {/* Login Card — floats over hero with negative marginTop */}
            <View style={[styles.card, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.welcomeTitle, { color: theme.textPrimary }]}>Welcome Back</Text>
              <Text style={[styles.welcomeSubtitle, { color: theme.textSecondary }]}>Sign in to continue</Text>

              <Text style={[styles.label, { color: theme.textSecondary }]}>
                MOBILE NUMBER
              </Text>
              <TextInput
                placeholder="Mobile number"
                style={[
                  styles.input,
                  { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.inputBorder },
                ]}
                placeholderTextColor={theme.textSecondary}
                value={mobileNo}
                onChangeText={setMobileNo}
                keyboardType="numeric"
                maxLength={10}
              />

              <Text style={[styles.label, { color: theme.textSecondary }]}>
                PASSWORD
              </Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  placeholder="••••••••"
                  style={[
                    styles.passwordInput,
                    { backgroundColor: theme.inputBg, color: theme.textPrimary, borderColor: theme.inputBorder },
                  ]}
                  placeholderTextColor={theme.textSecondary}
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
                    <Eye size={moderateScale(20)} color={theme.textSecondary} />
                  ) : (
                    <EyeOff size={moderateScale(20)} color={theme.textSecondary} />
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

            <Text style={[styles.version, { color: theme.textSecondary }]}>
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
    paddingBottom: verticalScale(30),
  },
  wrapper: {
    flex: 1,
  },
  heroSection: {
    height: verticalScale(260),
    alignItems: 'center',
    paddingTop: verticalScale(50),
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    top: verticalScale(-50),
    left: moderateScale(-50),
    width: moderateScale(200),
    height: moderateScale(200),
    borderRadius: moderateScale(100),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle2: {
    position: 'absolute',
    bottom: verticalScale(-80),
    right: moderateScale(-40),
    width: moderateScale(250),
    height: moderateScale(250),
    borderRadius: moderateScale(125),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  logoContainer: {
    width: moderateScale(88),
    height: moderateScale(88),
    borderRadius: moderateScale(44),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: moderateScale(12),
    shadowOffset: { width: 0, height: verticalScale(4) },
    elevation: 6,
  },
  logo: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
  },
  companyName: {
    color: '#FFFFFF',
    fontSize: moderateScale(20),
    fontWeight: '800',
    marginBottom: verticalScale(4),
    textAlign: 'center',
    paddingHorizontal: moderateScale(20),
  },
  heroSubtitle: {
    color: '#FFFFFF',
    opacity: 0.75,
    fontSize: moderateScale(12),
    letterSpacing: 0.4,
  },
  card: {
    marginTop: verticalScale(-40),
    marginHorizontal: moderateScale(20),
    borderRadius: moderateScale(24),
    padding: moderateScale(24),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(20),
    shadowOffset: { width: 0, height: verticalScale(8) },
    elevation: 8,
  },
  welcomeTitle: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    marginBottom: verticalScale(4),
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    fontSize: moderateScale(14),
    marginBottom: verticalScale(20),
  },
  label: {
    fontSize: moderateScale(11),
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: verticalScale(8),
    marginTop: verticalScale(10),
  },
  input: {
    height: verticalScale(52),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    paddingHorizontal: moderateScale(16),
    fontSize: moderateScale(14),
    marginBottom: verticalScale(4),
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    height: verticalScale(52),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    paddingHorizontal: moderateScale(16),
    paddingRight: moderateScale(48),
    fontSize: moderateScale(14),
  },
  eyeButton: {
    position: 'absolute',
    right: moderateScale(16),
    height: '100%',
    justifyContent: 'center',
  },
  signInButton: {
    height: verticalScale(52),
    borderRadius: moderateScale(14),
    marginTop: verticalScale(28),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(10),
    shadowOffset: { width: 0, height: verticalScale(4) },
    elevation: 4,
  },
  signInText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  version: {
    textAlign: 'center',
    marginTop: verticalScale(36),
    fontSize: moderateScale(10),
    letterSpacing: 1.5,
    fontWeight: '500',
  },
});
