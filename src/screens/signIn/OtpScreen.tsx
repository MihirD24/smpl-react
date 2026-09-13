import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StyleSheet,
  StatusBar,
  useColorScheme,
  useWindowDimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { ChevronLeft, ShieldCheck, Smartphone } from 'lucide-react-native';

import ToastUtil from '../../utils/toastAndroid';
import { AuthStackScreenProps } from '../../navigation/navigationTypes';
import { AuthContext } from '../../context/authContext';
import { verifyOtp, resendOtp } from '../../services/otpService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveAuthToken } from '../../services/api/apiService';
import { BRAND, isTabletWidth, contentMaxWidth } from '../../assets/style/brandTheme';

interface OtpScreenProps extends AuthStackScreenProps<'otp'> {}

const OTP_LENGTH = 6;
const LOGIN_LOGO = require('../../assets/images/login_logo.jpeg');

const OtpScreen: React.FC<OtpScreenProps> = ({ navigation, route }) => {
  const authContext = useContext(AuthContext);
  const isDarkMode = useColorScheme() === 'dark';
  const { width, height } = useWindowDimensions();
  const tablet = isTabletWidth(width);

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const otpInputRefs = useRef<Array<TextInput | null>>([]);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const mobileNumber = route.params?.mobileNumber || '';
  const userId = route.params?.userId || '';

  const theme = {
    background: isDarkMode ? '#0D0F10' : '#F4F5F6',
    surface: isDarkMode ? '#181B1D' : '#FFFFFF',
    input: isDarkMode ? '#101315' : '#FAFAFA',
    text: isDarkMode ? '#FFFFFF' : BRAND.ink,
    muted: isDarkMode ? '#A6ADB5' : '#687078',
    border: isDarkMode ? '#303438' : '#E3E5E7',
    yellow: BRAND.yellow,
    yellowSoft: isDarkMode ? '#3B3210' : '#FFF7CC',
    danger: '#D64545',
  };

  const maskMobileNumber = (mobile: string | number): string => {
    const value = String(mobile);
    if (value.length <= 4) return value;
    return `${'*'.repeat(value.length - 4)}${value.slice(-4)}`;
  };

  const maskedMobileNumber = maskMobileNumber(mobileNumber);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const startTimer = () => {
    setTimeLeft(300);
    setCanResend(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCanResend(true);
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    // Support iOS/Android OTP autofill and paste of all six digits.
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
      const next = Array(OTP_LENGTH).fill('');
      digits.forEach((digit, i) => (next[i] = digit));
      setOtp(next);
      otpInputRefs.current[Math.min(digits.length, OTP_LENGTH) - 1]?.focus();
      return;
    }

    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < OTP_LENGTH - 1) otpInputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== OTP_LENGTH) {
      ToastUtil.error(`Please enter a ${OTP_LENGTH}-digit OTP`);
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOtp(userId, otpCode);
      if (response.success && response.data) {
        ToastUtil.success('OTP verified successfully!');
        const userInfo = response.data;
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
        saveAuthToken(userInfo.api_token);
        if (authContext) {
          authContext.setUserToken(userInfo.api_token);
          authContext.setUserInfo(userInfo);
        }
      } else {
        throw new Error(response.message || 'Invalid OTP');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'OTP verification failed';
      ToastUtil.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setResendLoading(true);
    try {
      const response = await resendOtp(mobileNumber);
      if (response.success) {
        ToastUtil.success('OTP resent successfully');
        startTimer();
        setOtp(Array(OTP_LENGTH).fill(''));
        otpInputRefs.current[0]?.focus();
      } else {
        throw new Error(response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resend OTP';
      ToastUtil.error(message);
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const complete = otp.join('').length === OTP_LENGTH;
  const expiring = timeLeft < 60;

  const verificationCard = (
    <View style={[styles.card, tablet && styles.cardTablet, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.cardIcon, { backgroundColor: theme.yellowSoft }]}>
        <ShieldCheck size={26} color={BRAND.black} strokeWidth={2.3} />
      </View>

      <Text style={[styles.cardTitle, { color: theme.text }]}>Verify your account</Text>
      <Text style={[styles.cardDescription, { color: theme.muted }]}>Enter the 6-digit verification code sent to</Text>

      <View style={styles.mobileRow}>
        <View style={[styles.mobileIcon, { backgroundColor: isDarkMode ? '#252A2D' : '#F0F1F2' }]}>
          <Smartphone size={17} color={theme.text} />
        </View>
        <Text style={[styles.mobileText, { color: theme.text }]}>+91 {maskedMobileNumber}</Text>
      </View>

      <Text style={[styles.inputLabel, { color: theme.muted }]}>VERIFICATION CODE</Text>

      <View style={[styles.otpContainer, tablet && styles.otpContainerTablet]}>
        {Array(OTP_LENGTH).fill(null).map((_, index) => {
          const filled = Boolean(otp[index]);
          return (
            <TextInput
              key={index}
              ref={ref => { otpInputRefs.current[index] = ref; }}
              style={[
                styles.otpInput,
                tablet && styles.otpInputTablet,
                {
                  backgroundColor: theme.input,
                  color: theme.text,
                  borderColor: filled ? BRAND.yellow : theme.border,
                  borderWidth: filled ? 2 : 1,
                },
              ]}
              value={otp[index]}
              onChangeText={value => handleOtpChange(index, value)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              maxLength={OTP_LENGTH}
              editable={!loading}
              selectTextOnFocus
              returnKeyType={index === OTP_LENGTH - 1 ? 'done' : 'next'}
              accessibilityLabel={`OTP digit ${index + 1}`}
            />
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.verifyButton, { backgroundColor: complete ? BRAND.yellow : isDarkMode ? '#34383B' : '#E2E4E6' }]}
        onPress={handleVerifyOtp}
        disabled={loading || !complete}
        activeOpacity={0.82}
      >
        {loading ? <ActivityIndicator size="small" color={BRAND.black} /> : <Text style={[styles.verifyButtonText, { color: complete ? BRAND.black : theme.muted }]}>Verify & Continue</Text>}
      </TouchableOpacity>

      <View style={styles.resendRow}>
        <Text style={[styles.timerText, { color: expiring ? theme.danger : theme.muted }]}>
          {canResend ? "Didn't receive the code?" : `Code expires in ${formatTime(timeLeft)}`}
        </Text>
        <TouchableOpacity onPress={handleResendOtp} disabled={!canResend || resendLoading} activeOpacity={0.7}>
          <Text style={[styles.resendText, { color: canResend ? BRAND.info : theme.muted }]}>
            {resendLoading ? 'Resending...' : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <View style={styles.screenContent}>
          <View style={[styles.topAccent, { backgroundColor: BRAND.yellow }]} />

          <View style={[styles.header, { width: Math.min(contentMaxWidth(width), width) }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: theme.surface, borderColor: theme.border }]} activeOpacity={0.75}>
              <ChevronLeft size={23} color={theme.text} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={[styles.headerLabel, { color: theme.muted }]}>SECURE LOGIN</Text>
          </View>

          <View style={[styles.page, { maxWidth: contentMaxWidth(width) }, tablet && styles.pageTablet, !tablet && height < 760 && styles.pageCompact]}>
            {tablet && (
              <View style={[styles.brandPanel, { backgroundColor: BRAND.black }]}>
                <View style={styles.brandYellowBar} />
                <Image source={LOGIN_LOGO} style={styles.brandLogoTablet} resizeMode="contain" />
                <View style={styles.brandDivider} />
                <Text style={styles.brandHrms}>HRMS</Text>
                <Text style={styles.brandHeadline}>One secure workspace for your workforce.</Text>
                <Text style={styles.brandSmall}>Attendance • Leave • Payroll • Service</Text>
              </View>
            )}

            <View style={[styles.content, tablet && styles.contentTablet]}>
              {!tablet && <Image source={LOGIN_LOGO} style={styles.brandLogo} resizeMode="contain" />}
              <Text style={[styles.eyebrow, { color: BRAND.black }]}>SHANTINATH JCB</Text>
              <Text style={[styles.title, { color: theme.text }]}>OTP Verification</Text>
              <Text style={[styles.subtitle, { color: theme.muted }]}>A secure verification step before entering your HRMS workspace.</Text>
              {verificationCard}
              <Text style={[styles.securityNote, { color: theme.muted }]}>Your verification code is private. Never share your OTP with anyone.</Text>
              <Text style={[styles.footer, { color: theme.muted }]}>SHANTINATH MOTORS PVT. LTD.  •  HRMS</Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {loading && <View style={styles.loadingOverlay}><ActivityIndicator size="large" color={BRAND.yellow} /></View>}
    </SafeAreaView>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  screenContent: { flex: 1 },
  topAccent: { height: 6, width: '100%' },
  header: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingTop: 14 },
  backButton: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerLabel: { marginLeft: 12, fontSize: 11, fontWeight: '700', letterSpacing: 1.4 },
  page: { width: '100%', flex: 1, alignSelf: 'center', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22, paddingVertical: 14 },
  pageTablet: { flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center', gap: 36, paddingHorizontal: 38, paddingVertical: 30 },
  content: { width: '100%', maxWidth: 540, alignItems: 'center' },
  contentTablet: { flex: 1, maxWidth: 560, justifyContent: 'center' },
  brandLogo: { width: '100%', maxWidth: 420, height: 50, marginBottom: 10 },
  brandPanel: { width: 360, maxWidth: '38%', minHeight: 560, borderRadius: 24, padding: 30, justifyContent: 'center', overflow: 'hidden' },
  brandYellowBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 9, backgroundColor: BRAND.yellow },
  brandLogoTablet: { width: '100%', height: 76, backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 6, marginBottom: 32 },
  brandDivider: { width: 54, height: 5, backgroundColor: BRAND.yellow, marginBottom: 18 },
  brandHrms: { color: BRAND.yellow, fontSize: 15, fontWeight: '800', letterSpacing: 3 },
  brandHeadline: { color: '#FFFFFF', fontSize: 28, lineHeight: 36, fontWeight: '800', marginTop: 14 },
  brandSmall: { color: '#A6ADB5', fontSize: 12, lineHeight: 20, marginTop: 18 },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.8, marginBottom: 4 },
  title: { fontSize: 27, lineHeight: 33, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 13, lineHeight: 18, textAlign: 'center', maxWidth: 460, marginTop: 5, marginBottom: 12 },
  card: { width: '100%', maxWidth: 540, borderRadius: 20, borderWidth: 1, padding: 18, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 18, shadowOffset: { width: 0, height: 7 }, elevation: 4 },
  cardTablet: { padding: 28, borderRadius: 24 },
  cardIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  cardTitle: { fontSize: 19, fontWeight: '800' },
  cardDescription: { fontSize: 13, lineHeight: 20, marginTop: 5 },
  mobileRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 14 },
  mobileIcon: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  mobileText: { marginLeft: 9, fontSize: 14, fontWeight: '700', letterSpacing: 0.2 },
  inputLabel: { width: '100%', fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 10 },
  otpContainer: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  otpContainerTablet: { maxWidth: 430 },
  otpInput: { width: 43, height: 50, borderRadius: 12, textAlign: 'center', fontSize: 21, fontWeight: '800', padding: 0 },
  otpInputTablet: { width: 52, height: 60, fontSize: 23 },
  verifyButton: { width: '100%', height: 50, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  verifyButtonText: { fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },
  resendRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 13 },
  timerText: { fontSize: 12, flexShrink: 1 },
  resendText: { fontSize: 12, fontWeight: '800', marginLeft: 12 },
  securityNote: { fontSize: 10, lineHeight: 15, textAlign: 'center', maxWidth: 440, marginTop: 10 },
  footer: { fontSize: 8, letterSpacing: 0.8, marginTop: 9 },
  pageCompact: { paddingHorizontal: 18, paddingVertical: 8 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.18)', alignItems: 'center', justifyContent: 'center' },
});
