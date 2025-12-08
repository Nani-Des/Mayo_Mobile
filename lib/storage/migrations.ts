import { schemaMigrations, addColumns } from '@nozbe/watermelondb/Schema/migrations';

export const migrations = schemaMigrations({
  migrations: [
    // Migration from version 1 to 2 (example)
    // {
    //   toVersion: 2,
    //   steps: [
    //     addColumns({
    //       table: 'patient_records',
    //       columns: [
    //         { name: 'new_field', type: 'string' },
    //       ],
    //     }),
    //   ],
    // },
  ],
});