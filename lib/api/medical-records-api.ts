import { TransferPackage } from '../types/transfer';
import { getDb } from '@/model';
import { useAuthStore } from '@/stores/authStore';
import * as Application from 'expo-application';
import { Platform } from 'react-native';

/**
 * Utility to generate a simple checksum for data validation
 */
async function generateChecksum(data: any): Promise<string> {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
}

/**
 * Utility to get device ID
 */
async function getDeviceId(): Promise<string> {
    if (Platform.OS === 'android') {
        return Application.getAndroidId() || 'android-device';
    }
    return 'ios-device';
}

/**
 * Medical Records API
 * 
 * Implemented using expo-sqlite for local storage and device-to-device transfer.
 */
export const medicalRecordsAPI = {
    /**
     * Called when patient needs to send records to doctor
     */
    async prepareRecordsForTransfer(patientId: string): Promise<TransferPackage> {
        try {
            const db = getDb();
            
            console.log('[prepareRecordsForTransfer] Starting for patientId:', patientId);
            
            // 1. Check if patientId exists; if not, try to get the first patient (for seeded test data)
            let actualPatientId = patientId;
            const patient = await db.getFirstAsync('SELECT id FROM patients WHERE id = ?', [patientId]);
            if (!patient) {
                console.log('[prepareRecordsForTransfer] PatientId', patientId, 'not found, looking for any patient');
                const anyPatient = await db.getFirstAsync<{ id: string }>('SELECT id FROM patients LIMIT 1');
                if (anyPatient) {
                    actualPatientId = anyPatient.id;
                    console.log('[prepareRecordsForTransfer] Using first available patient:', actualPatientId);
                } else {
                    console.warn('[prepareRecordsForTransfer] No patients found in database');
                }
            }
            
            // 2. Fetch data from SQLite using standardized column names
            const records = await db.getAllAsync('SELECT * FROM patient_records WHERE patient_id = ?', [actualPatientId]);
            const medications = await db.getAllAsync('SELECT * FROM medications WHERE patient_id = ?', [actualPatientId]);
            const labResults = await db.getAllAsync('SELECT * FROM lab_results WHERE patient_id = ?', [actualPatientId]);
            
            console.log('[prepareRecordsForTransfer] Fetched:', { records: records?.length, medications: medications?.length, labResults: labResults?.length });

        const data = {
            patientId,
            records,
            medications,
            labResults,
            exportedAt: new Date().toISOString(),
        };

        // 2. Generate checksum
        const checksum = await generateChecksum(data);

        // 3. Return the package
        return {
            transferId: `trans-${Date.now()}`,
            patientId,
            data,
            checksum,
            timestamp: new Date(),
            metadata: {
                version: '1.0.0',
                deviceId: await getDeviceId(),
                transferMethod: 'wifi',
            },
        };
        } catch (error) {
            console.error('[prepareRecordsForTransfer] Error:', error);
            throw error;
        }
    },

    /**
     * Called when patient receives updated records from doctor
     */
    async saveReceivedRecords(transferPackage: TransferPackage): Promise<void> {
        const db = getDb();
        const { data, checksum, metadata, patientId } = transferPackage;

        // 1. Verify checksum
        const actualChecksum = await generateChecksum(data);
        if (checksum !== actualChecksum) {
            throw new Error('Checksum verification failed. Data may be corrupted.');
        }

        // 2. Handle Hospital Onboarding
        if (metadata?.hospitalId) {
            const currentHospitalId = useAuthStore.getState().hospitalId;
            if (!currentHospitalId) {
                console.log('Onboarding device to hospital:', metadata.hospitalId);
                useAuthStore.setState({ hospitalId: metadata.hospitalId, isDeviceRegistered: true });
            }
        }

        // 3. Save to local SQLite with STANDARDIZED schema column names
        await db.withTransactionAsync(async () => {
            // Save records with standardized schema
            if (data.records && Array.isArray(data.records)) {
                for (const record of data.records) {
                    try {
                        await db.runAsync(
                            `INSERT OR REPLACE INTO patient_records (id, patient_id, record_type, title, description, category, created_at, updated_at) 
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                            [record.id || `rec-${Date.now()}`, patientId, record.record_type, record.title, record.description, record.category, Date.now(), Date.now()]
                        );
                    } catch (e) {
                        console.warn('[saveReceivedRecords] Error saving record:', e);
                    }
                }
            }

            // Save medications with standardized schema
            if (data.medications && Array.isArray(data.medications)) {
                for (const med of data.medications) {
                    try {
                        await db.runAsync(
                            `INSERT OR REPLACE INTO medications (id, patient_id, medication_name, generic_name, brand_name, strength, form, dosage, frequency, route, quantity, refills, prescribing_provider, prescribed_at, started_at, ended_at, status, indication, instructions, side_effects, interactions, cost, insurance_covered, pharmacy, notes, created_at, updated_at) 
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                            [
                                med.id || `med-${Date.now()}`, 
                                patientId, 
                                med.medication_name || med.name, // Support both old and new field names
                                med.generic_name || null,
                                med.brand_name || null,
                                med.strength || null,
                                med.form || null,
                                med.dosage || null,
                                med.frequency || null,
                                med.route || null,
                                med.quantity || null,
                                med.refills || null,
                                med.prescribing_provider || null,
                                med.prescribed_at || Date.now(),
                                med.started_at || Date.now(),
                                med.ended_at || null,
                                med.status || 'ACTIVE',
                                med.indication || null,
                                med.instructions || null,
                                med.side_effects || null,
                                med.interactions || null,
                                med.cost || null,
                                med.insurance_covered || null,
                                med.pharmacy || null,
                                med.notes || null,
                                Date.now(), 
                                Date.now()
                            ]
                        );
                    } catch (e) {
                        console.warn('[saveReceivedRecords] Error saving medication:', e);
                    }
                }
            }
            
            // Save lab results with standardized schema
            if (data.labResults && Array.isArray(data.labResults)) {
                for (const lab of data.labResults) {
                    try {
                        await db.runAsync(
                            `INSERT OR REPLACE INTO lab_results (id, patient_id, test_name, test_code, category, value, unit, reference_range, status, performed_at, reported_at, performing_lab, ordering_provider, interpretation, notes, created_at, updated_at) 
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                            [
                                lab.id || `lab-${Date.now()}`, 
                                patientId, 
                                lab.test_name,
                                lab.test_code || null,
                                lab.category || null,
                                lab.value || null,
                                lab.unit || null,
                                lab.reference_range || null,
                                lab.status || 'COMPLETED',
                                lab.performed_at || Date.now(),
                                lab.reported_at || null,
                                lab.performing_lab || null,
                                lab.ordering_provider || null,
                                lab.interpretation || null,
                                lab.notes || null,
                                Date.now(), 
                                Date.now()
                            ]
                        );
                    } catch (e) {
                        console.warn('[saveReceivedRecords] Error saving lab result:', e);
                    }
                }
            }
        });
    },

    /**
     * Get current patient ID
     */
    async getCurrentPatientId(): Promise<string> {
        const { user } = useAuthStore.getState();
        if (user?.id && user.id !== 'unknown') {
            return user.id;
        }
        
        const db = getDb();
        try {
            const firstPatient = await db.getFirstAsync<{id: string}>('SELECT id FROM patients LIMIT 1');
            return firstPatient?.id || 'guest-patient';
        } catch (e) {
            return 'guest-patient';
        }
    },
};
