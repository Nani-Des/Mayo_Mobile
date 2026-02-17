import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function DeviceRegistrationScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Device Registration</Text>
      <Text style={styles.subtitle}>
        Your device is not registered. 
        {'\n'}
        Please ask an Administrator to register this device.
      </Text>
      
      <View style={styles.infoBox}>
         <Text>Device ID: (Check Console/Logs)</Text>
      </View>

      <Button title="Back to Login" onPress={() => router.replace('/login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  infoBox: {
    padding: 16,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginBottom: 20,
  }
});
