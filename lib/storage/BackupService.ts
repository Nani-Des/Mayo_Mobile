import { StorageManager } from './StorageManager';
import { SyncSnapshot } from './types';
import { encryptData } from './utils/crypto';
import { VersionManager } from './VersionManager';
import { v4 as uuidv4 } from 'uuid';

export class BackupService {
  private storageManager: StorageManager;
  private versionManager: VersionManager;

  constructor(storageManager: StorageManager, versionManager: VersionManager) {
    this.storageManager = storageManager;
    this.versionManager = versionManager;
  }

  async createBackupSnapshot(): Promise<{ snapshot: SyncSnapshot; encryptedData: string; iv: string }> {
    const records = await this.storageManager.getAllPatientRecords();
    const snapshotTimestamp = new Date();

    // Create a merged vector clock for all records
    const clocks = records.map(r => r.metadata.vectorClock);
    const mergedClock = this.versionManager.mergeVectorClocks(clocks.map(c => {
      const vc = new (require('./utils/vectorClock')).VectorClock();
      vc.clock = new Map(Object.entries(c));
      return vc;
    }));

    const snapshot: SyncSnapshot = {
      id: uuidv4(),
      metadata: {
        uuid: uuidv4(),
        createdAt: snapshotTimestamp,
        hashChecksum: '', // Will be set after encryption
        deviceSignature: '', // Will be set after encryption
        vectorClock: Object.fromEntries(mergedClock.getClock()),
      },
      records,
      snapshotTimestamp,
    };

    // Serialize and encrypt the snapshot
    const dataString = JSON.stringify(snapshot);
    const { encrypted, iv } = await encryptData(dataString);

    // Note: In a full implementation, hash and signature would be computed here
    // But since this is just preparation, we'll leave them empty

    return {
      snapshot,
      encryptedData: encrypted,
      iv,
    };
  }

  // Note: Actual upload to MinIO would be handled by calling the backend API
  // This method prepares the data for upload
  async prepareBackupData(): Promise<{ deviceId: string; data: string; timestamp: number; encryptionKey: string }> {
    const { encryptedData, iv } = await this.createBackupSnapshot();
    const deviceId = this.versionManager.getDeviceId();

    return {
      deviceId,
      data: JSON.stringify({ encrypted: encryptedData, iv }),
      timestamp: Date.now(),
      encryptionKey: 'device-specific-key', // In practice, this would be derived from device key
    };
  }
}