import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';

export default function EditProfileScreen() {
    const { user, updateProfile, isLoading } = useAuthStore();
    
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || ''); // Note: user interface needs extending if phone missing
    
    const colors = {
        text: useThemeColor({}, 'text'),
        background: useThemeColor({}, 'background'),
        tint: useThemeColor({}, 'tint'),
        error: useThemeColor({}, 'error'),
        card: useThemeColor({}, 'card'),
    };

    const handleSave = async () => {
        if (!fullName.trim() || !email.trim()) {
            Alert.alert("Error", "Name and Email are required");
            return;
        }

        const result = await updateProfile({
            fullName,
            email,
            // @ts-ignore: User interface might need update for phoneNumber if not present
            phoneNumber
        });

        if (result.success) {
            Alert.alert("Success", "Profile updated successfully");
            router.back();
        } else {
            Alert.alert("Error", result.error || "Failed to update profile");
        }
    };

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: 'Edit Profile' }} />
            
            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <ThemedText style={styles.label}>Full Name</ThemedText>
                    <TextInput
                        style={[styles.input, { color: colors.text, backgroundColor: colors.card }]}
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Enter full name"
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <ThemedText style={styles.label}>Email Address</ThemedText>
                    <TextInput
                        style={[styles.input, { color: colors.text, backgroundColor: colors.card }]}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <ThemedText style={styles.label}>Phone Number</ThemedText>
                    <TextInput
                        style={[styles.input, { color: colors.text, backgroundColor: colors.card }]}
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        placeholder="Enter phone number"
                        keyboardType="phone-pad"
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
                        <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
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
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
