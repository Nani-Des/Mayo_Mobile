import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

// Database import commented out - using mock data
// import { database } from '@/model';
// import FamilyMember from '@/model/FamilyMember';

interface FamilyScreenProps {
  members: any[];
}

const FamilyScreen = ({ members = [] }: FamilyScreenProps) => {
  const router = useRouter();
  const tintColor = useThemeColor({}, 'tint');

  const handleAddMember = async () => {
    // Placeholder - database operations disabled due to JSI issues
    console.log('Add member placeholder - database operations disabled');
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0284C7', '#0369A1']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.iconCircle}>
            <IconSymbol size={40} color="#0284C7" name="person.3.fill" />
          </View>
          <ThemedText type="hero" style={styles.headerTitle}>
            Family Account
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Manage your dependents and health records
          </ThemedText>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Family Members</ThemedText>
            <TouchableOpacity onPress={handleAddMember}>
              <IconSymbol name="plus.circle.fill" size={24} color={tintColor} />
            </TouchableOpacity>
          </View>

          {members.length === 0 ? (
            <Card variant="flat" style={styles.emptyCard}>
              <IconSymbol name="person.crop.circle.badge.plus" size={48} color={useThemeColor({}, 'textSecondary')} />
              <ThemedText style={styles.emptyText}>No family members added yet.</ThemedText>
              <Button 
                title="Add Your First Member" 
                onPress={handleAddMember}
                style={{ marginTop: 16 }}
              />
            </Card>
          ) : (
            members.map((member) => (
              <Card key={member.id} variant="elevated" style={styles.memberCard}>
                <View style={styles.memberInfo}>
                  <View style={[styles.avatar, { backgroundColor: tintColor + '20' }]}>
                    <ThemedText style={{ color: tintColor, fontWeight: 'bold' }}>
                      {member.firstName[0]}{member.lastName[0]}
                    </ThemedText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="defaultSemiBold">{member.firstName} {member.lastName}</ThemedText>
                    <ThemedText type="caption">{member.relationship}</ThemedText>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color={useThemeColor({}, 'icon')} />
                </View>
              </Card>
            ))
          )}

          <ThemedText type="subtitle" style={styles.sectionTitle}>Overview</ThemedText>
          <Card variant="outlined" style={styles.infoCard}>
            <ThemedText style={styles.infoText}>
              Adding family members allows you to manage their health records, track appointments, and share medical history securely within the Mayo ecosystem.
            </ThemedText>
          </Card>
        </View>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 80,
    paddingBottom: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  headerTitle: {
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    marginTop: 12,
  },
  emptyText: {
    marginTop: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  memberCard: {
    marginBottom: 12,
    padding: 16,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  infoText: {
    lineHeight: 20,
    opacity: 0.8,
  }
});

const enhance = (Component: React.FC<FamilyScreenProps>) => Component;

export default enhance(FamilyScreen);
