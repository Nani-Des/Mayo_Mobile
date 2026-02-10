import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BLEProtocol } from '@/lib/services/protocols/ble-protocol';
import { DiscoveredDevice } from '@/lib/types/transfer';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';

interface BLEDeviceListProps {
  onDeviceSelected: (device: DiscoveredDevice) => void;
}

const bleProtocol = new BLEProtocol();

export function BLEDeviceList({ onDeviceSelected }: BLEDeviceListProps) {
  const [devices, setDevices] = useState<DiscoveredDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const itemBackgroundColor = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const handleScan = async () => {
    setIsScanning(true);
    setError(null);
    setDevices([]);

    try {
      const discoveredDevices = await bleProtocol.discover();
      setDevices(discoveredDevices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan for devices');
      console.error('BLE scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleDeviceSelect = (device: DiscoveredDevice) => {
    onDeviceSelected(device);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Available Devices
      </ThemedText>

      <TouchableOpacity
        style={[
          styles.scanButton,
          { backgroundColor: isScanning ? '#dc3545' : tintColor }
        ]}
        onPress={handleScan}
        disabled={isScanning}
      >
        {isScanning ? (
          <ActivityIndicator color="white" />
        ) : (
          <ThemedText style={styles.buttonText}>
            {devices.length > 0 ? 'Scan Again' : 'Start Scanning'}
          </ThemedText>
        )}
      </TouchableOpacity>

      {isScanning && (
        <ThemedText style={[styles.scanningText, { color: tintColor }]}>
          Scanning for nearby devices...
        </ThemedText>
      )}

      {error && (
        <ThemedText style={styles.errorText}>
          {error}
        </ThemedText>
      )}

      {devices.length > 0 ? (
        <View style={styles.deviceList}>
          {devices.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.deviceItem, { backgroundColor: itemBackgroundColor }]}
              onPress={() => handleDeviceSelect(item)}
            >
              <ThemedView style={styles.deviceInfo}>
                <ThemedText style={styles.deviceName}>{item.name}</ThemedText>
                {item.rssi && (
                  <ThemedText style={styles.deviceRssi}>Signal: {item.rssi} dBm</ThemedText>
                )}
              </ThemedView>
              <ThemedText style={[styles.connectButton, { color: tintColor }]}>
                Connect
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      ) : !isScanning && !error ? (
        <ThemedView style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>
            Tap "Start Scanning" to discover nearby devices
          </ThemedText>
        </ThemedView>
      ) : null}

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
    minHeight: 50,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  scanningText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  errorText: {
    textAlign: 'center',
    color: '#dc3545',
    marginBottom: 16,
    fontWeight: '600',
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
