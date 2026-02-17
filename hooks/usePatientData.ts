import { useQuery } from '@tanstack/react-query';
import { getPatientByFamilyMemberId, getPatientRecords, Patient, PatientRecord } from '@/lib/api/patients-api';
import { useAuth } from '@/providers/AuthProvider';
import { getDb } from '@/model';

/**
 * Hook to get local patient ID from SQLite (for offline transfers)
 * Checks if patient has any records in local database
 */
export const useMyPatientData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['myPatientData', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      try {
        const db = getDb();
        
        // Try to get patient with snake_case columns (current schema)
        let localPatient = await db.getFirstAsync<{ id: string; first_name: string; last_name: string; date_of_birth: number; gender: string } | null>(
          'SELECT id, first_name, last_name, date_of_birth, gender FROM patients LIMIT 1'
        ).catch(async () => {
          // Fallback: try with just id if columns don't exist yet
          return await db.getFirstAsync<{ id: string } | null>(
            'SELECT id FROM patients LIMIT 1'
          );
        });
        
        if (localPatient) {
          // Check if this patient has any records
          const hasRecords = await db.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM patient_records WHERE patient_id = ?',
            [localPatient.id]
          ).catch(() => ({ count: 0 }));
          
          if (hasRecords && hasRecords.count > 0) {
            // Convert to Patient interface format - handle old schema gracefully
            const typed = localPatient as any;
            return {
              id: localPatient.id,
              userId: user?.id,
              firstName: typed.first_name || 'Patient',
              lastName: typed.last_name || '',
              dateOfBirth: typed.date_of_birth ? new Date(typed.date_of_birth).toISOString() : new Date().toISOString(),
              gender: typed.gender || 'unknown',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as Patient;
          }
        }
      } catch (error) {
        console.log('[useMyPatientData] Local SQLite check error:', error);
      }
      
      return null;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

/**
 * Hook to fetch patient data for a family member
 */
export const useFamilyMemberPatientData = (familyMemberId: string | undefined) => {
  return useQuery({
    queryKey: ['familyMemberPatientData', familyMemberId],
    queryFn: async () => {
      if (!familyMemberId) return null;
      return await getPatientByFamilyMemberId(familyMemberId);
    },
    enabled: !!familyMemberId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch health metrics (derived from patient records/vital signs)
 */
export const useHealthMetrics = (patientId: string | undefined) => {
  return useQuery({
    queryKey: ['healthMetrics', patientId],
    queryFn: async () => {
      if (!patientId) return null;
      
      const records = await getPatientRecords(patientId);
      
      // Calculate health score (stubbed logic for now, using real data)
      // In a real app, this would process vital signs, activity, etc.
      let healthScore = 85; // Base score
      
      // Mock calculation based on number of records for now
      if (records.length > 10) healthScore += 5;
      if (records.length > 20) healthScore += 7;
      
      return {
        healthScore: Math.min(healthScore, 100),
        recentRecords: records.slice(0, 5),
        totalRecords: records.length,
      };
    },
    enabled: !!patientId,
    staleTime: 1000 * 60 * 5,
  });
};
