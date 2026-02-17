import { LinearGradient } from 'expo-linear-gradient';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';

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

    const handleMethodPress = (route: string) => {
        router.push(route as any);
    };

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
                                    </View>
                                    <ThemedText type="defaultSemiBold" style={styles.methodTitle}>{method.title}</ThemedText>
                                </Card>
                            </TouchableOpacity>
                        ))}
                    </View>

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
