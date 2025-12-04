import { Redirect, Tabs } from "expo-router";
import { useAuth } from "../../providers/AuthProvider";

export default function TabsLayout() {
  const { session, loading } = useAuth();

  if (loading) return null;

  if (!session) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
    </Tabs>
  );
}
