import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { appSchema } from './schema';
import { PatientRecordModel } from './models/PatientRecord';
import { SyncSnapshotModel } from './models/SyncSnapshot';

let databaseInstance: Database | null = null;

function createDatabase(): Database {
  const adapter = new SQLiteAdapter({
    schema: appSchema as any,
    dbName: 'mayo_mobile.db',
    jsi: false, // Disable JSI to avoid initialization errors
  });

  return new Database({
    adapter,
    modelClasses: [PatientRecordModel, SyncSnapshotModel],
  });
}

export function getDatabase(): Database {
  if (!databaseInstance) {
    databaseInstance = createDatabase();
  }
  return databaseInstance;
}

// For backwards compatibility, export a getter
export const database = new Proxy({} as Database, {
  get(target, prop) {
    return getDatabase()[prop as keyof Database];
  },
});