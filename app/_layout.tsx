import { Stack } from "expo-router";
import { AuthProvider } from "../providers/AuthProvider";
import { StorageProvider } from "../providers/StorageProvider";
import { SafeAreaProvider } from 'react-native-safe-area-context';


export default function RootLayout() {
  return (
    <SafeAreaProvider>
    <AuthProvider>
      <StorageProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </StorageProvider>
    </AuthProvider>
    </SafeAreaProvider>


  );
}
