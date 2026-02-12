import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';

interface WiFiDirectManagerProps {
  onConnected: (networkInfo: any) => void;
  onDisconnected: () => void;
}

export function WiFiDirectManager({ onConnected, onDisconnected }: WiFiDirectManagerProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [networkName, setNetworkName] = useState(''); // This will be your PC IP
  const [password, setPassword] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [ipAddress, setIpAddress] = useState('');

  const inputBackground = useThemeColor({}, 'backgroundSecondary');
  const inputBorder = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');

  const handleConnect = async () => {
    if (!networkName.trim()) {
      setConnectionStatus('Please enter PC IP address');
      return;
    }

    setConnectionStatus('Connecting to Station...');

    try {
      // REAL CONNECTION: Fetching the handshake from your PC server on Port 3000
      const response = await fetch(`http://${networkName}:3000/handshake`, {
        method: 'GET',
      });

      if (response.ok) {
        // Success logic
        setIsConnected(true);
        setIpAddress(networkName);
        setConnectionStatus('Connected to Doctor PC');
        
        // Notify the parent screen that we are connected
        onConnected({ 
          ssid: 'Mayo_Secure_WiFi', 
          ipAddress: networkName 
        });
      } else {
        throw new Error('Station rejected connection');
      }
    } catch (error) {
      // Failure logic
      setIsConnected(false);
      setConnectionStatus('Connection Failed');
      Alert.alert(
        "Station Offline", 
        "Could not find the Doctor Station. Check your PC IP and ensure server.js is running."
      );
    }
  };

  const handleDisconnect = () => {
    setConnectionStatus('Disconnecting...');

    // Resetting states
    setIsConnected(false);
    setIpAddress('');
    setConnectionStatus('Disconnected');
    
    // This triggers the handleResetSecurity in your DataTransferScreen
    onDisconnected();
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        WiFi Direct Connection
      </ThemedText>

      {!isConnected ? (
        <>
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Doctor Station IP (PC IP)</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: inputBackground, borderColor: inputBorder, color: textColor }]}
              value={networkName}
              onChangeText={setNetworkName}
              placeholder="e.g. 192.168.1.15"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              editable={!connectionStatus.includes('Connecting')}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Security Token (Optional)</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: inputBackground, borderColor: inputBorder, color: textColor }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              editable={!connectionStatus.includes('Connecting')}
            />
          </ThemedView>

          <TouchableOpacity
            style={styles.connectButton}
            onPress={handleConnect}
            disabled={connectionStatus.includes('Connecting')}
          >
            <ThemedText style={styles.buttonText}>Connect</ThemedText>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          style={styles.disconnectButton}
          onPress={handleDisconnect}
        >
          <ThemedText style={styles.buttonText}>Disconnect</ThemedText>
        </TouchableOpacity>
      )}

      <ThemedView style={styles.statusContainer}>
        <ThemedText style={styles.statusLabel}>Status:</ThemedText>
        <ThemedText style={[
          styles.statusValue,
          isConnected ? styles.connected : styles.disconnected
        ]}>
          {connectionStatus}
        </ThemedText>
      </ThemedView>

      {isConnected && ipAddress && (
        <ThemedView style={styles.infoContainer}>
          <ThemedText style={styles.infoLabel}>Station IP:</ThemedText>
          <ThemedText style={styles.infoValue}>{ipAddress}</ThemedText>
        </ThemedView>
      )}

      <ThemedText style={styles.note}>
        WiFi Direct enables high-speed direct connections between devices without an internet connection
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { marginBottom: 16, textAlign: 'center' },
  inputGroup: { marginBottom: 16 },
  label: { fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12 },
  connectButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  disconnectButton: { backgroundColor: '#dc3545', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: 'white', fontWeight: 'bold' },
  statusContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  statusLabel: { fontWeight: '600' },
  statusValue: { fontWeight: '600' },
  connected: { color: '#28a745' },
  disconnected: { color: '#6c757d' },
  infoContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  infoLabel: { fontWeight: '600' },
  infoValue: { fontWeight: '600', color: '#0a7ea4' },
  note: { fontSize: 12, fontStyle: 'italic', opacity: 0.7, textAlign: 'center', marginTop: 16 },
});