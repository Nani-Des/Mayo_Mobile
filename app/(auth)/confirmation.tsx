import { router } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Confirmation() {
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ marginBottom: 20 }}>
        Your email has been confirmed! You can now log in.
      </Text>
      <Button title="Go to Login" onPress={() => router.replace("/(auth)/login")} />
    </View>
  );
}
