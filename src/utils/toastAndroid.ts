import { Alert, Platform } from 'react-native';

function showAndroidToast(message: string, duration: 'SHORT' | 'LONG') {
  // Avoid touching ToastAndroid on iOS bundles (Release/TestFlight safety).
  if (Platform.OS !== 'android') return;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { ToastAndroid } = require('react-native') as {
    ToastAndroid?: { show?: (msg: string, len: number) => void; SHORT: number; LONG: number };
  };
  const toast = ToastAndroid;
  if (!toast?.show) return;
  toast.show(message, duration === 'SHORT' ? toast.SHORT : toast.LONG);
}

const ToastUtil = {
  success: (message: string) => {
    if (Platform.OS === 'android') {
      showAndroidToast(message, 'SHORT');
      return;
    }
    Alert.alert('Success', message);
  },

  error: (message: string) => {
    if (Platform.OS === 'android') {
      showAndroidToast(message, 'SHORT');
      return;
    }
    Alert.alert('Error', message);
  },

  info: (message: string) => {
    if (Platform.OS === 'android') {
      showAndroidToast(message, 'SHORT');
      return;
    }
    Alert.alert('Info', message);
  },

  long: (message: string) => {
    if (Platform.OS === 'android') {
      showAndroidToast(message, 'LONG');
      return;
    }
    Alert.alert('Info', message);
  },
};

export default ToastUtil;
