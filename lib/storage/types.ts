import { VectorClock as VectorClockClass } from './utils/vectorClock';

export type VectorClock = Record<string, number>;

export enum TransferProtocol {
  BLE = 'BLE',
  WIFI_DIRECT = 'WIFI_DIRECT',
  USB = 'USB',
  QR_CODE = 'QR_CODE',
}

export interface TransferSession {
  id: string;
  protocol: TransferProtocol;
  status: 'INITIATED' | 'TRANSFERRING' | 'COMPLETED' | 'FAILED';
  startTime: Date;
  endTime?: Date;
  transferredRecords: string[]; // UUIDs of records transferred
  totalBytes: number;
  errorMessage?: string;
}

export const MEDICAL_DATA_SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';

export interface RecordMetadata {
  uuid: string;
  createdAt: Date;
  hashChecksum: string; // SHA-256
  deviceSignature: string; // ECDSA signature
  vectorClock: VectorClock;
}

export interface PatientRecord {
  id: string;
  metadata: RecordMetadata;
  data: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: 'male' | 'female' | 'other';
    medicalRecordNumber: string;
    // Add other patient fields as needed
  };
}

export interface SyncSnapshot {
  id: string;
  metadata: RecordMetadata;
  records: PatientRecord[];
  snapshotTimestamp: Date;
}