import { useQuery } from '@tanstack/react-query';
import { getMyFamilies, getFamilyMembers, Family, FamilyMember } from '@/lib/api/family-api';

export const useFamilyData = () => {
    return useQuery({
        queryKey: ['familyMembers'],
        queryFn: async () => {
            const families = await getMyFamilies();
            
            if (!families || families.length === 0) {
                return { members: [], familyId: null };
            }

            const primaryFamily = families[0];
            const allMembers: FamilyMember[] = [];
            
            try {
                const members = await getFamilyMembers(primaryFamily.id);
                if (members && members.length > 0) {
                    allMembers.push(...members);
                }
            } catch (e) {
                if (primaryFamily.members && primaryFamily.members.length > 0) {
                    allMembers.push(...primaryFamily.members);
                }
            }
            
            return { members: allMembers, familyId: primaryFamily.id };
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
