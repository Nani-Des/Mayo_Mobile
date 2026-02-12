// services/SyncService.ts
export const SyncService = {
  getMockPatientHistory: () => {
    return {
      patientId: "P-10293",
      personalInfo: {
        firstName: "Alex",
        lastName: "Rivera",
        dob: "1988-11-24",
      },
      // This is what the doctor updates
      medicalRecords: [
        {
          id: "REC-001",
          date: "2026-01-10",
          diagnosis: "Seasonal Allergies",
          prescription: "Cetirizine 10mg",
          doctor: "Dr. House"
        }
      ],
      sessionToken: "TMP-" + Math.random().toString(36).substr(2, 9)
    };
  }
};