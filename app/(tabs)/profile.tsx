import { useAuthStore } from '@/stores/authStore';
import { Redirect, router } from 'expo-router';
import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ProfileScreen() {
    const { logout, user } = useAuthStore();
    const tintColor = useThemeColor({}, 'tint');
    const iconColor = useThemeColor({}, 'icon');
    const textColor = useThemeColor({}, 'text');

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Logout", 
                    style: "destructive", 
                    onPress: async () => {
                        await logout();
                    }
                }
            ]
        );
    };

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <ThemedView style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#0284C7', '#0369A1']}
                style={styles.header}
            >
                <View style={styles.profileHeader}>
                    <View style={styles.avatar}>
                        <ThemedText style={styles.avatarText}>
                            {getInitials(user?.fullName || user?.email)}
                        </ThemedText>
                    </View>
                    <ThemedText type="subtitle" style={styles.userName}>
                        {user?.fullName || 'User'}
                    </ThemedText>
                    <ThemedText style={styles.userEmail}>
                        {user?.email || 'email@example.com'}
                    </ThemedText>
                    {user?.type && (
                        <View style={styles.badge}>
                            <ThemedText style={styles.badgeText}>{user.type}</ThemedText>
                        </View>
                    )}
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>Account</ThemedText>
                
                <Card variant="elevated" style={styles.menuCard}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/edit-profile')}>
                        <View style={styles.menuIconInfo}>
                            <IconSymbol name="person.circle" size={24} color={tintColor} />
                            <ThemedText>Edit Profile</ThemedText>
                        </View>
                        <IconSymbol name="chevron.right" size={20} color={iconColor} />
                    </TouchableOpacity>
                    
                    <View style={styles.divider} />
                    
                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/change-password')}>
                        <View style={styles.menuIconInfo}>
                            <IconSymbol name="lock.circle" size={24} color={tintColor} />
                            <ThemedText>Change Password</ThemedText>
                        </View>
                        <IconSymbol name="chevron.right" size={20} color={iconColor} />
                    </TouchableOpacity>
                    
                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/notifications')}>
                         <View style={styles.menuIconInfo}>
                            <IconSymbol name="bell.circle" size={24} color={tintColor} />
                            <ThemedText>Notifications</ThemedText>
                        </View>
                        <IconSymbol name="chevron.right" size={20} color={iconColor} />
                    </TouchableOpacity>
                </Card>

                <ThemedText type="subtitle" style={styles.sectionTitle}>Support</ThemedText>

                <Card variant="elevated" style={styles.menuCard}>
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconInfo}>
                            <IconSymbol name="questionmark.circle" size={24} color={tintColor} />
                            <ThemedText>Help & FAQ</ThemedText>
                        </View>
                        <IconSymbol name="chevron.right" size={20} color={iconColor} />
                    </TouchableOpacity>
                    
                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconInfo}>
                             <IconSymbol name="envelope.circle" size={24} color={tintColor} />
                            <ThemedText>Contact Support</ThemedText>
                        </View>
                        <IconSymbol name="chevron.right" size={20} color={iconColor} />
                    </TouchableOpacity>
                </Card>

                <Button 
                    variant="ghost" 
                    onPress={handleLogout}
                    style={styles.logoutButton}
                >
                    <ThemedText style={{ color: '#EF4444', fontWeight: '600' }}>Log Out</ThemedText>
                </Button>

                <ThemedText style={styles.versionText}>Version 1.0.0</ThemedText>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    profileHeader: {
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 2,
        borderColor: 'white',
    },
    avatarText: {
        fontSize: 32,
        color: 'white',
        fontWeight: 'bold',
    },
    userName: {
        color: 'white',
        marginBottom: 4,
    },
    userEmail: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginBottom: 12,
    },
    badge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        marginBottom: 12,
        marginTop: 12,
        marginLeft: 4,
    },
    menuCard: {
        padding: 0,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    menuIconInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginLeft: 52,
    },
    logoutButton: {
        marginTop: 30,
    },
    versionText: {
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 40,
        opacity: 0.5,
        fontSize: 12,
    },
});
