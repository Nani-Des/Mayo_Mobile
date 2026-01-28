import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tintColor = useThemeColor({}, 'tint');

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
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero Section */}
        <LinearGradient
          colors={['#0284C7', '#0369A1']} // New Mayo Blue Palette
          style={[styles.header, { paddingTop: insets.top + 20 }]}
        >
          <View style={styles.headerTop}>
            <View>
              <ThemedText style={styles.greeting}>Good Morning,</ThemedText>
              <ThemedText type="hero" style={styles.username}>Sarah Doe</ThemedText>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <IconSymbol name="person.circle" size={40} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Heart Rate</ThemedText>
              <View style={styles.infoValueContainer}>
                <IconSymbol name="heart.fill" size={16} color="#EF4444" style={{ marginRight: 6 }} />
                <ThemedText type="defaultSemiBold" style={styles.infoValue}>72 bpm</ThemedText>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Next Visit</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.infoValue}>Oct 24</ThemedText>
            </View>
          </View>
        </LinearGradient>

        <ThemedView style={styles.content}>
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
            <TouchableOpacity>
              <ThemedText type="link">See All</ThemedText>
            </TouchableOpacity>
          </View>

          <Card variant="flat" style={[styles.recentList, { backgroundColor: useThemeColor({}, 'card') }]}>
            {[1, 2].map((_, i) => (
              <View key={i} style={[styles.recentItem, { borderBottomColor: useThemeColor({}, 'border') }]}>
                <View style={[styles.recentIcon, { backgroundColor: i === 0 ? tintColor + '15' : Colors.light.success + '15' }]}>
                  <IconSymbol name={i === 0 ? 'doc.text.fill' : 'checkmark.circle.fill'} size={20} color={i === 0 ? tintColor : Colors.light.success} />
                </View>
                <View style={styles.recentInfo}>
                  <ThemedText type="defaultSemiBold">{i === 0 ? 'Lab Results Available' : 'Appointment Confirmed'}</ThemedText>
                  <ThemedText type="caption">Today, 9:41 AM</ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={20} color={useThemeColor({}, 'icon')} />
              </View>
            ))}
          </Card>

          {/* Offline Banner */}
          <Card variant="flat" style={[styles.offlineContainer, { backgroundColor: useThemeColor({}, 'background') }]}>
            <IconSymbol name="wifi.slash" size={16} color={useThemeColor({}, 'textSecondary')} style={{ marginRight: 8 }} />
            <ThemedText type="caption" style={{ color: useThemeColor({}, 'textSecondary') }}>Working offline • Changes sync automatically</ThemedText>
          </Card>
        </ThemedView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 60,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 16,
  },
  infoLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValue: {
    color: 'white',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: -40, // Overlap effect
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