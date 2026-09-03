import React, {
  useState,
  useRef,
  useEffect,
  useContext,
} from 'react';

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

import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { ChevronLeft } from 'lucide-react-native';

import ToastUtil from '../../utils/toastAndroid';
import { AuthStackScreenProps } from '../../navigation/navigationTypes';
import { AuthContext } from '../../context/authContext';
import { verifyOtp, resendOtp } from '../../services/otpService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveAuthToken } from '../../services/api/apiService';

interface OtpScreenProps extends AuthStackScreenProps<'otp'> {}

const OtpScreen: React.FC<OtpScreenProps> = ({
  navigation,
  route,
}) => {
  const authContext = useContext(AuthContext);
  const isDarkMode = useColorScheme() === 'dark';

  /**
   * Responsive dimensions
   * Used to identify iPad/tablet layouts.
   */
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const theme = {
    screenBg: isDarkMode ? '#111827' : '#F6FAFF',
    title: isDarkMode ? '#F9FAFB' : '#111827',
    subtitle: isDarkMode ? '#9CA3AF' : '#6B7280',
    card: isDarkMode ? '#1F2937' : '#FFFFFF',
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

  const [otp, setOtp] = useState<string[]>(
    Array(otpLength).fill(''),
  );

  const [loading, setLoading] = useState<boolean>(false);

  const [timeLeft, setTimeLeft] = useState<number>(300);

  const [canResend, setCanResend] = useState<boolean>(false);

  const [resendLoading, setResendLoading] =
    useState<boolean>(false);

  const timerIntervalRef = useRef<
    ReturnType<typeof setInterval> | null
  >(null);

  /**
   * Mask mobile number.
   * Example:
   * 9876543210 -> ******3210
   */
  const maskMobileNumber = (
    mobile: string | number,
  ): string => {
    const str = String(mobile);

    if (str.length < 4) {
      return str;
    }

    return (
      '*'.repeat(str.length - 4) +
      str.slice(-4)
    );
  };

  const mobileNumber = route.params?.mobileNumber || '';
  const userId = route.params?.userId || '';

  const maskedMobileNumber =
    maskMobileNumber(mobileNumber);

  /**
   * Start countdown timer.
   */
  useEffect(() => {
    startTimer();

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
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
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCanResend(true);

          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }

          return 0;
        }

        return prev - 1;
      });
    }, 1000);
  };

  /**
   * Handle OTP digit change.
   */
  const handleOtpChange = (
    index: number,
    value: string,
  ) => {
    // Only allow numeric input
    if (!/^\d*$/.test(value)) {
      return;
    }

    const newOtp = [...otp];

    /**
     * Keep only one digit.
     */
    newOtp[index] = value.slice(-1);

    setOtp(newOtp);

    /**
     * Automatically focus next OTP input.
     */
    if (
      value &&
      index < otpLength - 1
    ) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  /**
   * Handle backspace.
   */
  const handleKeyPress = (
    index: number,
    key: string,
  ) => {
    if (
      key === 'Backspace' &&
      !otp[index] &&
      index > 0
    ) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  /**
   * Verify OTP.
   */
  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== otpLength) {
      ToastUtil.error(
        `Please enter a ${otpLength}-digit OTP`,
      );
      return;
    }

    setLoading(true);

    try {
      const response = await verifyOtp(
        userId,
        otpCode,
      );

      console.log(
        'OTP Verification Response:',
        response,
      );

      if (
        response.success &&
        response.data
      ) {
        ToastUtil.success(
          'OTP verified successfully!',
        );

        // Save user information
        const userInfo = response.data;

        await AsyncStorage.setItem(
          'userInfo',
          JSON.stringify(userInfo),
        );

        saveAuthToken(
          userInfo.api_token,
        );

        // Update authentication context
        if (authContext) {
          authContext.setUserToken(
            userInfo.api_token,
          );

          authContext.setUserInfo(
            userInfo,
          );
        }
      } else {
        throw new Error(
          response.message ||
            'Invalid OTP',
        );
      }
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'OTP verification failed';

      ToastUtil.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend OTP.
   */
  const handleResendOtp = async () => {
    if (!canResend) {
      return;
    }

    setResendLoading(true);

    try {
      const response =
        await resendOtp(mobileNumber);

      if (response.success) {
        ToastUtil.success(
          'OTP resent successfully',
        );

        startTimer();

        // Clear current OTP after resend
        setOtp(
          Array(otpLength).fill(''),
        );

        // Focus first OTP input
        otpInputRefs.current[0]?.focus();
      } else {
        throw new Error(
          response.message ||
            'Failed to resend OTP',
        );
      }
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Failed to resend OTP';

      ToastUtil.error(msg);
    } finally {
      setResendLoading(false);
    }
  };

  /**
   * Format countdown.
   */
  const formatTime = (
    seconds: number,
  ): string => {
    const mins = Math.floor(
      seconds / 60,
    );

    const secs = seconds % 60;

    return `${mins}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const isTimerExpiring =
    timeLeft < 60;

  const isOtpComplete =
    otp.join('').length === otpLength;

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor:
            theme.screenBg,
        },
      ]}
    >
      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        keyboardVerticalOffset={
          Platform.OS === 'ios'
            ? 20
            : 0
        }
        style={styles.keyboardContainer}
      >
        <StatusBar
          backgroundColor="transparent"
          translucent
          barStyle={
            isDarkMode
              ? 'light-content'
              : 'dark-content'
          }
        />

        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
          bounces={false}
        >
          {/* Back button */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() =>
                navigation.goBack()
              }
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={styles.backButton}
            >
              <ChevronLeft
                size={24}
                color={theme.title}
                strokeWidth={2.5}
              />
            </TouchableOpacity>
          </View>

          {/* Main content */}
          <View
            style={[
              styles.wrapper,
              isTablet &&
                styles.wrapperTablet,
            ]}
          >
            {/* Title */}
            <Text
              style={[
                styles.title,
                {
                  color:
                    theme.title,
                },
              ]}
            >
              Enter OTP
            </Text>

            {/* Subtitle */}
            <Text
              style={[
                styles.subtitle,
                {
                  color:
                    theme.subtitle,
                },
              ]}
            >
              We've sent a 6-digit code
              {'\n'}
              to {maskedMobileNumber}
            </Text>

            {/* OTP Card */}
            <View
              style={[
                styles.card,
                isTablet &&
                  styles.cardTablet,
                {
                  backgroundColor:
                    theme.card,
                  borderColor:
                    theme.cardBorder,
                },
              ]}
            >
              {/* OTP Inputs */}
              <View
                style={[
                  styles.otpContainer,
                  isTablet &&
                    styles.otpContainerTablet,
                ]}
              >
                {Array(otpLength)
                  .fill(null)
                  .map((_, index) => (
                    <TextInput
                      key={index}
                      ref={ref => {
                        otpInputRefs.current[
                          index
                        ] = ref;
                      }}
                      style={[
                        styles.otpInput,
                        isTablet &&
                          styles.otpInputTablet,
                        {
                          backgroundColor:
                            theme.inputBg,
                          color:
                            theme.inputText,
                          borderColor:
                            otp[index]
                              ? theme.button
                              : theme.inputBorder,
                        },
                      ]}
                      value={otp[index]}
                      onChangeText={value =>
                        handleOtpChange(
                          index,
                          value,
                        )
                      }
                      onKeyPress={({
                        nativeEvent,
                      }) =>
                        handleKeyPress(
                          index,
                          nativeEvent.key,
                        )
                      }
                      keyboardType="number-pad"
                      textContentType="oneTimeCode"
                      autoComplete="one-time-code"
                      maxLength={1}
                      editable={!loading}
                      placeholder="-"
                      placeholderTextColor={
                        theme.placeholder
                      }
                      selectTextOnFocus
                      returnKeyType={
                        index ===
                        otpLength - 1
                          ? 'done'
                          : 'next'
                      }
                      accessibilityLabel={`OTP digit ${
                        index + 1
                      }`}
                    />
                  ))}
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  {
                    backgroundColor:
                      isOtpComplete
                        ? theme.button
                        : theme.buttonDisabled,
                  },
                ]}
                onPress={
                  handleVerifyOtp
                }
                disabled={
                  loading ||
                  !isOtpComplete
                }
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Verify OTP"
              >
                {loading ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={
                      styles.verifyButtonText
                    }
                  >
                    Verify OTP
                  </Text>
                )}
              </TouchableOpacity>

              {/* Timer / Resend */}
              <View
                style={[
                  styles.timerSection,
                  isTablet &&
                    styles.timerSectionTablet,
                ]}
              >
                <Text
                  style={[
                    styles.timerText,
                    {
                      color:
                        isTimerExpiring
                          ? theme.warning
                          : theme.subtitle,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {canResend
                    ? "Didn't receive code?"
                    : `Code expires in ${formatTime(
                        timeLeft,
                      )}`}
                </Text>

                <TouchableOpacity
                  onPress={
                    handleResendOtp
                  }
                  disabled={
                    !canResend ||
                    resendLoading
                  }
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Resend OTP"
                >
                  <Text
                    style={[
                      styles.resendButton,
                      {
                        color:
                          canResend
                            ? theme.button
                            : theme.buttonDisabled,
                      },
                    ]}
                  >
                    {resendLoading
                      ? 'Resending...'
                      : 'Resend OTP'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Helper text */}
            <Text
              style={[
                styles.helperText,
                {
                  color:
                    theme.subtitle,
                },
              ]}
            >
              Enter the 6-digit code
              sent to your phone number
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Loading overlay */}
      {loading && (
        <View
          style={[
            styles.loadingOverlay,
            {
              backgroundColor:
                'rgba(0, 0, 0, 0.25)',
            },
          ]}
          pointerEvents="auto"
        >
          <ActivityIndicator
            size="large"
            color={theme.button}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default OtpScreen;

/* =========================================================
   STYLES
   ========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  keyboardContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  header: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },

  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  wrapper: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },

  wrapperTablet: {
    paddingHorizontal: 32,
    paddingTop: 30,
    paddingBottom: 56,
  },

  title: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitle: {
    width: '100%',
    maxWidth: 520,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 0,
    textAlign: 'center',
    marginBottom: 28,
    paddingHorizontal: 8,
  },

  card: {
    width: '100%',
    maxWidth: 560,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,

    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 4,
  },

  cardTablet: {
    maxWidth: 560,
    padding: 28,
    borderRadius: 26,
  },

  otpContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },

  otpContainerTablet: {
    gap: 10,
    marginBottom: 28,
  },

  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    padding: 0,
  },

  otpInputTablet: {
    width: 64,
    height: 64,
    borderRadius: 16,
    fontSize: 24,
  },

  verifyButton: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,

    shadowColor: '#2563EB',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,
  },

  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  timerSection: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor:
      'rgba(100, 116, 139, 0.12)',
  },

  timerSectionTablet: {
    paddingTop: 18,
  },

  timerText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    marginRight: 12,
  },

  resendButton: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    marginLeft: 8,
  },

  helperText: {
    width: '100%',
    maxWidth: 520,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '400',
    marginTop: 2,
    paddingHorizontal: 8,
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});