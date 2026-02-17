import { useEffect, useState } from "react";
import { Button, Text, View, StyleSheet, ScrollView, FlatList } from "react-native";
import { useAuthStore } from "../stores/authStore";
import SyncService from "./services/SyncService";

export default function Page() {
  const { user, logout } = useAuthStore();
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    // Fetch records locally
    try {
      const history = SyncService.getMockPatientHistory();
      if (history && history.medicalRecords) {
        setRecords(history.medicalRecords);
      }
    } catch (e) {
      console.error("Failed to fetch records", e);
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Medical Records</Text>
        <Text style={styles.subtitle}>Welcome, {user?.fullName || user?.username || user?.email}</Text>
      </View>

      <View style={styles.content}>
        {records.length === 0 ? (
           <Text style={styles.emptyText}>No records found locally.</Text>
        ) : (
           <FlatList
             data={records}
             keyExtractor={(item) => item.id}
             renderItem={({ item }) => (
               <View style={styles.recordCard}>
                 <Text style={styles.recordDate}>{item.date}</Text>
                 <Text style={styles.recordDiagnosis}>{item.diagnosis}</Text>
                 <Text style={styles.recordPrescription}>Rx: {item.prescription}</Text>
                 <Text style={styles.recordDoctor}>Dr: {item.doctor}</Text>
               </View>
             )}
           />
        )}
      </View>

      <Button title="Logout" onPress={logout} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "bold" },
  subtitle: { fontSize: 16, color: "gray" },
  content: { flex: 1 },
  emptyText: { textAlign: "center", marginTop: 50, color: "gray" },
  recordCard: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#0284C7'
  },
  recordDate: { color: '#666', fontSize: 12 },
  recordDiagnosis: { fontSize: 18, fontWeight: 'bold' },
  recordPrescription: { fontSize: 14, color: '#444', marginTop: 4 },
  recordDoctor: { fontSize: 12, color: '#888', marginTop: 4 }
});
