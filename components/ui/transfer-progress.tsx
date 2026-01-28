import { useEffect } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface TransferProgressProps {
  method: string;
  progress: number;
}

export function TransferProgress({ method, progress }: TransferProgressProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Transferring via {method}
      </ThemedText>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${progress}%` }
            ]} 
          />
        </View>
      </View>
      
      <ThemedText style={styles.progressText}>
        {progress}% Complete
      </ThemedText>
      
      <ThemedText style={styles.infoText}>
        Please keep devices close and do not disconnect during transfer
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    marginVertical: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  progressContainer: {
    marginVertical: 16,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0a7ea4',
    borderRadius: 5,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 8,
  },
  infoText: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.8,
    fontStyle: 'italic',
  },
});