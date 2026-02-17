// FamilyMember TypeScript interface for API responses
// Matches the server DTO structure from family-api.ts

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface EmergencyContact {
  name?: string;
  relationship?: string;
  phoneNumber?: string;
  email?: string;
}

export interface FamilyMember {
  id: string;
  userId: string;
  familyId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date string
  gender?: string;
  relationship: string;
  email?: string;
  phone?: string;
  address?: Address;
  bloodType?: string;
  emergencyContact?: EmergencyContact;
  medicalNotes?: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Helper to get full name
export const getFullName = (member: FamilyMember): string => {
  return `${member.firstName} ${member.lastName}`;
};

// Helper to calculate age from dateOfBirth
export const getAge = (member: FamilyMember): number => {
  const today = new Date();
  const birthDate = new Date(member.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};
