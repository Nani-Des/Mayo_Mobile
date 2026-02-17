import { LinearGradient } from 'expo-linear-gradient';
import { Alert, StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { USBTransfer } from '@/components/ui/usb-transfer';
import { useTransferStore } from '@/stores/transferStore';

export default function USBTransferScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleDataTransfer = (data: any) => {
    Alert.alert(
      'Transfer Complete',
      'Patient records have been successfully transferred via USB.',
      [{ text: 'OK' }]
    );
    console.log('USB Transfer Successful:', data);
  };

  const handleDisconnect = () => {
    Alert.alert('Disconnected', 'USB connection has been terminated. Security lock re-engaged.');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemedView style={styles.container}>
        <LinearGradient
          colors={['#ffc107', '#d39e00']}
          style={[styles.header, { paddingTop: insets.top + 60, paddingBottom: 30 }]}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <IconSymbol name="chevron.left" size={24} color="white" />
            </TouchableOpacity>
            <ThemedText type="hero" style={styles.headerTitle}>USB Transfer</ThemedText>
            <View style={{ width: 40 }} />
          </View>
          
          <View style={styles.headerIconContainer}>
            <View style={styles.iconCircle}>
              <IconSymbol name="cable.connector" size={32} color="#ffc107" />
            </View>
            <ThemedText style={styles.headerSubtitle}>Transfer data via USB cable connection</ThemedText>
          </View>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              USB Data Bridge
            </ThemedText>
            <ThemedText style={styles.description}>
              Connect your device to a computer via USB cable to transfer medical records securely.
            </ThemedText>

            <View style={styles.transferContainer}>
              <USBTransfer
                onDataTransfer={handleDataTransfer}
                isLocked={useTransferStore((s) => s.isLocked)}
                onDisconnect={() => {
                  // Clear handshake and call local disconnect handler
                  useTransferStore.getState().clearHandshake();
                  handleDisconnect();
                }}
              />
            </View>
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
  transferContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
