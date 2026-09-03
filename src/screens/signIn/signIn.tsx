import React, { useContext, useState } from 'react';
import { View, Image, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import VersionCheck from 'react-native-version-check';
import { Eye, EyeOff } from 'lucide-react-native';
import { moderateScale, verticalScale, scale } from 'react-native-size-matters';

import { AuthContext } from '../../context/authContext';
import { AuthStackScreenProps } from '../../navigation/navigationTypes';
import ToastUtil from '../../utils/toastAndroid';

import AppScreen from '../../components/ui/AppScreen';
import AppCard from '../../components/ui/AppCard';
import AppInput from '../../components/ui/AppInput';
import AppButton from '../../components/ui/AppButton';
import { useAppTheme } from '../../constant/theme';

const SignIn: React.FC<AuthStackScreenProps<'signIn'>> = ({ navigation }) => {
  const { login } = useContext(AuthContext) as {
    login: (mobileNo: number, password: string) => Promise<{ userId: number }>;
    loginError: string;
  };
  const { colors } = useAppTheme();

  const [mobileNo, setMobileNo] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [secure, setSecure] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!mobileNo || !password) {
      ToastUtil.info('Please enter mobile number and password');
      return;
    }
    setLoading(true);
    try {
      const { userId } = await login(Number(mobileNo), password);
      setTimeout(() => {
        navigation.navigate('otp', { mobileNumber: mobileNo, userId });
      }, 300);
    } catch (error) {
      const msg = error instanceof Error && error.message ? error.message : 'Login Failed';
      ToastUtil.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen keyboardAvoiding padding={false}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrapper}>
          {/* Logo */}
          <View style={[styles.logoContainer, { backgroundColor: colors.surface }]}>
            <Image
              source={require('../../assets/images/login_logo.jpeg')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>Shantinath Motors Pvt Ltd</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Workforce App</Text>

          {/* Login Card */}
          <AppCard style={styles.card}>
            <AppInput
              label="Mobile Number"
              placeholder="Enter mobile number"
              keyboardType="numeric"
              maxLength={10}
              value={mobileNo}
              onChangeText={setMobileNo}
              containerStyle={styles.inputSpacing}
            />

            <AppInput
              label="Password"
              placeholder="••••••••"
              secureTextEntry={secure}
              value={password}
              onChangeText={setPassword}
              rightIcon={
                secure ? <Eye size={20} color={colors.textMuted} /> : <EyeOff size={20} color={colors.textMuted} />
              }
              onRightIconPress={() => setSecure(!secure)}
              containerStyle={styles.inputSpacing}
            />

            <AppButton
              label="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.signInButton}
            />
          </AppCard>

          <Text style={[styles.version, { color: colors.textMuted }]}>
            VERSION {VersionCheck.getCurrentVersion()} • ENTERPRISE EDITION
          </Text>
        </View>
      </ScrollView>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  wrapper: {
    alignItems: 'center',
    paddingVertical: verticalScale(30),
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: moderateScale(96),
    height: moderateScale(96),
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(20),
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  logo: {
    width: moderateScale(76),
    height: moderateScale(76),
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: scale(13),
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: verticalScale(28),
  },
  card: {
    width: '100%',
    padding: 24,
  },
  inputSpacing: {
    marginBottom: 20,
  },
  signInButton: {
    marginTop: 8,
  },
  version: {
    marginTop: verticalScale(30),
    fontSize: scale(10),
    letterSpacing: 1.5,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

export default SignIn;
