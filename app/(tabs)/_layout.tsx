import { Redirect, Tabs } from "expo-router";
import { useAuth } from "../../providers/AuthProvider";
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from "../../constants/colors";
import { Colors } from "@/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabsLayout() {
  const { session, loading } = useAuth();

  if (loading) return null;

  if (!session) return <Redirect href="/(auth)/login" />;

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <Tabs screenOptions={{  headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        
     }}>

      <Tabs.Screen
      name="index"
      options={{
        title: "Home", 
        tabBarIcon: ({color, size}) => <Ionicons name="home" size={size} color={color}
        />
        }} 
        />
      <Tabs.Screen
      name="share"
      options={{
        title: "Share", 
        tabBarIcon: ({color, size}) => <Ionicons name="share-outline" size={size} color={color}/>
        }} 
        />
      <Tabs.Screen
      name="notes"
      options={{
        title: "Notes", 
        tabBarIcon: ({color, size}) => <Ionicons name="document-text-outline" size={size} color={color}/>
        }} 
        />
      <Tabs.Screen
      name="profile"
      options={{
        title: "Profile", 
        tabBarIcon: ({color, size}) => <Ionicons name="person-outline" size={size} color={color}/>
        }} 
        />
     
    </Tabs>
    </SafeAreaView>
  );
}
