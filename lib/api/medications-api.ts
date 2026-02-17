import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDb } from '@/model';

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

// Types for Medications API

export interface Medication {
  id: string;
  patientRecordId: string;
  medicationName: string; // Was name
  dosage: string;
  frequency: string;
  prescribedAt: string; // Was startDate
  startedAt?: string;
  endedAt?: string; // Was endDate
  prescribingProvider?: string; // Was prescribedBy
  pharmacy?: string;
  status: 'active' | 'discontinued' | 'completed' | 'on-hold';
  instructions?: string;
  sideEffects?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicationRequest {
  patientRecordId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy?: string;
  pharmacy?: string;
  status?: 'active' | 'discontinued' | 'completed' | 'on-hold';
  instructions?: string;
  sideEffects?: string;
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
 * Get all medications for a patient record
 * GET /api/patient-records/medications/patient-record/{patientRecordId}
 */
export async function getMedications(patientRecordId: string): Promise<Medication[]> {
  return request<Medication[]>(`/medications/patient-record/${patientRecordId}`, {
    method: 'GET',
  });
}

/**
 * Get active medications for a patient record
 * GET /api/patient-records/medications/active/patient-record/{patientRecordId}
 */
export async function getActiveMedications(patientRecordId: string): Promise<Medication[]> {
  return request<Medication[]>(`/medications/active/patient-record/${patientRecordId}`, {
    method: 'GET',
  });
}

/**
 * Create a new medication
 * POST /api/patient-records/medications
 */
export async function createMedication(medicationData: CreateMedicationRequest): Promise<Medication> {
  return request<Medication>('/medications', {
    method: 'POST',
    body: JSON.stringify(medicationData),
  });
}
export async function getMedicationsByPatient(patientId: string): Promise<Medication[]> {
  try {
    return await request<Medication[]>(`/medications/patient/${patientId}`, {
      method: 'GET',
    });
  } catch (error) {
    console.log('Medications endpoint not accessible, checking local SQLite:', error);
    try {
      const db = getDb();
      const localMeds = await db.getAllAsync<any>('SELECT * FROM medications WHERE patient_id = ?', [patientId]);
      
      return localMeds.map(m => ({
        id: m.id,
        patientRecordId: m.patient_id,
        medicationName: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        prescribedAt: new Date(m.prescribed_at || m.created_at).toISOString(),
        status: m.status || 'active',
        createdAt: new Date(m.created_at).toISOString(),
        updatedAt: new Date(m.updated_at).toISOString(),
      } as Medication));
    } catch (e) {
      console.error('Failed to fetch from local SQLite:', e);
      return [];
    }
  }
}
