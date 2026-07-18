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
  moderateVerticalScale,
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
    buttonDisabled: isDarkMode ? '#4B5563' : '#CBD5E1',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    inputBorder: isDarkMode ? '#334155' : '#E2E8F0',
    cardBorder: isDarkMode ? '#1E293B' : '#E2E8F0',
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
          {/* Header with back button */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <ChevronLeft
                size={24}
                color={theme.title}
                strokeWidth={2.5}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.wrapper}>
            {/* Title */}
            <Text style={[styles.title, { color: theme.title }]}>
              Enter OTP
            </Text>
            <Text style={[styles.subtitle, { color: theme.subtitle }]}>
              We've sent a 6-digit code to {maskedMobileNumber}
            </Text>

            {/* OTP Input Card */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.cardBorder,
                  borderWidth: 1,
                },
              ]}
            >
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
                          borderWidth: 2,
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

            {/* Helper Text */}
            <Text style={[styles.helperText, { color: theme.subtitle }]}>
              Enter the 6-digit code sent to your phone number
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.button} />
        </View>
      )}
    </SafeAreaView>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  wrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: verticalScale(20),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: scale(13),
    fontWeight: '500',
    letterSpacing: 0.3,
    textAlign: 'center',
    marginBottom: verticalScale(28),
    lineHeight: 20,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: moderateVerticalScale(56),
    borderRadius: 14,
    fontSize: moderateScale(20),
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 8,
  },
  verifyButton: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 16,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(100, 116, 139, 0.1)',
  },
  timerText: {
    fontSize: scale(13),
    fontWeight: '500',
  },
  resendButton: {
    fontSize: scale(13),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  helperText: {
    fontSize: scale(12),
    textAlign: 'center',
    fontWeight: '400',
    marginTop: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});
