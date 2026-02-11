import {
    Connection,
    DiscoveredDevice,
    TransferPackage,
    TransferProgress,
    TransferProtocol,
    TransferState
} from '../types/transfer';

/**
 * Base Transfer Service
 * 
 * Manages all transfer protocols and provides a unified interface
 * for the UI layer to interact with.
 */
export class TransferService {
    private currentProtocol: TransferProtocol | null = null;
    private currentConnection: Connection | null = null;
    private transferState: TransferState = 'idle';
    private progressCallbacks: Set<(progress: TransferProgress) => void> = new Set();

    /**
     * Set the active transfer protocol
     */
    setProtocol(protocol: TransferProtocol): void {
        this.currentProtocol = protocol;
    }

    /**
     * Discover nearby devices using the current protocol
     */
    async discover(): Promise<DiscoveredDevice[]> {
        if (!this.currentProtocol) {
            throw new Error('No protocol selected');
        }

        this.setTransferState('discovering');

        try {
            const devices = await this.currentProtocol.discover();
            this.setTransferState('idle');
            return devices;
        } catch (error) {
            this.setTransferState('failed');
            throw error;
        }
    }

    /**
     * Connect to a device
     */
    async connect(device: DiscoveredDevice): Promise<Connection> {
        if (!this.currentProtocol) {
            throw new Error('No protocol selected');
        }

        this.setTransferState('connecting');

        try {
            const connection = await this.currentProtocol.connect(device);
            this.currentConnection = connection;
            this.setTransferState('connected');
            return connection;
        } catch (error) {
            this.setTransferState('failed');
            throw error;
        }
    }

    /**
     * Send data to connected device
     */
    async send(data: TransferPackage): Promise<void> {
        if (!this.currentProtocol) {
            throw new Error('No protocol selected');
        }

        if (!this.currentConnection?.isConnected) {
            throw new Error('Not connected to any device');
        }

        this.setTransferState('transferring');

        try {
            await this.currentProtocol.send(data, (progress) => {
                this.notifyProgress(progress);
            });
            this.setTransferState('completed');
        } catch (error) {
            this.setTransferState('failed');
            throw error;
        }
    }

    /**
     * Receive data from connected device
     */
    async receive(): Promise<TransferPackage> {
        if (!this.currentProtocol) {
            throw new Error('No protocol selected');
        }

        if (!this.currentConnection?.isConnected) {
            throw new Error('Not connected to any device');
        }

        this.setTransferState('transferring');

        try {
            const data = await this.currentProtocol.receive((progress) => {
                this.notifyProgress(progress);
            });
            this.setTransferState('completed');
            return data;
        } catch (error) {
            this.setTransferState('failed');
            throw error;
        }
    }

    /**
     * Disconnect from current device
     */
    async disconnect(): Promise<void> {
        if (!this.currentProtocol) {
            return;
        }

        try {
            await this.currentProtocol.disconnect();
            this.currentConnection = null;
            this.setTransferState('disconnected');
        } catch (error) {
            console.error('Error disconnecting:', error);
            throw error;
        }
    }

    /**
     * Get current transfer state
     */
    getState(): TransferState {
        return this.transferState;
    }

    /**
     * Get current connection
     */
    getConnection(): Connection | null {
        return this.currentConnection;
    }

    /**
     * Subscribe to progress updates
     */
    onProgress(callback: (progress: TransferProgress) => void): () => void {
        this.progressCallbacks.add(callback);

        // Return unsubscribe function
        return () => {
            this.progressCallbacks.delete(callback);
        };
    }

    /**
     * Private: Update transfer state
     */
    private setTransferState(state: TransferState): void {
        this.transferState = state;
    }

    /**
     * Private: Notify all progress listeners
     */
    private notifyProgress(progress: TransferProgress): void {
        this.progressCallbacks.forEach(callback => callback(progress));
    }
}

// Singleton instance
export const transferService = new TransferService();
