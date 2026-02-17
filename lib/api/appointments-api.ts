import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Appointment Status Enum
export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

// Appointment Type Enum
export enum AppointmentType {
  CHECKUP = 'CHECKUP',
  FOLLOW_UP = 'FOLLOW_UP',
  CONSULTATION = 'CONSULTATION',
  PROCEDURE = 'PROCEDURE',
  EMERGENCY = 'EMERGENCY',
}

// Types for Appointments API

export interface Appointment {
  id: string;
  patientId: string;
  familyMemberId?: string;
  providerId?: string;
  hospitalId?: string;
  appointmentDate: string; // ISO date string
  appointmentTime: string; // ISO time string
  duration: number; // in minutes
  status: AppointmentStatus;
  type: AppointmentType;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentRequest {
  patientId: string;
  familyMemberId?: string;
  providerId?: string;
  hospitalId?: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  type: AppointmentType;
  notes?: string;
  createdBy?: string;
}

export interface UpdateAppointmentRequest {
  patientId?: string;
  familyMemberId?: string;
  providerId?: string;
  hospitalId?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  duration?: number;
  type?: AppointmentType;
  notes?: string;
}

export interface UpdateAppointmentStatusRequest {
  status: AppointmentStatus;
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

// API Client - similar to other API files
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
 * Get all appointments
 * GET /api/appointments
 */
export async function getAppointments(): Promise<Appointment[]> {
  return request<Appointment[]>('/appointments', {
    method: 'GET',
  });
}

/**
 * Get appointment by ID
 * GET /api/appointments/{id}
 */
export async function getAppointmentById(id: string): Promise<Appointment> {
  return request<Appointment>(`/appointments/${id}`, {
    method: 'GET',
  });
}

/**
 * Get appointments for a patient
 * GET /api/appointments/patient/{patientId}
 */
export async function getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
  return request<Appointment[]>(`/appointments/patient/${patientId}`, {
    method: 'GET',
  });
}

/**
 * Get appointments for a family member
 * GET /api/appointments/family-member/{familyMemberId}
 */
export async function getAppointmentsByFamilyMember(familyMemberId: string): Promise<Appointment[]> {
  return request<Appointment[]>(`/appointments/family-member/${familyMemberId}`, {
    method: 'GET',
  });
}

/**
 * Create a new appointment
 * POST /api/appointments
 */
export async function createAppointment(appointmentData: CreateAppointmentRequest): Promise<Appointment> {
  return request<Appointment>('/appointments', {
    method: 'POST',
    body: JSON.stringify(appointmentData),
  });
}

/**
 * Update an appointment
 * PUT /api/appointments/{id}
 */
export async function updateAppointment(id: string, appointmentData: UpdateAppointmentRequest): Promise<Appointment> {
  return request<Appointment>(`/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(appointmentData),
  });
}

/**
 * Update appointment status
 * PATCH /api/appointments/{id}/status
 */
export async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
  return request<Appointment>(`/appointments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

/**
 * Delete an appointment
 * DELETE /api/appointments/{id}
 */
export async function deleteAppointment(id: string): Promise<void> {
  return request<void>(`/appointments/${id}`, {
    method: 'DELETE',
  });
}
