import { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface DataReceptionProps {
  onDataReceived: (data: any) => void;
}

export function DataReception({ onDataReceived }: DataReceptionProps) {
  const [isListening, setIsListening] = useState(false);
  const [receivedData, setReceivedData] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');

  // Simulate listening for incoming data
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isListening) {
      setConnectionStatus('Listening for incoming data...');
      
      // Simulate receiving data
      interval = setInterval(() => {
        // Random chance to receive data
        if (Math.random() > 0.7) {
          const mockData = {
            id: Math.floor(Math.random() * 1000),
            type: 'medical_record',
            timestamp: new Date().toISOString(),
            size: Math.floor(Math.random() * 10000) + 1000,
          };
          
          setReceivedData(mockData);
          setConnectionStatus('Data received!');
          
          // Show alert to user
          Alert.alert(
            'Incoming Data',
            `Received ${mockData.type} (${mockData.size} bytes)`,
            [
              {
                text: 'Accept',
                onPress: () => {
                  onDataReceived(mockData);
                  setReceivedData(null);
                  setConnectionStatus('Listening for incoming data...');
                },
              },
              {
                text: 'Reject',
                onPress: () => {
                  setReceivedData(null);
                  setConnectionStatus('Listening for incoming data...');
                },
                style: 'cancel',
              },
            ]
          );
        }
      }, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening]);

  const toggleListening = () => {
    setIsListening(!isListening);
    setConnectionStatus(isListening ? 'Disconnected' : 'Listening for incoming data...');
    setReceivedData(null);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Data Reception
      </ThemedText>
      
      <ThemedView style={styles.statusContainer}>
        <ThemedText style={styles.statusLabel}>Connection Status:</ThemedText>
        <ThemedText style={[
          styles.statusValue,
          connectionStatus.includes('Listening') ? styles.listening : 
          connectionStatus.includes('received') ? styles.received : styles.disconnected
        ]}>
          {connectionStatus}
        </ThemedText>
      </ThemedView>
      
      <TouchableOpacity 
        style={[
          styles.toggleButton,
          isListening ? styles.stopButton : styles.startButton
        ]}
        onPress={toggleListening}
      >
        <ThemedText style={styles.buttonText}>
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </ThemedText>
      </TouchableOpacity>
      
      {receivedData && (
        <ThemedView style={styles.dataPreview}>
          <ThemedText style={styles.previewTitle}>Incoming Data Preview</ThemedText>
          <ThemedText>Type: {receivedData.type}</ThemedText>
          <ThemedText>Size: {receivedData.size} bytes</ThemedText>
          <ThemedText>Timestamp: {new Date(receivedData.timestamp).toLocaleString()}</ThemedText>
        </ThemedView>
      )}
      
      <ThemedText style={styles.note}>
        Enable listening to receive medical records from other devices
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginVertical: 16,
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
    borderBottomColor: '#eee',
  },
  statusLabel: {
    fontWeight: '600',
  },
  statusValue: {
    fontWeight: '600',
  },
  listening: {
    color: '#0a7ea4',
  },
  received: {
    color: '#28a745',
  },
  disconnected: {
    color: '#6c757d',
  },
  toggleButton: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 16,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#28a745',
  },
  stopButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dataPreview: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0a7ea4',
  },
  previewTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  note: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.7,
    textAlign: 'center',
  },
});