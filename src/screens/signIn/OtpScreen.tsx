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
  ScrollView,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { ChevronLeft } from 'lucide-react-native';
import {
  moderateScale,
  scale,
  verticalScale,
} from 'react-native-size-matters';
import ToastUtil from '../../utils/toastAndroid';
import { AuthStackScreenProps } from '../../navigation/navigationTypes';
import { AuthContext } from '../../context/authContext';
import { verifyOtp, resendOtp } from '../../services/otpService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveAuthToken } from '../../services/api/apiService';

interface OtpScreenProps extends AuthStackScreenProps<'otp'> {}

const OtpScreen: React.FC<OtpScreenProps> = ({ navigation, route }) => {
  const authContext = useContext(AuthContext);
  const isDarkMode = useColorScheme() === 'dark';

  const theme = {
    heroBg: isDarkMode ? '#1E3A8A' : '#1D4ED8',
    screenBg: isDarkMode ? '#0F172A' : '#F8FAFC',
    card: isDarkMode ? '#1E293B' : '#FFFFFF',
    title: '#FFFFFF',
    cardTitle: isDarkMode ? '#F8FAFC' : '#0F172A',
    subtitle: isDarkMode ? '#94A3B8' : '#64748B',
    heroSubtitle: isDarkMode ? '#93C5FD' : '#DBEAFE',
    label: isDarkMode ? '#94A3B8' : '#64748B',
    inputBg: isDarkMode ? '#0F172A' : '#F8FAFC',
    inputText: isDarkMode ? '#F8FAFC' : '#0F172A',
    placeholder: isDarkMode ? '#64748B' : '#94A3B8',
    button: '#2563EB',
    buttonDisabled: isDarkMode ? '#334155' : '#E2E8F0',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    inputBorder: isDarkMode ? '#334155' : '#E2E8F0',
    cardBorder: isDarkMode ? '#334155' : '#E2E8F0',
  };

  const otpLength = 6;
  const otpInputRefs = useRef<Array<TextInput | null>>([]);
  const [otp, setOtp] = useState<string[]>(Array(otpLength).fill(''));
  const [loading, setLoading] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes
  const [canResend, setCanResend] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const maskMobileNumber = (mobile: string | number): string => {
    const str = String(mobile);
    if (str.length < 4) return str;
    return '*'.repeat(str.length - 4) + str.slice(-4);
  };

  const mobileNumber = route.params?.mobileNumber || '';
  const userId = route.params?.userId || '';
  const maskedMobileNumber = maskMobileNumber(mobileNumber);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    setTimeLeft(300);
    setCanResend(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numeric input
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-move to next input if a digit is entered
    if (value && index < otpLength - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== otpLength) {
      ToastUtil.error(`Please enter a ${otpLength}-digit OTP`);
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOtp(userId, otpCode);
      console.log('OTP Verification Response:', response);
      if (response.success && response.data) {
        ToastUtil.success('OTP verified successfully!');
        
        // Save user info and token
        const userInfo = response.data;
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
        saveAuthToken(userInfo.api_token);

        // Update auth context
        if (authContext) {
          authContext.setUserToken(userInfo.api_token);
          authContext.setUserInfo(userInfo);
        }
      } else {
        throw new Error(response.message || 'Invalid OTP');
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'OTP verification failed';
      ToastUtil.error(msg);
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
      } else {
        throw new Error(response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to resend OTP';
      ToastUtil.error(msg);
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isTimerExpiring = timeLeft < 60;

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.heroBg }]}>
      <StatusBar
        backgroundColor="transparent"
        translucent
        barStyle="light-content"
      />
      <View style={[styles.mainContainer, { backgroundColor: theme.screenBg }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Hero Section */}
            <View style={[styles.heroSection, { backgroundColor: theme.heroBg }]}>
              {/* Decorative circles */}
              <View style={styles.circleLarge} />
              <View style={styles.circleSmall} />
              
              {/* Header with back button */}
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  activeOpacity={0.7}
                  style={styles.backButton}
                >
                  <ChevronLeft
                    size={moderateScale(24)}
                    color="#FFFFFF"
                    strokeWidth={2.5}
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.heroContent}>
                <Text style={[styles.heroTitle, { color: theme.title }]}>
                  Verification
                </Text>
                <Text style={[styles.heroSubtitle, { color: theme.heroSubtitle }]}>
                  We've sent a 6-digit code to {maskedMobileNumber}
                </Text>
              </View>
            </View>

            {/* Floating Card */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.cardBorder,
                  borderWidth: isDarkMode ? 1 : 0,
                  shadowColor: isDarkMode ? 'transparent' : '#0F172A',
                },
              ]}
            >
              <Text style={[styles.cardTitle, { color: theme.cardTitle }]}>Enter OTP</Text>
              
              {/* OTP Input Fields */}
              <View style={styles.otpContainer}>
                {Array(otpLength)
                  .fill(null)
                  .map((_, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => {
                        otpInputRefs.current[index] = ref;
                      }}
                      style={[
                        styles.otpInput,
                        {
                          backgroundColor: theme.inputBg,
                          color: theme.inputText,
                          borderColor: otp[index]
                            ? theme.button
                            : theme.inputBorder,
                          borderWidth: 1,
                        },
                      ]}
                      value={otp[index]}
                      onChangeText={(value) => handleOtpChange(index, value)}
                      onKeyPress={({ nativeEvent }) =>
                        handleKeyPress(index, nativeEvent.key)
                      }
                      keyboardType="numeric"
                      maxLength={1}
                      editable={!loading}
                      placeholder="-"
                      placeholderTextColor={theme.placeholder}
                    />
                  ))}
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  {
                    backgroundColor:
                      otp.join('').length === otpLength ? theme.button : theme.buttonDisabled,
                  },
                ]}
                onPress={handleVerifyOtp}
                disabled={loading || otp.join('').length !== otpLength}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify OTP</Text>
                )}
              </TouchableOpacity>

              {/* Timer and Resend Section */}
              <View style={styles.timerSection}>
                <Text
                  style={[
                    styles.timerText,
                    {
                      color: isTimerExpiring ? theme.warning : theme.subtitle,
                    },
                  ]}
                >
                  {canResend
                    ? "Didn't receive code?"
                    : `Code expires in ${formatTime(timeLeft)}`}
                </Text>

                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={!canResend || resendLoading}
                  activeOpacity={0.7}
                  style={styles.resendBtnContainer}
                >
                  <Text
                    style={[
                      styles.resendButton,
                      {
                        color: canResend ? theme.button : theme.buttonDisabled,
                      },
                    ]}
                  >
                    {resendLoading ? 'Resending...' : 'Resend OTP'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.button} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: verticalScale(40),
  },
  heroSection: {
    height: verticalScale(200),
    paddingHorizontal: moderateScale(20),
    borderBottomLeftRadius: moderateScale(24),
    borderBottomRightRadius: moderateScale(24),
    overflow: 'hidden',
  },
  circleLarge: {
    position: 'absolute',
    top: verticalScale(-50),
    right: moderateScale(-20),
    width: moderateScale(150),
    height: moderateScale(150),
    borderRadius: moderateScale(75),
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  circleSmall: {
    position: 'absolute',
    top: verticalScale(60),
    right: moderateScale(-30),
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(40),
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  header: {
    marginTop: verticalScale(10),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  backButton: {
    padding: moderateScale(8),
    marginLeft: moderateScale(-8),
    borderRadius: moderateScale(8),
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  heroContent: {
    marginTop: verticalScale(10),
  },
  heroTitle: {
    fontSize: moderateScale(28),
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: verticalScale(8),
  },
  heroSubtitle: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    lineHeight: verticalScale(20),
  },
  card: {
    marginHorizontal: moderateScale(20),
    marginTop: verticalScale(-40),
    borderRadius: moderateScale(16),
    padding: moderateScale(24),
    shadowOpacity: 0.08,
    shadowRadius: moderateScale(16),
    shadowOffset: { width: 0, height: verticalScale(4) },
    elevation: 4,
  },
  cardTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    marginBottom: verticalScale(20),
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(24),
  },
  otpInput: {
    width: moderateScale(42),
    height: moderateScale(48),
    borderRadius: moderateScale(12),
    fontSize: moderateScale(20),
    fontWeight: '700',
    textAlign: 'center',
  },
  verifyButton: {
    height: verticalScale(52),
    borderRadius: moderateScale(14),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: verticalScale(16),
    borderTopWidth: 1,
    borderTopColor: 'rgba(100, 116, 139, 0.1)',
  },
  timerText: {
    fontSize: moderateScale(13),
    fontWeight: '500',
  },
  resendBtnContainer: {
    paddingVertical: verticalScale(4),
    paddingHorizontal: moderateScale(8),
  },
  resendButton: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

