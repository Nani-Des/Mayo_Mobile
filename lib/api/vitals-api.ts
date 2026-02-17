import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - Gateway on port 8443 with /api/v1 prefix
const getApiBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;
  if (__DEV__) {
    return 'http://10.0.2.2:8443/api/v1';
  }
  return 'http://localhost:8443/api/v1';
};

const API_BASE_URL = getApiBaseUrl();
const ACCESS_TOKEN_KEY = 'mayo_access_token';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface VitalSign {
  id: string;
  patientRecordId: string;
  type: 'BLOOD_PRESSURE' | 'HEART_RATE' | 'TEMPERATURE' | 'RESPIRATORY_RATE' | 'OXYGEN_SATURATION' | 'WEIGHT' | 'HEIGHT' | 'BMI';
  value: number;
  unit: string;
  measuredAt: string;
  status: 'NORMAL' | 'ABNORMAL' | 'CRITICAL';
  notes?: string;
}

async function getStoredAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = await getStoredAccessToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  const apiResponse: ApiResponse<T> = await response.json();
  
  if (!response.ok || !apiResponse.success) {
    throw new Error(apiResponse.message || `HTTP Error: ${response.status}`);
  }
  
  return apiResponse.data;
}

export async function getVitalSignsByPatient(patientId: string): Promise<VitalSign[]> {
  return request<VitalSign[]>(`/patient-records/vital-signs/patient/${patientId}`, {
    method: 'GET',
  });
}
