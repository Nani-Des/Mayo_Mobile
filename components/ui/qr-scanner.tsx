import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Vibration } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface QRScannerProps {
  onQRCodeScanned: (data: string, parsedIp?: string) => void;
  onCancel: () => void;
}

export function QRScanner({ onQRCodeScanned, onCancel }: QRScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    Vibration.vibrate(100); // Haptic feedback for the user

    let parsedIp: string | undefined;

    try {
      const parsed = JSON.parse(data);
      
      // Match the JSON structure we built in the Browser (server.js / doctor's.html)
      // { "ip": "192.168.x.x", "token": "...", "instruction": "..." }
      const rawIp = parsed.ip ?? null;

      // Validate IP format (simple regex)
      if (rawIp && /^\d{1,3}(\.\d{1,3}){3}$/.test(rawIp)) {
        parsedIp = rawIp;
      }
    } catch (e) {
      console.log("QR is not JSON, checking for raw IP string...");
      // Fallback: If it's just a raw IP string
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(data.trim())) {
        parsedIp = data.trim();
      }
    }

    onQRCodeScanned(data, parsedIp);
  };

  if (hasPermission === null) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Requesting camera permission…</ThemedText>
      </ThemedView>
    );
  }

  if (hasPermission === false) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={{ color: 'red' }}>No access to camera</ThemedText>
        <TouchableOpacity style={styles.button} onPress={onCancel}>
          <ThemedText style={styles.buttonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Secure Link Scanner</ThemedText>
      <ThemedText style={styles.instructions}>
        Align the Doctor's QR code within the frame to sync IP automatically.
      </ThemedText>

      <View style={styles.cameraOuterBorder}>
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          />
          {/* Scanning Overlay UI */}
          <View style={styles.overlay}>
             <View style={[styles.corner, styles.topLeft]} />
             <View style={[styles.corner, styles.topRight]} />
             <View style={[styles.corner, styles.bottomLeft]} />
             <View style={[styles.corner, styles.bottomRight]} />
             
             {/* Animating scan line would go here */}
             <View style={styles.scanLine} />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#444' }]} 
          onPress={onCancel}
        >
          <ThemedText style={styles.buttonText}>Cancel</ThemedText>
        </TouchableOpacity>
        
        {scanned && (
          <TouchableOpacity 
            style={[styles.button, { marginLeft: 10 }]} 
            onPress={() => setScanned(false)}
          >
            <ThemedText style={styles.buttonText}>Try Again</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#0284c7' },
  instructions: { textAlign: 'center', marginBottom: 30, opacity: 0.7, fontSize: 14 },
  cameraOuterBorder: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
    backgroundColor: '#1a1a1a'
  },
  cameraContainer: {
    width: 280,
    height: 280,
    overflow: 'hidden',
    borderRadius: 12,
    position: 'relative',
  },
  camera: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, padding: 40 },
  scanLine: {
    height: 2,
    backgroundColor: '#0284c7',
    width: '100%',
    position: 'absolute',
    top: '50%',
    opacity: 0.5,
    shadowColor: "#0284c7",
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#0284c7',
  },
  topLeft: { top: 20, left: 20, borderTopWidth: 4, borderLeftWidth: 4 },
  topRight: { top: 20, right: 20, borderTopWidth: 4, borderRightWidth: 4 },
  bottomLeft: { bottom: 20, left: 20, borderBottomWidth: 4, borderLeftWidth: 4 },
  bottomRight: { bottom: 20, right: 20, borderBottomWidth: 4, borderRightWidth: 4 },
  footer: { flexDirection: 'row', marginTop: 30 },
  button: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buttonText: { color: 'white', fontWeight: '600' },
});