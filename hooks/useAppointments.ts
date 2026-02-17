import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAppointments, updateAppointmentStatus, AppointmentStatus } from '@/lib/api/appointments-api';

export const useAppointments = () => {
    return useQuery({
        queryKey: ['appointments'],
        queryFn: async () => {
            const data = await getAppointments();
            return data || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useAppointmentMutations = () => {
    const queryClient = useQueryClient();

    const updateStatus = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: AppointmentStatus }) => {
            return await updateAppointmentStatus(id, status);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });

    return {
        updateStatus: updateStatus.mutateAsync,
        isUpdating: updateStatus.isPending,
        error: updateStatus.error,
    };
};
