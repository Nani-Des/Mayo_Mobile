import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Confirmation() {
  return (
    <View 
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#fff",
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>
        🎉 Email Verified!
      </Text>

      <Text
        style={{
          fontSize: 16,
          color: "#444",
          textAlign: "center",
          marginBottom: 30,
        }}
      >
        Your account has been successfully confirmed.
      </Text>

      <TouchableOpacity
        style={{
          backgroundColor: "#2e7dff",
          paddingVertical: 12,
          paddingHorizontal: 25,
          borderRadius: 8,
        }}
        onPress={() => router.replace("/(auth)/login")}
      >
        <Text style={{ color: "white", fontSize: 16 }}>
          Go to Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}
