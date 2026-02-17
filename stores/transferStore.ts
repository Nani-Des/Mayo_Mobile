import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Handshake {
  ip?: string;
  token?: string;
  hospitalId?: string;
  deviceId?: string;
}

interface TransferState {
  handshake: Handshake | null;
  isLocked: boolean; // QR/handshake lock for USB and direct transfers
  setHandshake: (h: Handshake) => void;
  clearHandshake: () => void;
  lock: () => void;
  unlock: () => void;
}

export const useTransferStore = create<TransferState>((set) => ({
  handshake: null,
  isLocked: true,
  setHandshake: (h: Handshake) => {
    set({ handshake: h, isLocked: false });
    try {
      AsyncStorage.setItem('transfer_handshake', JSON.stringify(h));
    } catch (e) {
      // ignore
    }
  },
  clearHandshake: () => {
    set({ handshake: null, isLocked: true });
    try {
      AsyncStorage.removeItem('transfer_handshake');
    } catch (e) {}
  },
  lock: () => set({ isLocked: true }),
  unlock: () => set({ isLocked: false }),
}));

// Try to hydrate from storage (best-effort)
(async () => {
  try {
    const raw = await AsyncStorage.getItem('transfer_handshake');
    if (raw) {
      const obj = JSON.parse(raw);
      useTransferStore.setState({ handshake: obj, isLocked: false });
    }
  } catch (e) {
    // ignore
  }
})();

export default useTransferStore;
