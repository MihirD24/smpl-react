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
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#0E244A' : '#0E2A59' }}>
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
          contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.screenBg }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.wrapper}>
            <View style={[styles.topBrand, { backgroundColor: isDarkMode ? '#172554' : '#0F2B5B' }]}>
              <View style={styles.topBrandGlow} />
              <Text style={styles.topBrandKicker}>SHANTINATH MOTORS</Text>
              <Text style={styles.topBrandTitle}>Workforce Hub</Text>
              <Text style={styles.topBrandSub}>Secure access to your employee workspace</Text>
            </View>
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
            <View style={styles.welcomeBlock}>
              <Text style={[styles.eyebrow, { color: theme.button }]}>EMPLOYEE LOGIN</Text>
              <Text style={[styles.title, { color: theme.title }]}>Welcome back</Text>
              <Text style={[styles.subtitle, { color: theme.subtitle }]}>Sign in to continue to your workforce dashboard</Text>
            </View>

            {/* Card */}
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder, borderWidth: 1 }]}>
              <View style={styles.cardTopRow}>
                <View style={styles.cardTopIndicator} />
                <View>
                  <Text style={[styles.cardTitle, { color: theme.title }]}>Sign in</Text>
                  <Text style={[styles.cardHint, { color: theme.subtitle }]}>Use your registered mobile number</Text>
                </View>
              </View>
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
  scrollContent: { flexGrow: 1, paddingBottom: verticalScale(26) },
  wrapper: { width: '100%', alignItems: 'center', paddingBottom: verticalScale(24) },
  topBrand: { width: '100%', minHeight: verticalScale(214), paddingHorizontal: moderateScale(24), paddingTop: verticalScale(32), paddingBottom: verticalScale(24), overflow: 'hidden' },
  topBrandGlow: { position: 'absolute', width: moderateScale(210), height: moderateScale(210), borderRadius: moderateScale(105), right: moderateScale(-65), top: moderateScale(-70), backgroundColor: 'rgba(96,165,250,0.13)' },
  topBrandKicker: { color: '#BFD3F6', fontSize: moderateScale(9), fontWeight: '800', letterSpacing: 1.7, marginBottom: verticalScale(9) },
  topBrandTitle: { color: '#FFFFFF', fontSize: moderateScale(29), fontWeight: '800', letterSpacing: -0.8 },
  topBrandSub: { color: '#C7D2E0', fontSize: moderateScale(11.5), lineHeight: moderateScale(18), marginTop: verticalScale(7), maxWidth: moderateScale(295) },
  logoContainer: { width: moderateScale(78), height: moderateVerticalScale(78), borderRadius: moderateScale(22), backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginTop: verticalScale(-36), marginBottom: verticalScale(14), shadowColor: '#0F172A', shadowOpacity: 0.10, shadowRadius: 18, elevation: 4 },
  logo: { width: moderateScale(66), height: moderateVerticalScale(66) },
  welcomeBlock: { alignItems: 'flex-start', alignSelf: 'stretch', paddingHorizontal: moderateScale(22), marginBottom: verticalScale(14) },
  eyebrow: { fontSize: moderateScale(8.5), fontWeight: '800', letterSpacing: 1.6, marginBottom: verticalScale(5) },
  title: { fontSize: moderateScale(26), fontWeight: '800', letterSpacing: -0.7, marginBottom: verticalScale(4) },
  titleBold: { fontWeight: '800', color: '#0F172A' },
  titleLight: { fontWeight: '400', color: '#0F172A' },
  subtitle: { fontSize: moderateScale(11.5), color: '#64748B', lineHeight: moderateScale(18), fontWeight: '500', maxWidth: moderateScale(305) },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(3) },
  cardTopIndicator: { width: moderateScale(4), height: moderateScale(36), borderRadius: 4, backgroundColor: '#2563EB', marginRight: moderateScale(10) },
  cardTitle: { fontSize: moderateScale(17), fontWeight: '800' },
  cardHint: { fontSize: moderateScale(10), marginTop: verticalScale(2) },
  card: { backgroundColor: '#FFFFFF', borderRadius: moderateScale(22), paddingHorizontal: moderateScale(18), paddingTop: moderateScale(17), paddingBottom: moderateScale(20), marginHorizontal: moderateScale(18), alignSelf: 'stretch', marginBottom: verticalScale(16), shadowColor: '#0F172A', shadowOpacity: 0.07, shadowRadius: 22, shadowOffset: { width: 0, height: 10 }, elevation: 4 },
  label: { fontSize: moderateScale(9.5), color: '#64748B', marginBottom: 7, marginTop: 14, fontWeight: '700', letterSpacing: 1.1 },
  input: { backgroundColor: '#F7F9FC', borderRadius: moderateScale(13), paddingHorizontal: moderateScale(14), height: verticalScale(52), fontSize: 15, color: '#0F172A' },
  passwordWrapper: { position: 'relative', justifyContent: 'center' },
  passwordInput: { backgroundColor: '#F7F9FC', borderRadius: moderateScale(13), paddingHorizontal: moderateScale(14), paddingRight: moderateScale(48), height: verticalScale(52), fontSize: 15, color: '#0F172A' },
  eyeButton: { position: 'absolute', right: 16, height: '100%', justifyContent: 'center' },
  signInButton: { marginTop: verticalScale(20), height: verticalScale(52), borderRadius: moderateScale(14), backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center', shadowColor: '#2563EB', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  signInText: { color: '#FFFFFF', fontSize: 15.5, fontWeight: '800', letterSpacing: 0.2 },
  forgot: { color: '#2563EB', marginVertical: 14, fontSize: scale(13), fontWeight: '600' },
  version: { marginTop: verticalScale(10), fontSize: scale(9), color: '#94A3B8', letterSpacing: 1.2, fontWeight: '600' },
});
