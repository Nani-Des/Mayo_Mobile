import { LinearGradient } from 'expo-linear-gradient';
import { Alert, StyleSheet, View, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BLEDeviceList } from '@/components/ui/ble-device-list';
import { DiscoveredDevice } from '@/lib/types/transfer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import SyncService from '@/app/services/SyncService';
import { transferService } from '@/lib/services/transfer-service';
import { BLEPlxProtocol } from '@/lib/services/protocols/ble-plx-protocol';
import { BLEProtocol } from '@/lib/services/protocols/ble-protocol';
import { ensureBLEPermissions } from '@/lib/services/ble-permissions';
import { medicalRecordsAPI } from '@/lib/api/medical-records-api';
import { useTransferStore } from '@/stores/transferStore';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function BLETransferScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [connectedDevice, setConnectedDevice] = useState<DiscoveredDevice | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferProgress, setTransferProgress] = useState<number | null>(null);
  const [currentSession] = useState(SyncService.getMockPatientHistory());
  const handshake = useTransferStore((s) => s.handshake);
  const [protoRef, setProtoRef] = useState<any | null>(null);
  const [permissionsGranted, setPermissionsGranted] = useState<boolean | null>(null);
  const [nativeError, setNativeError] = useState<string | null>(null);
  const [useSimulated, setUseSimulated] = useState(false);

  useEffect(() => {
    // Try to instantiate native BLE protocol; if native module missing, record error so UI can fallback
    try {
      const p = new BLEPlxProtocol();
      setProtoRef(p);
    } catch (e: any) {
      setNativeError(e?.message || String(e));
      // leave protoRef null so user can choose simulated fallback
    }
  }, []);

  const handleDeviceSelected = async (device: DiscoveredDevice) => {
    try {
      // Ensure we have a protocol (native or simulated)
      let protoToUse = protoRef;
      if (!protoToUse && useSimulated) protoToUse = new BLEProtocol();
      if (!protoToUse) throw new Error('No BLE protocol available. Enable permissions or select simulated fallback.');

      transferService.setProtocol(protoToUse);
      await transferService.connect(device);
      setConnectedDevice(device);
      Alert.alert('Device Connected', `Successfully connected to ${device.name}. You can now transfer data.`, [{ text: 'OK' }]);
    } catch (err: any) {
      Alert.alert('Connection Failed', err.message || 'Could not connect to selected device');
    }
  };

  const handlePushData = async () => {
    if (!connectedDevice) return;
    setIsTransferring(true);
    setTransferProgress(0);
    const unsubscribe = transferService.onProgress((p) => setTransferProgress(Math.round(p.percentage)));
    try {
      const patientId = await medicalRecordsAPI.getCurrentPatientId();
      const transferPackage = await medicalRecordsAPI.prepareRecordsForTransfer(patientId);
      if (transferPackage.metadata) transferPackage.metadata.transferMethod = 'bluetooth';

      await transferService.send(transferPackage);
      Alert.alert('Transfer Success', `Patient records sent to ${connectedDevice.name} via Bluetooth.`);
    } catch (err: any) {
      setTransferProgress(null);
      Alert.alert('BLE Transfer Failed', err.message || 'BLE transfer failed');
    } finally {
      unsubscribe();
      setIsTransferring(false);
      setTimeout(() => setTransferProgress(null), 500);
    }
  };

  const handlePullData = async () => {
    if (!connectedDevice) return;
    setIsTransferring(true);
    setTransferProgress(0);
    const unsubscribe = transferService.onProgress((p) => setTransferProgress(Math.round(p.percentage)));
    try {
      const received = await transferService.receive();
      await medicalRecordsAPI.saveReceivedRecords(received.data);
      Alert.alert('Sync Success', 'Received updates from device and saved locally.');
    } catch (err: any) {
      setTransferProgress(null);
      Alert.alert('BLE Sync Failed', err.message || 'Could not receive data from device');
    } finally {
      unsubscribe();
      setIsTransferring(false);
      setTimeout(() => setTransferProgress(null), 500);
    }
  };

  const handleDisconnect = () => {
    setConnectedDevice(null);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemedView style={styles.container}>
        <LinearGradient
          colors={['#28a745', '#1e7e34']}
          style={[styles.header, { paddingTop: insets.top + 60, paddingBottom: 30 }]}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <IconSymbol name="chevron.left" size={24} color="white" />
            </TouchableOpacity>
            <ThemedText type="hero" style={styles.headerTitle}>Bluetooth</ThemedText>
            <View style={{ width: 40 }} />
          </View>
          
          <View style={styles.headerIconContainer}>
            <View style={styles.iconCircle}>
              <IconSymbol name="antenna.radiowaves.left.and.right" size={32} color="#28a745" />
            </View>
            <ThemedText style={styles.headerSubtitle}>Connect to nearby devices via Bluetooth</ThemedText>
          </View>
        </LinearGradient>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.content}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Available Bluetooth Devices
              </ThemedText>
              <ThemedText style={styles.description}>
                Scan for nearby Bluetooth devices to establish a connection for transferring medical records.
              </ThemedText>

          {!connectedDevice ? (
            <>
              {nativeError && !useSimulated ? (
                <Card style={{ padding: 16, marginBottom: 12 }}>
                  <ThemedText style={{ marginBottom: 8, fontWeight: '700' }}>BLE Native Module Unavailable</ThemedText>
                  <ThemedText style={{ marginBottom: 12 }}>{nativeError}</ThemedText>
                  <ThemedText style={{ marginBottom: 12 }}>
                    To use native BLE install and link `react-native-ble-plx`. As a temporary fallback you can use the simulated BLE flow.
                  </ThemedText>
                  <Button title="Use Simulated BLE" onPress={() => setUseSimulated(true)} />
                </Card>
              ) : null}

              {permissionsGranted === false ? (
                <Card style={{ padding: 16, marginBottom: 12 }}>
                  <ThemedText style={{ marginBottom: 8, fontWeight: '700' }}>Bluetooth Permissions Required</ThemedText>
                  <ThemedText style={{ marginBottom: 12 }}>The app needs location/Bluetooth permissions to scan for nearby devices. Grant permissions to continue.</ThemedText>
                  <Button
                    title="Grant Permissions"
                    onPress={async () => {
                      const ok = await ensureBLEPermissions();
                      if (ok) setPermissionsGranted(true);
                      else Alert.alert('Permissions Denied', 'Please enable Bluetooth/location permissions in app settings.');
                    }}
                  />
                </Card>
              ) : null}

              <View style={styles.deviceListContainer}>
                <Button
                  title={permissionsGranted === true ? 'Refresh Devices' : 'Enable Bluetooth & Scan'}
                  onPress={async () => {
                    // Prompt permissions proactively
                    const ok = await ensureBLEPermissions();
                    setPermissionsGranted(ok);
                    if (!ok) {
                      Alert.alert('Permissions Needed', 'Bluetooth/location permission is required to scan for devices.');
                      return;
                    }
                    // no-op: BLEDeviceList has its own scan button; setting permissions enables it
                  }}
                />
                <BLEDeviceList onDeviceSelected={handleDeviceSelected} protocol={useSimulated ? new BLEProtocol() : protoRef} />
              </View>
            </>
          ) : (
              <Card variant="elevated" style={styles.connectedCard}>
                <View style={styles.connectionStatus}>
                  <View style={[styles.statusDot, { backgroundColor: '#28a745' }]} />
                  <ThemedText type="defaultSemiBold">Connected to Device</ThemedText>
                </View>
                <ThemedText style={styles.deviceName}>{connectedDevice.name}</ThemedText>
                
                <View style={styles.actionButtons}>
                  <Button 
                    title={isTransferring ? "Transferring..." : "Push Patient Records"}
                    onPress={handlePushData}
                    disabled={isTransferring}
                    style={styles.mainActionButton}
                    icon={isTransferring ? undefined : "arrow.up.circle.fill"}
                  />
                  
                  <Button 
                    title={isTransferring ? "Syncing..." : "Pull Updated Records"}
                    onPress={handlePullData}
                    disabled={isTransferring}
                    variant="outline"
                    style={styles.outlineActionButton}
                    icon={isTransferring ? undefined : "arrow.down.circle"}
                  />
                </View>

                {transferProgress !== null ? (
                  <ThemedText style={styles.progressText}>{`Progress: ${transferProgress}%`}</ThemedText>
                ) : isTransferring ? (
                  <ActivityIndicator style={{ marginTop: 10 }} color="#28a745" />
                ) : null}

                <TouchableOpacity onPress={handleDisconnect} style={styles.disconnectButton}>
                  <ThemedText style={styles.disconnectText}>Disconnect</ThemedText>
                </TouchableOpacity>
              </Card>
            )}
          </View>
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 5,
  },
  iconText: {
    fontSize: 28,
  },
  headerTitle: {
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    padding: 20,
    marginTop: -10,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  description: {
    opacity: 0.7,
    marginBottom: 16,
    lineHeight: 20,
  },
  deviceListContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  connectedCard: {
    padding: 20,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  deviceName: {
    textAlign: 'center',
    opacity: 0.5,
    fontSize: 12,
    marginBottom: 24,
  },
  actionButtons: {
    gap: 12,
  },
  mainActionButton: {
    backgroundColor: '#28a745',
  },
  outlineActionButton: {
    borderColor: '#28a745',
  },
  progressText: {
    marginTop: 12,
    textAlign: 'center',
  },
  disconnectButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  disconnectText: {
    color: '#28a745',
    fontWeight: '600',
    fontSize: 13,
  }
});
