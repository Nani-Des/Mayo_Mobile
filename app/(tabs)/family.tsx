import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useFamilyData } from '@/hooks/useFamilyData';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

// Import family API functions
import { type Family, type FamilyMember } from '@/lib/api/family-api';
// Import model helpers
import { getFullName, getAge } from '@/model';
// Import edit member modal
import EditMemberModal from '@/app/edit-member-modal';

const FamilyScreen = () => {
  const router = useRouter();
  const tintColor = useThemeColor({}, 'tint');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'icon');
  const { data: membersData, isLoading, error: queryError, refetch } = useFamilyData();
  const { members, familyId } = membersData || { members: [], familyId: null };
  const error = queryError ? (queryError as Error).message : null;
  
  // Edit modal state
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  const handleAddMember = async () => {
    if (!familyId) {
        // Should ideally not happen if user is logged in and has a family
        // Could trigger create family flow here if needed
        console.warn("No family ID available to add member");
        return;
    }
    setSelectedMember(null);
    setIsEditModalVisible(true);
  };

  // Handle edit button press
  const handleEditMember = (member: FamilyMember) => {
    setSelectedMember(member);
    setIsEditModalVisible(true);
  };

  // Handle successful edit
  const handleEditSuccess = () => {
    // Refresh the family data after successful edit
    refetch();
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
            <IconSymbol size={32} color="#0284C7" name="person.3.fill" />
          </View>
          <ThemedText type="hero" style={styles.headerTitle}>
            Family Account
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Manage your dependents and health records
          </ThemedText>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Family Members</ThemedText>
            <TouchableOpacity onPress={handleAddMember} style={styles.addButton}>
              <IconSymbol name="plus" size={16} color="white" />
              <ThemedText style={styles.addButtonText}>Add</ThemedText>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={tintColor} />
              <ThemedText type="caption" style={{ marginTop: 8 }}>Loading family...</ThemedText>
            </View>
          ) : error ? (
            <Card variant="flat" style={styles.emptyCard}>
              <IconSymbol name="exclamationmark.triangle" size={40} color={textSecondaryColor} />
              <ThemedText style={styles.emptyText}>{error}</ThemedText>
              <Button 
                title="Retry" 
                onPress={() => refetch()}
                style={{ marginTop: 16 }}
              />
            </Card>
          ) : members.length === 0 ? (
            <Card variant="elevated" style={styles.emptyCard}>
              <View style={[styles.emptyIconContainer, { backgroundColor: tintColor + '10' }]}>
                <IconSymbol name="person.crop.circle.badge.plus" size={40} color={tintColor} />
              </View>
              <ThemedText type="defaultSemiBold" style={styles.emptyTitle}>Secure Health Management</ThemedText>
              <ThemedText style={styles.emptyText}>Add family members to manage their records and appointments securely.</ThemedText>
              <Button 
                title="Add Family Member" 
                onPress={handleAddMember}
                style={{ marginTop: 20, width: '100%' }}
              />
            </Card>
          ) : (
            members.map((member) => (
              <Card key={member.id} variant="elevated" style={styles.memberCard}>
                <View style={styles.memberInfo}>
                  <View style={[styles.avatar, { backgroundColor: tintColor + '20' }]}>
                    <ThemedText style={{ color: tintColor, fontWeight: 'bold' }}>
                      {getFullName(member).charAt(0)}
                    </ThemedText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="defaultSemiBold">{getFullName(member)}</ThemedText>
                    <ThemedText type="caption">{member.relationship} • {getAge(member)} yrs</ThemedText>
                  </View>
                  <TouchableOpacity 
                    onPress={() => handleEditMember(member)}
                    style={styles.editButton}
                  >
                    <IconSymbol name="pencil" size={20} color={iconColor} />
                  </TouchableOpacity>
                  <IconSymbol name="chevron.right" size={20} color={iconColor} />
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

      {/* Edit Member Modal */}
      <EditMemberModal
        visible={isEditModalVisible}
        member={selectedMember}
        familyId={familyId}
        onClose={() => {
          setIsEditModalVisible(false);
          setSelectedMember(null);
        }}
        onSuccess={handleEditSuccess}
      />
    </ThemedView>
  );
};

export default FamilyScreen;

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
  sectionTitle: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    textAlign: 'center',
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 20,
    marginBottom: 8,
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
  editButton: {
    padding: 8,
    marginRight: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
