import * as SQLite from 'expo-sqlite';

// Database version for migrations
const DATABASE_VERSION = 3;
const DATABASE_NAME = 'mayo_emr_v3.db';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the database and create tables if they don't exist
 * Uses STANDARDIZED schema matching server and desktop formats
 * See: DATA_SCHEMA_STANDARD.md
 */
export const initDatabase = async () => {
    try {
        db = await SQLite.openDatabaseAsync(DATABASE_NAME);
        
        await db.withTransactionAsync(async () => {
            // Standardized Patients Table
            await db!.runAsync(`
                CREATE TABLE IF NOT EXISTS patients (
                    id TEXT PRIMARY KEY NOT NULL,
                    medical_record_number TEXT UNIQUE,
                    first_name TEXT NOT NULL,
                    last_name TEXT NOT NULL,
                    email TEXT,
                    date_of_birth INTEGER,
                    gender TEXT,
                    contact_info TEXT,
                    created_at INTEGER NOT NULL,
                    updated_at INTEGER NOT NULL
                );
            `);

            // Standardized Patient Records (Clinical Records) Table
            await db!.runAsync(`
                CREATE TABLE IF NOT EXISTS patient_records (
                    id TEXT PRIMARY KEY NOT NULL,
                    patient_id TEXT NOT NULL,
                    record_type TEXT NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT,
                    category TEXT,
                    created_at INTEGER NOT NULL,
                    updated_at INTEGER NOT NULL,
                    FOREIGN KEY(patient_id) REFERENCES patients(id)
                );
            `);

            // Standardized Medications Table (matching server schema)
            await db!.runAsync(`
                CREATE TABLE IF NOT EXISTS medications (
                    id TEXT PRIMARY KEY NOT NULL,
                    patient_id TEXT NOT NULL,
                    medication_name TEXT NOT NULL,
                    generic_name TEXT,
                    brand_name TEXT,
                    strength TEXT,
                    form TEXT,
                    dosage TEXT,
                    frequency TEXT,
                    route TEXT,
                    quantity INTEGER,
                    refills INTEGER,
                    prescribing_provider TEXT,
                    prescribed_at INTEGER,
                    started_at INTEGER,
                    ended_at INTEGER,
                    status TEXT,
                    indication TEXT,
                    instructions TEXT,
                    side_effects TEXT,
                    interactions TEXT,
                    cost REAL,
                    insurance_covered INTEGER,
                    pharmacy TEXT,
                    notes TEXT,
                    created_at INTEGER NOT NULL,
                    updated_at INTEGER NOT NULL,
                    FOREIGN KEY(patient_id) REFERENCES patients(id)
                );
            `);

            // Standardized Lab Results Table (matching server schema)
            await db!.runAsync(`
                CREATE TABLE IF NOT EXISTS lab_results (
                    id TEXT PRIMARY KEY NOT NULL,
                    patient_id TEXT NOT NULL,
                    test_name TEXT NOT NULL,
                    test_code TEXT,
                    category TEXT,
                    value REAL,
                    unit TEXT,
                    reference_range TEXT,
                    status TEXT,
                    performed_at INTEGER,
                    reported_at INTEGER,
                    performing_lab TEXT,
                    ordering_provider TEXT,
                    interpretation TEXT,
                    notes TEXT,
                    created_at INTEGER NOT NULL,
                    updated_at INTEGER NOT NULL,
                    FOREIGN KEY(patient_id) REFERENCES patients(id)
                );
            `);

            // Family Members Table (optional, for future use)
            await db!.runAsync(`
                CREATE TABLE IF NOT EXISTS family_members (
                    id TEXT PRIMARY KEY NOT NULL,
                    family_id TEXT,
                    user_id TEXT NOT NULL,
                    first_name TEXT NOT NULL,
                    last_name TEXT NOT NULL,
                    relationship TEXT NOT NULL,
                    date_of_birth TEXT,
                    created_at INTEGER NOT NULL,
                    updated_at INTEGER NOT NULL
                );
            `);
        });

        console.log('Database initialized successfully with standardized schema');
    } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
    }
};

/**
 * Seed database with sample data for testing transfers
 * Uses STANDARDIZED data format
 */
export const seedDatabase = async () => {
    try {
        const db = getDb();
        const now = Date.now();
        // Canonical ID for patient@mayo.com from server seed V2__seed_data.sql
        const patientId = 'e5f6a7b8-c9d0-1234-ef01-23456789abcd';

        console.log('[seedDatabase] Starting database seeding...');

        await db.withTransactionAsync(async () => {
            // Check if patient already exists
            const existingPatient = await db.getFirstAsync(
                'SELECT id FROM patients WHERE id = ?',
                [patientId]
            );

            console.log('[seedDatabase] Existing patient check:', existingPatient);

            if (existingPatient) {
                console.log('[seedDatabase] Patient already exists, checking for data updates/repair...');
                
                // Let's also check what patients exist
                const allPatients = await db.getAllAsync('SELECT id, first_name, last_name FROM patients');
                console.log('[seedDatabase] All patients in database:', allPatients);
                
                // We could verify data integrity here, but for now just skip if patient exists
                // to avoid overwriting user-generated changes
                return;
            }

            console.log('[seedDatabase] Seeding fresh data for patient@mayo.com...');

            // 1. Add Patient: John Patient
            try {
                await db.runAsync(
                    `INSERT INTO patients (id, medical_record_number, first_name, last_name, email, date_of_birth, gender, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        patientId, 
                        'MRN-2024-889', 
                        'John', 
                        'Patient', 
                        'patient@mayo.com',
                        631152000000, // Approx 1990
                        'M', 
                        now, 
                        now
                    ]
                );
                console.log('[seedDatabase] Patient created: John Patient');
            } catch (e) {
                console.warn('[seedDatabase] Could not insert patient:', e);
                return; // Stop if patient creation fails
            }

            // 2. Clinical Records
            try {
                // Record 1: Annual Physical
                await db.runAsync(
                    `INSERT INTO patient_records (id, patient_id, record_type, title, description, category, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        'rec-init-001', 
                        patientId, 
                        'VISIT_SUMMARY', 
                        'Annual Physical Examination', 
                        'Patient is a 34-year-old male presenting for annual physical. Reports feeling well overall. Minor complaints of occasional headaches.', 
                        'OUTPATIENT',
                        now - 86400000 * 14, // 2 weeks ago
                        now - 86400000 * 14
                    ]
                );

                // Record 2: Diagnosis
                await db.runAsync(
                    `INSERT INTO patient_records (id, patient_id, record_type, title, description, category, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        'rec-init-002', 
                        patientId, 
                        'DIAGNOSIS', 
                        'Essential Hypertension', 
                        'Diagnosed with Stage 1 Hypertension. Lifestyle modifications recommended (diet, exercise).', 
                        'CHRONIC_CONDITION',
                        now - 86400000 * 60, // 2 months ago
                        now - 86400000 * 60
                    ]
                );
                console.log('[seedDatabase] Clinical records created');
            } catch (e) {
                console.warn('[seedDatabase] Could not insert clinical records:', e);
            }

            // 3. Medications
            try {
                // Med 1: Lisinopril
                await db.runAsync(
                    `INSERT INTO medications (id, patient_id, medication_name, generic_name, dosage, frequency, route, quantity, refills, status, indication, prescribed_at, started_at, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        'med-init-001', 
                        patientId, 
                        'Prinivil',
                        'Lisinopril', 
                        '10mg', 
                        'Daily', 
                        'PO',
                        30,
                        3,
                        'ACTIVE', 
                        'Hypertension',
                        now - 86400000 * 60, 
                        now - 86400000 * 60, 
                        now - 86400000 * 60, 
                        now - 86400000 * 60
                    ]
                );

                // Med 2: Vitamin D
                await db.runAsync(
                    `INSERT INTO medications (id, patient_id, medication_name, generic_name, dosage, frequency, route, quantity, refills, status, indication, prescribed_at, started_at, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        'med-init-002', 
                        patientId, 
                        'Vitamin D3', 
                        'Cholecalciferol',
                        '2000 IU', 
                        'Daily', 
                        'PO',
                        90,
                        1,
                        'ACTIVE', 
                        'Supplement',
                        now - 86400000 * 14, 
                        now - 86400000 * 14, 
                        now - 86400000 * 14, 
                        now - 86400000 * 14
                    ]
                );
                console.log('[seedDatabase] Medications created');
            } catch (e) {
                console.warn('[seedDatabase] Could not insert medications:', e);
            }

            // 4. Lab Results
            try {
                // Lab 1: Lipid Panel
                await db.runAsync(
                    `INSERT INTO lab_results (id, patient_id, test_name, category, value, unit, reference_range, status, performed_at, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        'lab-init-001', 
                        patientId, 
                        'Total Cholesterol', 
                        'HEMATOLOGY',
                        185, 
                        'mg/dL', 
                        '< 200 mg/dL',
                        'COMPLETED', 
                        now - 86400000 * 14, 
                        now - 86400000 * 14, 
                        now - 86400000 * 14
                    ]
                );

                // Lab 2: LDL
                await db.runAsync(
                    `INSERT INTO lab_results (id, patient_id, test_name, category, value, unit, reference_range, status, performed_at, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        'lab-init-002', 
                        patientId, 
                        'LDL Cholesterol', 
                        'HEMATOLOGY',
                        110, 
                        'mg/dL', 
                        '< 100 mg/dL',
                        'COMPLETED', 
                        now - 86400000 * 14, 
                        now - 86400000 * 14, 
                        now - 86400000 * 14
                    ]
                );

                 // Lab 3: Glucose
                 await db.runAsync(
                    `INSERT INTO lab_results (id, patient_id, test_name, category, value, unit, reference_range, status, performed_at, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        'lab-init-003', 
                        patientId, 
                        'Fasting Blood Glucose', 
                        'CHEMISTRY',
                        92, 
                        'mg/dL', 
                        '70-99 mg/dL',
                        'COMPLETED', 
                        now - 86400000 * 14, 
                        now - 86400000 * 14, 
                        now - 86400000 * 14
                    ]
                );
                console.log('[seedDatabase] Lab results created');
            } catch (e) {
                console.warn('[seedDatabase] Could not insert lab results:', e);
            }

            console.log('[seedDatabase] Database seeding completed for patient@mayo.com');
        });
    } catch (error) {
        console.error('[seedDatabase] Failed to seed database:', error);
    }
};

/**
 * Get internal database instance
 */
export const getDb = () => {
    if (!db) {
        console.error('[getDb] Database not initialized. Call initDatabase() first.');
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return db;
};

// Re-export TypeScript interfaces
export { type FamilyMember, type Address, type EmergencyContact, getFullName, getAge } from './FamilyMember';
