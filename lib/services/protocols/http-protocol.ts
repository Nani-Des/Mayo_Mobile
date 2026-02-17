import { TransferProtocol, DiscoveredDevice, Connection, TransferPackage, TransferProgress } from '@/lib/types/transfer';

export class HttpProtocol implements TransferProtocol {
  private connection: Connection | null = null;

  async discover(): Promise<DiscoveredDevice[]> {
    // HTTP doesn't support discovery in this app; return empty list
    return [];
  }

  async connect(device: DiscoveredDevice): Promise<Connection> {
    // Device should contain the ip in id or metadata
    const ip = device.metadata?.ip || device.id;
    this.connection = { deviceId: ip, method: 'wifi', isConnected: true, connectedAt: new Date() };
    return this.connection;
  }

  async send(data: TransferPackage, onProgress?: (p: TransferProgress) => void): Promise<void> {
    if (!this.connection?.isConnected) throw new Error('Not connected');

    // Simulate progress while sending; real upload progress isn't available via fetch easily
    const totalBytes = JSON.stringify(data).length;
    let sent = 0;
    const transferId = data.transferId;

    // Progress simulation until we start the request
    onProgress?.({ transferId, bytesTransferred: 0, totalBytes, percentage: 0, state: 'transferring' });

    const progressInterval = setInterval(() => {
      sent = Math.min(totalBytes, sent + Math.round(totalBytes * 0.15));
      const pct = Math.min(95, Math.round((sent / totalBytes) * 100));
      onProgress?.({ transferId, bytesTransferred: sent, totalBytes, percentage: pct, state: 'transferring' });
    }, 300);

    try {
      const ip = this.connection.deviceId;
      const resp = await fetch(`http://${ip}:8444/api/sync/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      clearInterval(progressInterval);
      onProgress?.({ transferId, bytesTransferred: totalBytes, totalBytes, percentage: 100, state: 'completed' });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || 'Server error');
      }
    } catch (e) {
      clearInterval(progressInterval);
      onProgress?.({ transferId, bytesTransferred: sent, totalBytes, percentage: Math.round((sent / totalBytes) * 100), state: 'failed', error: (e as Error).message });
      throw e;
    }
  }

  async receive(onProgress?: (p: TransferProgress) => void): Promise<TransferPackage> {
    if (!this.connection?.isConnected) throw new Error('Not connected');

    const transferId = `pull-${Date.now()}`;
    onProgress?.({ transferId, bytesTransferred: 0, totalBytes: 1, percentage: 0, state: 'transferring' });

    try {
      const ip = this.connection.deviceId;
      const resp = await fetch(`http://${ip}:8444/api/sync/pull`, { method: 'GET' });
      if (!resp.ok) throw new Error('Server returned error');
      const json = await resp.json();

      onProgress?.({ transferId, bytesTransferred: 1, totalBytes: 1, percentage: 100, state: 'completed' });

      // Assume server returns a TransferPackage-like object
      return json as TransferPackage;
    } catch (e) {
      onProgress?.({ transferId, bytesTransferred: 0, totalBytes: 1, percentage: 0, state: 'failed', error: (e as Error).message });
      throw e;
    }
  }

  async disconnect(): Promise<void> {
    this.connection = null;
  }

  getConnectionStatus(): Connection | null {
    return this.connection;
  }
}

export default HttpProtocol;
