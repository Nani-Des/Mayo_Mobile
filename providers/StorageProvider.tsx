import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { StorageManager } from "../lib/storage/StorageManager";
import { VersionManager } from "../lib/storage/VersionManager";
import { BackupService } from "../lib/storage/BackupService";
import { MigrationManager } from "../lib/storage/MigrationManager";
import { TransferManager } from "../lib/transfer/TransferManager";
import { database } from "../lib/storage/database";
import { useAuth } from "./AuthProvider";

interface StorageContextType {
  storageManager: StorageManager | null;
  versionManager: VersionManager | null;
  backupService: BackupService | null;
  migrationManager: MigrationManager | null;
  transferManager: TransferManager | null;
  isInitialized: boolean;
}

const StorageContext = createContext<StorageContextType | null>(null);

export const StorageProvider = ({ children }: PropsWithChildren) => {
  const [storageManager, setStorageManager] = useState<StorageManager | null>(null);
  const [versionManager, setVersionManager] = useState<VersionManager | null>(null);
  const [backupService, setBackupService] = useState<BackupService | null>(null);
  const [migrationManager, setMigrationManager] = useState<MigrationManager | null>(null);
  const [transferManager, setTransferManager] = useState<TransferManager | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    const initializeStorage = async () => {
      if (!session) return; // Wait for authentication

      try {
        // Database is already initialized

        // Create managers
        const vm = new VersionManager();
        const sm = new StorageManager();
        const bs = new BackupService(sm, vm);
        const mm = new MigrationManager();
        const tm = new TransferManager(sm);

        // Run migrations
        await mm.runMigrations();

        setVersionManager(vm);
        setStorageManager(sm);
        setBackupService(bs);
        setMigrationManager(mm);
        setTransferManager(tm);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize storage:', error);
      }
    };

    initializeStorage();
  }, [session]);

  return (
    <StorageContext.Provider value={{
      storageManager,
      versionManager,
      backupService,
      migrationManager,
      transferManager,
      isInitialized
    }}>
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error("useStorage must be used within a StorageProvider");
  }
  return context;
};