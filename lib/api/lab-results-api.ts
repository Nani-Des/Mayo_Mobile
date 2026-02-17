                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDb } from '@/model';

// API Base URL - Gateway on port 8443 with /api/v1 prefix
const getApiBaseUrl = () => {
  // Check for environment variable first
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;
  
  // Platform detection
  if (__DEV__) {
    // Use 10.0.2.2 for Android Emulator, localhost for others
    return 'http://10.0.2.2:8443/api/v1';
  }
  return 'http://localhost:8443/api/v1';
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

// Types for Lab Results API

export interface LabResult {
  id: string;
  patientRecordId: string;
  testName: string;
  performedAt: string; // ISO date string
  result: string;
  unit?: string;
  referenceRange?: string;
  status: 'pending' | 'completed' | 'abnormal' | 'critical';
  notes?: string;
  orderingProvider?: string; // Was orderedBy
  performingLab?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLabResultRequest {
  patientRecordId: string;
  testName: string;
  testDate: string;
  result: string;
  unit?: string;
  referenceRange?: string;
  status?: 'pending' | 'completed' | 'abnormal' | 'critical';
  notes?: string;
  orderedBy?: string;
  performedBy?: string;
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
 * Get all lab results for a patient record
 * GET /api/patient-records/lab-results/patient-record/{patientRecordId}
 */
export async function getLabResults(patientRecordId: string): Promise<LabResult[]> {
  return request<LabResult[]>(`/patient-records/lab-results/patient-record/${patientRecordId}`, {
    method: 'GET',
  });
}

/**
 * Create a new lab result
 * POST /api/patient-records/lab-results
 */
export async function createLabResult(labResultData: CreateLabResultRequest): Promise<LabResult> {
  return request<LabResult>('/patient-records/lab-results', {
    method: 'POST',
    body: JSON.stringify(labResultData),
  });
}
export async function getLabResultsByPatient(patientId: string): Promise<LabResult[]> {
  try {
    return await request<LabResult[]>(`/patient-records/lab-results/patient/${patientId}`, {
      method: 'GET',
    });
  } catch (error) {
    console.log('Lab results endpoint not accessible, checking local SQLite:', error);
    try {
      const db = getDb();
      const localLabs = await db.getAllAsync<any>('SELECT * FROM lab_results WHERE patient_id = ?', [patientId]);
      
      return localLabs.map(l => ({
        id: l.id,
        patientRecordId: l.patient_id,
        testName: l.test_name,
        performedAt: new Date(l.performed_at || l.created_at).toISOString(),
        result: l.value,
        unit: l.unit,
        status: l.status || 'completed',
        createdAt: new Date(l.created_at).toISOString(),
        updatedAt: new Date(l.updated_at).toISOString(),
      } as LabResult));
    } catch (e) {
      console.error('Failed to fetch from local SQLite:', e);
      return [];
    }
  }
}
