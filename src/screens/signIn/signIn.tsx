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
const SignIn: React.FC<AuthStackScreenProps<'signIn'>> = () => {
  const { login } = useContext(AuthContext) as {
    login: (mobileNo: number | null, password: string | null) => Promise<void>;
    loginError: string;
  };

  const [mobileNo, setMobileNo] = useState<number | null>(null);
  const [password, setPassword] = useState<string | null>(null);
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
  };
  const handleLogin = async () => {
    if (!mobileNo && !password) {
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
      await login(mobileNo, password);
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
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
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <Text style={[styles.label, { color: theme.label }]}>
                MOBILE NUMBER
              </Text>
              <TextInput
                placeholder="mobile number"
                style={[
                  styles.input,
                  { backgroundColor: theme.inputBg, color: theme.inputText },
                ]}
                placeholderTextColor={theme.placeholder}
                value={mobileNo ?? ''}
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
                    { backgroundColor: theme.inputBg, color: theme.inputText },
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

            <TouchableOpacity>
              <Text style={[styles.forgot, { color: theme.forgot }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

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
  },
  wrapper: {
    flex: 1,
    alignItems: 'center',
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(24),
  },
  logoContainer: {
    width: moderateScale(90),
    height: moderateVerticalScale(90),
    borderRadius: moderateScale(18),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(14),
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  logo: {
    width: moderateScale(80),
    height: moderateVerticalScale(80),
  },
  title: {
    fontSize: moderateScale(20),
    letterSpacing: 1,
  },
  titleBold: {
    fontWeight: '700',
    color: '#111827',
  },
  titleLight: {
    fontWeight: '400',
    color: '#111827',
  },

  subtitle: {
    fontSize: scale(12),
    color: '#6B7280',
    marginBottom: verticalScale(22),
  },

  card: {
    width: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 8,
  },

  label: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 6,
    marginTop: 12,
    letterSpacing: 1,
  },

  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: verticalScale(42),
    fontSize: 14,
    color: '#111827',
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },

  passwordInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingRight: 44, // space for eye icon
    height: verticalScale(42),
    fontSize: 14,
    color: '#111827',
  },

  eyeButton: {
    position: 'absolute',
    right: 14,
    height: '100%',
    justifyContent: 'center',
  },

  signInButton: {
    marginTop: 20,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  signInText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  forgot: {
    color: '#2563EB',
    marginVertical: 12,
    fontSize: scale(12),
  },

  version: {
    marginTop: verticalScale(22),
    fontSize: scale(10),
    color: '#CBD5E1',
    letterSpacing: 1,
  },
});
