import { PermissionsAndroid, Platform } from 'react-native';
import { connect, getAvailablePeers, initialize, startDiscoveringPeers } from 'react-native-wifi-p2p';
import { Connection, DiscoveredDevice, TransferPackage, TransferProgress, TransferProtocol } from '../../types/transfer';

export class WiFiProtocol implements TransferProtocol {
    private isInitialized = false;

    async initialize(): Promise<void> {
        if (!this.isInitialized) {
            if (Platform.OS === 'android') {
                await this.requestPermissions();
            }
            try {
                await initialize();
            } catch (e: any) {
                // Ignore "already initialized" error to support hot-reloading and re-mounting
                const msg = e?.message || '';
                if (msg.includes('initialized once') || msg.includes('already initialized')) {
                    console.log('WiFi P2P already initialized, continuing...');
                } else {
                    console.error('WiFi P2P Init Error:', e);
                    // Don't throw for now to allow UI to render even if P2P fails
                }
            }
            this.isInitialized = true;
        }
    }

    private async requestPermissions(): Promise<void> {
        try {
            const permissions = [
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            ];

            // Add NEARBY_WIFI_DEVICES for Android 13+
            if (typeof Platform.Version === 'number' && Platform.Version >= 33) {
                permissions.push(PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES);
            }

            const granted = await PermissionsAndroid.requestMultiple(permissions);
            console.log('WiFi P2P Permissions:', granted);
        } catch (err) {
            console.warn('Failed to request permissions:', err);
        }
    }

    async discover(): Promise<DiscoveredDevice[]> {
        await this.initialize();

        return new Promise((resolve, reject) => {
            startDiscoveringPeers()
                .then(() => {
                    // Wait a bit for discovery
                    setTimeout(async () => {
                        try {
                            const peers = await getAvailablePeers();
                            const devices: DiscoveredDevice[] = peers.devices.map(device => ({
                                id: device.deviceAddress,
                                name: device.deviceName,
                                type: 'wifi',
                                metadata: { ...device }
                            }));
                            resolve(devices);
                        } catch (e) {
                            reject(e);
                        }
                    }, 5000); // 5 sec scan
                })
                .catch(err => reject(err));
        });
    }

    async connect(device: DiscoveredDevice): Promise<Connection> {
        await this.initialize();

        return new Promise((resolve, reject) => {
            connect(device.id)
                .then(() => {
                    resolve({
                        deviceId: device.id,
                        method: 'wifi',
                        isConnected: true,
                        connectedAt: new Date()
                    });
                })
                .catch(err => reject(err));
        });
    }

    async send(data: TransferPackage, onProgress?: (progress: TransferProgress) => void): Promise<void> {
        // For WiFi P2P, we typically send files. 
        // We need to serialize the package to a file first.
        // This is a simplified implementation.
        const jsonString = JSON.stringify(data);
        // In real implementation: Write to file, then sendFile(path)
        console.log('Sending data via WiFi P2P:', jsonString.length, 'bytes');

        // Simulate progress for now as sendFile requires file path
        if (onProgress) {
            onProgress({
                transferId: data.transferId,
                bytesTransferred: jsonString.length,
                totalBytes: jsonString.length,
                percentage: 100,
                state: 'completed'
            });
        }
    }

    async receive(onProgress?: (progress: TransferProgress) => void): Promise<TransferPackage> {
        throw new Error('Receive not implemented yet');
    }

    async disconnect(): Promise<void> {
        // WiFi P2P disconnection logic
    }

    getConnectionStatus(): Connection | null {
        // Check internal state
        return null;
    }
}
