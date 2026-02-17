import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - Patient Record Service on port 8445
const getApiBaseUrl = () => {
  // Check for environment variable first
  const envUrl = process.env.EXPO_PUBLIC_PATIENT_RECORD_API_URL;
  if (envUrl) return `${envUrl}/patient-records`;
  
  // Platform detection
  if (__DEV__) {
    // Use 10.0.2.2 for Android Emulator, localhost for others
    return 'http://10.0.2.2:8445/api/patient-records';
  }
  return 'http://localhost:8445/api/patient-records';
};

const API_BASE_URL = getApiBaseUrl();

// Token storage keys (same as auth.ts)
const ACCESS_TOKEN_KEY = 'mayo_access_token';

// API Response wrapper (matches server's ApiResponse)
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
  requestId?: string;
}

// Types for Allergies API

export interface Allergy {
  id: string;
  patientRecordId: string;
  allergen: string;
  reactionDescription: string; // Was reaction
  reactionSeverity: 'mild' | 'moderate' | 'severe' | 'life-threatening'; // Was severity
  onsetDate?: string;
  reportedDate?: string;
  status: 'active' | 'inactive' | 'resolved';
  verifiedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAllergyRequest {
  patientRecordId: string;
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  onsetDate?: string;
  status?: 'active' | 'inactive' | 'resolved';
  verifiedBy?: string;
  notes?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Get stored access token
async function getStoredAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

// API Client - similar to family-api.ts but for patient-record-service
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get auth token for headers
  const token = await getStoredAccessToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Parse response as ApiResponse
    const text = await response.text();
    const apiResponse: ApiResponse<T> = text ? JSON.parse(text) : { success: false, data: null as any };
    
    if (!response.ok || !apiResponse.success) {
      throw {
        message: apiResponse.message || `HTTP Error: ${response.status}`,
        status: response.status,
        code: (apiResponse as any).code,
      } as ApiError;
    }
    
    // Return the data field (unwrapped from ApiResponse)
    return apiResponse.data;
  } catch (error) {
    if ((error as ApiError).message) {
      throw error;
    }
    throw {
      message: error instanceof Error ? error.message : 'Network error',
      status: 0,
      code: 'NETWORK_ERROR',
    } as ApiError;
  }
}

/**
 * Get all allergies for a patient record
 * GET /api/patient-records/allergies/patient-record/{patientRecordId}
 */
export async function getAllergies(patientRecordId: string): Promise<Allergy[]> {
  return request<Allergy[]>(`/allergies/patient-record/${patientRecordId}`, {
    method: 'GET',
  });
}

/**
 * Get active allergies for a patient record
 * GET /api/patient-records/allergies/active/patient-record/{patientRecordId}
 */
export async function getActiveAllergies(patientRecordId: string): Promise<Allergy[]> {
  return request<Allergy[]>(`/allergies/active/patient-record/${patientRecordId}`, {
    method: 'GET',
  });
}

/**
 * Create a new allergy
 * POST /api/patient-records/allergies
 */
export async function createAllergy(allergyData: CreateAllergyRequest): Promise<Allergy> {
  return request<Allergy>('/allergies', {
    method: 'POST',
    body: JSON.stringify(allergyData),
  });
}
export async function getAllergiesByPatient(patientId: string): Promise<Allergy[]> {
  return request<Allergy[]>(`/allergies/patient/${patientId}`, {
    method: 'GET',
  });
}
