import { useQuery } from '@tanstack/react-query';
import { getPatients } from '@/lib/api/patients-api';

export const usePatients = () => {
    return useQuery({
        queryKey: ['patients'],
        queryFn: async () => {
            const data = await getPatients();
            return data || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
