import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'patients',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'first_name', type: 'string' },
        { name: 'last_name', type: 'string' },
        { name: 'date_of_birth', type: 'number' }, // Timestamp
        { name: 'gender', type: 'string' },
        { name: 'contact_info', type: 'string' }, // JSON stringified
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'patient_records',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'patient_id', type: 'string', isIndexed: true },
        { name: 'record_type', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'metadata', type: 'string' }, // JSON stringified
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'family_members',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'family_id', type: 'string', isIndexed: true }, // Links to a local Family table if needed, or just server ID
        { name: 'user_id', type: 'string', isIndexed: true }, // The user account this member belongs to
        { name: 'first_name', type: 'string' },
        { name: 'last_name', type: 'string' },
        { name: 'relationship', type: 'string' },
        { name: 'date_of_birth', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    // We can add specific tables for labs/meds if we want structured query capability, 
    // or store them as specific record_types in patient_records. 
    // For now, let's add specific tables for clarity and typed access.
    tableSchema({
      name: 'medications',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'patient_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'dosage', type: 'string' },
        { name: 'frequency', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'prescribed_at', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'lab_results',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true },
        { name: 'patient_id', type: 'string', isIndexed: true },
        { name: 'test_name', type: 'string' },
        { name: 'value', type: 'string' },
        { name: 'unit', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'performed_at', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
  ]
})
