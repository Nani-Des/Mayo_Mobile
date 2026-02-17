import { useQuery } from '@tanstack/react-query';
import { getLabResultsByPatient } from '@/lib/api/lab-results-api';
import { getMedicationsByPatient } from '@/lib/api/medications-api';
import { getAllergiesByPatient } from '@/lib/api/allergies-api';
import { getVitalSignsByPatient } from '@/lib/api/vitals-api';

export const useMedicalRecords = (patientId: string | null | undefined) => {
    console.log('[useMedicalRecords] Hook called with patientId:', patientId);
    return useQuery({
        queryKey: ['medicalRecords', patientId],
        queryFn: async () => {
            console.log('[useMedicalRecords] Query function executing, patientId:', patientId);
            if (!patientId) {
                console.log('[useMedicalRecords] No patientId, returning empty data');
                return { labs: [], meds: [], allergies: [], vitals: [] };
            }

            const [labs, meds, allergies, vitals] = await Promise.all([
                getLabResultsByPatient(patientId).catch(() => []),
                getMedicationsByPatient(patientId).catch(() => []),
                getAllergiesByPatient(patientId).catch(() => []),
                getVitalSignsByPatient(patientId).catch(() => []),
            ]);

            console.log('[useMedicalRecords] Data fetched:', { labs: labs.length, meds: meds.length, allergies: allergies.length, vitals: vitals.length });

            return { labs, meds, allergies, vitals };
        },
        enabled: !!patientId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
