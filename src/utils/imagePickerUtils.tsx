import * as ImagePicker from 'react-native-image-picker';

import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import { requestCameraPermission } from './permissionUtils';

export const launchCamera = async () => {
  const device = useCameraDevice('back');
  const { hasPermission } = useCameraPermission();

  if (!hasPermission) return requestCameraPermission(); ;
  if (device == null) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Camera style={StyleSheet.absoluteFill} device={device} isActive={true} />
    </View>
  );
};

// export const launchCamera = async (options: ImagePicker.CameraOptions) => {
//   return new Promise((resolve, reject) => {
//     ImagePicker.launchCamera(options, response => {
//       if (response.didCancel) {
//         resolve({didCancel: true});
//       } else if (response.errorCode) {
//         reject(new Error(response.errorMessage));
//       } else {
//         resolve(response);
//       }
//     });
//   });
// };

export const launchGallery = async (
  options: ImagePicker.ImageLibraryOptions,
) => {
  return new Promise((resolve, reject) => {
    ImagePicker.launchImageLibrary(options, response => {
      if (response.didCancel) {
        resolve({ didCancel: true });
      } else if (response.errorCode) {
        reject(new Error(response.errorMessage));
      } else {
        resolve(response);
      }
    });
  });
};
