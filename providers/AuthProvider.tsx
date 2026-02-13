import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { getStoredAccessToken, isAuthenticated, login as apiLogin, LoginRequest } from "../lib/api/auth";
import { router } from "expo-router";

interface AuthContextType {
  user: { id: string; email: string; fullName: string } | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<{ id: string; email: string; fullName: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Decode JWT token payload
  const decodeToken = (token: string): { sub?: string; userId?: string; email?: string; fullName?: string; name?: string } | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  };

  // Extract user info from token
  const extractUserFromToken = (token: string) => {
    const payload = decodeToken(token);
    if (!payload) return null;
    return {
      id: payload.sub || payload.userId || 'unknown',
      email: payload.email || '',
      fullName: payload.fullName || payload.name || '',
    };
  };

  useEffect(() => {
    async function checkAuth() {
      try {
        const hasToken = await isAuthenticated();
        setIsLoggedIn(hasToken);
        
        if (hasToken) {
          const token = await getStoredAccessToken();
          if (token) {
            const userInfo = extractUserFromToken(token);
            if (userInfo) {
              setUser(userInfo);
            }
          }
        }
      } catch (error) {
        console.warn('Auth check failed:', error);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  // Redirect when auth state changes
  useEffect(() => {
    if (!loading) {
      if (isLoggedIn) {
        // Redirect to tabs if logged in and on auth screen
        router.replace("/(tabs)");
      }
    }
  }, [isLoggedIn, loading]);

  const login = async (credentials: LoginRequest) => {
    const response = await apiLogin(credentials);
    const userInfo = extractUserFromToken(response.accessToken);
    if (userInfo) {
      setUser(userInfo);
      setIsLoggedIn(true);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isLoggedIn, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
