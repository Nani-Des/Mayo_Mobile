import { router } from "expo-router";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { supabase } from "../../lib/supabaseClient";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "http://localhost:8081/confirmation",
      },
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Registration successful! Check your email.");
      router.replace("/(auth)/login");
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

      <Button title="Create Account" onPress={handleRegister} />
    </View>
  );
}
