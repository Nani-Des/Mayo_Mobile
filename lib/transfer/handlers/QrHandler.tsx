import { ProtocolHandler, EncryptedRecord } from './ProtocolHandler';
import React from 'react';
import QRCode from 'react-native-qrcode-svg';

export class QrHandler extends ProtocolHandler {
  private qrData: string | null = null;
  private qrRef: any = null;

  async initialize(sessionId: string, ephemeralKey: string): Promise<void> {
    this.sessionId = sessionId;
    this.ephemeralKey = ephemeralKey;

    // Generate QR code data containing session info and ephemeral key
    const qrPayload = {
      sessionId: this.sessionId,
      ephemeralKey: this.ephemeralKey,
      protocol: 'QR',
      timestamp: new Date().toISOString(),
    };

    this.qrData = JSON.stringify(qrPayload);
  }

  async sendRecord(record: EncryptedRecord): Promise<void> {
    // For QR code transfer, records are encoded into additional QR codes
    // In practice, this might involve generating multiple QR codes or using a different approach
    try {
      // Note: Actual implementation would need to handle large data by chunking into multiple QR codes
      // or using a different mechanism. This is a simplified placeholder.
    } catch (error) {
      throw new Error(`QR send failed: ${error}`);
    }
  }

  async finalize(): Promise<void> {
    try {
      this.qrData = null;
      this.qrRef = null;
    } catch {
      // Error handling without console logging
    }
  }

  async cancel(): Promise<void> {
    await this.finalize();
  }

  getQrData(): string | null {
    return this.qrData;
  }

  generateQrCode(): React.JSX.Element | null {
    if (!this.qrData) return null;

    return (
      <QRCode
        value={this.qrData}
        size={200}
        getRef={(ref: any) => (this.qrRef = ref)}
      />
    );
  }

  // Method to get QR code as base64 string for sharing
  async getQrCodeBase64(): Promise<string | null> {
    if (!this.qrRef) return null;

    try {
      const data = await this.qrRef.toDataURL();
      return data;
    } catch {
      return null;
    }
  }
}