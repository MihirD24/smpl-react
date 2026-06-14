import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import AppIcon from './appIcon';

const CameraScreen = ({ onCapture, onClose }) => {
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('front');
  console.log('Camera device:', device);
  const { hasPermission } = useCameraPermission();

  if (!hasPermission) return null;

  const takePhoto = async () => {
    const photo = await cameraRef.current?.takePhoto({ flash: 'off' });
    if (photo?.path) {
      onCapture(`file://${photo.path}`);
    }
  };

  return (
    <>
      {device === undefined ? (
        // eslint-disable-next-line react-native/no-inline-styles
        <View style={ { justifyContent: 'center', alignItems: 'center' , marginTop:'auto', marginBottom:'auto'} }>
          <Text>Camera not available</Text>
        </View>
      ) : (
        <View style={styles.container}>
          <Camera
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            photo
          />

          <TouchableOpacity style={styles.capture} onPress={takePhoto}>
            <AppIcon name="Camera" size={40} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.close} onPress={onClose}>
            <AppIcon name="X" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  capture: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 50,
  },
  close: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
});
