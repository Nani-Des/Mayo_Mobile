import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

// Actually, let's keep the logic but replace the UI components with our new ones directly in this file for simplicity as per instructions to "apply styling".
// However, TransferMethodCard seems to be a custom component. Let's check it later. For now, I'll rewrite the screen to use our new Cards.

// Mock components replacement for simplicity in this artifact, assuming logic handles the rest
import { BLEDeviceList } from '@/components/ui/ble-device-list';
import { QRGenerator } from '@/components/ui/qr-generator';
import { QRScanner } from '@/components/ui/qr-scanner';
import { TransferProgress } from '@/components/ui/transfer-progress';
import { USBTransfer } from '@/components/ui/usb-transfer';
import { WiFiDirectManager } from '@/components/ui/wifi-direct-manager';

const { width } = Dimensions.get('window');

export default function DataTransferScreen() {
  const insets = useSafeAreaInsets();
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferProgress, setTransferProgress] = useState(0);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [versionInfo] = useState({
    currentVersion: 'v1.2.3',
    lastUpdated: '2025-12-08 14:30:00',
    deviceCount: 3,
  });

  const handleTransfer = (method: string) => {
    setSelectedMethod(method);
    if (method === 'QR Code') {
      setShowQRScanner(true);
      return;
    }
    setIsTransferring(true);
    setTransferProgress(0);
    // Simulating transfer logic preserved...
    const interval = setInterval(() => {
      setTransferProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTransferring(false);
          Alert.alert('Transfer Complete', `Data successfully transferred via ${method}`);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const methods = [
    { title: 'Bluetooth', desc: 'Nearby devices', icon: 'bluetooth', color: '#28a745' },
    { title: 'WiFi Direct', desc: 'High-speed P2P', icon: 'wifi', color: '#0a7ea4' },
    { title: 'USB Cable', desc: 'Direct connection', icon: 'cable.connector', color: '#ffc107' },
    { title: 'QR Code', desc: 'Scan to share', icon: 'qrcode', color: '#dc3545' },
  ];

  if (showQRScanner || showQRGenerator) {
    // Simplified view for QR modes to use new styling as well
    const isScan = showQRScanner;
    return (
      <ThemedView style={styles.container}>
        <LinearGradient
          colors={['#0284C7', '#0369A1']}
          style={[styles.header, { paddingTop: insets.top + 20 }]}
        >
          <ThemedText type="hero" style={styles.headerTitle}>{isScan ? 'Scan QR' : 'My Code'}</ThemedText>
          <ThemedText style={styles.headerSubtitle}>{isScan ? 'Align code within frame' : 'Show this to another device'}</ThemedText>
        </LinearGradient>
        <View style={styles.content}>
          <Card style={styles.qrContainer}>
            {isScan ? (
              <QRScanner onQRCodeScanned={(data) => { setShowQRScanner(false); Alert.alert('Scanned', data); }} onCancel={() => setShowQRScanner(false)} />
            ) : (
              <QRGenerator data="mayo-transfer-data" size={250} />
            )}
          </Card>
          <Button
            variant="secondary"
            title="Close"
            onPress={() => { setShowQRScanner(false); setShowQRGenerator(false); }}
            style={{ marginTop: 24 }}
          />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <LinearGradient
          colors={['#0284C7', '#0369A1']}
          style={[styles.header, { paddingTop: insets.top + 20 }]}
        >
          <View style={styles.iconCircle}>
            <IconSymbol name="arrow.triangle.swap" size={40} color="#0284C7" />
          </View>
          <ThemedText type="hero" style={styles.headerTitle}>Data Transfer</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Securely share records offline</ThemedText>
        </LinearGradient>

        <View style={styles.content}>

          {isTransferring ? (
            <Card style={styles.progressCard}>
              <ThemedText type="title">Sending...</ThemedText>
              <TransferProgress method={selectedMethod || ''} progress={transferProgress} />
            </Card>
          ) : (
            <View>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Transfer Methods</ThemedText>
              <View style={styles.grid}>
                {methods.map((m, i) => (
                  <TouchableOpacity key={i} style={styles.gridItem} onPress={() => handleTransfer(m.title)} activeOpacity={0.8}>
                    <Card variant="elevated" style={styles.methodCard}>
                      <View style={[styles.methodIcon, { backgroundColor: m.color + '20' }]}>
                        <IconSymbol name={m.icon as any} size={28} color={m.color} />
                      </View>
                      <ThemedText type="cardTitle" style={{ marginBottom: 4 }}>{m.title}</ThemedText>
                      <ThemedText type="caption">{m.desc}</ThemedText>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <ThemedText type="subtitle" style={styles.sectionTitle}>Nearby Devices</ThemedText>
          <Card variant="outlined" style={styles.deviceListCard}>
            <BLEDeviceList onDeviceSelected={(d) => Alert.alert('Selected', d.name)} />
          </Card>

          <View style={styles.row}>
            <Button
              title="Receive Data"
              icon="square.and.arrow.down"
              style={{ flex: 1, marginRight: 8 }}
              onPress={() => { }}
            />
            <Button
              variant="outline"
              title="Generate QR"
              icon="qrcode"
              style={{ flex: 1, marginLeft: 8 }}
              onPress={() => setShowQRGenerator(true)}
            />
          </View>

          <ThemedText type="subtitle" style={styles.sectionTitle}>Connection Status</ThemedText>
          <Card variant="flat" style={styles.statusCard}>
            <WiFiDirectManager onConnected={() => { }} onDisconnected={() => { }} />
            <View style={[styles.divider, { backgroundColor: borderColor }]} />
            <USBTransfer onDataTransfer={() => { }} />
          </Card>

          <View style={{ marginTop: 32, alignItems: 'center' }}>
            <ThemedText type="caption">Version: {versionInfo.currentVersion}</ThemedText>
            <ThemedText type="caption">Last Sync: {versionInfo.lastUpdated}</ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  content: {
    padding: 24,
    marginTop: -20,
  },
  sectionTitle: {
    marginBottom: 16,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: (width - 48 - 12) / 2,
  },
  methodCard: {
    padding: 16,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressCard: {
    padding: 32,
    alignItems: 'center',
  },
  deviceListCard: {
    padding: 0,
    overflow: 'hidden',
    minHeight: 100,
  },
  statusCard: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    marginVertical: 24,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  qrContainer: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
});