import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - Family API via auth-service on port 8451
const getApiBaseUrl = () => {
  // Check for environment variable first
  const envUrl = process.env.EXPO_PUBLIC_FAMILY_API_URL;
  if (envUrl) return envUrl;
  
  // Platform detection
  if (__DEV__) {
    // Use 10.0.2.2 for Android Emulator, localhost for others
    return 'http://10.0.2.2:8451/api/v1';
  }
  return 'http://localhost:8451/api/v1';
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

// Types for Family API

export interface FamilyMember {
  id: string;
  familyId: string;
  userId: string;
  firstName: string;
  lastName: string;
  relationship: string;
  dateOfBirth: string; // ISO date string
  email?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Family {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  members: FamilyMember[];
  createdAt: string;
  updatedAt: string;
}

export interface AddFamilyMemberRequest {
  firstName: string;
  lastName: string;
  relationship: string;
  dateOfBirth: string;
  email?: string;
  phoneNumber?: string;
  role?: 'HEAD' | 'MEMBER';
}

export interface UpdateFamilyMemberRequest {
  firstName?: string;
  lastName?: string;
  relationship?: string;
  dateOfBirth?: string;
  email?: string;
  phoneNumber?: string;
}

export interface CreateFamilyRequest {
  name: string;
}

export interface UpdateFamilyRequest {
  name?: string;
  memberIds?: string[];
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

// API Client - similar to auth.ts but with Authorization header
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
 * Get user's families
 * GET /api/v1/families/my-families
 */
export async function getMyFamilies(): Promise<Family[]> {
  return request<Family[]>('/families/my-families', {
    method: 'GET',
  });
}

/**
 * Get family by ID
 * GET /api/v1/families/{familyId}
 */
export async function getFamilyById(familyId: string): Promise<Family> {
  return request<Family>(`/families/${familyId}`, {
    method: 'GET',
  });
}

/**
 * Get family members
 * GET /api/v1/families/{familyId}/members
 */
export async function getFamilyMembers(familyId: string): Promise<FamilyMember[]> {
  return request<FamilyMember[]>(`/families/${familyId}/members`, {
    method: 'GET',
  });
}

/**
 * Add family member
 * POST /api/v1/families/{familyId}/members
 */
export async function addFamilyMember(
  familyId: string,
  memberData: AddFamilyMemberRequest
): Promise<FamilyMember> {
  return request<FamilyMember>(`/families/${familyId}/members`, {
    method: 'POST',
    body: JSON.stringify(memberData),
  });
}

/**
 * Remove family member
 * DELETE /api/v1/families/{familyId}/members/{memberId}
 */
export async function removeFamilyMember(
  familyId: string,
  memberId: string
): Promise<void> {
  return request<void>(`/families/${familyId}/members/${memberId}`, {
    method: 'DELETE',
  });
}

/**
 * Update family member
 * PUT /api/v1/families/{familyId}
 */
export async function updateFamilyMember(
  familyId: string,
  memberId: string,
  memberData: UpdateFamilyMemberRequest
): Promise<Family> {
  return request<Family>(`/families/${familyId}`, {
    method: 'PUT',
    body: JSON.stringify({ memberId, ...memberData }),
  });
}

/**
 * Create a new family
 * POST /api/v1/families
 */
export async function createFamily(familyData: CreateFamilyRequest): Promise<Family> {
  return request<Family>('/families', {
    method: 'POST',
    body: JSON.stringify(familyData),
  });
}

/**
 * Delete a family
 * DELETE /api/v1/families/{familyId}
 */
export async function deleteFamily(familyId: string): Promise<void> {
  return request<void>(`/families/${familyId}`, {
    method: 'DELETE',
  });
}
