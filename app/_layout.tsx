import { Stack } from "expo-router";
import { AuthProvider } from "../providers/AuthProvider";
import { StorageProvider } from "../providers/StorageProvider";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StorageProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </StorageProvider>
    </AuthProvider>


  );
}
