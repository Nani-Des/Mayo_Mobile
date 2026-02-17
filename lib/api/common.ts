import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - Gateway on port 8443 with /api/v1 prefix
// Environment variable EXPO_PUBLIC_API_URL can override (e.g., http://10.0.2.2:8443/api/v1)
// For Android Emulator: use 10.0.2.2 instead of localhost
// For iOS Simulator: use localhost
// For physical device: use your machine's IP address
const getApiBaseUrl = () => {
  // Check for environment variable first
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    console.log('[API] Using EXPO_PUBLIC_API_URL:', envUrl);
    return envUrl;
  }
  
  // Platform detection
  if (__DEV__) {
    // Default development: try Android emulator gateway
    const defaultUrl = 'http://10.0.2.2:8443/api/v1';
    console.log('[API] Using default dev URL:', defaultUrl);
    return defaultUrl;
  }
  return 'https://api.mayoapp.com/api/v1'; // Production URL (adjust as needed)
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Helper to check if the API server is reachable.
 * Useful for debugging connectivity issues.
 */
export async function checkApiConnectivity(): Promise<boolean> {
  try {
    const healthUrl = `${API_BASE_URL}/health`;
    const response = await fetch(healthUrl, { method: 'GET', timeout: 5000 } as any);
    return response.ok;
  } catch (error) {
    console.warn('[API] Connectivity check failed:', error);
    return false;
  }
}

// Token storage keys
const ACCESS_TOKEN_KEY = 'mayo_access_token';
const REFRESH_TOKEN_KEY = 'mayo_refresh_token';

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
  requestId?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Token management functions
export async function storeTokens(
  accessToken: string | null | undefined,
  refreshToken: string | null | undefined
): Promise<void> {
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

export async function getAuthHeader(): Promise<string | null> {
  const token = await getStoredAccessToken();
  return token ? `Bearer ${token}` : null;
}

// API Client
export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
  }

  // Auto-inject Auth header if available and not explicitly set
  if (!headers.has('Authorization')) {
      const authHeader = await getAuthHeader();
      if (authHeader) {
          headers.set('Authorization', authHeader);
      }
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    // Parse response
    const text = await response.text();
    const apiResponse: ApiResponse<T> = text ? JSON.parse(text) : { success: false, data: null as any };
    
    if (!response.ok || !apiResponse.success) {
      // Handle 401 Unauthorized - Token Refresh
      if (response.status === 401) {
          console.log('[API] 401 Unauthorized - Attempting refresh...');
          
          try {
              const refreshToken = await getStoredRefreshToken();
              if (!refreshToken) {
                  throw new Error('No refresh token available');
              }

              // Direct fetch to avoid circular dependency/recursion
              const refreshUrl = `${API_BASE_URL}/auth/refresh`;
              const refreshResponse = await fetch(refreshUrl, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ refreshToken }),
              });

              if (refreshResponse.ok) {
                  const refreshData = await refreshResponse.json();
                  if (refreshData.success && refreshData.data) {
                      const { accessToken, refreshToken: newRefreshToken } = refreshData.data;
                      
                      console.log('[API] Token refresh successful');
                      await storeTokens(accessToken, newRefreshToken);

                      // Retry original request with new token
                      const newHeaders = new Headers(options.headers);
                      newHeaders.set('Authorization', `Bearer ${accessToken}`);
                      newHeaders.set('Content-Type', 'application/json'); // Ensure content type is preserved

                      const retryConfig: RequestInit = {
                          ...options,
                          headers: newHeaders,
                      };

                      const retryResponse = await fetch(url, retryConfig);
                      const retryText = await retryResponse.text();
                      const retryApiResponse: ApiResponse<T> = retryText ? JSON.parse(retryText) : { success: false, data: null as any };

                       if (!retryResponse.ok || !retryApiResponse.success) {
                          throw {
                              message: retryApiResponse.message || `HTTP Error: ${retryResponse.status}`,
                              status: retryResponse.status,
                              code: (retryApiResponse as any).code,
                          } as ApiError;
                       }

                      return retryApiResponse.data;
                  }
              }
              
              console.warn('[API] Token refresh failed');
          } catch (refreshError) {
              console.error('[API] Error during token refresh:', refreshError);
          }
           
          // If we get here, refresh failed or threw error
          console.warn('[API] Session expired - clearing tokens');
          await clearTokens();
      }

      throw {
        message: apiResponse.message || `HTTP Error: ${response.status}`,
        status: response.status,
        code: (apiResponse as any).code,
      } as ApiError;
    }
    
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
