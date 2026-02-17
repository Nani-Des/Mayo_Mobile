import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/stores/authStore';

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
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
  requestId?: string;
}

// Hospital Status enum
export enum HospitalStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

// Hospital type
export interface Hospital {
  id: string;
  hospitalId: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  status: HospitalStatus;
  integrationEnabled: boolean;
  supportedProtocols?: string[];
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

// API Error type
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Mock data for development (since hospital endpoints are ADMIN-only)
const MOCK_HOSPITALS: Hospital[] = [
  {
    id: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
    hospitalId: 'MAYO-001',
    name: 'Mayo Clinic Rochester',
    address: '200 First Street SW, Rochester, MN 55905',
    phone: '+1-507-284-2511',
    email: 'info@mayoclinic.org',
    website: 'https://www.mayoclinic.org',
    status: HospitalStatus.ACTIVE,
    integrationEnabled: true,
    supportedProtocols: ['HL7', 'FHIR', 'DICOM'],
    lastSyncAt: '2026-02-14T10:00:00Z',
    createdAt: '2025-01-15T08:30:00Z',
    updatedAt: '2026-02-14T10:00:00Z',
  },
  {
    id: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
    hospitalId: 'MAYO-002',
    name: 'Mayo Clinic Phoenix',
    address: '5777 E Mayo Blvd, Phoenix, AZ 85054',
    phone: '+1-480-515-6296',
    email: 'phoenix@mayoclinic.org',
    website: 'https://www.mayoclinic.org/phoenix',
    status: HospitalStatus.ACTIVE,
    integrationEnabled: true,
    supportedProtocols: ['HL7', 'FHIR'],
    lastSyncAt: '2026-02-13T15:30:00Z',
    createdAt: '2025-02-20T09:00:00Z',
    updatedAt: '2026-02-13T15:30:00Z',
  },
  {
    id: '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r',
    hospitalId: 'MAYO-003',
    name: 'Mayo Clinic Jacksonville',
    address: '4500 San Pablo Rd, Jacksonville, FL 32224',
    phone: '+1-904-953-2000',
    email: 'jax@mayoclinic.org',
    website: 'https://www.mayoclinic.org/jacksonville',
    status: HospitalStatus.ACTIVE,
    integrationEnabled: true,
    supportedProtocols: ['HL7', 'FHIR', 'DICOM'],
    lastSyncAt: '2026-02-14T08:00:00Z',
    createdAt: '2025-03-10T10:15:00Z',
    updatedAt: '2026-02-14T08:00:00Z',
  },
  {
    id: '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s',
    hospitalId: 'MAYO-004',
    name: 'Mayo Clinic Health System - Eau Claire',
    address: '1221 Whipple St, Eau Claire, WI 54703',
    phone: '+1-715-838-3311',
    email: 'eauclaire@mayoclinic.org',
    website: 'https://www.mayoclinichealthsystem.org',
    status: HospitalStatus.ACTIVE,
    integrationEnabled: false,
    supportedProtocols: ['HL7'],
    lastSyncAt: '2026-01-20T12:00:00Z',
    createdAt: '2025-04-05T11:30:00Z',
    updatedAt: '2026-01-20T12:00:00Z',
  },
  {
    id: '5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t',
    hospitalId: 'MAYO-005',
    name: 'St. Marys Hospital',
    address: '1216 2nd St SW, Rochester, MN 55902',
    phone: '+1-507-255-5123',
    email: 'stmarys@mayoclinic.org',
    website: 'https://www.mayoclinic.org/saint-marys',
    status: HospitalStatus.PENDING,
    integrationEnabled: false,
    supportedProtocols: [],
    createdAt: '2025-12-01T14:00:00Z',
    updatedAt: '2025-12-01T14:00:00Z',
  },
  {
    id: '6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u',
    hospitalId: 'EXTERNAL-001',
    name: 'Johns Hopkins Hospital',
    address: '1800 Orleans St, Baltimore, MD 21287',
    phone: '+1-410-955-5000',
    email: 'info@jhmi.edu',
    website: 'https://www.hopkinsmedicine.org',
    status: HospitalStatus.INACTIVE,
    integrationEnabled: false,
    supportedProtocols: [],
    createdAt: '2025-06-15T09:45:00Z',
    updatedAt: '2025-11-30T16:20:00Z',
  },
  {
    id: '7g8h9i0j-1k2l-3m4n-5o6p-7q8r9s0t1u2v',
    hospitalId: 'EXTERNAL-002',
    name: 'Cleveland Clinic',
    address: '9500 Euclid Ave, Cleveland, OH 44195',
    phone: '+1-216-444-2200',
    email: 'info@ccf.org',
    website: 'https://www.clevelandclinic.org',
    status: HospitalStatus.ACTIVE,
    integrationEnabled: true,
    supportedProtocols: ['HL7', 'FHIR'],
    lastSyncAt: '2026-02-10T09:00:00Z',
    createdAt: '2025-07-20T13:00:00Z',
    updatedAt: '2026-02-10T09:00:00Z',
  },
  {
    id: '8h9i0j1k-2l3m-4n5o-6p7q-8r9s0t1u2v3w',
    hospitalId: 'EXTERNAL-003',
    name: 'Massachusetts General Hospital',
    address: '55 Fruit St, Boston, MA 02114',
    phone: '+1-617-726-2000',
    email: 'info@mgh.harvard.edu',
    website: 'https://www.massgeneral.org',
    status: HospitalStatus.ACTIVE,
    integrationEnabled: true,
    supportedProtocols: ['HL7', 'FHIR', 'DICOM'],
    lastSyncAt: '2026-02-12T14:30:00Z',
    createdAt: '2025-08-10T10:00:00Z',
    updatedAt: '2026-02-12T14:30:00Z',
  },
];

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
 * Get all hospitals
 * GET /api/v1/hospitals
 * 
 * Note: This endpoint is ADMIN-only on the server.
 * For development, returns mock data.
 */
export async function getHospitals(): Promise<Hospital[]> {
  // Try to fetch from server first
  try {
    return await request<Hospital[]>('/hospitals', {
      method: 'GET',
    });
  } catch (error) {
    // If server fails (e.g., ADMIN-only restriction), return mock data for development
    console.log('Hospital endpoint not accessible, using mock data:', error);
    return MOCK_HOSPITALS;
  }
}

/**
 * Get hospital by ID
 * GET /api/v1/hospitals/{id}
 * 
 * Note: This endpoint is ADMIN-only on the server.
 * For development, returns mock data.
 */
export async function getHospitalById(id: string): Promise<Hospital | null> {
  // Try to fetch from server first
  try {
    return await request<Hospital>(`/hospitals/${id}`, {
      method: 'GET',
    });
  } catch (error) {
    // If server fails, return mock data for development
    console.log('Hospital endpoint not accessible, using mock data:', error);
    const hospital = MOCK_HOSPITALS.find(h => h.id === id);
    return hospital || null;
  }
}

/**
 * Get hospital by hospital ID string
 * GET /api/v1/hospitals/by-hospital-id/{hospitalId}
 * 
 * Note: This endpoint is ADMIN-only on the server.
 * For development, returns mock data.
 */
export async function getHospitalByHospitalId(hospitalId: string): Promise<Hospital | null> {
  // Try to fetch from server first
  try {
    return await request<Hospital>(`/hospitals/by-hospital-id/${hospitalId}`, {
      method: 'GET',
    });
  } catch (error) {
    // If server fails, return mock data for development
    console.log('Hospital endpoint not accessible, using mock data:', error);
    const hospital = MOCK_HOSPITALS.find(h => h.hospitalId === hospitalId);
    return hospital || null;
  }
}

/**
 * Get the hospital associated with this device
 * Uses hospitalId stored in authStore
 */
export async function getMyHospital(): Promise<Hospital | null> {
  const hospitalId = useAuthStore.getState().hospitalId;
  if (!hospitalId) {
    console.log('No hospitalId found in authStore. Device may not be registered.');
    return null;
  }
  
  return getHospitalByHospitalId(hospitalId);
}

// Export mock data for testing
export { MOCK_HOSPITALS };
