import { TransferProtocol, DiscoveredDevice, Connection, TransferPackage, TransferProgress } from '@/lib/types/transfer';

/**
 * BLEProtocol
 *
 * Lightweight, offline-friendly BLE protocol stub used by the app UI.
 * This implementation simulates discovery/connect/send/receive for local
 * Bluetooth transfers. Replace with a native BLE implementation later.
 */
export class BLEProtocol implements TransferProtocol {
  private connection: Connection | null = null;

  async discover(): Promise<DiscoveredDevice[]> {
    // Simulated discovery: return a small set of likely doctor station devices
    await new Promise((r) => setTimeout(r, 800));
    return [
      { id: 'doctor-station-1', name: 'Doctor Station A', type: 'bluetooth', rssi: -45, metadata: {} },
      { id: 'doctor-station-2', name: 'Doctor Station B', type: 'bluetooth', rssi: -60, metadata: {} },
    ];
  }

  async connect(device: DiscoveredDevice): Promise<Connection> {
    // Simulate connection handshake
    await new Promise((r) => setTimeout(r, 700));
    this.connection = { deviceId: device.id, method: 'bluetooth', isConnected: true, connectedAt: new Date() };
    return this.connection;
  }

  async send(data: TransferPackage, onProgress?: (p: TransferProgress) => void): Promise<void> {
    if (!this.connection?.isConnected) throw new Error('Not connected to any device');

    const total = JSON.stringify(data).length || 1;
    let sent = 0;
    const transferId = data.transferId;

    // Simulate chunked transfer over BLE
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        sent = Math.min(total, sent + Math.round(total * 0.2));
        const pct = Math.min(99, Math.round((sent / total) * 100));
        onProgress?.({ transferId, bytesTransferred: sent, totalBytes: total, percentage: pct, state: 'transferring' });
        if (sent >= total) {
          clearInterval(interval);
          onProgress?.({ transferId, bytesTransferred: total, totalBytes: total, percentage: 100, state: 'completed' });
          resolve();
        }
      }, 400);
    });
  }

  async receive(onProgress?: (p: TransferProgress) => void): Promise<TransferPackage> {
    if (!this.connection?.isConnected) throw new Error('Not connected to any device');

    const transferId = `ble-pull-${Date.now()}`;
    let progress = 0;

    // Simulate receiving a small TransferPackage over BLE
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        progress += 25;
        onProgress?.({ transferId, bytesTransferred: progress, totalBytes: 100, percentage: Math.min(100, progress), state: 'transferring' });
        if (progress >= 100) {
          clearInterval(interval);
          const pkg: TransferPackage = {
            transferId: `ble-${Date.now()}`,
            patientId: 'unknown',
            data: { message: 'Simulated BLE payload' },
            checksum: 'simulated',
            timestamp: new Date(),
            metadata: { version: '1', deviceId: this.connection!.deviceId, transferMethod: 'bluetooth' }
          };
          onProgress?.({ transferId, bytesTransferred: 100, totalBytes: 100, percentage: 100, state: 'completed' });
          resolve(pkg);
        }
      }, 350);
    });
  }

  async disconnect(): Promise<void> {
    this.connection = null;
  }

  getConnectionStatus(): Connection | null {
    return this.connection;
  }
}

export default BLEProtocol;
