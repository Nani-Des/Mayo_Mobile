import { TransferPackage } from '../types/transfer';

/**
 * Medical Records API
 * 
 * These are STUB functions for the backend team to implement.
 * The mobile transfer layer will call these functions to get/save medical records.
 */

export const medicalRecordsAPI = {
    /**
     * Called when patient needs to send records to doctor
     * 
     * @param patientId - ID of the patient
     * @returns TransferPackage ready to send
     * 
     * @throws Error - Backend team should implement this
     */
    async prepareRecordsForTransfer(patientId: string): Promise<TransferPackage> {
        // TODO: Backend team implements this
        // This should:
        // 1. Fetch patient's medical records from database
        // 2. Package them into TransferPackage format
        // 3. Generate checksum
        // 4. Return the package

        console.warn('medicalRecordsAPI.prepareRecordsForTransfer() not implemented by backend team');

        // Temporary mock for testing
        return {
            transferId: `transfer-${Date.now()}`,
            patientId,
            data: {
                // Backend team defines this structure
                records: [],
                patientInfo: {},
            },
            checksum: 'mock-checksum',
            timestamp: new Date(),
            metadata: {
                version: '1.0.0',
                deviceId: 'mobile-device',
                transferMethod: 'bluetooth',
            },
        };
    },

    /**
     * Called when patient receives updated records from doctor
     * 
     * @param data - TransferPackage received from doctor
     * 
     * @throws Error - Backend team should implement this
     */
    async saveReceivedRecords(data: TransferPackage): Promise<void> {
        // TODO: Backend team implements this
        // This should:
        // 1. Validate the received data
        // 2. Verify checksum
        // 3. Save to local database
        // 4. Optionally sync to Supabase

        console.warn('medicalRecordsAPI.saveReceivedRecords() not implemented by backend team');
        console.log('Received data:', data);

        // Temporary mock for testing
        return Promise.resolve();
    },

    /**
     * Get current patient ID
     * 
     * @returns Current logged-in patient's ID
     * 
     * @throws Error - Backend team should implement this
     */
    async getCurrentPatientId(): Promise<string> {
        // TODO: Backend team implements this
        // Should get from auth context or local storage

        console.warn('medicalRecordsAPI.getCurrentPatientId() not implemented by backend team');

        // Temporary mock for testing
        return 'patient-123';
    },
};
