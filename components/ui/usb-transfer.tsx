import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

interface USBTransferProps {
  onDataTransfer: (data: any) => void;
}

export function USBTransfer({ onDataTransfer }: USBTransferProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [transferStatus, setTransferStatus] = useState('No USB device connected');
  const [transferProgress, setTransferProgress] = useState(0);
  const borderColor = useThemeColor({}, 'border');

  const handleUSBConnect = () => {
    // Simulate USB connection
    setIsConnected(true);
    setTransferStatus('USB device connected. Ready to transfer.');
  };

  const handleUSBDisconnect = () => {
    // Simulate USB disconnection
    setIsConnected(false);
    setTransferStatus('USB device disconnected');
    setTransferProgress(0);
  };

  const handleSendData = () => {
    if (!isConnected) {
      Alert.alert('Error', 'Please connect a USB device first');
      return;
    }

    setTransferStatus('Sending data...');
    setTransferProgress(0);

    // Simulate data transfer
    const interval = setInterval(() => {
      setTransferProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTransferStatus('Data transfer complete');

          // Simulate received data
          const mockData = {
            id: Math.floor(Math.random() * 1000),
            type: 'medical_record',
            timestamp: new Date().toISOString(),
            size: Math.floor(Math.random() * 10000) + 1000,
          };

          onDataTransfer(mockData);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleReceiveData = () => {
    if (!isConnected) {
      Alert.alert('Error', 'Please connect a USB device first');
      return;
    }

    setTransferStatus('Receiving data...');
    setTransferProgress(0);

    // Simulate data reception
    const interval = setInterval(() => {
      setTransferProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTransferStatus('Data reception complete');

          // Simulate received data
          const mockData = {
            id: Math.floor(Math.random() * 1000),
            type: 'medical_record_update',
            timestamp: new Date().toISOString(),
            size: Math.floor(Math.random() * 10000) + 1000,
          };

          onDataTransfer(mockData);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        USB Transfer
      </ThemedText>

      <ThemedView style={[styles.statusContainer, { borderBottomColor: borderColor }]}>
        <ThemedText style={styles.statusLabel}>Connection Status:</ThemedText>
        <ThemedText style={[
          styles.statusValue,
          isConnected ? styles.connected : styles.disconnected
        ]}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </ThemedText>
      </ThemedView>

      <ThemedView style={[styles.statusContainer, { borderBottomColor: borderColor }]}>
        <ThemedText style={styles.statusLabel}>Transfer Status:</ThemedText>
        <ThemedText style={styles.statusValue}>
          {transferStatus}
        </ThemedText>
      </ThemedView>

      {transferProgress > 0 && transferProgress < 100 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${transferProgress}%` }
              ]}
            />
          </View>
          <ThemedText style={styles.progressText}>
            {transferProgress}% Complete
          </ThemedText>
        </View>
      )}

      <View style={styles.buttonContainer}>
        {!isConnected ? (
          <TouchableOpacity
            style={styles.connectButton}
            onPress={handleUSBConnect}
          >
            <ThemedText style={styles.buttonText}>Connect USB Device</ThemedText>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendData}
            >
              <ThemedText style={styles.buttonText}>Send Data</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.receiveButton}
              onPress={handleReceiveData}
            >
              <ThemedText style={styles.buttonText}>Receive Data</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={handleUSBDisconnect}
            >
              <ThemedText style={styles.buttonText}>Disconnect</ThemedText>
            </TouchableOpacity>
          </>
        )}
      </View>

      <ThemedText style={styles.note}>
        Connect your device via USB cable to transfer medical records securely
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  statusLabel: {
    fontWeight: '600',
  },
  statusValue: {
    fontWeight: '600',
  },
  connected: {
    color: '#28a745',
  },
  disconnected: {
    color: '#6c757d',
  },
  progressContainer: {
    marginVertical: 16,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0a7ea4',
    borderRadius: 5,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    marginVertical: 16,
    gap: 12,
  },
  connectButton: {
    backgroundColor: '#0a7ea4',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  receiveButton: {
    backgroundColor: '#ffc107',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disconnectButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  note: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.7,
    textAlign: 'center',
  },
});