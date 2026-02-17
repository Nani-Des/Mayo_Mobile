import { LinearGradient } from 'expo-linear-gradient';
<<<<<<< HEAD
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
=======
import { useEffect, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
>>>>>>> 86deab5da16b4bac244d489615a4f80ec156f5d9
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
<<<<<<< HEAD
=======
import { useThemeColor } from '@/hooks/use-theme-color';

import { BLEDeviceList } from '@/components/ui/ble-device-list';
import { QRGenerator } from '@/components/ui/qr-generator';
import { QRScanner } from '@/components/ui/qr-scanner';
import { USBTransfer } from '@/components/ui/usb-transfer';
import { WiFiDirectManager } from '@/components/ui/wifi-direct-manager';
import { SyncService } from '@/lib/services/sync-service';
>>>>>>> 86deab5da16b4bac244d489615a4f80ec156f5d9

const { width } = Dimensions.get('window');

export default function DataTransferScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const transferMethods = [
        { 
            title: 'QR Code', 
            icon: 'qrcode', 
            color: '#DC2626',
            route: '/transfer-qr'
        },
        { 
            title: 'Bluetooth', 
            icon: 'antenna.radiowaves.left.and.right', 
            color: '#2563EB',
            route: '/transfer-ble'
        },
        { 
            title: 'WiFi Direct', 
            icon: 'wifi', 
            color: '#0D9488',
            route: '/transfer-wifi'
        },
        { 
            title: 'NFC Tap', 
            icon: 'sensor.tag.radiowaves.forward', 
            color: '#7C3AED',
            route: '/transfer-nfc'
        },
    ];

<<<<<<< HEAD
    const handleMethodPress = (route: string) => {
        router.push(route as any);
    };

=======
    // SECURITY STATES
    const [isHandshakeComplete, setIsHandshakeComplete] = useState(false);
    const [connectedPcIp, setConnectedPcIp] = useState<string | null>(null);

    // IP extracted from QR scan — passed to WiFiDirectManager to auto-fill the input
    const [scannedIp, setScannedIp] = useState<string | undefined>(undefined);

    const [currentSession, setCurrentSession] = useState<any>(null);
    const [selectedMethod, setSelectedMethod] = useState<'wifi' | 'usb' | 'ble' | 'qr'>('wifi');

    useEffect(() => {
        const loadInitData = async () => {
            try {
                const data = await SyncService.exportPatientData('p-123');
                setCurrentSession(data);
            } catch (e) { console.error(e); }
        };
        loadInitData();
    }, []);

    const handleGenerateQR = () => {
        setShowQRGenerator(true);
    };

    const handleResetSecurity = () => {
        setIsHandshakeComplete(false);
        setConnectedPcIp(null);
        Alert.alert('Security Locked', 'Connection severed. Handshake required to resume.');
    };

    // Send patient records to the connected Doctor Station PC
    const handlePushData = async () => {
        if (!connectedPcIp) {
            Alert.alert('Connection Required', 'Please connect to the Doctor Station IP first.');
            return;
        }

        if (!currentSession) {
            Alert.alert('Loading', 'Data not ready yet');
            return;
        }

        try {
            const response = await fetch(`http://${connectedPcIp}:3000/transfer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentSession),
            });

            if (response.ok) {
                Alert.alert('Transfer Success', 'Patient records sent to Doctor Station.');
            } else {
                throw new Error('Server returned an error');
            }
        } catch (error) {
            Alert.alert('Transfer Failed', 'Make sure server.js is running on your PC.');
        }
    };

    // --- QR Full-Screen Views ---
    if (showQRScanner || showQRGenerator) {
        const isScan = showQRScanner;
        return (
            <ThemedView style={styles.container}>
                <LinearGradient
                    colors={['#0284C7', '#0369A1']}
                    style={[styles.header, { paddingTop: insets.top + 20 }]}
                >
                    <ThemedText type="hero" style={styles.headerTitle}>
                        {isScan ? 'Scan Doctor QR' : 'Doctor Handshake'}
                    </ThemedText>
                    <ThemedText style={styles.headerSubtitle}>
                        {isScan ? "Point at the QR on the Doctor's PC" : 'Let the doctor scan this code'}
                    </ThemedText>
                </LinearGradient>

                <View style={styles.content}>
                    <Card style={styles.qrContainer}>
                        {isScan ? (
                            <QRScanner
                                onQRCodeScanned={(data, parsedIp) => {
                                    // Prevent multiple triggers
                                    if (scannedIp) return;

                                    if (parsedIp) {
                                        setScannedIp(parsedIp);
                                        setConnectedPcIp(parsedIp); // Store active connection
                                        setIsHandshakeComplete(true); // Unlock USB immediately
                                    }

                                    // Close scanner shortly after
                                    setTimeout(() => setShowQRScanner(false), 150);
                                }}
                                onCancel={() => setShowQRScanner(false)}
                            />
                        ) : (
                            <QRGenerator
                                data={JSON.stringify({
                                    token: currentSession?.transferId || 'loading',
                                    id: currentSession?.patientId || 'p-123',
                                    instruction: 'SCAN_TO_PULL',
                                })}
                                size={250}
                            />
                        )}
                    </Card>

                    {/* Hint text instead of alerts */}
                    {scannedIp && (
                        <ThemedText style={styles.ipHint}>
                            ✓ Doctor Station IP auto-filled: {scannedIp}. USB bridge unlocked.
                        </ThemedText>
                    )}

                    <Button
                        variant="secondary"
                        title="Close"
                        onPress={() => {
                            setShowQRScanner(false);
                            setShowQRGenerator(false);
                        }}
                        style={{ marginTop: 24 }}
                    />
                </View>
            </ThemedView>
        );
    }

    // --- Main Screen ---
>>>>>>> 86deab5da16b4bac244d489615a4f80ec156f5d9
    return (
        <ThemedView style={styles.container}>
            <LinearGradient
                colors={['#0284C7', '#0369A1']}
                style={[styles.header, { paddingTop: insets.top + 20 }]}
            >
                <View style={styles.iconCircle}>
                    <IconSymbol name="arrow.triangle.swap" size={32} color="#0284C7" />
                </View>
                <ThemedText type="hero" style={styles.headerTitle}>Data Transfer</ThemedText>
                <ThemedText style={styles.headerSubtitle}>Securely share records offline</ThemedText>
            </LinearGradient>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <View style={styles.content}>
                    {/* Transfer Method Grid */}
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Select Transfer Method</ThemedText>
                    <ThemedText style={styles.description}>
                        Choose a method to securely transfer your medical records to a Doctor's workstation.
                    </ThemedText>
                    
                    <View style={styles.grid}>
<<<<<<< HEAD
                        {transferMethods.map((method, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={styles.gridItem} 
                                activeOpacity={0.8}
                                onPress={() => handleMethodPress(method.route)}
                            >
                                <Card variant="elevated" style={styles.methodCard}>
                                    <View style={[styles.methodIcon, { backgroundColor: method.color + '15' }]}>
                                        <IconSymbol name={method.icon as any} size={28} color={method.color} />
=======
                        {[
                            { id: 'ble', title: 'Bluetooth', icon: 'bluetooth', color: '#28a745' },
                            { id: 'wifi', title: 'WiFi Direct', icon: 'wifi', color: '#0a7ea4' },
                            { id: 'usb', title: 'USB Cable', icon: 'cable.connector', color: '#ffc107' },
                            { id: 'qr', title: 'QR Code', icon: 'qrcode', color: '#dc3545' },
                        ].map((m, i) => (
                            <TouchableOpacity
                                key={i}
                                style={styles.gridItem}
                                activeOpacity={0.8}
                                onPress={() => setSelectedMethod(m.id as any)}
                            >
                                <Card
                                    variant={selectedMethod === m.id ? 'elevated' : 'outlined'}
                                    style={[
                                        styles.methodCard,
                                        selectedMethod === m.id && { borderColor: m.color, borderWidth: 2 }
                                    ]}
                                >
                                    <View style={[styles.methodIcon, { backgroundColor: m.color + '20' }]}>
                                        <IconSymbol name={m.icon as any} size={28} color={m.color} />
>>>>>>> 86deab5da16b4bac244d489615a4f80ec156f5d9
                                    </View>
                                    <ThemedText type="defaultSemiBold" style={styles.methodTitle}>{method.title}</ThemedText>
                                </Card>
                            </TouchableOpacity>
                        ))}
                    </View>

<<<<<<< HEAD
                    {/* Info Card */}
                    <Card variant="flat" style={styles.infoCard}>
                        <View style={styles.infoContent}>
                            <IconSymbol name="info.circle.fill" size={20} color="#0284C7" />
                            <ThemedText type="defaultSemiBold" style={styles.infoTitle}>How it works</ThemedText>
                        </View>
                        <ThemedText style={styles.infoText}>
                            1. Select a transfer method above{"\n"}
                            2. Establish a connection with the Doctor's PC{"\n"}
                            3. Select the records you wish to share{"\n"}
                            4. Confirm the secure transmission
                        </ThemedText>
                    </Card>
=======
                    {/* Dynamic Content Based on Selection */}
                    {selectedMethod === 'ble' && (
                        <>
                            <ThemedText type="subtitle" style={styles.sectionTitle}>Nearby Devices</ThemedText>
                            <Card variant="outlined" style={styles.deviceListCard}>
                                <BLEDeviceList onDeviceSelected={(d) => Alert.alert('Selected', d.name)} />
                            </Card>
                        </>
                    )}

                    {(selectedMethod === 'wifi' || selectedMethod === 'usb') && (
                        <>
                            {/* Step 1: Secure Handshake */}
                            <ThemedText type="subtitle" style={styles.sectionTitle}>1. Secure Handshake</ThemedText>
                            <View style={styles.row}>
                                <Button
                                    variant="outline"
                                    title={isHandshakeComplete ? 'Verified ✓' : 'Show My QR'}
                                    icon="qrcode"
                                    style={{ flex: 1, marginRight: 8 }}
                                    onPress={handleGenerateQR}
                                />
                                <Button
                                    variant="outline"
                                    title={scannedIp ? `IP: ${scannedIp}` : 'Scan Doctor QR'}
                                    icon="camera"
                                    style={{ flex: 1 }}
                                    onPress={() => setShowQRScanner(true)}
                                />
                            </View>

                            {/* Step 2: Establish Bridge */}
                            <ThemedText type="subtitle" style={styles.sectionTitle}>2. Establish Bridge</ThemedText>
                            <Card variant="flat" style={styles.statusCard}>
                                {selectedMethod === 'wifi' && (
                                    <WiFiDirectManager
                                        prefillIp={scannedIp}
                                        onConnected={(info) => {
                                            setConnectedPcIp(info.ipAddress);
                                            setIsHandshakeComplete(true);
                                        }}
                                        onDisconnected={handleResetSecurity}
                                    />
                                )}

                                {selectedMethod === 'usb' && (
                                    <USBTransfer
                                        isLocked={!isHandshakeComplete}
                                        onDisconnect={handleResetSecurity}
                                        onDataTransfer={(data) => console.log('USB Transfer Successful:', data)}
                                    />
                                )}
                            </Card>

                            {/* Step 3: Push Data */}
                            <ThemedText type="subtitle" style={styles.sectionTitle}>3. Push Data</ThemedText>
                            <Card variant="elevated" style={styles.statusCard}>
                                <Button
                                    title="PUSH RECORDS TO PC"
                                    disabled={!isHandshakeComplete}
                                    onPress={handlePushData}
                                    style={{ backgroundColor: isHandshakeComplete ? '#28a745' : '#ccc' }}
                                />
                                <ThemedText style={styles.note}>
                                    {isHandshakeComplete
                                        ? `Ready to transfer${connectedPcIp ? ` → ${connectedPcIp}` : ''}`
                                        : 'Complete handshake & bridge first'}
                                </ThemedText>
                            </Card>
                        </>
                    )}

                    {selectedMethod === 'qr' && (
                        <View style={{ alignItems: 'center', marginTop: 20 }}>
                            <Button
                                title="Generate Static QR"
                                onPress={handleGenerateQR}
                                style={{ width: '100%' }}
                            />
                        </View>
                    )}
>>>>>>> 86deab5da16b4bac244d489615a4f80ec156f5d9
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingBottom: 30,
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
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 8,
    },
    headerTitle: { color: 'white', marginBottom: 4 },
    headerSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '500' },
    content: { padding: 24 },
    sectionTitle: { marginBottom: 8 },
    description: { opacity: 0.6, marginBottom: 24, lineHeight: 20 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    gridItem: { width: (width - 48 - 12) / 2 },
    methodCard: { padding: 20, height: 140, justifyContent: 'center', alignItems: 'center' },
    methodIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    methodTitle: {
        fontSize: 14,
    },
    infoCard: { padding: 20, backgroundColor: 'rgba(2, 132, 199, 0.05)' },
    infoContent: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    infoTitle: { color: '#0284C7' },
    infoText: { lineHeight: 26, opacity: 0.7, fontSize: 13 },
});
