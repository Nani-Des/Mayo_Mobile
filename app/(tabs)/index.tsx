import { LinearGradient } from 'expo-linear-gradient';
import type { LinearGradientProps } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import { useEffect } from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/providers/AuthProvider';
import { useFamilyData } from '@/hooks/useFamilyData';
import { useMyPatientData, useFamilyMemberPatientData, useHealthMetrics } from '@/hooks/usePatientData';
import { AccountSelector } from '@/components/AccountSelector';



const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tintColor = useThemeColor({}, 'tint');
  
  // Auth and Family Data
  const { user } = useAuth();
  const { data: familyData } = useFamilyData();
  
  // Account Selection State
  const [selectedAccountId, setSelectedAccountId] = React.useState<string>('me');
  
  // Patient Data Hooks
  const { data: myPatient } = useMyPatientData();
  const { data: familyMemberPatient } = useFamilyMemberPatientData(
    selectedAccountId !== 'me' ? selectedAccountId : undefined
  );
  
  // Current active patient
  const activePatient = selectedAccountId === 'me' ? myPatient : familyMemberPatient;
  
  // Health Metrics
  const { data: healthMetrics, isLoading: isHealthLoading } = useHealthMetrics(activePatient?.id);

  // Prepare accounts for selector
  const accounts = [
    { id: 'me', name: user?.fullName || 'Me', role: 'Primary Account', isMe: true },
    ...(familyData?.members?.map(m => ({
      id: m.id,
      name: `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'Family Member',
      role: m.relationship || 'Dependent',
    })) || [])
  ];

  const features: {
    title: string;
    description: string;
    icon: any;
    route: string;
  }[] = [
      {
        title: "Medical Records",
        description: "History & Labs",
        icon: "doc.text",
        route: "/medical-records"
      },
      {
        title: "Data Transfer",
        description: "Share Securely",
        icon: "arrow.triangle.swap",
        route: "/data-transfer"
      },
      {
        title: "Providers",
        description: "Find Care",
        icon: "location",
        route: "/providers"
      },
      {
        title: "Appointments",
        description: "Schedule Visits",
        icon: "calendar",
        route: "/appointments"
      }
    ];

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="light" />
      {/* Fixed Header */}
      <LinearGradient
        colors={['#0284C7', '#0369A1']}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.headerTop}>
          <View>
            <ThemedText style={styles.greeting}>Good Morning,</ThemedText>
            <AccountSelector 
              accounts={accounts}
              selectedAccountId={selectedAccountId}
              onSelectAccount={setSelectedAccountId}
            />
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <IconSymbol name="person.circle" size={40} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <IconSymbol name="heart.fill" size={16} color="white" />
              <ThemedText style={styles.infoLabel}>Health Score</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.infoValue}>
                {isHealthLoading ? '--' : `${healthMetrics?.healthScore || 0}%`}
              </ThemedText>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <IconSymbol name="calendar.badge.clock" size={16} color="white" />
              <ThemedText style={styles.infoLabel}>Next Visit</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.infoValue}>
                {activePatient ? 'None' : '--'}
              </ThemedText>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.content}>
          {/* Quick Access Grid */}
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Quick Access</ThemedText>
          </View>

          <View style={styles.grid}>
            {features.map((feature, index) => (
              <TouchableOpacity
                key={index}
                style={styles.gridItem}
                onPress={() => router.push(feature.route as any)}
                activeOpacity={0.7}
              >
                <Card variant="elevated" style={styles.featureCard}>
                  <View style={[styles.iconContainer, { backgroundColor: tintColor + '15' }]}>
                    <IconSymbol name={feature.icon} size={28} color={tintColor} />
                  </View>
                  <ThemedText type="cardTitle" style={styles.featureTitle}>{feature.title}</ThemedText>
                  <ThemedText type="caption" style={styles.featureDesc}>{feature.description}</ThemedText>
                </Card>
              </TouchableOpacity>
            ))}
          </View>


          {/* Recent Activity */}
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Recent Activity</ThemedText>
            <TouchableOpacity onPress={() => router.push('/medical-records')}>
              <ThemedText type="link">See All</ThemedText>
            </TouchableOpacity>
          </View>

          <Card variant="flat" style={[styles.recentList, { backgroundColor: useThemeColor({}, 'card') }]}>
            {isHealthLoading ? (
              <View style={styles.recentItem}>
                <ThemedText type="caption">Loading activity...</ThemedText>
              </View>
            ) : healthMetrics?.recentRecords && healthMetrics.recentRecords.length > 0 ? (
              healthMetrics.recentRecords.map((record, i) => (
                <TouchableOpacity 
                  key={record.id} 
                  style={[styles.recentItem, { borderBottomColor: useThemeColor({}, 'border') }]}
                  onPress={() => router.push(`/medical-records/${record.id}` as any)}
                >
                  <View style={[styles.recentIcon, { backgroundColor: tintColor + '15' }]}>
                    <IconSymbol name="doc.text.fill" size={20} color={tintColor} />
                  </View>
                  <View style={styles.recentInfo}>
                    <ThemedText type="defaultSemiBold">{record.recordType.replace('_', ' ')}</ThemedText>
                    <ThemedText type="caption">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color={useThemeColor({}, 'icon')} />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.recentItem}>
                <ThemedText type="caption">No recent activity</ThemedText>
              </View>
            )}
          </Card>

          {/* Offline Banner */}
          <Card variant="flat" style={[styles.offlineContainer, { backgroundColor: useThemeColor({}, 'background') }]}>
            <IconSymbol name="wifi.slash" size={16} color={useThemeColor({}, 'textSecondary')} style={{ marginRight: 8 }} />
            <ThemedText type="caption" style={{ color: useThemeColor({}, 'textSecondary') }}>Working offline • Changes sync automatically</ThemedText>
          </Card>
        </View>
      </ScrollView>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  greeting: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginBottom: 4,
  },
  username: {
    color: 'white',
  },
  profileButton: {
    padding: 4,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 8,
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  infoLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    marginTop: 4,
  },
  infoValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: -20, // Reduced overlap to prevent covering text
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridItem: {
    width: (width - 48 - 16) / 2, // (Screen width - padding - gap) / 2
  },
  featureCard: {
    padding: 16,
    height: 160,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    marginTop: 12,
  },
  featureDesc: {
    marginTop: 4,
  },
  recentList: {
    borderRadius: 20,
    padding: 4, // Background color will be handled by the Card component or themed view
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9', // Very subtle separator
  },
  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  recentInfo: {
    flex: 1,
  },
  offlineContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    padding: 12,
    alignSelf: 'center',
  },
});

export default HomeScreen;
