import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

interface WiFiDirectManagerProps {
  onConnected: (networkInfo: { ssid: string; ipAddress: string }) => void;
  onDisconnected: () => void;
  /** IP auto-filled from a QR scan — user can still edit before connecting */
  prefillIp?: string;
}

export function WiFiDirectManager({ onConnected, onDisconnected, prefillIp }: WiFiDirectManagerProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [networkName, setNetworkName] = useState('');
  const [password, setPassword] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [ipAddress, setIpAddress] = useState('');

  const inputBackground = useThemeColor({}, 'backgroundSecondary');
  const inputBorder = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');

  // Auto-fill IP whenever a new one arrives from QR scan
  useEffect(() => {
    if (prefillIp && !isConnected) {
      setNetworkName(prefillIp);
      setConnectionStatus('IP filled from QR — tap Connect');
    }
  }, [prefillIp]);

  // Replace your handleConnect function with this updated logic
const handleConnect = async () => {
    if (!networkName.trim()) {
        setConnectionStatus('Please enter PC IP address');
        return;
    }

    setConnectionStatus('Connecting to Station…');

    // Create a timeout so the app doesn't hang forever
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        const response = await fetch(`http://${networkName}:3000/handshake`, {
            method: 'GET',
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            setIsConnected(true);
            setIpAddress(networkName);
            setConnectionStatus('Connected to Doctor PC');
            onConnected({ ssid: 'Hotspot_Network', ipAddress: networkName });
        } else {
            throw new Error('Station rejected');
        }
    } catch (error: any) {
        clearTimeout(timeoutId);
        setIsConnected(false);
        setConnectionStatus('Connection Failed');
        
        const errorMsg = error.name === 'AbortError' 
            ? 'Request timed out. Check Firewall.' 
            : 'Could not find Station. Ensure PC is on the same Hotspot.';
            
        Alert.alert('Station Offline', errorMsg);
    }
};

  const handleDisconnect = () => {
    setIsConnected(false);
    setIpAddress('');
    setConnectionStatus('Disconnected');
    onDisconnected();
  };

  const isConnecting = connectionStatus.includes('Connecting');

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>WiFi Direct Connection</ThemedText>

      {!isConnected ? (
        <>
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={styles.label}>Doctor Desktop IP</ThemedText>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: inputBackground, borderColor: inputBorder, color: textColor },
                prefillIp && networkName === prefillIp && styles.inputPrefilled,
              ]}
              value={networkName}
              onChangeText={setNetworkName}
              placeholder="e.g. 192.168.1.15"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              editable={!isConnecting}
            />
            {prefillIp && networkName === prefillIp && (
              <ThemedText style={styles.prefillHint}>✓ Auto-filled from QR scan</ThemedText>
            )}
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
              editable={!isConnecting}
            />
          </ThemedView>

          <TouchableOpacity
            style={[styles.connectButton, isConnecting && styles.buttonDisabled]}
            onPress={handleConnect}
            disabled={isConnecting}
          >
            <ThemedText style={styles.buttonText}>
              {isConnecting ? 'Connecting…' : 'Connect'}
            </ThemedText>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect}>
          <ThemedText style={styles.buttonText}>Disconnect</ThemedText>
        </TouchableOpacity>
      )}

      <ThemedView style={styles.statusContainer}>
        <ThemedText style={styles.statusLabel}>Status:</ThemedText>
        <ThemedText style={[styles.statusValue, isConnected ? styles.connected : styles.disconnected]}>
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
  inputPrefilled: { borderColor: '#28a745', borderWidth: 2 },
  prefillHint: { fontSize: 11, color: '#28a745', marginTop: 4, fontWeight: '600' },
  connectButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  disconnectButton: { backgroundColor: '#dc3545', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  buttonDisabled: { opacity: 0.6 },
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