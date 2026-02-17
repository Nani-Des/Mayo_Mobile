import { BleManager, Device, Subscription } from 'react-native-ble-plx';
import { TransferProtocol, DiscoveredDevice, Connection, TransferPackage, TransferProgress } from '@/lib/types/transfer';
import { Buffer } from 'buffer';
import { ensureBLEPermissions } from '@/lib/services/ble-permissions';
import { Platform } from 'react-native';

// Note: this implementation requires 'react-native-ble-plx' and a buffer polyfill ('buffer').
// Install: npm install react-native-ble-plx buffer

export class BLEPlxProtocol implements TransferProtocol {
  private manager: BleManager;
  private connectedDevice: Device | null = null;
  private notifySubscription: Subscription | null = null;
  private receiveBuffer: Buffer = Buffer.alloc(0);

  constructor() {
    try {
      this.manager = new BleManager();
    } catch (e) {
      // If native module missing, throw descriptive error so caller can show fallback UX
      throw new Error('react-native-ble-plx native module not available. Ensure it is installed and linked.');
    }
  }

  constructor() {
    this.manager = new BleManager();
  }

  async discover(): Promise<DiscoveredDevice[]> {
    const ok = await ensureBLEPermissions();
    if (!ok) throw new Error('BLE permissions not granted');

    const discovered: Record<string, DiscoveredDevice> = {};

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        try { this.manager.stopDeviceScan(); } catch (e) {}
        resolve(Object.values(discovered));
      }, 4000);

      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          clearTimeout(timeout);
          try { this.manager.stopDeviceScan(); } catch (e) {}
          reject(error);
          return;
        }

        if (!device || !device.id) return;
        discovered[device.id] = { id: device.id, name: device.name || device.id, type: 'bluetooth', rssi: device.rssi ?? undefined, metadata: {} };
      });
    });
  }

  async connect(device: DiscoveredDevice): Promise<Connection> {
    const ok = await ensureBLEPermissions();
    if (!ok) throw new Error('BLE permissions not granted');

    // Connect via react-native-ble-plx Device id
    const dev = await this.manager.connectToDevice(device.id);
    await dev.discoverAllServicesAndCharacteristics();
    this.connectedDevice = dev;
    // reset receive buffer on new connection
    this.receiveBuffer = Buffer.alloc(0);
    return { deviceId: dev.id, method: 'bluetooth', isConnected: true, connectedAt: new Date() };
  }

  async send(data: TransferPackage, onProgress?: (p: TransferProgress) => void): Promise<void> {
    if (!this.connectedDevice) throw new Error('Not connected');

    // Require service/characteristic UUIDs to be provided by the other side (metadata)
    // Prefer metadata on TransferPackage or connectedDevice.metadata (if available)
    const svcUuid = (data.metadata as any)?.serviceUuid || (this.connectedDevice?.serviceUUIDs && this.connectedDevice.serviceUUIDs[0]);
    const charUuid = (data.metadata as any)?.writeCharacteristicUuid;
    if (!svcUuid || !charUuid) throw new Error('Write characteristic UUID not provided. Ensure device advertises or metadata includes service/characteristic.');

    // Implement length-prefixed framing: 8-byte ASCII length header followed by payload
    const payload = JSON.stringify(data);
    const payloadBuf = Buffer.from(payload, 'utf8');
    const total = payloadBuf.length;
    const header = Buffer.from(String(total).padStart(8, '0'), 'utf8');
    const framed = Buffer.concat([header, payloadBuf]);

    const chunkSize = Platform.OS === 'android' ? 512 : 128; // conservative for iOS
    let offset = 0;
    const transferId = data.transferId;

    while (offset < framed.length) {
      const end = Math.min(framed.length, offset + chunkSize);
      const chunkBuf = framed.slice(offset, end);
      const b64 = chunkBuf.toString('base64');
      await this.connectedDevice!.writeCharacteristicWithResponseForService(svcUuid, charUuid, b64);
      offset = end;
      const pct = Math.round((offset / framed.length) * 100);
      onProgress?.({ transferId, bytesTransferred: offset, totalBytes: framed.length, percentage: pct, state: 'transferring' });
    }

    onProgress?.({ transferId, bytesTransferred: framed.length, totalBytes: framed.length, percentage: 100, state: 'completed' });
  }

  async receive(onProgress?: (p: TransferProgress) => void): Promise<TransferPackage> {
    if (!this.connectedDevice) throw new Error('Not connected');

    // Require a read/notify characteristic UUID
    const svcUuid = undefined as string | undefined; // could be configured
    const notifyChar = undefined as string | undefined;
    if (!notifyChar || !svcUuid) throw new Error('Receive characteristic UUID not configured for BLE receive');

    // Subscribe to notifications and accumulate framed chunks using length-prefix
    return new Promise((resolve, reject) => {
      let expectedLen: number | null = null;
      let transferred = 0;

      this.notifySubscription = this.connectedDevice!.monitorCharacteristicForService(svcUuid, notifyChar, (error, characteristic) => {
        if (error) {
          reject(error);
          return;
        }
        const base64 = characteristic?.value || '';
        const chunkBuf = Buffer.from(base64, 'base64');
        this.receiveBuffer = Buffer.concat([this.receiveBuffer, chunkBuf]);
        transferred = this.receiveBuffer.length;
        onProgress?.({ transferId: `ble-pull-${Date.now()}`, bytesTransferred: transferred, totalBytes: 0, percentage: 0, state: 'transferring' });

        // Read header when available
        if (expectedLen === null && this.receiveBuffer.length >= 8) {
          const header = this.receiveBuffer.slice(0, 8).toString('utf8');
          const parsed = parseInt(header, 10);
          if (!isNaN(parsed)) expectedLen = parsed;
        }

        if (expectedLen !== null && this.receiveBuffer.length >= 8 + expectedLen) {
          const payloadBuf = this.receiveBuffer.slice(8, 8 + expectedLen);
          // remove processed bytes from buffer
          this.receiveBuffer = this.receiveBuffer.slice(8 + expectedLen);
          try {
            const payloadStr = payloadBuf.toString('utf8');
            const parsedPkg = JSON.parse(payloadStr) as TransferPackage;
            onProgress?.({ transferId: `ble-pull-${Date.now()}`, bytesTransferred: expectedLen, totalBytes: expectedLen, percentage: 100, state: 'completed' });
            resolve(parsedPkg);
          } catch (e) {
            reject(new Error('Failed to parse received BLE payload'));
          }
        }
      });
    });
  }

  async disconnect(): Promise<void> {
    try {
      if (this.notifySubscription) {
        this.notifySubscription.remove();
        this.notifySubscription = null;
      }
    } catch (e) {}
    try {
      if (this.connectedDevice) await this.manager.cancelDeviceConnection(this.connectedDevice.id);
    } finally {
      this.connectedDevice = null;
    }
  }

  getConnectionStatus(): Connection | null {
    if (!this.connectedDevice) return null;
    return { deviceId: this.connectedDevice.id, method: 'bluetooth', isConnected: true, connectedAt: new Date() };
  }
}

export default BLEPlxProtocol;
