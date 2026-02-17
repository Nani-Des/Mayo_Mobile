import { PermissionsAndroid, Platform } from 'react-native';

/**
 * ensureBLEPermissions
 * Requests runtime permissions needed for BLE scanning/connection on Android.
 * On iOS the function currently resolves true (ensure you add the proper
 * Info.plist entries: NSBluetoothAlwaysUsageDescription / NSBluetoothPeripheralUsageDescription).
 */
export async function ensureBLEPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      // Android 12+ has separate BLUETOOTH_* permissions; request location as a fallback
      const permissions = [] as string[];
      // runtime check is simplified; callers should adapt for Android SDK specifics
      permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION as string);

      const granted = await PermissionsAndroid.requestMultiple(permissions);

      const ok = Object.values(granted).every(v => v === PermissionsAndroid.RESULTS.GRANTED);
      return ok;
    } catch (e) {
      console.warn('BLE permission request failed', e);
      return false;
    }
  }

  // iOS: assume permissions are declared in Info.plist and will be prompted by the system
  return true;
}

export default ensureBLEPermissions;
