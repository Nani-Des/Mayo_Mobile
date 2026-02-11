import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ProvidersScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Find Care' }} />
            <ThemedView style={styles.container}>
                <ThemedText type="title">Providers</ThemedText>
                <ThemedText style={styles.description}>
                    Search for doctors and specialists near you.
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
