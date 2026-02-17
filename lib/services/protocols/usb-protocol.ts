import { Connection, DiscoveredDevice, TransferPackage, TransferProgress, TransferProtocol } from '../../types/transfer';

export class USBProtocol implements TransferProtocol {
    private isConnected = false;

    async initialize(): Promise<void> {
        // detection logic
    }

    async discover(): Promise<DiscoveredDevice[]> {
        // USB doesn't strictly 'discover' like wireless, but detects attached accessories
        return [
            {
                id: 'usb-accessory',
                name: 'USB Accessory',
                type: 'usb',
                metadata: { status: 'waiting_for_connection' }
            }
        ];
    }

    async connect(device: DiscoveredDevice): Promise<Connection> {
        this.isConnected = true;
        return {
            deviceId: device.id,
            method: 'usb',
            isConnected: true,
            connectedAt: new Date()
        };
    }

    async send(data: TransferPackage, onProgress?: (progress: TransferProgress) => void): Promise<void> {
        console.log('Sending data via USB:', data);
    }

    async receive(onProgress?: (progress: TransferProgress) => void): Promise<TransferPackage> {
        throw new Error('USB Receive Not Implemented');
    }

    async disconnect(): Promise<void> {
        this.isConnected = false;
    }

    getConnectionStatus(): Connection | null {
        return this.isConnected ? {
            deviceId: 'usb-accessory',
            method: 'usb',
            isConnected: true,
            connectedAt: new Date()
        } : null;
    }
}
