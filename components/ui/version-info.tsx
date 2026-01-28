import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface VersionInfoProps {
  currentVersion: string;
  lastUpdated: string;
  deviceCount: number;
}

export function VersionInfo({ currentVersion, lastUpdated, deviceCount }: VersionInfoProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Version Information
      </ThemedText>
      
      <ThemedView style={styles.infoRow}>
        <ThemedText style={styles.label}>Current Version:</ThemedText>
        <ThemedText style={styles.value}>{currentVersion}</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.infoRow}>
        <ThemedText style={styles.label}>Last Updated:</ThemedText>
        <ThemedText style={styles.value}>{lastUpdated}</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.infoRow}>
        <ThemedText style={styles.label}>Devices Synced:</ThemedText>
        <ThemedText style={styles.value}>{deviceCount}</ThemedText>
      </ThemedView>
      
      <ThemedText style={styles.note}>
        Version conflicts will be automatically resolved using Last-Writer-Wins algorithm
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginVertical: 16,
  },
  title: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    opacity: 0.8,
  },
  note: {
    marginTop: 12,
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.7,
    textAlign: 'center',
  },
});