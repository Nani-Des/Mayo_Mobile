import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { initDatabase } from '@/lib/db';
import { seedDatabase } from '@/lib/db/seed';
import { PatientService, type Patient, type Visit } from '@/lib/services/patient-service';

export default function MedicalRecordsScreen() {
    const [patient, setPatient] = useState<Patient | null>(null);
    const [visits, setVisits] = useState<Visit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Initialize database
                await initDatabase();

                // Seed if needed
                await seedDatabase();

                // Fetch patient data
                const patientData = await PatientService.getPatient('p-123');
                const visitsData = await PatientService.getVisits('p-123');

                setPatient(patientData);
                setVisits(visitsData);
            } catch (error) {
                console.error('Failed to load medical records:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return (
            <ThemedView style={styles.container}>
                <ActivityIndicator size="large" />
                <ThemedText style={{ marginTop: 10 }}>Loading records...</ThemedText>
            </ThemedView>
        );
    }

    if (!patient) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText type="title">No Patient Data</ThemedText>
                <ThemedText style={styles.description}>
                    Database is empty. Please check seeding.
                </ThemedText>
            </ThemedView>
        );
    }

    return (
        <>
            <Stack.Screen options={{ title: 'Medical Records' }} />
            <ThemedView style={styles.container}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Patient Info Card */}
                    <Card variant="elevated" style={styles.card}>
                        <ThemedText type="subtitle">Patient Information</ThemedText>
                        <View style={styles.infoRow}>
                            <ThemedText style={styles.label}>Name:</ThemedText>
                            <ThemedText style={styles.value}>{patient.name}</ThemedText>
                        </View>
                        <View style={styles.infoRow}>
                            <ThemedText style={styles.label}>DOB:</ThemedText>
                            <ThemedText style={styles.value}>{patient.date_of_birth || 'N/A'}</ThemedText>
                        </View>
                        <View style={styles.infoRow}>
                            <ThemedText style={styles.label}>Blood Type:</ThemedText>
                            <ThemedText style={styles.value}>{patient.blood_type || 'N/A'}</ThemedText>
                        </View>
                        <View style={styles.infoRow}>
                            <ThemedText style={styles.label}>Allergies:</ThemedText>
                            <ThemedText style={styles.value}>{patient.allergies || 'None'}</ThemedText>
                        </View>
                    </Card>

                    {/* Visit History */}
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Visit History</ThemedText>
                    {visits.length === 0 ? (
                        <Card variant="outlined" style={styles.card}>
                            <ThemedText style={styles.emptyText}>No visits recorded</ThemedText>
                        </Card>
                    ) : (
                        visits.map((visit) => (
                            <Card key={visit.id} variant="outlined" style={styles.visitCard}>
                                <View style={styles.visitHeader}>
                                    <ThemedText type="cardTitle">{visit.diagnosis}</ThemedText>
                                    <ThemedText style={styles.date}>{visit.date}</ThemedText>
                                </View>
                                <ThemedText style={styles.doctor}>Dr. {visit.doctor_name}</ThemedText>
                                <ThemedText style={styles.hospital}>{visit.hospital_name}</ThemedText>
                                {visit.notes && (
                                    <ThemedText style={styles.notes}>{visit.notes}</ThemedText>
                                )}
                            </Card>
                        ))
                    )}
                </ScrollView>
            </ThemedView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    card: {
        padding: 16,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    label: {
        fontWeight: '600',
        opacity: 0.7,
    },
    value: {
        fontWeight: '500',
    },
    sectionTitle: {
        marginTop: 8,
        marginBottom: 12,
    },
    visitCard: {
        padding: 12,
        marginBottom: 12,
    },
    visitHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    date: {
        fontSize: 12,
        opacity: 0.6,
    },
    doctor: {
        fontSize: 13,
        marginTop: 4,
        opacity: 0.8,
    },
    hospital: {
        fontSize: 12,
        marginTop: 2,
        opacity: 0.6,
    },
    notes: {
        fontSize: 12,
        marginTop: 8,
        fontStyle: 'italic',
        opacity: 0.7,
    },
    emptyText: {
        textAlign: 'center',
        opacity: 0.6,
        fontStyle: 'italic',
    },
    description: {
        marginTop: 10,
        textAlign: 'center',
        opacity: 0.8,
    },
});
