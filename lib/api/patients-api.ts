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

// Types for Patients API

export interface Patient {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date string
  gender: string;
  bloodType?: string;
  email?: string;
  phone?: string;
  address?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  medicalNotes?: string;
  familyMemberId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientRequest {
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodType?: string;
  email?: string;
  phone?: string;
  address?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  medicalNotes?: string;
  profileImageUrl?: string;
}

export interface UpdatePatientRequest {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  email?: string;
  phone?: string;
  address?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  medicalNotes?: string;
  profileImageUrl?: string;
}

// Patient Record type (for getPatientRecords)
export interface PatientRecord {
  id: string;
  patientId: string;
  recordType: string;
  recordDate: string;
  description?: string;
  data?: Record<string, any>;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
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

// Local database fallback for patients
async function getPatientsFromLocal(): Promise<Patient[]> {
  try {
    console.log('[getPatientsFromLocal] Fetching from local database...');
    const db = getDb();
    const patients = await db.getAllAsync('SELECT * FROM patients');
    console.log('[getPatientsFromLocal] Found patients:', patients.length);
    
    return patients.map((row: any) => ({
      id: row.id,
      userId: row.user_id || 'local-user',
      firstName: row.first_name,
      lastName: row.last_name,
      dateOfBirth: row.date_of_birth ? new Date(row.date_of_birth).toISOString() : '',
      gender: row.gender || '',
      bloodType: row.blood_type,
      email: row.email,
      phone: row.contact_info,
      address: row.address,
      emergencyContact: row.emergency_contact ? JSON.parse(row.emergency_contact) : undefined,
      medicalNotes: row.medical_notes,
      familyMemberId: row.family_member_id,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : '',
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : '',
    }));
  } catch (error) {
    console.error('[getPatientsFromLocal] Database error:', error);
    return [];
  }
}

/**
 * Get all patients
 * GET /api/patients
 */
export async function getPatients(): Promise<Patient[]> {
  console.log('[getPatients] Fetching patients from API...');
  try {
    const token = await getStoredAccessToken();
    console.log('[getPatients] Token available:', !!token);
    
    const result = await request<Patient[]>('/patients', {
      method: 'GET',
    });
    console.log('[getPatients] API result:', result);
    
    // If API returns empty array, fall back to local database
    if (!result || result.length === 0) {
      console.log('[getPatients] API returned empty, falling back to local database...');
      return getPatientsFromLocal();
    }
    
    return result;
  } catch (error) {
    console.error('[getPatients] API failed, falling back to local database:', error);
    // Fallback to local database
    return getPatientsFromLocal();
  }
}

/**
 * Get patient by ID
 * GET /api/patients/{id}
 */
export async function getPatientById(id: string): Promise<Patient> {
  return request<Patient>(`/patients/${id}`, {
    method: 'GET',
  });
}

/**
 * Create a new patient
 * POST /api/patients
 */
export async function createPatient(patientData: CreatePatientRequest): Promise<Patient> {
  return request<Patient>('/patients', {
    method: 'POST',
    body: JSON.stringify(patientData),
  });
}

/**
 * Update patient
 * PUT /api/patients/{id}
 */
export async function updatePatient(id: string, patientData: UpdatePatientRequest): Promise<Patient> {
  return request<Patient>(`/patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patientData),
  });
}

/**
 * Delete patient
 * DELETE /api/patients/{id}
 */
export async function deletePatient(id: string): Promise<void> {
  return request<void>(`/patients/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Get all records for a patient
 * GET /api/patient-records/patient/{patientId}
 */
export async function getPatientRecords(patientId: string): Promise<PatientRecord[]> {
  return request<PatientRecord[]>(`/patient-records/patient/${patientId}`, {
    method: 'GET',
  });
}

/**
 * Get patients by user ID
 * GET /api/patients/user/{userId}
 */
export async function getPatientsByUserId(userId: string): Promise<Patient[]> {
  return request<Patient[]>(`/patients/user/${userId}`, {
    method: 'GET',
  });
}

/**
 * Get patient by family member ID
 * GET /api/patients/family-member/{familyMemberId}
 */
export async function getPatientByFamilyMemberId(familyMemberId: string): Promise<Patient> {
  return request<Patient>(`/patients/family-member/${familyMemberId}`, {
    method: 'GET',
  });
}
