import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';

export default function ChangePasswordScreen() {
    const { changePassword, isLoading } = useAuthStore();
    
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const colors = {
        text: useThemeColor({}, 'text'),
        background: useThemeColor({}, 'background'),
        tint: useThemeColor({}, 'tint'),
        error: useThemeColor({}, 'error'),
        card: useThemeColor({}, 'card'),
    };

    const handleSave = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            Alert.alert("Error", "All fields are required");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "New passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }

        const result = await changePassword({
            oldPassword,
            newPassword
        });

        if (result.success) {
            Alert.alert("Success", "Password changed successfully", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } else {
            Alert.alert("Error", result.error || "Failed to change password");
        }
    };

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: 'Change Password' }} />
            
            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <ThemedText style={styles.label}>Current Password</ThemedText>
                    <TextInput
                        style={[styles.input, { color: colors.text, backgroundColor: colors.card }]}
                        value={oldPassword}
                        onChangeText={setOldPassword}
                        placeholder="Enter current password"
                        secureTextEntry
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <ThemedText style={styles.label}>New Password</ThemedText>
                    <TextInput
                        style={[styles.input, { color: colors.text, backgroundColor: colors.card }]}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="Enter new password"
                        secureTextEntry
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <ThemedText style={styles.label}>Confirm New Password</ThemedText>
                    <TextInput
                        style={[styles.input, { color: colors.text, backgroundColor: colors.card }]}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirm new password"
                        secureTextEntry
                        placeholderTextColor="#999"
                    />
                </View>

                <Button 
                    onPress={handleSave} 
                    disabled={isLoading}
                    style={styles.saveButton}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <ThemedText style={styles.saveButtonText}>Update Password</ThemedText>
                    )}
                </Button>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    form: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        marginBottom: 8,
        fontWeight: '600',
        fontSize: 14,
        opacity: 0.8,
    },
    input: {
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    saveButton: {
        marginTop: 20,
        backgroundColor: '#4F46E5',
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
