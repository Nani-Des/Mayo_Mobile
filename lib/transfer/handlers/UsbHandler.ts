import { ProtocolHandler, EncryptedRecord } from './ProtocolHandler';
import * as FileSystem from 'expo-file-system';

export class UsbHandler extends ProtocolHandler {
  private transferDirectory: string | null = null;

  async initialize(sessionId: string, ephemeralKey: string): Promise<void> {
    this.sessionId = sessionId;
    this.ephemeralKey = ephemeralKey;

    // Create temporary directory for MTP transfer
    try {
      this.transferDirectory = `${(FileSystem as any).documentDirectory}transfer_${sessionId}/`;
      await FileSystem.makeDirectoryAsync(this.transferDirectory);
    } catch (error) {
      throw new Error(`USB MTP initialization failed: ${error}`);
    }
  }

  async sendRecord(record: EncryptedRecord): Promise<void> {
    if (!this.transferDirectory) {
      throw new Error('USB MTP not initialized');
    }

    try {
      const recordData = JSON.stringify(record);
      const fileName = `record_${record.metadata.uuid}.json`;
      const filePath = `${this.transferDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, recordData);
    } catch (error) {
      throw new Error(`USB MTP send failed: ${error}`);
    }
  }

  async finalize(): Promise<void> {
    try {
      // Note: Actual MTP transfer to USB device would require additional implementation
      // This implementation saves files to a temporary directory that can be accessed via MTP
      if (this.transferDirectory) {
        // Files are now available in the transfer directory for MTP access
      }
    } catch {
      // Error handling without console logging
    }
  }

  async cancel(): Promise<void> {
    try {
      if (this.transferDirectory) {
        await FileSystem.deleteAsync(this.transferDirectory, { idempotent: true });
        this.transferDirectory = null;
      }
    } catch {
      // Error handling without console logging
    }
  }
}