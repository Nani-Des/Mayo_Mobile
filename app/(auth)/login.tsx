import { router } from "expo-router";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { supabase } from "../../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      router.replace("/(tabs)");
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <Text>Email</Text>
      <TextInput
        style={{ borderWidth: 1, marginBottom: 15, padding: 10 }}
        onChangeText={setEmail}
      />

      <Text>Password</Text>
      <TextInput
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 15, padding: 10 }}
        onChangeText={setPassword}
      />

      <Button title="Login" onPress={handleLogin} />
      <Button
        title="Create Account"
        onPress={() => router.push("/(auth)/register")}
      />
    </View>
  );
}
