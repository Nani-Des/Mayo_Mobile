import { 
    request, 
    storeTokens, 
    getStoredRefreshToken, 
    clearTokens, 
    getStoredAccessToken, 
    ApiError 
} from './common';

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

// Auth API functions

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  
  await storeTokens(response.accessToken, response.refreshToken);
  
  return response;
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  return request<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

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
  
  await storeTokens(response.accessToken, response.refreshToken);
  
  return response;
}

export async function logout(): Promise<void> {
  // Since tokens are stateless JWTs stored locally, we don't need a server endpoint
  // Just clear local tokens on the client side
  await clearTokens();
}

export { getStoredAccessToken, storeTokens, clearTokens };

export async function isAuthenticated(): Promise<boolean> {
  const token = await getStoredAccessToken();
  return !!token;
}

/**
 * Update user profile
 */
export async function updateProfile(userId: string, data: Partial<{ fullName: string; email: string; phoneNumber: string }>): Promise<any> {
    return request<any>(`/auth/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

/**
 * Change password
 */
export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}

export async function changePasswordRequest(userId: string, data: ChangePasswordRequest): Promise<void> {
    return request<void>('/auth/change-password', {
        method: 'POST',
        headers: {
            'X-User-Id': userId,
        },
        body: JSON.stringify(data),
    });
}
