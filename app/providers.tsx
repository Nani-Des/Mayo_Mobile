import { useState, useCallback, useEffect, useLayoutEffect } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    TextInput,
    Pressable,
    Modal,
    Linking,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRouter, Stack } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Button } from '@/components/ui/button';
import {
    getHospitals,
    getHospitalById,
    Hospital,
    HospitalStatus,
} from '@/lib/api/hospitals-api';

// Filter types
type FilterType = 'ALL' | 'ACTIVE' | 'INACTIVE';

// Helper to get status color
const getStatusColor = (status: HospitalStatus, colors: any): string => {
    switch (status) {
        case HospitalStatus.ACTIVE:
            return colors.success; // Green
        case HospitalStatus.INACTIVE:
            return colors.textSecondary; // Gray
        case HospitalStatus.PENDING:
            return colors.warning; // Yellow/Amber
        default:
            return colors.textSecondary;
    }
};

// Helper to get status label
const getStatusLabel = (status: HospitalStatus): string => {
    switch (status) {
        case HospitalStatus.ACTIVE:
            return 'Active';
        case HospitalStatus.INACTIVE:
            return 'Inactive';
        case HospitalStatus.PENDING:
            return 'Pending';
        default:
            return status;
    }
};

// Helper to format date
const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Status Badge Component
const StatusBadge = ({ status, colors }: { status: HospitalStatus; colors: any }) => {
    const backgroundColor = getStatusColor(status, colors);
    return (
        <View style={[styles.statusBadge, { backgroundColor: backgroundColor + '20' }]}>
            <ThemedText style={[styles.statusBadgeText, { color: backgroundColor }]}>
                {getStatusLabel(status)}
            </ThemedText>
        </View>
    );
};

// Integration Status Badge
const IntegrationBadge = ({ enabled, colors }: { enabled: boolean; colors: any }) => {
    const backgroundColor = enabled ? colors.success + '20' : colors.textSecondary + '20';
    const textColor = enabled ? colors.success : colors.textSecondary;
    return (
        <View style={[styles.integrationBadge, { backgroundColor }]}>
            <ThemedText style={[styles.integrationBadgeText, { color: textColor }]}>
                {enabled ? '● Integrated' : '○ Not Integrated'}
            </ThemedText>
        </View>
    );
};

// Protocol Badge Component
const ProtocolBadge = ({ protocol }: { protocol: string }) => {
    const colors = {
        tint: useThemeColor({}, 'tint'),
    };
    return (
        <View style={[styles.protocolBadge, { backgroundColor: colors.tint + '15' }]}>
            <ThemedText style={[styles.protocolBadgeText, { color: colors.tint }]}>
                {protocol}
            </ThemedText>
        </View>
    );
};

// Hospital Card Component
const HospitalCard = ({
    hospital,
    onPress,
    colors,
}: {
    hospital: Hospital;
    onPress: () => void;
    colors: any;
}) => {
    return (
        <Pressable onPress={onPress}>
            <Card style={styles.hospitalCard}>
                <View style={styles.cardHeader}>
                    <View style={styles.hospitalNameContainer}>
                        <ThemedText type="defaultSemiBold" style={styles.hospitalName}>
                            {hospital.name}
                        </ThemedText>
                        <ThemedText style={styles.hospitalId}>{hospital.hospitalId}</ThemedText>
                    </View>
                    <StatusBadge status={hospital.status} colors={colors} />
                </View>

                <View style={styles.cardBody}>
                    {hospital.address && (
                        <View style={styles.detailRow}>
                            <View style={styles.detailIconContainer}>
                                <IconSymbol name="location" size={16} color={colors.tint} />
                            </View>
                            <ThemedText style={styles.detailValue} numberOfLines={2}>
                                {hospital.address}
                            </ThemedText>
                        </View>
                    )}
                    {hospital.phone && (
                        <View style={styles.detailRow}>
                            <View style={styles.detailIconContainer}>
                                <IconSymbol name="phone" size={16} color={colors.tint} />
                            </View>
                            <ThemedText style={styles.detailValue}>{hospital.phone}</ThemedText>
                        </View>
                    )}
                    <View style={styles.detailRow}>
                        <View style={styles.detailIconContainer}>
                            <IconSymbol name="link" size={16} color={colors.tint} />
                        </View>
                        <IntegrationBadge enabled={hospital.integrationEnabled} colors={colors} />
                    </View>
                    
                    {hospital.supportedProtocols && hospital.supportedProtocols.length > 0 && (
                        <View style={styles.protocolsContainer}>
                            <ThemedText style={styles.protocolsLabel}>Protocols:</ThemedText>
                            <View style={styles.protocolsList}>
                                {hospital.supportedProtocols.map((protocol, index) => (
                                    <ProtocolBadge key={index} protocol={protocol} />
                                ))}
                            </View>
                        </View>
                    )}

                    {hospital.lastSyncAt && (
                        <View style={styles.syncRow}>
                            <ThemedText style={styles.syncLabel}>Last sync:</ThemedText>
                            <ThemedText style={styles.syncValue}>
                                {formatDate(hospital.lastSyncAt)}
                            </ThemedText>
                        </View>
                    )}
                </View>
            </Card>
        </Pressable>
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
const EmptyState = ({ filterType, searchQuery, colors }: { filterType: FilterType; searchQuery: string; colors: any }) => {
    const getMessage = () => {
        if (searchQuery) {
            return `No providers found matching "${searchQuery}".`;
        }
        switch (filterType) {
            case 'ACTIVE':
                return 'No active providers found.';
            case 'INACTIVE':
                return 'No inactive providers found.';
            default:
                return 'No providers found.';
        }
    };

    return (
        <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
                <IconSymbol name="building.2" size={48} color={colors.tint} />
            </View>
            <ThemedText type="default" style={styles.emptyStateTitle}>
                {searchQuery ? 'No Results' : 
                 filterType === 'ACTIVE' ? 'No Active Providers' : 
                 filterType === 'INACTIVE' ? 'No Inactive Providers' : 'No Providers'}
            </ThemedText>
            <ThemedText style={styles.emptyStateText}>{getMessage()}</ThemedText>
        </View>
    );
};

// Hospital Detail Modal
const HospitalDetailModal = ({
    hospital,
    visible,
    onClose,
    colors,
}: {
    hospital: Hospital | null;
    visible: boolean;
    onClose: () => void;
    colors: any;
}) => {
    if (!hospital) return null;

    const handleCall = () => {
        if (hospital.phone) {
            Linking.openURL(`tel:${hospital.phone}`);
        }
    };

    const handleEmail = () => {
        if (hospital.email) {
            Linking.openURL(`mailto:${hospital.email}`);
        }
    };

    const handleWebsite = () => {
        if (hospital.website) {
            Linking.openURL(hospital.website);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <ThemedView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                <View style={styles.modalHeader}>
                    <ThemedText type="title" style={styles.modalTitle}>{hospital.name}</ThemedText>
                    <Pressable onPress={onClose} style={styles.closeButton}>
                        <IconSymbol name="xmark" size={20} color={colors.text} />
                    </Pressable>
                </View>

                <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
                    <View style={styles.modalStatusRow}>
                        <StatusBadge status={hospital.status} colors={colors} />
                        <IntegrationBadge enabled={hospital.integrationEnabled} colors={colors} />
                    </View>

                    <Card style={styles.modalCard}>
                        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Contact Information</ThemedText>
                        
                        {hospital.address && (
                            <View style={styles.modalDetailRow}>
                                <ThemedText style={styles.modalLabel}>📍 Address:</ThemedText>
                                <ThemedText style={styles.modalValue}>{hospital.address}</ThemedText>
                            </View>
                        )}
                        
                        {hospital.phone && (
                            <Pressable onPress={handleCall} style={styles.modalDetailRow}>
                                <ThemedText style={styles.modalLabel}>📞 Phone:</ThemedText>
                                <ThemedText style={[styles.modalValue, styles.linkText]}>{hospital.phone}</ThemedText>
                            </Pressable>
                        )}
                        
                        {hospital.email && (
                            <Pressable onPress={handleEmail} style={styles.modalDetailRow}>
                                <ThemedText style={styles.modalLabel}>✉️ Email:</ThemedText>
                                <ThemedText style={[styles.modalValue, styles.linkText]}>{hospital.email}</ThemedText>
                            </Pressable>
                        )}
                        
                        {hospital.website && (
                            <Pressable onPress={handleWebsite} style={styles.modalDetailRow}>
                                <ThemedText style={styles.modalLabel}>🌐 Website:</ThemedText>
                                <ThemedText style={[styles.modalValue, styles.linkText]} numberOfLines={1}>
                                    {hospital.website}
                                </ThemedText>
                            </Pressable>
                        )}
                    </Card>

                    <Card style={styles.modalCard}>
                        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Integration Details</ThemedText>
                        
                        <View style={styles.modalDetailRow}>
                            <ThemedText style={styles.modalLabel}>🏥 Hospital ID:</ThemedText>
                            <ThemedText style={styles.modalValue}>{hospital.hospitalId}</ThemedText>
                        </View>
                        
                        <View style={styles.modalDetailRow}>
                            <ThemedText style={styles.modalLabel}>🔄 Integration:</ThemedText>
                            <ThemedText style={styles.modalValue}>
                                {hospital.integrationEnabled ? 'Enabled' : 'Disabled'}
                            </ThemedText>
                        </View>
                        
                        <View style={styles.modalDetailRow}>
                            <ThemedText style={styles.modalLabel}>� Last Sync:</ThemedText>
                            <ThemedText style={styles.modalValue}>
                                {hospital.lastSyncAt ? formatDate(hospital.lastSyncAt) : 'Never'}
                            </ThemedText>
                        </View>

                        {hospital.supportedProtocols && hospital.supportedProtocols.length > 0 && (
                            <View style={styles.modalProtocolsSection}>
                                <ThemedText style={styles.modalLabel}>📡 Supported Protocols:</ThemedText>
                                <View style={styles.protocolsList}>
                                    {hospital.supportedProtocols.map((protocol, index) => (
                                        <ProtocolBadge key={index} protocol={protocol} />
                                    ))}
                                </View>
                            </View>
                        )}
                    </Card>

                    <Card style={styles.modalCard}>
                        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Record Information</ThemedText>
                        
                        <View style={styles.modalDetailRow}>
                            <ThemedText style={styles.modalLabel}>📅 Created:</ThemedText>
                            <ThemedText style={styles.modalValue}>{formatDate(hospital.createdAt)}</ThemedText>
                        </View>
                        
                        <View style={styles.modalDetailRow}>
                            <ThemedText style={styles.modalLabel}>✏️ Updated:</ThemedText>
                            <ThemedText style={styles.modalValue}>{formatDate(hospital.updatedAt)}</ThemedText>
                        </View>
                    </Card>
                </ScrollView>
            </ThemedView>
        </Modal>
    );
};

export default function ProvidersScreen() {
    const navigation = useNavigation();
    const router = useRouter();
    
    // Hide the navigation header
    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
        });
    }, [navigation]);
    
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
    const insets = useSafeAreaInsets();

    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Detail modal state
    const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    // Fetch hospitals
    const fetchHospitals = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);

            // getHospitals already handles fallback to mock data internally
            const data = await getHospitals();
            setHospitals(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load providers');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchHospitals();
    }, [fetchHospitals]);

    // Filter and search hospitals
    useEffect(() => {
        let filtered = [...hospitals];

        // Apply status filter
        if (activeFilter !== 'ALL') {
            filtered = filtered.filter((hospital) => {
                if (activeFilter === 'ACTIVE') {
                    return hospital.status === HospitalStatus.ACTIVE;
                } else if (activeFilter === 'INACTIVE') {
                    return hospital.status === HospitalStatus.INACTIVE;
                }
                return true;
            });
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter((hospital) =>
                hospital.name.toLowerCase().includes(query) ||
                hospital.hospitalId.toLowerCase().includes(query) ||
                (hospital.address && hospital.address.toLowerCase().includes(query))
            );
        }

        // Sort alphabetically by name
        filtered.sort((a, b) => a.name.localeCompare(b.name));

        setFilteredHospitals(filtered);
    }, [hospitals, activeFilter, searchQuery]);

    // Handle refresh
    const onRefresh = useCallback(() => {
        fetchHospitals(true);
    }, [fetchHospitals]);

    // Handle hospital card press
    const handleHospitalPress = useCallback(async (hospital: Hospital) => {
        // Fetch full details (in case we have partial data)
        try {
            const fullHospital = await getHospitalById(hospital.id);
            setSelectedHospital(fullHospital || hospital);
        } catch {
            setSelectedHospital(hospital);
        }
        setDetailModalVisible(true);
    }, []);

    // Close detail modal
    const closeDetailModal = useCallback(() => {
        setDetailModalVisible(false);
        setSelectedHospital(null);
    }, []);

    // Get counts for filter badges
    const getFilterCounts = () => {
        const active = hospitals.filter((h) => h.status === HospitalStatus.ACTIVE).length;
        const inactive = hospitals.filter((h) => h.status === HospitalStatus.INACTIVE).length;

        return { all: hospitals.length, active, inactive };
    };

    const counts = getFilterCounts();

    if (loading) {
        return (
        <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            
            <LinearGradient
                colors={['#0284C7', '#0369A1']}
                style={[styles.header, { paddingTop: 60 }]}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <IconSymbol name="chevron.left" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <ThemedText style={styles.headerLabel}>Providers</ThemedText>
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
                            label={`Active (${counts.active})`}
                            active={activeFilter === 'ACTIVE'}
                            onPress={() => setActiveFilter('ACTIVE')}
                            colors={colors}
                        />
                        <FilterTab
                            label={`Inactive (${counts.inactive})`}
                            active={activeFilter === 'INACTIVE'}
                            onPress={() => setActiveFilter('INACTIVE')}
                            colors={colors}
                        />
                    </ScrollView>
                </View>
            </LinearGradient>
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={colors.tint} />
                    <ThemedText style={styles.loadingText}>Loading providers...</ThemedText>
                </View>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            
            <LinearGradient
                colors={['#0284C7', '#0369A1']}
                style={[styles.header, { paddingTop: 60 }]}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <IconSymbol name="chevron.left" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <ThemedText style={styles.headerLabel}>Providers</ThemedText>
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
                            label={`Active (${counts.active})`}
                            active={activeFilter === 'ACTIVE'}
                            onPress={() => setActiveFilter('ACTIVE')}
                            colors={colors}
                        />
                        <FilterTab
                            label={`Inactive (${counts.inactive})`}
                            active={activeFilter === 'INACTIVE'}
                            onPress={() => setActiveFilter('INACTIVE')}
                            colors={colors}
                        />
                    </ScrollView>
                </View>
            </LinearGradient>

            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
                    <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
                    <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder="Search by name or location..."
                            placeholderTextColor={colors.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {searchQuery.length > 0 && (
                            <Pressable onPress={() => setSearchQuery('')}>
                                <ThemedText style={styles.clearButton}>✕</ThemedText>
                            </Pressable>
                        )}
                    </View>
                </View>

                {/* Filter Tabs */}
                <View style={styles.filterContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterScroll}
                    >
                        <FilterTab
                            label={`All (${counts.all})`}
                            active={activeFilter === 'ALL'}
                            onPress={() => setActiveFilter('ALL')}
                            colors={colors}
                        />
                        <FilterTab
                            label={`Active (${counts.active})`}
                            active={activeFilter === 'ACTIVE'}
                            onPress={() => setActiveFilter('ACTIVE')}
                            colors={colors}
                        />
                        <FilterTab
                            label={`Inactive (${counts.inactive})`}
                            active={activeFilter === 'INACTIVE'}
                            onPress={() => setActiveFilter('INACTIVE')}
                            colors={colors}
                        />
                    </ScrollView>
                </View>

                {/* Error Message */}
                {error && (
                    <View style={[styles.errorContainer, { backgroundColor: colors.error + '20' }]}>
                        <ThemedText style={[styles.errorText, { color: colors.error }]}>
                            {error}
                        </ThemedText>
                    </View>
                )}

                {/* Hospitals List */}
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
                    {filteredHospitals.length === 0 ? (
                        <EmptyState filterType={activeFilter} searchQuery={searchQuery} colors={colors} />
                    ) : (
                        filteredHospitals.map((hospital) => (
                            <HospitalCard
                                key={hospital.id}
                                hospital={hospital}
                                onPress={() => handleHospitalPress(hospital)}
                                colors={colors}
                            />
                        ))
                    )}
                </ScrollView>

                {/* Detail Modal */}
                <HospitalDetailModal
                    hospital={selectedHospital}
                    visible={detailModalVisible}
                    onClose={closeDetailModal}
                    colors={colors}
                />
            </ThemedView>
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
    detailIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(2, 132, 199, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    emptyStateIcon: {
        marginBottom: 12,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
    },
    searchIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        padding: 0,
    },
    clearButton: {
        fontSize: 16,
        opacity: 0.5,
        padding: 4,
    },
    filterContainer: {
        paddingVertical: 8,
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
    hospitalCard: {
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    hospitalNameContainer: {
        flex: 1,
        marginRight: 12,
    },
    hospitalName: {
        fontSize: 16,
        fontWeight: '600',
    },
    hospitalId: {
        fontSize: 12,
        opacity: 0.6,
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
        marginRight: 8,
    },
    detailValue: {
        fontSize: 14,
        flex: 1,
    },
    integrationBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    integrationBadgeText: {
        fontSize: 12,
        fontWeight: '500',
    },
    protocolsContainer: {
        marginTop: 8,
    },
    protocolsLabel: {
        fontSize: 12,
        opacity: 0.6,
        marginBottom: 6,
    },
    protocolsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    protocolBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    protocolBadgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    syncRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    syncLabel: {
        fontSize: 12,
        opacity: 0.6,
        marginRight: 4,
    },
    syncValue: {
        fontSize: 12,
        opacity: 0.8,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
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
    // Modal styles
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    modalTitle: {
        flex: 1,
        marginRight: 16,
    },
    closeButton: {
        padding: 8,
    },
    closeButtonText: {
        fontSize: 20,
        opacity: 0.6,
    },
    modalScroll: {
        flex: 1,
    },
    modalContent: {
        padding: 16,
        paddingBottom: 40,
    },
    modalStatusRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    modalCard: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    modalDetailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    modalLabel: {
        fontSize: 14,
        fontWeight: '500',
        opacity: 0.6,
        width: 120,
    },
    modalValue: {
        fontSize: 14,
        flex: 1,
    },
    linkText: {
        color: '#007AFF',
    },
    modalProtocolsSection: {
        marginTop: 8,
    },
});

