import React, { useState, useRef, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { moderateScale, moderateVerticalScale, scale, verticalScale } from 'react-native-size-matters';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthStackScreenProps } from '../../navigation/navigationTypes';
import { AuthContext } from '../../context/authContext';
import { verifyOtp, resendOtp } from '../../services/otpService';
import { saveAuthToken } from '../../services/api/apiService';
import ToastUtil from '../../utils/toastAndroid';

import AppScreen from '../../components/ui/AppScreen';
import AppCard from '../../components/ui/AppCard';
import AppButton from '../../components/ui/AppButton';
import { useAppTheme } from '../../constant/theme';

interface OtpScreenProps extends AuthStackScreenProps<'otp'> {}

const OtpScreen: React.FC<OtpScreenProps> = ({ navigation, route }) => {
  const authContext = useContext(AuthContext);
  const { colors } = useAppTheme();

  const otpLength = 6;
  const otpInputRefs = useRef<Array<TextInput | null>>([]);
  const [otp, setOtp] = useState<string[]>(Array(otpLength).fill(''));
  const [loading, setLoading] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const mobileNumber = route.params?.mobileNumber || '';
  const userId = route.params?.userId || '';

  const maskMobileNumber = (mobile: string | number): string => {
    const str = String(mobile);
    if (str.length < 4) return str;
    return '*'.repeat(str.length - 4) + str.slice(-4);
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
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
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
      const msg = error instanceof Error ? error.message : 'OTP verification failed';
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
      ToastUtil.error(error instanceof Error ? error.message : 'Failed to resend OTP');
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
    <AppScreen keyboardAvoiding padding={false}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backButton}>
            <ChevronLeft size={28} color={colors.text} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <View style={styles.wrapper}>
          <Text style={[styles.title, { color: colors.text }]}>Enter OTP</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            We've sent a 6-digit code to {maskedMobileNumber}
          </Text>

          <AppCard style={styles.card}>
            <View style={styles.otpContainer}>
              {Array(otpLength).fill(null).map((_, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { otpInputRefs.current[index] = ref; }}
                  style={[
                    styles.otpInput,
                    {
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: otp[index] ? colors.primary : colors.border,
                      borderWidth: 2,
                    },
                  ]}
                  value={otp[index]}
                  onChangeText={(value) => handleOtpChange(index, value)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                  keyboardType="numeric"
                  maxLength={1}
                  editable={!loading}
                  placeholder="-"
                  placeholderTextColor={colors.textMuted}
                />
              ))}
            </View>

            <AppButton
              label="Verify OTP"
              onPress={handleVerifyOtp}
              loading={loading}
              disabled={otp.join('').length !== otpLength}
              style={styles.verifyButton}
            />

            <View style={[styles.timerSection, { borderTopColor: colors.border }]}>
              <Text style={[styles.timerText, { color: isTimerExpiring ? colors.warning : colors.textMuted }]}>
                {canResend ? "Didn't receive code?" : `Code expires in ${formatTime(timeLeft)}`}
              </Text>
              <TouchableOpacity onPress={handleResendOtp} disabled={!canResend || resendLoading}>
                <Text style={[styles.resendButton, { color: canResend ? colors.primary : colors.textMuted }]}>
                  {resendLoading ? 'Resending...' : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            </View>
          </AppCard>

          <Text style={[styles.helperText, { color: colors.textMuted }]}>
            Enter the 6-digit code sent to your phone number
          </Text>
        </View>
      </ScrollView>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  wrapper: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: verticalScale(20),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: scale(13),
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: verticalScale(28),
    lineHeight: 20,
  },
  card: {
    width: '100%',
    padding: 24,
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
    borderRadius: 12,
    fontSize: moderateScale(20),
    fontWeight: '700',
    textAlign: 'center',
  },
  verifyButton: {
    marginBottom: 20,
  },
  timerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  timerText: {
    fontSize: scale(13),
    fontWeight: '500',
  },
  resendButton: {
    fontSize: scale(13),
    fontWeight: '700',
  },
  helperText: {
    fontSize: scale(12),
    textAlign: 'center',
    marginTop: 16,
  },
});

export default OtpScreen;
