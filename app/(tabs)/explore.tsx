import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Collapsible } from '@/components/ui/collapsible';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function TabTwoScreen() {
  const router = useRouter();
  const tintColor = useThemeColor({}, 'tint');

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero Section */}
        <LinearGradient
          colors={['#0284C7', '#0369A1']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.iconCircle}>
              <IconSymbol size={48} color="#0284C7" name="info.circle" />
            </View>
            <ThemedText type="hero" style={styles.headerTitle}>
              Mayo EMR
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Secure. Offline-first. Ghana-focused.
            </ThemedText>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Key Features</ThemedText>

          <View style={styles.featuresGrid}>
            <Card variant="elevated" style={styles.featureCard}>
              <IconSymbol name="wifi.slash" size={32} color={tintColor} style={styles.featureIcon} />
              <ThemedText type="cardTitle">Offline-First</ThemedText>
              <ThemedText type="caption" style={styles.featureText}>Works without internet connectivity</ThemedText>
            </Card>

            <Card variant="elevated" style={styles.featureCard}>
              <IconSymbol name="lock.fill" size={32} color={Colors.light.success} style={styles.featureIcon} />
              <ThemedText type="cardTitle">Secure</ThemedText>
              <ThemedText type="caption" style={styles.featureText}>End-to-end encrypted local storage</ThemedText>
            </Card>

            <Card variant="elevated" style={styles.featureCard}>
              <IconSymbol name="arrow.triangle.swap" size={32} color={Colors.light.warning} style={styles.featureIcon} />
              <ThemedText type="cardTitle">Transfer</ThemedText>
              <ThemedText type="caption" style={styles.featureText}>Share via Bluetooth, WiFi, or QR</ThemedText>
            </Card>

            <Card variant="elevated" style={styles.featureCard}>
              <IconSymbol name="person.crop.rectangle.fill" size={32} color={Colors.light.error} style={styles.featureIcon} />
              <ThemedText type="cardTitle">Ghana Card</ThemedText>
              <ThemedText type="caption" style={styles.featureText}>National ID integration support</ThemedText>
            </Card>
          </View>

          <ThemedText type="subtitle" style={styles.sectionTitle}>Documentation</ThemedText>

          <Card variant="outlined" style={styles.docItem}>
            <Collapsible title="Offline Architecture">
              <ThemedText style={styles.collapsibleText}>
                Work seamlessly without internet connectivity. All data is securely stored on your device and syncs automatically when online.
              </ThemedText>
            </Collapsible>
          </Card>

          <Card variant="outlined" style={styles.docItem}>
            <Collapsible title="Data Transfer Protocols">
              <ThemedText style={styles.collapsibleText}>
                Transfer medical records securely between devices using:
              </ThemedText>
              <ThemedText style={styles.listItem}>• Bluetooth Low Energy</ThemedText>
              <ThemedText style={styles.listItem}>• WiFi Direct (P2P)</ThemedText>
              <ThemedText style={styles.listItem}>• Encrypted QR Codes</ThemedText>

              <Button
                title="Try Transfer"
                icon="arrow.right.circle.fill"
                onPress={() => router.push('/data-transfer')}
                style={{ marginTop: 16 }}
              />
            </Collapsible>
          </Card>

          <Card variant="outlined" style={styles.docItem}>
            <Collapsible title="Security Standards">
              <ThemedText style={styles.collapsibleText}>
                Built with security and privacy in mind, featuring:
              </ThemedText>
              <ThemedText style={styles.listItem}>• AES-256 Encryption</ThemedText>
              <ThemedText style={styles.listItem}>• Local-first Key Management</ThemedText>
              <ThemedText style={styles.listItem}>• HIPAA-ready Audit Logs</ThemedText>
            </Collapsible>
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
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  headerTitle: {
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    marginTop: 8,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  featureCard: {
    width: '47%', // Slightly less than half to account for gap
    padding: 16,
    alignItems: 'center',
    height: 180,
    justifyContent: 'center',
  },
  featureIcon: {
    marginBottom: 12,
  },
  featureText: {
    textAlign: 'center',
    marginTop: 8,
  },
  docItem: {
    marginBottom: 16,
    padding: 0, // Let collapsible handle padding
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  collapsibleText: {
    marginBottom: 12,
    lineHeight: 22,
  },
  listItem: {
    marginBottom: 4,
    opacity: 0.8,
  },
});