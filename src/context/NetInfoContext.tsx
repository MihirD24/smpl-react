import React, { createContext, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { showMessage } from 'react-native-flash-message';
import { StyleSheet } from 'react-native';
import ToastUtil from '../utils/toastAndroid';

export const NetInfoContext = createContext();

export const NetInfoProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [hasLostConnection, setHasLostConnection] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = !!state.isConnected;

      // When INTERNET GOES OFF
      if (!connected && isConnected) {
        setIsConnected(false);
        setHasLostConnection(true);

        ToastUtil.error('You are offline. Some features may not work.');
      }

      // When INTERNET RETURNS
      if (connected && !isConnected) {
        ToastUtil.success("You're back online! Press Retry to continue.");
      }
    });

    return () => unsubscribe();
  }, [isConnected]);

  const retryConnection = async () => {
    const state = await NetInfo.fetch();

    if (state.isConnected) {
      ToastUtil.success('Connection restored!');

      setIsConnected(true);
      setHasLostConnection(false);

      return true;
    } else {
      ToastUtil.error('Still offline. Try again.');
      return false;
    }
  };

  return (
    <NetInfoContext.Provider
      value={{ isConnected, hasLostConnection, retryConnection }}
    >
      {children}
    </NetInfoContext.Provider>
  );
};
