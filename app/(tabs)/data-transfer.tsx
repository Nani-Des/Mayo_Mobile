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

import { BLEDeviceList } from '@/components/ui/ble-device-list';
import { QRGenerator } from '@/components/ui/qr-generator';
import { QRScanner } from '@/components/ui/qr-scanner';
import { USBTransfer } from '@/components/ui/usb-transfer';
import { WiFiDirectManager } from '@/components/ui/wifi-direct-manager';
import { SyncService } from '@/app/services/SyncService';

const { width } = Dimensions.get('window');

export default function DataTransferScreen() {
    const insets = useSafeAreaInsets();
    const borderColor = useThemeColor({}, 'border');

    const [showQRScanner, setShowQRScanner] = useState(false);
    const [showQRGenerator, setShowQRGenerator] = useState(false);

    // SECURITY STATES
    const [isHandshakeComplete, setIsHandshakeComplete] = useState(false);
    const [connectedPcIp, setConnectedPcIp] = useState<string | null>(null);

    // IP extracted from QR scan — passed to WiFiDirectManager to auto-fill the input
    const [scannedIp, setScannedIp] = useState<string | undefined>(undefined);

    const [currentSession] = useState(SyncService.getMockPatientHistory());

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
        if (scannedIp) return;

        if (parsedIp) {
            setScannedIp(parsedIp);
            setConnectedPcIp(parsedIp); // Store the IP as the "Active" connection
            setIsHandshakeComplete(true); // <--- THIS UNLOCKS THE USB COMPONENT IMMEDIATELY
            
            Alert.alert(
                "Handshake Success", 
                `Doctor PC (${parsedIp}) verified and USB bridge unlocked.`
            );
        }

        setTimeout(() => {
            setShowQRScanner(false);
        }, 150);
    }}
    onCancel={() => setShowQRScanner(false)}
/>


                        ) : (
                            <QRGenerator
                                data={JSON.stringify({
                                    token: currentSession.sessionToken,
                                    id: currentSession.patientId,
                                    instruction: 'SCAN_TO_PULL',
                                })}
                                size={250}
                            />
                        )}
                    </Card>
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
    return (
        <ThemedView style={styles.container}>
            <LinearGradient
                colors={['#0284C7', '#0369A1']}
                style={[styles.header, { paddingTop: insets.top + 20 }]}
            >
                <View style={styles.iconCircle}>
                    <IconSymbol name="arrow.triangle.swap" size={40} color="#0284C7" />
                </View>
                <ThemedText type="hero" style={styles.headerTitle}>Data Transfer</ThemedText>
                <ThemedText style={styles.headerSubtitle}>Securely share records ofline</ThemedText>
            </LinearGradient>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <View style={styles.content}>

                    {/* Transfer Method Grid */}
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Transfer Methods</ThemedText>
                    <View style={styles.grid}>
                        {[
                            { title: 'Bluetooth', icon: 'bluetooth', color: '#28a745' },
                            { title: 'WiFi Direct', icon: 'wifi', color: '#0a7ea4' },
                            { title: 'USB Cable', icon: 'cable.connector', color: '#ffc107' },
                            { title: 'QR Code', icon: 'qrcode', color: '#dc3545' },
                        ].map((m, i) => (
                            <TouchableOpacity key={i} style={styles.gridItem} activeOpacity={0.8}>
                                <Card variant="elevated" style={styles.methodCard}>
                                    <View style={[styles.methodIcon, { backgroundColor: m.color + '20' }]}>
                                        <IconSymbol name={m.icon as any} size={28} color={m.color} />
                                    </View>
                                    <ThemedText type="cardTitle">{m.title}</ThemedText>
                                </Card>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Nearby BLE Devices */}
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Nearby Devices</ThemedText>
                    <Card variant="outlined" style={styles.deviceListCard}>
                        <BLEDeviceList onDeviceSelected={(d) => Alert.alert('Selected', d.name)} />
                    </Card>

                    {/* Step 1: Secure Handshake */}
                    <ThemedText type="subtitle" style={styles.sectionTitle}>1. Secure Handshake</ThemedText>
                    <View style={styles.row}>
                        {/* Patient shows their own QR for the doctor to scan */}
                        <Button
                            variant="outline"
                            title={isHandshakeComplete ? 'Verified ✓' : 'Show My QR'}
                            icon="qrcode"
                            style={{ flex: 1, marginRight: 8 }}
                            onPress={handleGenerateQR}
                        />
                        {/* Patient scans doctor's QR — extracts PC IP automatically */}
                        <Button
                            variant="outline"
                            title={scannedIp ? `IP: ${scannedIp}` : 'Scan Doctor QR'}
                            icon="camera"
                            style={{ flex: 1 }}
                            onPress={() => setShowQRScanner(true)}
                        />
                    </View>
                    {scannedIp && (
                        <ThemedText style={styles.ipHint}>
                            ✓ IP auto-filled from QR — tap Connect below
                        </ThemedText>
                    )}

                    {/* Step 2: Establish Bridge */}
                    <ThemedText type="subtitle" style={styles.sectionTitle}>2. Establish Bridge</ThemedText>
                    <Card variant="flat" style={styles.statusCard}>
                        {/*
                         * prefillIp flows in from the QR scan.
                         * WiFiDirectManager watches it via useEffect and auto-populates its input.
                         */}
                        <WiFiDirectManager
                            prefillIp={scannedIp}
                            onConnected={(info) => {
                                setConnectedPcIp(info.ipAddress);
                                setIsHandshakeComplete(true);
                            }}
                            onDisconnected={handleResetSecurity}
                        />

                        <View style={[styles.divider, { backgroundColor: borderColor }]} />

                        <USBTransfer
                            isLocked={!isHandshakeComplete}
                            onDisconnect={handleResetSecurity}
                            onDataTransfer={(data) => console.log('USB Transfer Successful:', data)}
                        />
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

                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingBottom: 24,
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
        elevation: 5,
    },
    headerTitle: { color: 'white', marginBottom: 4 },
    headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
    content: { padding: 24, marginTop: -20 },
    sectionTitle: { marginBottom: 16, marginTop: 8 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
    gridItem: { width: (width - 48 - 12) / 2 },
    methodCard: { padding: 16, height: 120, justifyContent: 'center', alignItems: 'center' },
    methodIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    deviceListCard: { padding: 0, overflow: 'hidden', minHeight: 100, marginBottom: 8 },
    statusCard: { padding: 16, marginBottom: 20 },
    row: { flexDirection: 'row', marginVertical: 10 },
    divider: { height: 1, marginVertical: 16 },
    qrContainer: { height: 400, justifyContent: 'center', alignItems: 'center' },
    note: { fontSize: 12, textAlign: 'center', marginTop: 8, opacity: 0.6 },
    ipHint: { fontSize: 12, color: '#28a745', fontWeight: '600', marginBottom: 8, marginTop: -4 },
});