import { useEffect } from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "../providers/AuthProvider";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initDatabase, seedDatabase } from "@/model";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        await seedDatabase(); // Populate with test data
      } catch (err) {
        console.error("Database initialization failed", err);
      }
    };
    init();
  }, []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      </QueryClientProvider>
    </AuthProvider>
  );
}
