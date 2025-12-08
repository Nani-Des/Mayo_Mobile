import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { TransferProtocol, TransferSession } from '../lib/storage/types';
import { useStorage } from '../providers/StorageProvider';

const ShareRecordScreen: React.FC = () => {
  const { transferManager } = useStorage();
  const [selectedProtocol, setSelectedProtocol] = useState<TransferProtocol | null>(null);
  const [session, setSession] = useState<TransferSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleProtocolSelect = async (protocol: TransferProtocol) => {
    if (!transferManager) {
      Alert.alert('Error', 'Transfer manager not available');
      return;
    }

    setIsLoading(true);
    try {
      const newSession = await transferManager.startTransfer(protocol);
      setSession(newSession);
      setSelectedProtocol(protocol);
    } catch (error) {
      Alert.alert('Error', `Failed to start transfer: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderProtocolSelection = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Select Transfer Protocol</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleProtocolSelect(TransferProtocol.QR_CODE)}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>QR Code</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleProtocolSelect(TransferProtocol.BLE)}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>Bluetooth Low Energy</Text>
      </TouchableOpacity>
      {isLoading && <Text style={styles.loadingText}>Starting transfer...</Text>}
    </View>
  );

  const renderTransferUI = () => {
    if (!session || !selectedProtocol) return null;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Transfer Session</Text>
        <Text style={styles.statusText}>Status: {session.status}</Text>
        <Text style={styles.sessionText}>Session ID: {session.id}</Text>
        <Text style={styles.sessionText}>Protocol: {session.protocol}</Text>
        <Text style={styles.sessionText}>Records: {session.transferredRecords.length}</Text>

        {selectedProtocol === TransferProtocol.QR_CODE && renderQrCode()}
        {selectedProtocol === TransferProtocol.BLE && renderBleStatus()}

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => {
            if (transferManager && session) {
              transferManager.cancelTransfer(session.id);
              setSession(null);
              setSelectedProtocol(null);
            }
          }}
        >
          <Text style={styles.buttonText}>Cancel Transfer</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderQrCode = () => {
    if (!transferManager || !session) return null;
    const qrCode = transferManager.getQrCode(session.id);
    return qrCode ? (
      <View style={styles.qrContainer}>
        <Text style={styles.qrText}>Scan this QR code to receive records:</Text>
        {qrCode}
      </View>
    ) : (
      <Text style={styles.errorText}>QR code not available</Text>
    );
  };

  const renderBleStatus = () => {
    if (!transferManager || !session) return null;
    const isAdvertising = transferManager.isBleAdvertising(session.id);
    return (
      <View style={styles.bleContainer}>
        <Text style={styles.bleText}>
          {isAdvertising ? 'BLE Advertising Active' : 'BLE Advertising Stopped'}
        </Text>
        <Text style={styles.bleSubText}>
          Other devices can now connect to receive records
        </Text>
      </View>
    );
  };

  return selectedProtocol ? renderTransferUI() : renderProtocolSelection();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginVertical: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  statusText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  sessionText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  qrText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginVertical: 10,
  },
  bleContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  bleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  bleSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default ShareRecordScreen;