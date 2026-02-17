import { LinearGradient } from 'expo-linear-gradient';
import { Alert, StyleSheet, View, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Stack, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WiFiDirectManager } from '@/components/ui/wifi-direct-manager';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import SyncService from '@/app/services/SyncService';
import { medicalRecordsAPI } from '@/lib/api/medical-records-api';
import { useTransferStore } from '@/stores/transferStore';
import { useEffect } from 'react';
import { transferService } from '@/lib/services/transfer-service';
import { HttpProtocol } from '@/lib/services/protocols/http-protocol';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function WiFiTransferScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [currentSession] = useState(SyncService.getMockPatientHistory());
  const [connectedIp, setConnectedIp] = useState<string | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferProgress, setTransferProgress] = useState<number | null>(null);
  const handshake = useTransferStore((s) => s.handshake);

  const handleConnected = (info: { ssid: string; ipAddress: string; handshake?: { token?: string; hospitalId?: string; deviceId?: string } }) => {
    setConnectedIp(info.ipAddress);
    // Persist any handshake returned by the Doctor Station
    if (info.handshake) {
      useTransferStore.getState().setHandshake({ ip: info.ipAddress, token: info.handshake.token, hospitalId: info.handshake.hospitalId, deviceId: info.handshake.deviceId });
    }
    Alert.alert(
        'Connection Established',
        `Connected to ${info.ssid} at ${info.ipAddress}. You can now transfer data.`,
        [{ text: 'OK' }]
    );
  };

  const handleDisconnected = () => {
    setConnectedIp(null);
    Alert.alert('Disconnected', 'WiFi connection has been terminated.');
  };

  const handlePushData = async () => {
    if (!connectedIp) {
        Alert.alert('Connection Required', 'Please connect to the Doctor Station IP first.');
        return;
    }
    setIsTransferring(true);
    setTransferProgress(0);

    try {
      const patientId = await medicalRecordsAPI.getCurrentPatientId();
      const transferPackage = await medicalRecordsAPI.prepareRecordsForTransfer(patientId);
      if (transferPackage.metadata) transferPackage.metadata.transferMethod = 'wifi';

      // Use transferService + HttpProtocol for the transfer
      const proto = new HttpProtocol();
      transferService.setProtocol(proto);
      await transferService.connect({ id: connectedIp, name: connectedIp, type: 'wifi', metadata: { ip: connectedIp } });

      const unsubscribe = transferService.onProgress((p) => {
        setTransferProgress(Math.round(p.percentage));
      });

      await transferService.send(transferPackage);
      unsubscribe();

      Alert.alert('Transfer Success', 'Patient records sent to Doctor Station.');
    } catch (error: any) {
      setTransferProgress(null);
      Alert.alert('Transfer Failed', error.message || 'Make sure server.js is running on your PC and Firewall allows access.');
    } finally {
      setIsTransferring(false);
      setTimeout(() => setTransferProgress(null), 600);
    }
  };

  const handlePullData = async () => {
    if (!connectedIp) {
        Alert.alert('Connection Required', 'Please connect to the Doctor Station IP first.');
        return;
    }
    setIsTransferring(true);
    setTransferProgress(0);
    try {
      const proto = new HttpProtocol();
      transferService.setProtocol(proto);
      await transferService.connect({ id: connectedIp, name: connectedIp, type: 'wifi', metadata: { ip: connectedIp } });

      const unsubscribe = transferService.onProgress((p) => setTransferProgress(Math.round(p.percentage)));

      const received = await transferService.receive();
      unsubscribe();

      await medicalRecordsAPI.saveReceivedRecords(received.data);
      Alert.alert('Sync Success', 'Updated records received from Doctor Station and saved locally.');
    } catch (error: any) {
      setTransferProgress(null);
      Alert.alert('Sync Failed', error.message || 'Could not retrieve data from Doctor Station.');
    } finally {
      setIsTransferring(false);
      setTimeout(() => setTransferProgress(null), 600);
    }
  };

    // Hydrate from handshake if available
    useEffect(() => {
    if (handshake?.ip && !connectedIp) {
      setConnectedIp(handshake.ip);
    }
    }, [handshake, connectedIp]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemedView style={styles.container}>
        <LinearGradient
          colors={['#0a7ea4', '#065a73']}
          style={[styles.header, { paddingTop: insets.top + 60, paddingBottom: 30 }]}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <IconSymbol name="chevron.left" size={24} color="white" />
            </TouchableOpacity>
            <ThemedText type="hero" style={styles.headerTitle}>WiFi Direct</ThemedText>
            <View style={{ width: 40 }} />
          </View>
          
          <View style={styles.headerIconContainer}>
            <View style={styles.iconCircle}>
              <IconSymbol name="wifi" size={32} color="#0a7ea4" />
            </View>
            <ThemedText style={styles.headerSubtitle}>Connect directly to a computer via WiFi</ThemedText>
          </View>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            WiFi Direct Connection
          </ThemedText>
          <ThemedText style={styles.description}>
            Enter the Doctor Station PC IP address to establish a direct WiFi connection for high-speed data transfer.
          </ThemedText>

          <View style={styles.managerContainer}>
            <WiFiDirectManager
              onConnected={handleConnected}
              onDisconnected={handleDisconnected}
              prefillIp={handshake?.ip}
            />
          </View>

          {connectedIp && (
              <Card variant="elevated" style={styles.connectedCard}>
                <View style={styles.connectionStatus}>
                  <View style={[styles.statusDot, { backgroundColor: '#0a7ea4' }]} />
                  <ThemedText type="defaultSemiBold">Connected to Station</ThemedText>
                </View>
                <ThemedText style={styles.ipText}>{connectedIp}</ThemedText>
                
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
                  <ActivityIndicator style={{ marginTop: 10 }} color="#0a7ea4" />
                ) : null}

                <TouchableOpacity onPress={() => setConnectedIp(null)} style={styles.disconnectButton}>
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
  managerContainer: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  actionCard: {
    padding: 16,
    marginTop: 10,
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
  ipText: {
    textAlign: 'center',
    opacity: 0.5,
    fontSize: 12,
    marginBottom: 24,
  },
  actionButtons: {
    gap: 12,
  },
  mainActionButton: {
    backgroundColor: '#0a7ea4',
  },
  outlineActionButton: {
    borderColor: '#0a7ea4',
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
    color: '#0a7ea4',
    fontWeight: '600',
    fontSize: 13,
  }
});

