import { Platform } from 'react-native';
import SpInAppUpdates, {
  IAUAvailabilityStatus,
  IAUUpdateKind,
  StartUpdateOptions,
} from 'sp-react-native-in-app-updates';
import DeviceInfo from 'react-native-device-info';

let inAppUpdates: SpInAppUpdates | null = null;
if (Platform.OS === 'android') {
  inAppUpdates = new SpInAppUpdates(__DEV__);
}

/**
 * Checks Google Play Store for an app update.
 * If an update is available or an update was in progress,
 * it starts Google Play's IMMEDIATE update flow (Force Update).
 */
export const checkForInAppUpdate = async (): Promise<void> => {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    if (!inAppUpdates) return;

    const curVersionCode = DeviceInfo.getBuildNumber();

    const result = await inAppUpdates.checkNeedsUpdate({
      curVersion: curVersionCode,
      toSemverConverter: ver => `${ver}`,
      customVersionComparator: (storeVer, localVer) => {
        const storeCode = parseInt(storeVer, 10);
        const localCode = parseInt(localVer, 10);
        if (!isNaN(storeCode) && !isNaN(localCode)) {
          return storeCode > localCode ? 1 : 0;
        }
        return 0;
      },
    });

    const isUpdateAvailable =
      result?.shouldUpdate ||
      (result as any)?.other?.updateAvailability ===
        IAUAvailabilityStatus.DEVELOPER_TRIGGERED;

    if (isUpdateAvailable) {
      const updateOptions: StartUpdateOptions = {
        updateType: IAUUpdateKind.IMMEDIATE,
      };

      await inAppUpdates.startUpdate(updateOptions);
    }
  } catch (error) {
    if (__DEV__) {
      console.log('In-App Update error:', error);
    }
  }
};
