import { database } from './database';
import { PatientRecordModel } from './models/PatientRecord';
import { PatientRecord, RecordMetadata } from './types';
import { encryptData, decryptData, generateSHA256, signData } from './utils/crypto';
import { VersionManager } from './VersionManager';
import { VectorClock } from './utils/vectorClock';
import { v4 as uuidv4 } from 'uuid';

export class StorageManager {
  private versionManager: VersionManager;

  constructor() {
    this.versionManager = new VersionManager();
  }

  async createPatientRecord(data: PatientRecord['data']): Promise<PatientRecord> {
    const uuid = uuidv4();
    const createdAt = new Date();
    const vectorClock = this.versionManager.createNewVectorClock();

    // Serialize data for encryption
    const dataString = JSON.stringify(data);
    const { encrypted, iv } = await encryptData(dataString);

    // Create metadata
    const metadata: RecordMetadata = {
      uuid,
      createdAt,
      hashChecksum: await generateSHA256(dataString),
      deviceSignature: await signData(dataString),
      vectorClock: Object.fromEntries(vectorClock.getClock()),
    };

    // Store in database
    await database.write(async () => {
      await database.get<PatientRecordModel>('patient_records').create((record) => {
        record.uuid = uuid;
        record.encryptedData = JSON.stringify({ encrypted, iv });
        record.createdAt = createdAt.getTime();
        record.hashChecksum = metadata.hashChecksum;
        record.deviceSignature = metadata.deviceSignature;
        record.vectorClock = vectorClock.toJson();
      });
    });

    return {
      id: uuid,
      metadata,
      data,
    };
  }

  async getPatientRecord(uuid: string): Promise<PatientRecord | null> {
    const record = await database.get<PatientRecordModel>('patient_records').find(uuid);
    if (!record) return null;

    const encryptedData = JSON.parse(record.encryptedData);
    const decryptedData = await decryptData(encryptedData.encrypted, encryptedData.iv);
    const data = JSON.parse(decryptedData);

    const metadata: RecordMetadata = {
      uuid: record.uuid,
      createdAt: new Date(record.createdAt),
      hashChecksum: record.hashChecksum,
      deviceSignature: record.deviceSignature,
      vectorClock: JSON.parse(record.vectorClock),
    };

    return {
      id: record.uuid,
      metadata,
      data,
    };
  }

  async updatePatientRecord(uuid: string, newData: Partial<PatientRecord['data']>): Promise<PatientRecord | null> {
    const existing = await this.getPatientRecord(uuid);
    if (!existing) return null;

    const updatedData = { ...existing.data, ...newData };
    const dataString = JSON.stringify(updatedData);
    const { encrypted, iv } = await encryptData(dataString);

    const existingClock = VectorClock.fromJson(JSON.stringify(existing.metadata.vectorClock));
    const vectorClock = this.versionManager.incrementVectorClock(existingClock);

    const metadata: RecordMetadata = {
      ...existing.metadata,
      hashChecksum: await generateSHA256(dataString),
      deviceSignature: await signData(dataString),
      vectorClock: Object.fromEntries(vectorClock.getClock()),
    };

    await database.write(async () => {
      const record = await database.get<PatientRecordModel>('patient_records').find(uuid);
      await record.update((r) => {
        r.encryptedData = JSON.stringify({ encrypted, iv });
        r.hashChecksum = metadata.hashChecksum;
        r.deviceSignature = metadata.deviceSignature;
        r.vectorClock = vectorClock.toJson();
      });
    });

    return {
      id: uuid,
      metadata,
      data: updatedData,
    };
  }

  async deletePatientRecord(uuid: string): Promise<boolean> {
    try {
      await database.write(async () => {
        const record = await database.get<PatientRecordModel>('patient_records').find(uuid);
        await record.destroyPermanently();
      });
      return true;
    } catch {
      return false;
    }
  }

  async getAllPatientRecords(): Promise<PatientRecord[]> {
    const records = await database.get<PatientRecordModel>('patient_records').query().fetch();
    const results: PatientRecord[] = [];

    for (const record of records) {
      const patientRecord = await this.getPatientRecord(record.uuid);
      if (patientRecord) results.push(patientRecord);
    }

    return results;
  }
}