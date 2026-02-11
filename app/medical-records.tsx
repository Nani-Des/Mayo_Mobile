import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function MedicalRecordsScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Medical Records' }} />
            <ThemedView style={styles.container}>
                <ThemedText type="title">Medical Records</ThemedText>
                <ThemedText style={styles.description}>
                    View your history, lab results, and documents here.
                </ThemedText>
                <ThemedText style={styles.wip}>
                    (Coming Soon)
                </ThemedText>
            </ThemedView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    description: {
        marginTop: 10,
        textAlign: 'center',
        opacity: 0.8,
    },
    wip: {
        marginTop: 20,
        fontStyle: 'italic',
        opacity: 0.6,
    },
});
