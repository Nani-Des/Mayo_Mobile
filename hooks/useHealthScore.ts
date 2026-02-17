import { useQuery } from '@tanstack/react-query';
import { getLabResultsByPatient } from '@/lib/api/lab-results-api';
import { getVitalSignsByPatient } from '@/lib/api/vitals-api';

export interface HealthScore {
    score: number;
    status: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    trend: 'improving' | 'declining' | 'stable';
    lastUpdated: string;
    message: string;
}

export const useHealthScore = (patientId: string | null | undefined) => {
    return useQuery({
        queryKey: ['healthScore', patientId],
        queryFn: async (): Promise<HealthScore> => {
            if (!patientId) return {
                score: 0,
                status: 'Poor',
                trend: 'stable',
                lastUpdated: new Date().toISOString(),
                message: 'No data available'
            };

            const [labs, vitals] = await Promise.all([
                getLabResultsByPatient(patientId).catch(() => []),
                getVitalSignsByPatient(patientId).catch(() => []),
            ]);

            // Synthetic calculation logic
            // In a real app, this would be complex. Here we use a simplified version.
            let score = 75; // Base score
            
            // Adjust based on abnormal labs
            const abnormalLabs = labs.filter(l => l.status === 'abnormal' || l.status === 'critical').length;
            score -= abnormalLabs * 5;

            // Adjust based on abnormal vitals
            const abnormalVitals = vitals.filter(v => v.status === 'ABNORMAL' || v.status === 'CRITICAL').length;
            score -= abnormalVitals * 10;

            // Clamp score
            score = Math.max(0, Math.min(100, score));

            let status: HealthScore['status'] = 'Good';
            if (score > 90) status = 'Excellent';
            else if (score > 70) status = 'Good';
            else if (score > 50) status = 'Fair';
            else status = 'Poor';

            return {
                score,
                status,
                trend: 'stable', 
                lastUpdated: new Date().toISOString(),
                message: score > 70 ? 'Your health parameters are within normal ranges' : 'Some health parameters require attention'
            };
        },
        enabled: !!patientId,
        staleTime: 1000 * 60 * 15, // 15 minutes
    });
};
