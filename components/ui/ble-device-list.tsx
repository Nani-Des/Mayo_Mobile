import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';

interface BLEDevice {
  id: string;
  name: string;
  rssi: number;
}

interface BLEDeviceListProps {
  onDeviceSelected: (device: BLEDevice) => void;
}

export function BLEDeviceList({ onDeviceSelected }: BLEDeviceListProps) {
  const [devices, setDevices] = useState<BLEDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const itemBackgroundColor = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');

  // Simulate Bluetooth device discovery
  useEffect(() => {
    let scanInterval: ReturnType<typeof setInterval>;

    if (isScanning) {
      // Simulate discovering devices
      scanInterval = setInterval(() => {
        const mockDevices: BLEDevice[] = [
          { id: '1', name: 'Mayo Device 1', rssi: -65 },
          { id: '2', name: 'Mayo Device 2', rssi: -72 },
          { id: '3', name: 'Hospital Tablet', rssi: -58 },
          { id: '4', name: 'Clinic Phone', rssi: -80 },
        ];

        // Randomly update the device list
        if (Math.random() > 0.5) {
          setDevices(prev => {
            const newDevices = [...mockDevices];
            // Shuffle array to simulate changing device order
            return newDevices.sort(() => Math.random() - 0.5);
          });
        }
      }, 3000);
    }

    return () => {
      if (scanInterval) clearInterval(scanInterval);
    };
  }, [isScanning]);

  const toggleScan = () => {
    setIsScanning(!isScanning);
    if (!isScanning) {
      setDevices([]);
    }
  };

  const renderDevice = ({ item }: { item: BLEDevice }) => (
    <TouchableOpacity
      style={[styles.deviceItem, { backgroundColor: itemBackgroundColor }]}
      onPress={() => onDeviceSelected(item)}
    >
      <ThemedView style={styles.deviceInfo}>
        <ThemedText style={styles.deviceName}>{item.name}</ThemedText>
        <ThemedText style={styles.deviceRssi}>Signal: {item.rssi} dBm</ThemedText>
      </ThemedView>
      <ThemedText style={styles.connectButton}>Connect</ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Available Devices
      </ThemedText>

      <TouchableOpacity
        style={[
          styles.scanButton,
          isScanning ? styles.scanningButton : styles.idleButton
        ]}
        onPress={toggleScan}
      >
        <ThemedText style={styles.buttonText}>
          {isScanning ? 'Stop Scanning' : 'Start Scanning'}
        </ThemedText>
      </TouchableOpacity>

      {isScanning && (
        <ThemedText style={styles.scanningText}>
          Scanning for nearby devices...
        </ThemedText>
      )}

      {devices.length > 0 ? (
        <FlatList
          data={devices}
          renderItem={renderDevice}
          keyExtractor={(item) => item.id}
          style={styles.deviceList}
        />
      ) : (
        <ThemedView style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>
            {isScanning
              ? 'No devices found yet...'
              : 'Tap "Start Scanning" to discover nearby devices'}
          </ThemedText>
        </ThemedView>
      )}

      <ThemedText style={styles.note}>
        Make sure the other device has Bluetooth enabled and is discoverable
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
  scanButton: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 16,
    alignItems: 'center',
  },
  idleButton: {
    backgroundColor: '#0a7ea4',
  },
  scanningButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  scanningText: {
    textAlign: 'center',
    color: '#0a7ea4',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  deviceList: {
    maxHeight: 300,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  deviceRssi: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 4,
  },
  connectButton: {
    color: '#0a7ea4',
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  note: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 16,
  },
});