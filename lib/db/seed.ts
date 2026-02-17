import { PatientService } from '../services/patient-service';

export const seedDatabase = async () => {
    try {
        const existingPatient = await PatientService.getPatient('p-123');
        if (existingPatient) {
            console.log('Database already seeded');
            return;
        }

        console.log('Seeding database...');

        // 1. Create Patient
        await PatientService.savePatient({
            id: 'p-123',
            name: 'Sarah Doe',
            date_of_birth: '1990-05-15',
            gender: 'Female',
            blood_type: 'O+',
            allergies: 'Penicillin, Peanuts',
            height: 165,
            weight: 60
        });

        // 2. Add Visits
        await PatientService.addVisit({
            id: 'v-001',
            patient_id: 'p-123',
            date: '2023-10-24',
            doctor_name: 'Dr. Smith',
            hospital_name: 'Mayo Clinic General',
            diagnosis: 'Seasonal Allergies',
            notes: 'Patient reported sneezing and itchy eyes. Prescribed antihistamines.'
        });

        await PatientService.addVisit({
            id: 'v-002',
            patient_id: 'p-123',
            date: '2023-08-10',
            doctor_name: 'Dr. Jones',
            hospital_name: 'City Hospital',
            diagnosis: 'Routine Checkup',
            notes: 'Vitals normal. Blood pressure 120/80.'
        });

        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};
