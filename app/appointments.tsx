import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function AppointmentsScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Appointments' }} />
            <ThemedView style={styles.container}>
                <ThemedText type="title">Appointments</ThemedText>
                <ThemedText style={styles.description}>
                    Schedule and manage your upcoming visits.
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
