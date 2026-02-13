import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - Use environment variable or platform-specific default
// For Android Emulator: use 10.0.2.2 instead of localhost
// For iOS Simulator: use localhost
// For Web: use localhost
const getApiBaseUrl = () => {
  // Check for environment variable first
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;
  
  // Platform detection
  if (__DEV__) {
    // Use your machine's IP address for mobile emulators
    // Change this to match your machine's IP if running on physical device
    return 'http://10.0.2.2:8443/api';
  }
  return 'http://localhost:8443/api';
};

const API_BASE_URL = getApiBaseUrl();

// API Response wrapper (matches server's ApiResponse)
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
  requestId?: string;
}

// Types
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  ghanaCardId?: string;
  userType?: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    phoneNumber?: string;
    ghanaCardId?: string;
    userType?: string;
    createdAt: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Token storage keys
const ACCESS_TOKEN_KEY = 'mayo_access_token';
const REFRESH_TOKEN_KEY = 'mayo_refresh_token';

// API Client - unwraps ApiResponse<T> from server
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
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

// Token management functions
export async function storeTokens(
  accessToken: string | null | undefined,
  refreshToken: string | null | undefined
): Promise<void> {
  // Validate tokens before storing
  if (!accessToken || !refreshToken) {
    console.warn('storeTokens: Received null/undefined tokens', { accessToken, refreshToken });
    throw new Error('Invalid token response: tokens are null or undefined');
  }
  
  await AsyncStorage.multiSet([
    [ACCESS_TOKEN_KEY, accessToken],
    [REFRESH_TOKEN_KEY, refreshToken],
  ]);
}

export async function getStoredAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function getStoredRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function clearTokens(): Promise<void> {
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
}

// Auth API functions

/**
 * Login user with username/email and password
 * POST /api/auth/login
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  
  // Store tokens on successful login
  await storeTokens(response.accessToken, response.refreshToken);
  
  return response;
}

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  return request<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Refresh access token using refresh token
 * POST /api/auth/refresh
 */
export async function refreshToken(refreshToken?: string): Promise<RefreshTokenResponse> {
  const token = refreshToken || (await getStoredRefreshToken());
  
  if (!token) {
    throw {
      message: 'No refresh token available',
      status: 401,
      code: 'NO_REFRESH_TOKEN',
    } as ApiError;
  }
  
  const response = await request<RefreshTokenResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: token }),
  });
  
  // Store new tokens
  await storeTokens(response.accessToken, response.refreshToken);
  
  return response;
}

/**
 * Logout user and invalidate tokens
 * POST /api/auth/logout
 */
export async function logout(): Promise<void> {
  try {
    const refreshToken = await getStoredRefreshToken();
    
    await request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  } catch (error) {
    // Logout should still clear local tokens even if API call fails
    console.warn('Logout API call failed, clearing local tokens anyway');
  } finally {
    await clearTokens();
  }
}

/**
 * Get current access token for API calls
 * Returns the token with Bearer prefix for Authorization header
 */
export async function getAuthHeader(): Promise<string | null> {
  const token = await getStoredAccessToken();
  return token ? `Bearer ${token}` : null;
}

/**
 * Check if user is authenticated (has valid access token)
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getStoredAccessToken();
  return !!token;
}
