/**
 * Mayo Mobile API Client
 * Replaces Supabase with direct gateway API calls
 * Gateway: http://localhost:8443/api
 */

// Re-export auth functions for backward compatibility
export {
  login,
  register,
  logout,
  refreshToken,
  getAuthHeader,
  getStoredAccessToken,
  getStoredRefreshToken,
  storeTokens,
  clearTokens,
  isAuthenticated,
} from './api/auth';

// API Configuration
export const API_CONFIG = {
  baseUrl: 'http://localhost:8443/api',
  timeout: 30000,
};

// Helper to create authenticated fetch options
export async function getAuthenticatedRequestOptions(
  options = {}
) {
  const authHeader = await import('./api/auth').then((mod) => mod.getAuthHeader());
  
  return {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authHeader ? { Authorization: authHeader } : {}),
      ...options.headers,
    },
  };
}
