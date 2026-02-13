import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { SyncService } from '@/lib/services/sync-service';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

interface USBTransferProps {
  onDataTransfer: (data: any) => void;
  isLocked: boolean;
  onDisconnect: () => void; // Added for security reset
}

export function USBTransfer({ onDataTransfer, isLocked, onDisconnect }: USBTransferProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [transferStatus, setTransferStatus] = useState('No USB device connected');
  const [transferProgress, setTransferProgress] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const borderColor = useThemeColor({}, 'border');

  const handleUSBConnect = () => {
    setIsConnected(true);
    setTransferStatus('USB physical connection active. Ready.');
  };

  const handleUSBDisconnect = () => {
    setIsConnected(false);
    setTransferProgress(0);
    setTransferStatus('No USB device connected');
    // CRITICAL: Tells the screen to lock the QR Handshake again
    onDisconnect();
  };

  const handleSendData = async () => {
    // SECURITY CHECK: If screen is locked, block the function
    if (isLocked) {
      Alert.alert('Security Lock', 'Doctor must scan Handshake QR code before data can be pushed.');
      return;
    }

    setIsSending(true);
    setTransferStatus('Extracting Patient Delta...');

    try {
      const dataPackage = await SyncService.exportPatientData('p-123');

      // Simulate sending progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 25;
        setTransferProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setIsSending(false);
          setTransferStatus('Data Packet Transferred to PC!');
          console.log("--- USB PIPE DATA SENT ---", dataPackage);
          onDataTransfer(dataPackage);
        }
      }, 400);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to export patient data');
      setIsSending(false);
    }
  };

  const handleReceiveData = () => {
    if (!isConnected) {
      Alert.alert('Error', 'Please connect USB first');
      return;
    }
    setTransferStatus('Receiving Doctor Update...');
    setTransferProgress(0);

    const interval = setInterval(() => {
      setTransferProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTransferStatus('Record Updated locally');
          Alert.alert('Success', 'Doctor updates merged');
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>USB Data Bridge</ThemedText>

      <View style={[styles.statusContainer, { borderBottomColor: borderColor }]}>
        <ThemedText style={styles.statusLabel}>Physical Link:</ThemedText>
        <ThemedText style={[styles.statusValue, isConnected ? styles.connected : styles.disconnected]}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </ThemedText>
      </View>

      <ThemedText style={styles.statusSubtext}>
        {isLocked ? "🔒 Locked: QR Required" : "🔓 Handshake: Authorized"}
      </ThemedText>

      <ThemedText style={styles.statusValue}>{transferStatus}</ThemedText>

      {transferProgress > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${transferProgress}%` }]} />
          </View>
        </View>
      )}

      <View style={styles.buttonContainer}>
        {!isConnected ? (
          <TouchableOpacity style={styles.connectButton} onPress={handleUSBConnect}>
            <ThemedText style={styles.buttonText}>Simulate USB Connection</ThemedText>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.sendButton, (isLocked || isSending) && styles.disabledButton]}
              onPress={handleSendData}
              disabled={isSending || isLocked}
            >
              {isSending ? (
                <ActivityIndicator color="white" />
              ) : (
                <ThemedText style={styles.buttonText}>
                  {isLocked ? "Handshake Missing" : "Send Patient Record"}
                </ThemedText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.receiveButton, isLocked && styles.disabledButton]}
              onPress={handleReceiveData}
              disabled={isLocked}
            >
              <ThemedText style={styles.buttonText}>Receive Update</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.disconnectButton} onPress={handleUSBDisconnect}>
              <ThemedText style={styles.buttonText}>Disconnect & Lock</ThemedText>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 8 },
  title: { marginBottom: 12 },
  statusContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, marginBottom: 8 },
  statusLabel: { fontWeight: '600' },
  statusValue: { fontSize: 13, textAlign: 'center' },
  statusSubtext: { fontSize: 11, color: '#666', fontStyle: 'italic', marginBottom: 4 },
  connected: { color: '#28a745' },
  disconnected: { color: '#6c757d' },
  progressContainer: { marginVertical: 12 },
  progressBarBackground: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#0284C7' },
  buttonContainer: { marginTop: 16, gap: 10 },
  connectButton: { backgroundColor: '#0a7ea4', padding: 12, borderRadius: 8, alignItems: 'center' },
  sendButton: { backgroundColor: '#28a745', padding: 12, borderRadius: 8, alignItems: 'center' },
  receiveButton: { backgroundColor: '#ffc107', padding: 12, borderRadius: 8, alignItems: 'center' },
  disabledButton: { backgroundColor: '#ccc' },
  disconnectButton: { backgroundColor: '#dc3545', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold' },
});