import { createContext, PropsWithChildren, useContext, useEffect } from "react";
import { LoginRequest } from "../lib/api/auth";
import { useRouter, useSegments, useRootNavigationState } from "expo-router";
import { useAuthStore } from "../stores/authStore";

interface AuthContextType {
  user: { id: string; email: string; fullName?: string } | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const { user, isAuthenticated, isLoading, login, logout, initialize } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  // Initialize auth on mount
  useEffect(() => {
    initialize();
  }, []);

  // Protection logic
  useEffect(() => {
    if (!navigationState?.key || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthenticated && inAuthGroup) {
      // If logged in and in auth group (login screen), redirect to home
      router.replace('/(tabs)');
    } else if (!isAuthenticated && !inAuthGroup) {
      // If not logged in and not in auth group, redirect to login
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, segments, isLoading, navigationState?.key]);

  return (
    <AuthContext.Provider value={{ 
        user, 
        loading: isLoading, 
        isLoggedIn: isAuthenticated, 
        login: async (creds) => { await login(creds); } 
    }}>
      {!isLoading && children}
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
