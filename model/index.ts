// WatermelonDB imports commented out - JSI not available in Expo
// import { Database } from '@nozbe/watermelondb'
// import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'

// import { schema } from './schema'
// import Patient from './Patient'
// import FamilyMember from './FamilyMember'
// import LabResult from './LabResult'
// import Medication from './Medication'

// const adapter = new SQLiteAdapter({
//   schema,
//   // (Optional) Database name
//   // dbName: 'mayo_emr',
//   jsi: true,
//   // (Optional) Handle error if the database fails to load
//   onSetUpError: error => {
//     console.error('Database failed to load', error)
//   }
// })

// export const database = new Database({
//   adapter,
//   modelClasses: [
//     Patient,
//     FamilyMember,
//     LabResult,
//     Medication,
//   ],
// })

// Placeholder database object for type compatibility
export const database = {
  write: async (fn: () => Promise<void>) => { await fn(); },
  get: (table: string) => ({
    query: () => ({ observe: () => [] }),
    create: (fn: (record: any) => void) => { fn({}); return Promise.resolve({}); },
  }),
};
