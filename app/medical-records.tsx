import { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    View,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

// API imports
import { Patient } from '@/lib/api/patients-api';
import { type LabResult } from '@/lib/api/lab-results-api';
import { type Medication } from '@/lib/api/medications-api';
import { type Allergy } from '@/lib/api/allergies-api';
import { type VitalSign } from '@/lib/api/vitals-api';

// Hooks
import { usePatients } from '@/hooks/usePatients';
import { useMedicalRecords } from '@/hooks/useMedicalRecords';
import { useAuth } from '@/providers/AuthProvider';
import { useFamilyData } from '@/hooks/useFamilyData';
import { AccountSelector } from '@/components/AccountSelector';
import { LinearGradient } from 'expo-linear-gradient';

// Tab types
type TabType = 'lab-results' | 'medications' | 'allergies' | 'vitals';

export default function MedicalRecordsScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('lab-results');
    const [selectedAccountId, setSelectedAccountId] = useState<string>('me');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Auth and Family Data
    const { user } = useAuth();
    const { data: familyData } = useFamilyData();

    // 1. Fetch Patients (for the logged in user)
    const { 
        data: patientsData, 
        isLoading: isLoadingPatients, 
        error: patientsError,
        refetch: refetchPatients 
    } = usePatients();

    const patients = patientsData || [];

    // Current selected patient object
    const selectedPatient = selectedAccountId === 'me' 
        ? patients[0] // Primary patient for the user
        : patients.find(p => p.familyMemberId === selectedAccountId) || 
          patients.find(p => p.id === selectedAccountId); // Try to find by familyMemberId first

    console.log('[MedicalRecords] Selected account ID:', selectedAccountId);
    console.log('[MedicalRecords] Available patients:', patients);
    console.log('[MedicalRecords] Selected patient:', selectedPatient);

    // 2. Fetch Medical Records (dependent on selectedPatient)
    const {
        data: recordsData,
        isLoading: isLoadingRecords,
        error: recordsError,
        refetch: refetchRecords
    } = useMedicalRecords(selectedPatient?.id);

    // Prepare accounts for selector
    const accounts = [
        { id: 'me', name: user?.fullName || 'Me', role: 'Primary Account', isMe: true },
        ...(familyData?.members?.map(m => ({
            id: m.id,
            name: `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'Family Member',
            role: m.relationship || 'Dependent',
        })) || [])
    ];

    const labResults = recordsData?.labs || [];
    const medications = recordsData?.meds || [];
    const allergies = recordsData?.allergies || [];
    const vitals = recordsData?.vitals || [];
    
    // Derived state
    const isLoading = isLoadingPatients || (!!selectedPatient && isLoadingRecords);
    const error = (patientsError as Error)?.message || (recordsError as Error)?.message || null;

    const backgroundColor = useThemeColor({}, 'background');
    const cardBackground = useThemeColor({}, 'card');
    const borderColor = useThemeColor({}, 'border');
    const textSecondary = useThemeColor({}, 'textSecondary');
    const tintColor = useThemeColor({}, 'tint');
    const errorColor = useThemeColor({}, 'error');
    const warningColor = useThemeColor({}, 'warning');
    const successColor = useThemeColor({}, 'success');

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await Promise.all([refetchPatients(), refetchRecords()]);
        setIsRefreshing(false);
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    const getStatusColor = (status: string) => {
        if (!status) return textSecondary;
        switch (status.toLowerCase()) {
            case 'completed':
            case 'active':
            case 'resolved':
                return successColor;
            case 'abnormal':
            case 'moderate':
            case 'severe':
                return warningColor;
            case 'critical':
            case 'life-threatening':
                return errorColor;
            case 'pending':
            case 'on-hold':
                return textSecondary;
            default:
                return textSecondary;
        }
    };

    const renderTabButton = (tab: TabType, label: string) => {
        const isActive = activeTab === tab;
        return (
            <TouchableOpacity
                key={tab}
                style={[
                    styles.tabButton,
                    isActive && { backgroundColor: tintColor },
                ]}
                onPress={() => setActiveTab(tab)}
            >
                <ThemedText
                    style={[
                        styles.tabButtonText,
                        isActive && { color: '#FFFFFF' },
                    ]}
                >
                    {label}
                </ThemedText>
            </TouchableOpacity>
        );
    };


    const renderLabResultCard = (item: LabResult) => (
        <Card key={item.id} style={styles.recordCard}>
            <View style={styles.cardHeader}>
                <ThemedText type="cardTitle">{item.testName}</ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </ThemedText>
                </View>
            </View>
            <View style={styles.cardContent}>
                <View style={styles.resultRow}>
                    <ThemedText style={styles.resultLabel}>Result:</ThemedText>
                    <ThemedText type="defaultSemiBold">
                        {item.result}{item.unit && ` (${item.unit})`}
                    </ThemedText>
                </View>
                {item.referenceRange && (
                    <View style={styles.resultRow}>
                        <ThemedText style={styles.resultLabel}>Reference:</ThemedText>
                        <ThemedText style={styles.resultValue}>{item.referenceRange}</ThemedText>
                    </View>
                )}
                <View style={styles.resultRow}>
                    <ThemedText style={styles.resultLabel}>Date:</ThemedText>
                    <ThemedText style={styles.resultValue}>{formatDate(item.performedAt)}</ThemedText>
                </View>
                {item.orderingProvider && (
                    <View style={styles.resultRow}>
                        <ThemedText style={styles.resultLabel}>Ordered by:</ThemedText>
                        <ThemedText style={styles.resultValue}>{item.orderingProvider}</ThemedText>
                    </View>
                )}
                {item.notes && (
                    <ThemedText style={styles.notesText}>{item.notes}</ThemedText>
                )}
            </View>
        </Card>
    );

    const renderMedicationCard = (item: Medication) => (
        <Card key={item.id} style={styles.recordCard}>
            <View style={styles.cardHeader}>
                <ThemedText type="cardTitle">{item.medicationName}</ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </ThemedText>
                </View>
            </View>
            <View style={styles.cardContent}>
                <View style={styles.resultRow}>
                    <ThemedText style={styles.resultLabel}>Dosage:</ThemedText>
                    <ThemedText style={styles.resultValue}>{item.dosage}</ThemedText>
                </View>
                <View style={styles.resultRow}>
                    <ThemedText style={styles.resultLabel}>Frequency:</ThemedText>
                    <ThemedText style={styles.resultValue}>{item.frequency}</ThemedText>
                </View>
                <View style={styles.resultRow}>
                    <ThemedText style={styles.resultLabel}>Start Date:</ThemedText>
                    <ThemedText style={styles.resultValue}>{formatDate(item.prescribedAt)}</ThemedText>
                </View>
                {item.endedAt && (
                    <View style={styles.resultRow}>
                        <ThemedText style={styles.resultLabel}>End Date:</ThemedText>
                        <ThemedText style={styles.resultValue}>{formatDate(item.endedAt)}</ThemedText>
                    </View>
                )}
                {item.prescribingProvider && (
                    <View style={styles.resultRow}>
                        <ThemedText style={styles.resultLabel}>Prescribed by:</ThemedText>
                        <ThemedText style={styles.resultValue}>{item.prescribingProvider}</ThemedText>
                    </View>
                )}
                {item.instructions && (
                    <ThemedText style={styles.notesText}>💊 {item.instructions}</ThemedText>
                )}
            </View>
        </Card>
    );

    const renderAllergyCard = (item: Allergy) => (
        <Card key={item.id} style={styles.recordCard}>
            <View style={styles.cardHeader}>
                <ThemedText type="cardTitle">⚠️ {item.allergen}</ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.reactionSeverity) + '20' }]}>
                    <ThemedText style={[styles.statusText, { color: getStatusColor(item.reactionSeverity) }]}>
                        {item.reactionSeverity.charAt(0).toUpperCase() + item.reactionSeverity.slice(1)}
                    </ThemedText>
                </View>
            </View>
            <View style={styles.cardContent}>
                <View style={styles.resultRow}>
                    <ThemedText style={styles.resultLabel}>Reaction:</ThemedText>
                    <ThemedText style={styles.resultValue}>{item.reactionDescription}</ThemedText>
                </View>
                <View style={styles.resultRow}>
                    <ThemedText style={styles.resultLabel}>Status:</ThemedText>
                    <ThemedText style={styles.resultValue}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </ThemedText>
                </View>
                {item.onsetDate && (
                    <View style={styles.resultRow}>
                        <ThemedText style={styles.resultLabel}>Onset:</ThemedText>
                        <ThemedText style={styles.resultValue}>{formatDate(item.onsetDate)}</ThemedText>
                    </View>
                )}
                {item.verifiedBy && (
                    <View style={styles.resultRow}>
                        <ThemedText style={styles.resultLabel}>Verified by:</ThemedText>
                        <ThemedText style={styles.resultValue}>{item.verifiedBy}</ThemedText>
                    </View>
                )}
                {item.notes && (
                    <ThemedText style={styles.notesText}>{item.notes}</ThemedText>
                )}
            </View>
        </Card>
    );

    const renderVitalCard = (item: VitalSign) => (
        <Card key={item.id} style={styles.recordCard}>
            <View style={styles.cardHeader}>
                <ThemedText type="cardTitle">{item.type.replace(/_/g, ' ')}</ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status}
                    </ThemedText>
                </View>
            </View>
            <View style={styles.cardContent}>
                <View style={styles.resultRow}>
                    <ThemedText style={styles.resultLabel}>Value:</ThemedText>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <ThemedText type="cardTitle" style={{ color: tintColor }}>
                        {item.value}
                    </ThemedText>
                    <ThemedText style={{ fontSize: 14, opacity: 0.6, marginLeft: 2 }}>
                        {item.unit}
                    </ThemedText>
                </View>
                </View>
                <View style={styles.resultRow}>
                    <ThemedText style={styles.resultLabel}>Measured At:</ThemedText>
                    <ThemedText style={styles.resultValue}>{formatDate(item.measuredAt)}</ThemedText>
                </View>
                {item.notes && (
                    <ThemedText style={styles.notesText}>{item.notes}</ThemedText>
                )}
            </View>
        </Card>
    );

    const renderEmptyState = (message: string) => (
        <View style={styles.emptyState}>
            <ThemedText style={styles.emptyStateIcon}>📋</ThemedText>
            <ThemedText type="subtitle" style={styles.emptyStateTitle}>No Records Found</ThemedText>
            <ThemedText style={styles.emptyStateText}>{message}</ThemedText>
        </View>
    );

    const renderContent = () => {
        if (isLoading && !isRefreshing) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={tintColor} />
                    <ThemedText style={styles.loadingText}>Loading medical records...</ThemedText>
                </View>
            );
        }

        switch (activeTab) {
            case 'lab-results':
                if (labResults.length === 0) {
                    return renderEmptyState('No lab results available for this patient.');
                }
                return labResults.map(renderLabResultCard);

            case 'medications':
                if (medications.length === 0) {
                    return renderEmptyState('No medications on file for this patient.');
                }
                return medications.map(renderMedicationCard);

            case 'allergies':
                if (allergies.length === 0) {
                    return renderEmptyState('No allergies recorded for this patient.');
                }
                return allergies.map(renderAllergyCard);

            case 'vitals':
                if (vitals.length === 0) {
                    return renderEmptyState('No vital signs recorded for this patient.');
                }
                return vitals.map(renderVitalCard);

            default:
                return null;
        }
    };

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ 
                headerShown: false
            }} />
            
            <LinearGradient
                colors={['#0284C7', '#0369A1']}
                style={[styles.header, { paddingTop: 60, paddingBottom: 20 }]}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <IconSymbol name="chevron.left" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <ThemedText style={styles.headerLabel}>Medical Records</ThemedText>
                        <AccountSelector 
                            accounts={accounts}
                            selectedAccountId={selectedAccountId}
                            onSelectAccount={setSelectedAccountId}
                        />
                    </View>
                    <View style={{ width: 40 }} /> {/* Spacer */}
                </View>

                {/* Tab Navigation inside Header for better look */}
                <View style={styles.tabContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
                        {renderTabButton('lab-results', 'Lab Results')}
                        {renderTabButton('medications', 'Medications')}
                        {renderTabButton('allergies', 'Allergies')}
                        {renderTabButton('vitals', 'Vitals')}
                    </ScrollView>
                </View>
            </LinearGradient>

            {/* Error Message */}
            {error && (
                <View style={[styles.errorBanner, { backgroundColor: errorColor + '20' }]}>
                    <ThemedText style={[styles.errorBannerText, { color: errorColor }]}>
                        ⚠️ {error}
                    </ThemedText>
                </View>
            )}

            {/* Content */}
            <ScrollView
                style={styles.contentScroll}
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={tintColor}
                    />
                }
            >
                {renderContent()}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
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
    tabButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    tabButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    contentScroll: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    loadingContainer: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        opacity: 0.7,
    },
    recordCard: {
        marginBottom: 16,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    cardContent: {
        gap: 8,
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    resultLabel: {
        fontSize: 14,
        opacity: 0.6,
    },
    resultValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    notesText: {
        marginTop: 12,
        fontSize: 13,
        opacity: 0.8,
        lineHeight: 18,
        fontStyle: 'italic',
        paddingTop: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    errorBanner: {
        margin: 16,
        padding: 12,
        borderRadius: 12,
    },
    errorBannerText: {
        textAlign: 'center',
        fontWeight: '500',
    },
    emptyState: {
        paddingVertical: 80,
        alignItems: 'center',
    },
    emptyStateIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyStateTitle: {
        marginBottom: 8,
    },
    emptyStateText: {
        textAlign: 'center',
        opacity: 0.6,
        paddingHorizontal: 40,
    },
});
