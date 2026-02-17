import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Alert, StyleSheet, View, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { QRGenerator } from '@/components/ui/qr-generator';
import { QRScanner } from '@/components/ui/qr-scanner';
import SyncService from '@/app/services/SyncService';
import { medicalRecordsAPI } from '@/lib/api/medical-records-api';
import { useTransferStore } from '@/stores/transferStore';

export default function QRTransferScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [scannedIp, setScannedIp] = useState<string | undefined>(undefined);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferProgress, setTransferProgress] = useState<number | null>(null);
  const handshake = useTransferStore((s) => s.handshake);
  
  // Use current user's data for transfer
  const { user } = useAuth();
  
  // For offline transfer, we don't need to load patient data from server
  // prepareRecordsForTransfer() will read directly from local SQLite
  // We just need to ensure user is authenticated to enable the button
  const isAuthenticated = !!user?.id;
  
  // Debug logging
  useEffect(() => {
    console.log('[QR Transfer]', {
      userId: user?.id,
      isAuthenticated,
      scannedIp,
      handshakeIp: handshake?.ip,
    });
  }, [user?.id, isAuthenticated, scannedIp, handshake?.ip]);

  const handleQRCodeScanned = (data: string, parsedIp?: string) => {
    if (parsedIp) {
      setScannedIp(parsedIp);
      // If the QR payload contained a token or other handshake metadata, store it globally
      try {
        const parsed = JSON.parse(data);
        const token = parsed.token || parsed.authToken || parsed.tok;
        const hospitalId = parsed.hospitalId || parsed.hospital_id || undefined;
        useTransferStore.getState().setHandshake({ ip: parsedIp, token, hospitalId });
      } catch (e) {
        // not JSON or no additional metadata; still set IP-only handshake
        useTransferStore.getState().setHandshake({ ip: parsedIp });
      }
      Alert.alert(
        'Connection Established',
        `Doctor Station recognized at ${parsedIp}.`,
        [{ text: 'Great' }]
      );
    } else {
      Alert.alert('Scan Result', 'QR code recognized but no connection details found.');
    }
    setShowQRScanner(false);
  };

    const handlePushData = async () => {
    console.log('[handlePushData] Starting - scannedIp:', scannedIp, 'isAuthenticated:', isAuthenticated, 'user:', user?.id);
    
    if (!scannedIp) {
      console.warn('[handlePushData] No scanned IP');
      Alert.alert('Error', 'Please scan a QR code first');
      return;
    }
    
    if (!isAuthenticated) {
      console.warn('[handlePushData] Not authenticated');
      Alert.alert('Error', 'Please log in first');
      return;
    }
    
    setIsTransferring(true);
    setTransferProgress(0);
    let progressInterval: any = null;
    try {
      // Use user ID as patient ID for local transfer
      // prepareRecordsForTransfer will read from local SQLite
      const patientId = user?.id || 'local-patient';
      console.log('[handlePushData] Preparing transfer for patientId:', patientId);
      
      const transferPackage = await medicalRecordsAPI.prepareRecordsForTransfer(patientId);
      console.log('[handlePushData] Transfer package prepared:', transferPackage);
      
      if (transferPackage.metadata) transferPackage.metadata.transferMethod = 'qr';

      progressInterval = setInterval(() => {
        setTransferProgress((p) => Math.min(95, (p || 0) + Math.floor(Math.random() * 10) + 5));
      }, 350);

      const headers: any = { 'Content-Type': 'application/json' };
      if (handshake?.token) headers['Authorization'] = `Bearer ${handshake.token}`;

      console.log('[handlePushData] Sending to:', `http://${scannedIp}:8444/api/sync/push`, 'headers:', Object.keys(headers));
      
      const response = await fetch(`http://${scannedIp}:8444/api/sync/push`, {
        method: 'POST',
        headers,
        body: JSON.stringify(transferPackage),
      });

      console.log('[handlePushData] Response status:', response.status);
      clearInterval(progressInterval);
      setTransferProgress(100);

      if (response.ok) {
        console.log('[handlePushData] Transfer successful');
        Alert.alert('Transfer Success', 'Your medical profile has been sent to the Doctor Station.');
      } else {
        const errorJson = await response.json().catch(() => ({}));
        console.error('[handlePushData] Server error:', errorJson);
        throw new Error(errorJson.message || `Server error (${response.status})`);
      }
    } catch (error: any) {
      if (progressInterval) clearInterval(progressInterval);
      setTransferProgress(null);
      console.error('[handlePushData] Error:', error);
      Alert.alert('Transfer Failed', error.message || 'Could not reach Doctor Station. Ensure you are on the same network.');
    } finally {
      setIsTransferring(false);
      setTimeout(() => setTransferProgress(null), 600);
    }
    };

    const handlePullData = async () => {
    if (!scannedIp) return;
    setIsTransferring(true);
    setTransferProgress(0);
    let progressInterval: any = null;
    try {
      progressInterval = setInterval(() => {
        setTransferProgress((p) => Math.min(98, (p || 0) + Math.floor(Math.random() * 12) + 3));
      }, 300);

      const headers: any = {};
      if (handshake?.token) headers['Authorization'] = `Bearer ${handshake.token}`;

      const response = await fetch(`http://${scannedIp}:8444/api/sync/pull`, {
        method: 'GET',
        headers,
      });

      const json = await response.json();
      clearInterval(progressInterval);
      setTransferProgress(100);

      if (response.ok && json.success) {
        await medicalRecordsAPI.saveReceivedRecords(json.data);
        Alert.alert('Sync Success', 'Latest updates and prescriptions received from the Doctor and saved locally.');
      } else {
        throw new Error(json.message || 'Server returned an error');
      }
    } catch (error: any) {
      if (progressInterval) clearInterval(progressInterval);
      setTransferProgress(null);
      Alert.alert('Sync Failed', error.message || 'Could not retrieve data from Doctor Station.');
    } finally {
      setIsTransferring(false);
      setTimeout(() => setTransferProgress(null), 600);
    }
    };

  // Full-screen QR Scanner view
  if (showQRScanner) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient
          colors={['#DC2626', '#991B1B']}
          style={[styles.header, { paddingTop: 60 }]}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => setShowQRScanner(false)} style={styles.backButton}>
              <IconSymbol name="xmark" size={24} color="white" />
            </TouchableOpacity>
            <ThemedText type="hero" style={styles.headerTitle}>Scan Doctor QR</ThemedText>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        <View style={styles.scanContent}>
          <Card variant="elevated" style={styles.scannerWrapper}>
            <QRScanner
              onQRCodeScanned={handleQRCodeScanned}
              onCancel={() => setShowQRScanner(false)}
            />
          </Card>
          <ThemedText style={styles.scanInstruction}>
            Position the QR code shown on the Doctor's screen within the frame.
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  // Full-screen QR Generator view
  if (showQRGenerator) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient
          colors={['#DC2626', '#991B1B']}
          style={[styles.header, { paddingTop: 60 }]}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => setShowQRGenerator(false)} style={styles.backButton}>
              <IconSymbol name="xmark" size={24} color="white" />
            </TouchableOpacity>
            <ThemedText type="hero" style={styles.headerTitle}>Your QR Code</ThemedText>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        <View style={styles.genContent}>
          <Card variant="elevated" style={styles.qrCard}>
            <QRGenerator
              data={JSON.stringify({
                userIds: [user?.id],
                patientId: user?.id,
                action: 'REQUEST_DATA',
              })}
              size={240}
            />
          </Card>
          <ThemedText style={styles.genInstruction}>
            Show this code to the doctor to begin the secure handshake.
          </ThemedText>
          <Button
            variant="secondary"
            title="Done"
            onPress={() => setShowQRGenerator(false)}
            style={{ marginTop: 40, width: '100%' }}
          />
        </View>
      </ThemedView>
    );
  }

  // Main QR Transfer screen
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#DC2626', '#991B1B']}
        style={[styles.header, { paddingTop: insets.top + 60, paddingBottom: 30 }]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color="white" />
          </TouchableOpacity>
          <ThemedText type="hero" style={styles.headerTitle}>QR Transfer</ThemedText>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={styles.headerIconContainer}>
          <View style={styles.iconCircle}>
            <IconSymbol name="qrcode" size={32} color="#DC2626" />
          </View>
          <ThemedText style={styles.headerSubtitle}>Secure Offline Handshake</ThemedText>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {scannedIp ? (
            <Card variant="elevated" style={styles.connectedCard}>
              <View style={styles.connectionStatus}>
                <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                <ThemedText type="defaultSemiBold">Connected to Station</ThemedText>
              </View>
              <ThemedText style={styles.ipText}>{scannedIp}</ThemedText>
              
              <View style={styles.actionButtons}>
                <Button 
                   title={isTransferring ? "Processing..." : "Push Records"}
                   onPress={handlePushData}
                   disabled={isTransferring || !scannedIp}
                   style={styles.mainActionButton}
                />
                <Button 
                   title={isTransferring ? "Syncing..." : "Pull Updates"}
                   onPress={handlePullData}
                   disabled={isTransferring || !scannedIp}
                   variant="outline"
                   style={styles.outlineActionButton}
                />
              </View>

              {transferProgress !== null ? (
                <ThemedText style={styles.progressText}>{`Progress: ${transferProgress}%`}</ThemedText>
              ) : isTransferring ? (
                <ActivityIndicator style={{ marginTop: 10 }} color="#DC2626" />
              ) : null}

              <TouchableOpacity onPress={() => setScannedIp(undefined)} style={styles.disconnectButton}>
                <ThemedText style={styles.disconnectText}>Disconnect</ThemedText>
              </TouchableOpacity>
            </Card>
          ) : (
            <>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Methods</ThemedText>
              <View style={styles.methodGrid}>
                <TouchableOpacity 
                   style={styles.methodButton} 
                   onPress={() => setShowQRGenerator(true)}
                >
                  <Card variant="elevated" style={styles.methodInner}>
                    <IconSymbol name="qrcode" size={28} color="#DC2626" />
                    <ThemedText type="defaultSemiBold" style={{ marginTop: 8 }}>My Code</ThemedText>
                  </Card>
                </TouchableOpacity>

                <TouchableOpacity 
                   style={styles.methodButton} 
                   onPress={() => setShowQRScanner(true)}
                >
                  <Card variant="elevated" style={styles.methodInner}>
                    <IconSymbol name="camera.fill" size={28} color="#DC2626" />
                    <ThemedText type="defaultSemiBold" style={{ marginTop: 8 }}>Scan Doctor</ThemedText>
                  </Card>
                </TouchableOpacity>
              </View>

              <Card variant="flat" style={styles.helpCard}>
                <ThemedText style={styles.helpText}>
                  Use QR Transfer when you are at the doctor's office. This establishes a secure, direct connection to the doctor's station for private data exchange.
                </ThemedText>
              </Card>
            </>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16 },
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
  headerTitle: { color: 'white' },
  headerIconContainer: { alignItems: 'center' },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '500' },
  scrollContent: { paddingBottom: 40 },
  content: { padding: 20 },
  sectionTitle: { marginBottom: 16 },
  methodGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  methodButton: { flex: 1 },
  methodInner: { padding: 20, alignItems: 'center' },
  helpCard: { padding: 16, backgroundColor: 'rgba(0,0,0,0.02)' },
  helpText: { fontSize: 13, lineHeight: 20, opacity: 0.7, textAlign: 'center' },
  
  scanContent: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  scannerWrapper: { width: '100%', height: 350, overflow: 'hidden' },
  scanInstruction: { marginTop: 24, textAlign: 'center', opacity: 0.6, paddingHorizontal: 40 },
  
  genContent: { flex: 1, padding: 40, alignItems: 'center', justifyContent: 'center' },
  qrCard: { padding: 20, backgroundColor: 'white' },
  genInstruction: { marginTop: 24, textAlign: 'center', opacity: 0.6 },
  
  connectedCard: { padding: 20 },
  connectionStatus: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  ipText: { textAlign: 'center', opacity: 0.5, fontSize: 12, marginBottom: 24 },
  actionButtons: { gap: 12 },
  mainActionButton: { backgroundColor: '#DC2626' },
  outlineActionButton: { borderColor: '#DC2626' },
  disconnectButton: { marginTop: 20, alignItems: 'center' },
  disconnectText: { color: '#DC2626', fontWeight: '600', fontSize: 13 },
  progressText: {
    marginTop: 12,
    textAlign: 'center',
  },
});
