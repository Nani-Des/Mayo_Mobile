import { StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface QRGeneratorProps {
  data: string;
  size?: number;
}

export function QRGenerator({ data, size = 200 }: QRGeneratorProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Share via QR Code</ThemedText>
      <ThemedText style={styles.instructions}>
        Show this QR code to another device to initiate transfer
      </ThemedText>
      
      <View style={styles.qrContainer}>
        <QRCode
          value={data}
          size={size}
          color="#000"
          backgroundColor="#fff"
        />
      </View>
      
      <ThemedText style={styles.note}>
        This QR code contains encrypted transfer information
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  instructions: {
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.8,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 20,
  },
  note: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.7,
    textAlign: 'center',
  },
});