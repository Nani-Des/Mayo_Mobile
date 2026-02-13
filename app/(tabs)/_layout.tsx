import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Redirect, Tabs } from "expo-router";
import { useAuth } from "../../providers/AuthProvider";

export default function TabsLayout() {
  const { session, loading } = useAuth();
  const colorScheme = useColorScheme();

  if (loading) return null;

  // if (!session) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderTopColor: Colors[colorScheme ?? 'light'].border,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol name="house.fill" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="family"
        options={{
          title: 'Family',
          tabBarIcon: ({ color }) => <IconSymbol name="person.3.fill" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="data-transfer"
        options={{
          title: 'Transfer',
          tabBarIcon: ({ color }) => <IconSymbol name="paperplane.fill" color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
