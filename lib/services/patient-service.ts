import { getDatabase } from '../db';

export interface Patient {
    id: string;
    name: string;
    date_of_birth?: string;
    gender?: string;
    blood_type?: string;
    allergies?: string;
    height?: number;
    weight?: number;
}

export interface Visit {
    id: string;
    patient_id: string;
    date: string;
    doctor_name: string;
    hospital_name: string;
    diagnosis: string;
    notes: string;
}

export const PatientService = {
    // Create or Update Patient
    async savePatient(patient: Patient): Promise<void> {
        const db = await getDatabase();
        await db.runAsync(
            `INSERT OR REPLACE INTO patients (id, name, date_of_birth, gender, blood_type, allergies, height, weight, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'));`,
            [
                patient.id,
                patient.name,
                patient.date_of_birth || null,
                patient.gender || null,
                patient.blood_type || null,
                patient.allergies || null,
                patient.height || null,
                patient.weight || null
            ]
        );
    },

    // Get Patient by ID
    async getPatient(id: string): Promise<Patient | null> {
        const db = await getDatabase();
        const result = await db.getFirstAsync<Patient>(
            'SELECT * FROM patients WHERE id = ?;',
            [id]
        );
        return result || null;
    },

    // Add a Visit
    async addVisit(visit: Visit): Promise<void> {
        const db = await getDatabase();
        await db.runAsync(
            `INSERT INTO visits (id, patient_id, date, doctor_name, hospital_name, diagnosis, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
            [
                visit.id,
                visit.patient_id,
                visit.date,
                visit.doctor_name,
                visit.hospital_name,
                visit.diagnosis,
                visit.notes
            ]
        );
    },

    // Get All Visits for Patient
    async getVisits(patientId: string): Promise<Visit[]> {
        const db = await getDatabase();
        // Return latest visits first
        return await db.getAllAsync<Visit>(
            'SELECT * FROM visits WHERE patient_id = ? ORDER BY date DESC;',
            [patientId]
        );
    },

    // Get Summary for Home Screen (e.g. latest visit, allergies)
    async getPatientSummary(patientId: string) {
        const db = await getDatabase();
        const patient = await this.getPatient(patientId);
        const latestVisit = await db.getFirstAsync<Visit>(
            'SELECT * FROM visits WHERE patient_id = ? ORDER BY date DESC LIMIT 1;',
            [patientId]
        );

        return {
            patient,
            latestVisit,
        };
    }
};
