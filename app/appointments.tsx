import { useState, useCallback, useEffect, useMemo } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Alert,
    Pressable,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Button } from '@/components/ui/button';
import {
    Appointment,
    AppointmentStatus,
    AppointmentType,
} from '@/lib/api/appointments-api';
import { useAppointments, useAppointmentMutations } from '@/hooks/useAppointments';

// Filter types
type FilterType = 'ALL' | 'UPCOMING' | 'PAST' | 'CANCELLED';

// Helper to format date
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

// Helper to format time
const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
};

// Helper to get status color
const getStatusColor = (status: AppointmentStatus, colors: any): string => {
    switch (status) {
        case AppointmentStatus.SCHEDULED:
            return colors.tint; // Blue
        case AppointmentStatus.COMPLETED:
            return colors.success; // Green
        case AppointmentStatus.CANCELLED:
            return colors.error; // Red
        case AppointmentStatus.NO_SHOW:
            return colors.warning; // Orange/Amber
        default:
            return colors.textSecondary;
    }
};

// Helper to get status label
const getStatusLabel = (status: AppointmentStatus): string => {
    switch (status) {
        case AppointmentStatus.SCHEDULED:
            return 'Scheduled';
        case AppointmentStatus.COMPLETED:
            return 'Completed';
        case AppointmentStatus.CANCELLED:
            return 'Cancelled';
        case AppointmentStatus.NO_SHOW:
            return 'No Show';
        default:
            return status;
    }
};

// Helper to get appointment type label
const getTypeLabel = (type: AppointmentType): string => {
    switch (type) {
        case AppointmentType.CHECKUP:
            return 'Check-up';
        case AppointmentType.FOLLOW_UP:
            return 'Follow-up';
        case AppointmentType.CONSULTATION:
            return 'Consultation';
        case AppointmentType.PROCEDURE:
            return 'Procedure';
        case AppointmentType.EMERGENCY:
            return 'Emergency';
        default:
            return type;
    }
};

// Status Badge Component
const StatusBadge = ({ status, colors }: { status: AppointmentStatus; colors: any }) => {
    const backgroundColor = getStatusColor(status, colors);
    return (
        <View style={[styles.statusBadge, { backgroundColor: backgroundColor + '20' }]}>
            <ThemedText style={[styles.statusBadgeText, { color: backgroundColor }]}>
                {getStatusLabel(status)}
            </ThemedText>
        </View>
    );
};

// Appointment Card Component
const AppointmentCard = ({
    appointment,
    onCancel,
    onComplete,
    colors,
}: {
    appointment: Appointment;
    onCancel: (id: string) => void;
    onComplete: (id: string) => void;
    colors: any;
}) => {
    const isUpcoming = appointment.status === AppointmentStatus.SCHEDULED;
    const appointmentDateTime = new Date(
        `${appointment.appointmentDate}T${appointment.appointmentTime}`
    );
    const now = new Date();
    const isPast = appointmentDateTime < now;

    return (
        <Card style={styles.appointmentCard}>
            <View style={styles.cardHeader}>
                <View style={styles.dateTimeContainer}>
                    <ThemedText type="default" style={styles.dateText}>
                        {formatDate(appointment.appointmentDate)}
                    </ThemedText>
                    <ThemedText type="default" style={styles.timeText}>
                        {formatTime(appointment.appointmentTime)}
                    </ThemedText>
                </View>
                <StatusBadge status={appointment.status} colors={colors} />
            </View>

            <View style={styles.cardBody}>
                <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Type:</ThemedText>
                    <ThemedText style={styles.detailValue}>
                        {getTypeLabel(appointment.type)}
                    </ThemedText>
                </View>
                <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Provider:</ThemedText>
                    <ThemedText style={styles.detailValue}>
                        {appointment.providerId || 'Not assigned'}
                    </ThemedText>
                </View>
                <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Location:</ThemedText>
                    <ThemedText style={styles.detailValue}>
                        {appointment.hospitalId || 'Not specified'}
                    </ThemedText>
                </View>
                <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Duration:</ThemedText>
                    <ThemedText style={styles.detailValue}>
                        {appointment.duration} minutes
                    </ThemedText>
                </View>
                {appointment.notes && (
                    <View style={styles.notesContainer}>
                        <ThemedText style={styles.detailLabel}>Notes:</ThemedText>
                        <ThemedText style={styles.notesText}>{appointment.notes}</ThemedText>
                    </View>
                )}
            </View>

            {isUpcoming && (
                <View style={styles.cardActions}>
                    <Button
                        variant="outline"
                        size="sm"
                        onPress={() => onCancel(appointment.id)}
                        style={{ flex: 1, borderColor: colors.error }}
                    >
                        <ThemedText style={{ color: colors.error }}>Cancel</ThemedText>
                    </Button>
                    <Button
                        size="sm"
                        onPress={() => onComplete(appointment.id)}
                        style={{ flex: 1, backgroundColor: colors.success }}
                    >
                        <ThemedText style={{ color: '#fff' }}>Complete</ThemedText>
                    </Button>
                </View>
            )}
        </Card>
    );
};

// Filter Tab Component
const FilterTab = ({
    label,
    active,
    onPress,
    colors,
}: {
    label: string;
    active: boolean;
    onPress: () => void;
    colors: any;
}) => (
    <Pressable
        style={[
            styles.filterTab,
            active && { backgroundColor: colors.tint },
        ]}
        onPress={onPress}
    >
        <ThemedText
            style={[
                styles.filterTabText,
                active && { color: '#fff' },
            ]}
        >
            {label}
        </ThemedText>
    </Pressable>
);

// Empty State Component
const EmptyState = ({ filterType, colors }: { filterType: FilterType; colors: any }) => {
    const getMessage = () => {
        switch (filterType) {
            case 'UPCOMING':
                return 'No upcoming appointments scheduled.';
            case 'PAST':
                return 'No past appointments found.';
            case 'CANCELLED':
                return 'No cancelled appointments.';
            default:
                return 'No appointments found.';
        }
    };

    return (
        <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
                <IconSymbol name="calendar" size={48} color={colors.tint} />
            </View>
            <ThemedText type="default" style={styles.emptyStateTitle}>
                {filterType === 'UPCOMING' ? 'No Upcoming Appointments' : 
                 filterType === 'PAST' ? 'No Past Appointments' : 
                 filterType === 'CANCELLED' ? 'No Cancelled Appointments' : 'No Appointments'}
            </ThemedText>
            <ThemedText style={styles.emptyStateText}>{getMessage()}</ThemedText>
        </View>
    );
};

export default function AppointmentsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colors = {
        tint: useThemeColor({}, 'tint'),
        success: useThemeColor({}, 'success'),
        warning: useThemeColor({}, 'warning'),
        error: useThemeColor({}, 'error'),
        text: useThemeColor({}, 'text'),
        textSecondary: useThemeColor({}, 'textSecondary'),
        card: useThemeColor({}, 'card'),
        background: useThemeColor({}, 'background'),
    };

    const { data: appointmentsData, isLoading, error, refetch } = useAppointments();
    const { updateStatus } = useAppointmentMutations();
    
    const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
    const [refreshing, setRefreshing] = useState(false);

    const appointments = appointmentsData || [];

    // Filter appointments
    const filteredAppointments = useMemo(() => {
        const now = new Date();
        
        const filtered = appointments.filter((apt) => {
            const aptDateTime = new Date(`${apt.appointmentDate}T${apt.appointmentTime}`);
            
            switch (activeFilter) {
                case 'UPCOMING':
                    return apt.status === AppointmentStatus.SCHEDULED && aptDateTime >= now;
                case 'PAST':
                    return apt.status === AppointmentStatus.COMPLETED || 
                           (apt.status === AppointmentStatus.SCHEDULED && aptDateTime < now) ||
                           apt.status === AppointmentStatus.NO_SHOW;
                case 'CANCELLED':
                    return apt.status === AppointmentStatus.CANCELLED;
                default:
                    return true;
            }
        });

        // Sort by date (upcoming first for upcoming filter, past first for others)
        filtered.sort((a, b) => {
            const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
            const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
            return activeFilter === 'UPCOMING' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        });

        return filtered;
    }, [appointments, activeFilter]);

    // Handle refresh
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    // Handle cancel appointment
    const handleCancel = useCallback(async (id: string) => {
        Alert.alert(
            'Cancel Appointment',
            'Are you sure you want to cancel this appointment?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await updateStatus({ id, status: AppointmentStatus.CANCELLED });
                            Alert.alert('Success', 'Appointment cancelled successfully.');
                        } catch (err: any) {
                            Alert.alert('Error', err.message || 'Failed to cancel appointment');
                        }
                    },
                },
            ]
        );
    }, [updateStatus]);

    // Handle complete appointment
    const handleComplete = useCallback(async (id: string) => {
        Alert.alert(
            'Complete Appointment',
            'Mark this appointment as completed?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Complete',
                    onPress: async () => {
                        try {
                            await updateStatus({ id, status: AppointmentStatus.COMPLETED });
                            Alert.alert('Success', 'Appointment marked as completed.');
                        } catch (err: any) {
                            Alert.alert('Error', err.message || 'Failed to complete appointment');
                        }
                    },
                },
            ]
        );
    }, [updateStatus]);

    // Get counts for filter badges
    const counts = useMemo(() => {
        const now = new Date();
        const upcoming = appointments.filter(
            (apt) => apt.status === AppointmentStatus.SCHEDULED &&
            new Date(`${apt.appointmentDate}T${apt.appointmentTime}`) >= now
        ).length;
        const past = appointments.filter(
            (apt) => apt.status === AppointmentStatus.COMPLETED ||
            apt.status === AppointmentStatus.NO_SHOW ||
            (apt.status === AppointmentStatus.SCHEDULED &&
             new Date(`${apt.appointmentDate}T${apt.appointmentTime}`) < now)
        ).length;
        const cancelled = appointments.filter(
            (apt) => apt.status === AppointmentStatus.CANCELLED
        ).length;

        return { all: appointments.length, upcoming, past, cancelled };
    }, [appointments]);

    if (isLoading) {
        return (
            <>
            <Stack.Screen options={{ headerShown: false }} />
            <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
                <LinearGradient
                    colors={['#0284C7', '#0369A1']}
                    style={[styles.header, { paddingTop: 60 }]}
                >
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <IconSymbol name="chevron.left" size={24} color="white" />
                        </TouchableOpacity>
                        <View style={styles.headerTitleContainer}>
                            <ThemedText style={styles.headerLabel}>Appointments</ThemedText>
                        </View>
                        <View style={{ width: 40 }} />
                    </View>

                    <View style={styles.tabContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
                            <FilterTab
                                label={`All (${counts.all})`}
                                active={activeFilter === 'ALL'}
                                onPress={() => setActiveFilter('ALL')}
                                colors={colors}
                            />
                            <FilterTab
                                label={`Upcoming (${counts.upcoming})`}
                                active={activeFilter === 'UPCOMING'}
                                onPress={() => setActiveFilter('UPCOMING')}
                                colors={colors}
                            />
                            <FilterTab
                                label={`Past (${counts.past})`}
                                active={activeFilter === 'PAST'}
                                onPress={() => setActiveFilter('PAST')}
                                colors={colors}
                            />
                            <FilterTab
                                label={`Cancelled (${counts.cancelled})`}
                                active={activeFilter === 'CANCELLED'}
                                onPress={() => setActiveFilter('CANCELLED')}
                                colors={colors}
                            />
                        </ScrollView>
                    </View>
                </LinearGradient>
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={colors.tint} />
                    <ThemedText style={styles.loadingText}>Loading appointments...</ThemedText>
                </View>
            </ThemedView>
            </>
        );
    }

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
                <LinearGradient
                    colors={['#0284C7', '#0369A1']}
                    style={[styles.header, { paddingTop: 60 }]}
                >
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <IconSymbol name="chevron.left" size={24} color="white" />
                        </TouchableOpacity>
                        <View style={styles.headerTitleContainer}>
                            <ThemedText style={styles.headerLabel}>Appointments</ThemedText>
                        </View>
                        <View style={{ width: 40 }} />
                    </View>

                    <View style={styles.tabContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
                            <FilterTab
                                label={`All (${counts.all})`}
                                active={activeFilter === 'ALL'}
                                onPress={() => setActiveFilter('ALL')}
                                colors={colors}
                            />
                            <FilterTab
                                label={`Upcoming (${counts.upcoming})`}
                                active={activeFilter === 'UPCOMING'}
                                onPress={() => setActiveFilter('UPCOMING')}
                                colors={colors}
                            />
                            <FilterTab
                                label={`Past (${counts.past})`}
                                active={activeFilter === 'PAST'}
                                onPress={() => setActiveFilter('PAST')}
                                colors={colors}
                            />
                            <FilterTab
                                label={`Cancelled (${counts.cancelled})`}
                                active={activeFilter === 'CANCELLED'}
                                onPress={() => setActiveFilter('CANCELLED')}
                                colors={colors}
                            />
                        </ScrollView>
                    </View>
                </LinearGradient>

                {/* Error Message */}
                {error && (
                    <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
                        <ThemedText style={[styles.errorText, { color: colors.error }]}>
                            {(error as Error).message || 'Failed to load appointments'}
                        </ThemedText>
                    </View>
                )}

                {/* Appointments List */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.tint}
                        />
                    }
                >
                    {filteredAppointments.length === 0 ? (
                        <EmptyState filterType={activeFilter} colors={colors} />
                    ) : (
                        filteredAppointments.map((appointment) => (
                            <AppointmentCard
                                key={appointment.id}
                                appointment={appointment}
                                onCancel={handleCancel}
                                onComplete={handleComplete}
                                colors={colors}
                            />
                        ))
                    )}
                </ScrollView>
            </ThemedView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    tabContainer: {
        marginTop: 10,
    },
    tabScroll: {
        paddingRight: 16,
        gap: 8,
    },
    headerContent: {
        alignItems: 'center',
    },
    headerTitle: {
        color: 'white',
    },
    centerContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        opacity: 0.7,
    },
    filterContainer: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    filterScroll: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    filterTabText: {
        fontSize: 14,
        fontWeight: '500',
    },
    errorContainer: {
        margin: 16,
        padding: 12,
        borderRadius: 8,
    },
    errorText: {
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    appointmentCard: {
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    dateTimeContainer: {
        flex: 1,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '600',
    },
    timeText: {
        fontSize: 14,
        opacity: 0.7,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardBody: {
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: '500',
        opacity: 0.6,
        width: 80,
    },
    detailValue: {
        fontSize: 14,
        flex: 1,
    },
    notesContainer: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    notesText: {
        fontSize: 13,
        opacity: 0.8,
        marginTop: 4,
        fontStyle: 'italic',
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
    },
    cancelButton: {
        backgroundColor: 'transparent',
    },
    completeButton: {
        backgroundColor: '#10B981',
        borderWidth: 0,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyStateIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateText: {
        fontSize: 14,
        opacity: 0.7,
        textAlign: 'center',
    },
});
