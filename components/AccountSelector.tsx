import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Modal, FlatList } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

interface Account {
  id: string; // familyMemberId or 'me'
  name: string;
  role: string;
  isMe?: boolean;
}

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccountId: string;
  onSelectAccount: (accountId: string) => void;
}

export function AccountSelector({ accounts, selectedAccountId, onSelectAccount }: AccountSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const selectedAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0];

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
          <ThemedText style={styles.avatarText}>
            {selectedAccount?.name.charAt(0)}
          </ThemedText>
        </View>
        <View style={styles.info}>
          <ThemedText style={styles.name}>{selectedAccount?.name}</ThemedText>
          <ThemedText style={styles.role}>{selectedAccount?.role}</ThemedText>
        </View>
        <IconSymbol name="chevron.down" size={16} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Select Account</ThemedText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <IconSymbol name="xmark" size={20} color={textColor} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={accounts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.accountItem,
                    selectedAccountId === item.id && { backgroundColor: tintColor + '15' }
                  ]}
                  onPress={() => {
                    onSelectAccount(item.id);
                    setModalVisible(false);
                  }}
                >
                  <View style={[styles.avatar, { backgroundColor: tintColor }]}>
                    <ThemedText style={styles.avatarText}>{item.name.charAt(0)}</ThemedText>
                  </View>
                  <View style={styles.modalAccountInfo}>
                    <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                    <ThemedText type="caption">{item.role}</ThemedText>
                  </View>
                  {selectedAccountId === item.id && (
                    <IconSymbol name="checkmark" size={20} color={tintColor} />
                  )}
                </TouchableOpacity>
              )}
            />
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  info: {
    marginRight: 8,
  },
  name: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  role: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '60%',
    borderRadius: 24,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  modalAccountInfo: {
    flex: 1,
    marginLeft: 12,
  },
});
