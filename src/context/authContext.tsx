import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../constant/apiEndpoint';
import {
  apiPost,
  clearAuthToken,
  saveAuthToken,
} from '../services/api/apiService';

interface AuthContextType {
  login: (mobileNo: number, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  userToken: string | null;
  userInfo: UserInfo | null;
  setUserToken: React.Dispatch<React.SetStateAction<string | null>>;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo | null>>;
  loginError: string;
  tempMobileNumber: string | null;
  setTempMobileNumber: React.Dispatch<React.SetStateAction<string | null>>;
}

export const AuthContext = createContext<AuthContextType | null>(null);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loginError, setLoginError] = useState<string>('');
  const [tempMobileNumber, setTempMobileNumber] = useState<string | null>(null);

  const login = async (mobileNo: number, password: string): Promise<void> => {
    setIsLoading(true);
    setLoginError('');
    try {
      const fcmToken = (await AsyncStorage.getItem('fcmToken')) ?? '';
      const formData = new FormData();
      formData.append('mobile_no', mobileNo);
      formData.append('password', password);
      formData.append('fcmToken', fcmToken);
      // Call the generalized API post function
      const response = await apiPost(
        API_ENDPOINTS.AUTH.AUTHENTICATE_USER,
        formData,
      );

      if (response.success) {
        // Store temporary mobile number for OTP screen
        setTempMobileNumber(String(mobileNo));
        // DO NOT set userToken yet - wait for OTP verification
      } else {
        const msg = response.message || 'Login failed';
        setLoginError(msg);
        throw new Error(msg);
      }
    } catch (error) {
      // Preserve a meaningful error for UI, while still allowing callers to catch.
      const msg =
        error instanceof Error && error.message
          ? error.message
          : 'Login failed';
      setLoginError(msg);
      console.error('Login Error:', error);
      throw error instanceof Error ? error : new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    setLoginError('');

    try {
      const response = await apiPost('logout-user');

      // Even if API fails → force logout locally (important)

      setUserToken(null);
      setUserInfo(null);

      await clearAuthToken();
      await AsyncStorage.removeItem('userInfo');
    } catch (error) {
      console.error('Logout error:', error);

      // 🔥 STILL LOGOUT LOCALLY (very important)
      setUserToken(null);
      setUserInfo(null);

      await clearAuthToken();
      await AsyncStorage.removeItem('userInfo');
    } finally {
      setIsLoading(false);
    }
  };

  const isLoggedIn = async (): Promise<void> => {
    try {
      setIsLoading(true);

      const token = await AsyncStorage.getItem('authToken');
      const userInfoString = await AsyncStorage.getItem('userInfo');

      if (token && userInfoString) {
        setUserToken(token);
        setUserInfo(JSON.parse(userInfoString));
      } else {
        setUserToken(null);
        setUserInfo(null);
      }
    } catch (e) {
      console.log('isLoggedIn error', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        isLoading,
        userToken,
        loginError,
        userInfo,
        setUserToken,
        setUserInfo,
        tempMobileNumber,
        setTempMobileNumber,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
