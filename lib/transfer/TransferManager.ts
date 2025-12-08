import React from 'react';
import { StorageManager } from '../storage/StorageManager';
import { TransferProtocol, TransferSession, PatientRecord } from '../storage/types';
import { VectorClock } from '../storage/utils/vectorClock';
import { ProtocolHandler } from './handlers/ProtocolHandler';
import { BleHandler } from './handlers/BleHandler';
import { WifiDirectHandler } from './handlers/WifiDirectHandler';
import { UsbHandler } from './handlers/UsbHandler';
import { QrHandler } from './handlers/QrHandler';
import { v4 as uuidv4 } from 'uuid';
import Aes from 'react-native-aes-crypto';
import * as Crypto from 'expo-crypto';
import { Base64 } from 'js-base64';

export class TransferManager {
  private storageManager: StorageManager;
  private activeSessions: Map<string, TransferSession> = new Map();
  private handlers: Map<TransferProtocol, ProtocolHandler> = new Map();

  constructor(storageManager: StorageManager) {
    this.storageManager = storageManager;
    this.initializeHandlers();
  }

  private initializeHandlers(): void {
    this.handlers.set(TransferProtocol.BLE, new BleHandler());
    this.handlers.set(TransferProtocol.WIFI_DIRECT, new WifiDirectHandler());
    this.handlers.set(TransferProtocol.USB, new UsbHandler());
    this.handlers.set(TransferProtocol.QR_CODE, new QrHandler());
  }

  async startTransfer(protocol: TransferProtocol, remoteVectorClock?: VectorClock): Promise<TransferSession> {
    const sessionId = uuidv4();
    const session: TransferSession = {
      id: sessionId,
      protocol,
      status: 'INITIATED',
      startTime: new Date(),
      transferredRecords: [],
      totalBytes: 0,
    };

    this.activeSessions.set(sessionId, session);

    try {
      // Get delta records based on vector clock comparison
      const deltaRecords = await this.getDeltaRecords(remoteVectorClock);

      // Generate ephemeral AES key for this transfer
      const ephemeralKey = await this.generateEphemeralKey();

      // Initialize the protocol handler
      const handler = this.handlers.get(protocol);
      if (!handler) {
        throw new Error(`Unsupported protocol: ${protocol}`);
      }

      await handler.initialize(sessionId, ephemeralKey);

      // Start transferring records
      session.status = 'TRANSFERRING';
      this.activeSessions.set(sessionId, session);

      for (const record of deltaRecords) {
        const encryptedRecord = await this.encryptRecordForTransfer(record, ephemeralKey);
        await handler.sendRecord(encryptedRecord);
        session.transferredRecords.push(record.id);
        session.totalBytes += JSON.stringify(encryptedRecord).length;
      }

      // Complete the transfer
      await handler.finalize();
      session.status = 'COMPLETED';
      session.endTime = new Date();

    } catch (error) {
      session.status = 'FAILED';
      session.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      session.endTime = new Date();
    }

    this.activeSessions.set(sessionId, session);
    return session;
  }

  private async getDeltaRecords(remoteVectorClock?: VectorClock): Promise<PatientRecord[]> {
    const allRecords = await this.storageManager.getAllPatientRecords();

    if (!remoteVectorClock) {
      // If no remote clock, send all records
      return allRecords;
    }

    const remoteClock = VectorClock.fromJson(JSON.stringify(remoteVectorClock));
    const deltas: PatientRecord[] = [];

    for (const record of allRecords) {
      const localClock = VectorClock.fromJson(JSON.stringify(record.metadata.vectorClock));
      if (localClock.happenedBefore(remoteClock) || localClock.isConcurrentWith(remoteClock)) {
        deltas.push(record);
      }
    }

    return deltas;
  }

  private async generateEphemeralKey(): Promise<string> {
    const keyBytes = await Crypto.getRandomBytesAsync(32); // 256 bits
    return Base64.encode(String.fromCharCode(...keyBytes));
  }

  private async encryptRecordForTransfer(record: PatientRecord, ephemeralKey: string): Promise<any> {
    const recordString = JSON.stringify(record);
    const iv = await Crypto.getRandomBytesAsync(12); // 96 bits for GCM
    const ivBase64 = Base64.encode(String.fromCharCode(...iv));

    const encrypted = await Aes.encrypt(recordString, ephemeralKey, ivBase64, 'aes-256-gcm' as any);

    return {
      encrypted,
      iv: ivBase64,
      metadata: record.metadata,
    };
  }

  getActiveSessions(): TransferSession[] {
    return Array.from(this.activeSessions.values());
  }

  getSession(sessionId: string): TransferSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  getQrCode(sessionId: string): React.JSX.Element | null {
    const session = this.activeSessions.get(sessionId);
    if (!session || session.protocol !== TransferProtocol.QR_CODE) {
      return null;
    }
    const handler = this.handlers.get(TransferProtocol.QR_CODE) as QrHandler;
    return handler ? handler.generateQrCode() : null;
  }

  isBleAdvertising(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session || session.protocol !== TransferProtocol.BLE) {
      return false;
    }
    // For simplicity, assume if session is active and BLE, it's advertising
    return session.status === 'INITIATED' || session.status === 'TRANSFERRING';
  }

  async cancelTransfer(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    const handler = this.handlers.get(session.protocol);
    if (handler) {
      await handler.cancel();
    }

    session.status = 'FAILED';
    session.errorMessage = 'Transfer cancelled';
    session.endTime = new Date();
    this.activeSessions.set(sessionId, session);
  }
}