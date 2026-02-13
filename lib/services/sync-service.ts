import * as Crypto from 'expo-crypto';
import { TransferPackage } from '../types/transfer';
import { PatientService } from './patient-service';

export const SyncService = {
    /**
     * Exports all patient data into a transfer package
     */
    async exportPatientData(patientId: string): Promise<TransferPackage> {
        try {
            // 1. Fetch all data
            const summary = await PatientService.getPatientSummary(patientId);
            const visits = await PatientService.getVisits(patientId);

            // 2. Structure the data
            const dataPayload = {
                patient: summary.patient,
                visits: visits,
                version: '1.0',
                exportedAt: new Date().toISOString()
            };

            // 3. Create Transfer Package
            const transferId = Crypto.randomUUID();

            // Calculate checksum (simple implementation for now)
            // In production, you'd hash the stringified data
            const checksum = `chk-${Date.now()}`;

            return {
                transferId,
                patientId,
                data: dataPayload,
                checksum,
                timestamp: new Date()
            };
        } catch (error) {
            console.error('Export failed:', error);
            throw new Error('Failed to export patient data');
        }
    },

    /**
     * Imports a transfer package into the local database
     */
    async importPatientData(pkg: TransferPackage): Promise<void> {
        console.log('Importing package:', pkg.transferId);
        // TODO: Implement import logic
        // 1. Validate checksum
        // 2. Parse data
        // 3. Upsert patient
        // 4. Insert visits/history
    }
};
