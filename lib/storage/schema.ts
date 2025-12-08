import { tableSchema } from '@nozbe/watermelondb';

export const patientRecordSchema = tableSchema({
  name: 'patient_records',
  columns: [
    { name: 'uuid', type: 'string' },
    { name: 'encrypted_data', type: 'string' }, // Encrypted JSON blob
    { name: 'created_at', type: 'number' },
    { name: 'hash_checksum', type: 'string' },
    { name: 'device_signature', type: 'string' },
    { name: 'vector_clock', type: 'string' }, // JSON string
  ],
});

export const syncSnapshotSchema = tableSchema({
  name: 'sync_snapshots',
  columns: [
    { name: 'uuid', type: 'string' },
    { name: 'encrypted_data', type: 'string' },
    { name: 'created_at', type: 'number' },
    { name: 'hash_checksum', type: 'string' },
    { name: 'device_signature', type: 'string' },
    { name: 'vector_clock', type: 'string' },
    { name: 'snapshot_timestamp', type: 'number' },
  ],
});

export const appSchema = {
  version: 1,
  tables: [patientRecordSchema, syncSnapshotSchema],
};