import { request, API_BASE_URL } from './common';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Application from 'expo-application';


export interface DeviceCheckResponse {
  isRegistered: boolean;
  hospitalId?: string;
  deviceId?: string;
  deviceType?: string;
  deviceName?: string;
  lastHeartbeat?: string;
  status?: string;
}

export interface DeviceRegisterRequest {
  hospitalId: string;
  userId: string;
}

/**
 * Check if the current device is registered using the public endpoint.
 * GET /api/devices/public/check/{deviceId}
 */
export async function checkDeviceRegistration(deviceId: string): Promise<DeviceCheckResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/devices/public/check/${deviceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      return { isRegistered: false };
    }

    if (!response.ok) {
      throw new Error(`Device check failed: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    if (error.status === 404) {
      return { isRegistered: false };
    }
    throw error;
  }
}

/**
 * Register a device (Admin only).
 * POST /api/v1/devices/register
 */
export async function registerDevice(hospitalId: string, userId: string): Promise<any> {
    // This might require more fields typically, but matching the minimal desktop call for now if applicable.
    // Actually desktop uses `apiClient.registerDevice(hospitalId, userId)` which calls `/devices/register` on `deviceStore`?
    // Let's assume standard structure.
    // For now, mobile might not BE registering devices, just checking.
    // But let's add the placeholder.
    return request('/devices/register', {
        method: 'POST',
        body: JSON.stringify({ hospitalId, userId })
    });
}

/**
 * Get or generate a persistent local device ID.
 */
export async function getLocalDeviceId(): Promise<string | null> {
  try {
    let deviceId = await AsyncStorage.getItem('device_id');
    if (!deviceId) {
      if (Platform.OS === 'android') {
        deviceId = Application.getAndroidId();
      } else {
        // Fallback or iOS logic
        deviceId = Math.random().toString(36).substring(2, 15);
      }
      
      if (!deviceId) {
        deviceId = Math.random().toString(36).substring(2, 15);
      }
      
      await AsyncStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error('Error getting local device ID:', error);
    return null;
  }
}

