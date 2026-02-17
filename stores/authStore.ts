import { create } from 'zustand';
import * as authApi from '../lib/api/auth';
import * as deviceApi from '../lib/api/device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Application from 'expo-application';

// Helper removed as it's now in deviceApi.getLocalDeviceId()

interface User {
  id: string;
  email: string;
  username?: string;
  fullName?: string;
  type?: string;
  role?: string;
  permissions?: string[];
  phoneNumber?: string;
  hospitalId?: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  isDeviceRegistered: boolean;
  deviceCheckStatus: 'idle' | 'checking' | 'registered' | 'unregistered' | 'error';
  isLoading: boolean;
  error: string | null;
  hospitalId: string | null;

  // Actions
  login: (credentials: authApi.LoginRequest) => Promise<{ success: boolean; error?: string; redirect?: string }>;
  logout: () => Promise<void>;
  checkDeviceRegistration: () => Promise<deviceApi.DeviceCheckResponse>;
  initialize: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  changePassword: (data: authApi.ChangePasswordRequest) => Promise<{ success: boolean; error?: string }>;

  // Role checking helpers
  isSuperAdmin: () => boolean;
  isHospitalAdmin: () => boolean;
  isStaff: () => boolean;
  isDoctor: () => boolean;
  getHospitalId: () => string | null;
  getPermissions: () => string[];
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  token: null,
  isDeviceRegistered: false,
  deviceCheckStatus: 'idle',
  isLoading: true,
  error: null,
  hospitalId: null,

  // Role checking helpers
  isSuperAdmin: (): boolean => {
    const { user } = get();
    if (!user) return false;
    const role = (user.role || user.type || '').toUpperCase();
    return role === 'SUPER_ADMIN' || role === 'SUPER-ADMIN' || role === 'SUPERADMIN';
  },

  isHospitalAdmin: (): boolean => {
    const { user } = get();
    if (!user) return false;
    const role = (user.role || user.type || '').toUpperCase();
    return role === 'HOSPITAL_ADMIN' || role === 'ADMIN' || role === 'HOSPITAL-ADMIN' || user.type === 'HOSPITAL_ADMIN';
  },

  isStaff: (): boolean => {
    const { user } = get();
    if (!user) return false;
    const role = (user.role || user.type || '').toUpperCase();
    return role === 'DOCTOR' || role === 'NURSE' || role === 'STAFF' || user.type === 'DOCTOR' || user.type === 'NURSE' || user.type === 'STAFF';
  },

  isDoctor: (): boolean => {
    const { user } = get();
    if (!user) return false;
    const role = (user.role || user.type || '').toUpperCase();
    return role === 'DOCTOR' || user.type === 'DOCTOR';
  },

  getHospitalId: (): string | null => {
    const { user } = get();
    return user?.hospitalId || null;
  },

  getPermissions: (): string[] => {
    const { user } = get();
    return user?.permissions || [];
  },

  initialize: async () => {
    try {
      const token = await authApi.getStoredAccessToken();
      if (token) {
        // TODO: Validate token or decode it
        // For now, assume valid if present and try to fetch profile or similar if needed.
        // Or simply set auth true.
        // We really should decode the token to get the user.
        // React Native doesn't have `atob` by default always, need polyfill or library.
        // For now, we might just set isAuthenticated: true.
        set({ isAuthenticated: true, token });
        
        // Mobile app doesn't require device registration - skip device check
        set({ isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      console.error('Auth Init Error', e);
      set({ isAuthenticated: false, token: null, isLoading: false });
    }
  },

  checkDeviceRegistration: async () => {
    try {
      const storedLocalId = await deviceApi.getLocalDeviceId();
      if (!storedLocalId) return { isRegistered: false, hospitalId: undefined };

      const response = await deviceApi.checkDeviceRegistration(storedLocalId);
      
      set({ 
        isDeviceRegistered: response.isRegistered,
        deviceCheckStatus: response.isRegistered ? 'registered' : 'unregistered',
        hospitalId: response.hospitalId || undefined
      });

      return { isRegistered: response.isRegistered, hospitalId: response.hospitalId };
    } catch (error) {
      console.error('Device Check Error:', error);
      set({ deviceCheckStatus: 'error' });
      return { isRegistered: false, hospitalId: undefined };
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Authenticate
      const response = await authApi.login(credentials);
      const { accessToken, refreshToken } = response;

      // Attempt manual decode of payload
      let user: User | null = null;
      try {
        const payload = accessToken.split('.')[1];
        // base64 decode
        const decodedJson = JSON.parse(atob(payload)); // might need global.atob = ...
        user = {
            id: decodedJson.userId,
            email: decodedJson.email,
            username: decodedJson.username,
            fullName: decodedJson.fullName || decodedJson.name,
            type: decodedJson.userType || decodedJson.type,
            role: decodedJson.role || decodedJson.userType || decodedJson.type,
            permissions: decodedJson.permissions || [],
            hospitalId: decodedJson.hospitalId || undefined
        };
      } catch (e) {
         // Fallback if atob not available or structure differs
         user = { id: 'unknown', email: credentials.usernameOrEmail };
      }

      if (!user) {
        throw new Error('Failed to decode user from token');
      }

      // Mobile app is for PATIENTS - no device registration required
      // Simply authenticate and allow access
      set({
        isAuthenticated: true,
        user,
        token: accessToken,
        isLoading: false,
        isDeviceRegistered: false, // Not applicable for mobile/patient app
        deviceCheckStatus: 'not-required',
        hospitalId: user.hospitalId
      });
      return { success: true, redirect: '/' };


    } catch (error: any) {
      console.error('Login Error', error);
      set({ 
          isLoading: false, 
          error: error.message || 'Login Failed' 
      });
      return { success: false, error: error.message || 'Login Failed' };
    }
  },

  logout: async () => {
    await authApi.logout();
    set({ 
        isAuthenticated: false, 
        user: null, 
        token: null, 
        isDeviceRegistered: false,
        deviceCheckStatus: 'idle' 
    });
  },

  updateProfile: async (data: Partial<User>) => {
    const { user } = get();
    if (!user || !user.id) return { success: false, error: "User not found" };

    set({ isLoading: true });
    try {
        await authApi.updateProfile(user.id, data);
        set({
            user: { ...user, ...data }, 
            isLoading: false
        });
        return { success: true };
    } catch (error: any) {
        set({ isLoading: false, error: error.message });
        return { success: false, error: error.message };
    }
  },

  changePassword: async (data: authApi.ChangePasswordRequest) => {
      const { user } = get();
      if (!user || !user.id) return { success: false, error: "User not found" };

      set({ isLoading: true });
      try {
          await authApi.changePasswordRequest(user.id, data);
          set({ isLoading: false });
          return { success: true };
      } catch (error: any) {
          set({ isLoading: false, error: error.message });
          return { success: false, error: error.message };
      }
  }
}));

// Polyfill atob if needed for JWT decoding
if (typeof global.atob === 'undefined') {
    global.atob = (input: string) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        let str = input.replace(/=+$/, '');
        let output = '';
        if (str.length % 4 === 1) {
            throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
        }
        for (let bc = 0, bs = 0, buffer, i = 0;
            buffer = str.charAt(i++);
            ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
                bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
        ) {
            buffer = chars.indexOf(buffer);
        }
        return output;
    };
}
