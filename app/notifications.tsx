import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Switch, FlatList, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuthStore } from '@/stores/authStore';
import * as notificationApi from '@/lib/api/notifications';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function NotificationsScreen() {
    const { user } = useAuthStore();
    const [preferences, setPreferences] = useState<notificationApi.UserNotificationPreferences[]>([]);
    const [notifications, setNotifications] = useState<notificationApi.NotificationResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'settings' | 'history'>('settings');

    const colors = {
        text: useThemeColor({}, 'text'),
        background: useThemeColor({}, 'background'),
        tint: useThemeColor({}, 'tint'),
        tabActive: useThemeColor({}, 'tint'),
        tabInactive: '#999',
    };
    const insets = useSafeAreaInsets();

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const [prefsData, historyData] = await Promise.all([
                notificationApi.getPreferences(user.id),
                notificationApi.getNotifications(user.id)
            ]);
            setPreferences(prefsData);
            setNotifications(historyData);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to load notification data");
        } finally {
            setIsLoading(false);
        }
    };

    const togglePreference = async (type: string, key: keyof notificationApi.UpdateNotificationPreferencesRequest, value: boolean) => {
        if (!user?.id) return;
        
        // Optimistic update
        setPreferences(prev => prev.map(p => 
            p.notificationType === type ? { ...p, [key]: value } : p
        ));

        try {
            await notificationApi.updatePreferences(user.id, {
                notificationType: type,
                [key]: value
            });
        } catch (error) {
            console.error(error);
            // Revert on error
            loadData();
        }
    };

    const renderPreferenceItem = (pref: notificationApi.UserNotificationPreferences) => (
        <Card key={pref.id || pref.notificationType} variant="elevated" style={styles.card}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
                {pref.notificationType === 'ALL' ? 'Global Settings' : pref.notificationType.replace('_', ' ')}
            </ThemedText>
            
            <View style={styles.row}>
                <ThemedText>Push Notifications</ThemedText>
                <Switch 
                    value={pref.pushEnabled} 
                    onValueChange={(v) => togglePreference(pref.notificationType, 'pushEnabled', v)} 
                />
            </View>
            <View style={styles.divider} />
            
            <View style={styles.row}>
                <ThemedText>Email Notifications</ThemedText>
                <Switch 
                    value={pref.emailEnabled} 
                    onValueChange={(v) => togglePreference(pref.notificationType, 'emailEnabled', v)} 
                />
            </View>
            <View style={styles.divider} />

            <View style={styles.row}>
                <ThemedText>SMS Notifications</ThemedText>
                <Switch 
                    value={pref.smsEnabled} 
                    onValueChange={(v) => togglePreference(pref.notificationType, 'smsEnabled', v)} 
                />
            </View>
        </Card>
    );

    const renderNotificationItem = ({ item }: { item: notificationApi.NotificationResponse }) => (
        <Card variant="outlined" style={styles.notificationCard}>
            <View style={styles.notificationHeader}>
                <View style={styles.notificationIconContainer}>
                    <IconSymbol name="bell.fill" size={20} color={colors.tint} />
                </View>
                <View style={styles.notificationContent}>
                    <ThemedText style={styles.notificationTitle}>{item.title}</ThemedText>
                    <ThemedText style={styles.notificationDate}>
                        {new Date(item.createdAt).toLocaleDateString()}
                    </ThemedText>
                </View>
            </View>
            <ThemedText numberOfLines={2} style={styles.notificationMessage}>{item.message}</ThemedText>
        </Card>
    );

    return (
        <ThemedView style={styles.container}>
            {/* LinearGradient Header */}
            <LinearGradient
                colors={['#0284C7', '#0369A1']}
                style={[styles.header, { paddingTop: insets.top + 10 }]}
            >
                <View style={styles.headerContent}>
                    <ThemedText type="hero" style={styles.headerTitle}>Notifications</ThemedText>
                </View>
            </LinearGradient>
            
            <View style={styles.tabs}>
                <ThemedText 
                    style={[styles.tab, activeTab === 'settings' ? { color: colors.tabActive, fontWeight: 'bold' } : { color: colors.tabInactive }]}
                    onPress={() => setActiveTab('settings')}
                >
                    Settings
                </ThemedText>
                <ThemedText 
                    style={[styles.tab, activeTab === 'history' ? { color: colors.tabActive, fontWeight: 'bold' } : { color: colors.tabInactive }]}
                    onPress={() => setActiveTab('history')}
                >
                    History
                </ThemedText>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" style={{ marginTop: 20 }} />
            ) : (
                <View style={styles.content}>
                    {activeTab === 'settings' ? (
                        <ScrollView contentContainerStyle={styles.scrollContent}>
                             {preferences.length === 0 && <ThemedText>No preferences found.</ThemedText>}
                             {preferences.map(renderPreferenceItem)}
                        </ScrollView>
                    ) : (
                        <FlatList
                            data={notifications}
                            renderItem={renderNotificationItem}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.listContent}
                            ListEmptyComponent={<ThemedText style={{ textAlign: 'center', marginTop: 20 }}>No notifications yet.</ThemedText>}
                        />
                    )}
                </View>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerContent: {
        alignItems: 'center',
    },
    headerTitle: {
        color: 'white',
    },
    tabs: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    tab: {
        fontSize: 16,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    listContent: {
        padding: 16,
    },
    card: {
        marginBottom: 16,
        padding: 16,
    },
    cardTitle: {
        marginBottom: 12,
        textTransform: 'capitalize',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginVertical: 4,
    },
    notificationCard: {
        marginBottom: 12,
        padding: 12,
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    notificationIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(2, 132, 199, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
    },
    notificationTitle: {
        fontWeight: '600',
        fontSize: 14,
    },
    notificationDate: {
        fontSize: 12,
        opacity: 0.6,
    },
    notificationMessage: {
        fontSize: 14,
        opacity: 0.8,
    }
});
