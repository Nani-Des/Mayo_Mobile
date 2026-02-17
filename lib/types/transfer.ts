/**
 * Transfer Types
 * 
 * Core TypeScript interfaces for the data transfer system.
 * These types are shared across all transfer protocols (BLE, WiFi, USB, QR).
 */

/**
 * Transfer package structure - what gets sent between devices
 * Backend team will define the actual 'data' structure
 */
export interface TransferPackage {
    transferId: string;
    patientId: string;
    data: any; // Backend team defines medical records structure
    checksum: string;
    timestamp: Date;
    metadata?: {
        version: string;
        deviceId: string;
        hospitalId?: string;
        doctorId?: string;
        transferMethod: TransferMethod;
    };
}

/**
 * Available transfer methods
 */
export type TransferMethod = 'bluetooth' | 'wifi' | 'usb' | 'qr';

/**
 * Transfer state for UI
 */
export type TransferState =
    | 'idle'
    | 'discovering'
    | 'connecting'
    | 'connected'
    | 'transferring'
    | 'completed'
    | 'failed'
    | 'disconnected';

/**
 * Device discovered during scanning
 */
export interface DiscoveredDevice {
    id: string;
    name: string;
    type: TransferMethod;
    rssi?: number; // Signal strength for BLE/WiFi
    metadata?: Record<string, any>;
}

/**
 * Transfer progress information
 */
export interface TransferProgress {
    transferId: string;
    bytesTransferred: number;
    totalBytes: number;
    percentage: number;
    state: TransferState;
    error?: string;
}

/**
 * Connection information
 */
export interface Connection {
    deviceId: string;
    method: TransferMethod;
    isConnected: boolean;
    connectedAt?: Date;
}

/**
 * Base protocol interface that all transfer methods must implement
 */
export interface TransferProtocol {
    /**
     * Discover nearby devices
     */
    discover(): Promise<DiscoveredDevice[]>;

    /**
     * Connect to a specific device
     */
    connect(device: DiscoveredDevice): Promise<Connection>;

    /**
     * Send data to connected device
     */
    send(data: TransferPackage, onProgress?: (progress: TransferProgress) => void): Promise<void>;

    /**
     * Receive data from connected device
     */
    receive(onProgress?: (progress: TransferProgress) => void): Promise<TransferPackage>;

    /**
     * Disconnect from device
     */
    disconnect(): Promise<void>;

    /**
     * Get current connection status
     */
    getConnectionStatus(): Connection | null;
}

/**
 * Transfer error types
 */
export class TransferError extends Error {
    constructor(
        message: string,
        public code: TransferErrorCode,
        public method: TransferMethod
    ) {
        super(message);
        this.name = 'TransferError';
    }
}

export type TransferErrorCode =
    | 'DISCOVERY_FAILED'
    | 'CONNECTION_FAILED'
    | 'TRANSFER_FAILED'
    | 'CHECKSUM_MISMATCH'
    | 'TIMEOUT'
    | 'PERMISSION_DENIED'
    | 'DEVICE_NOT_FOUND'
    | 'UNKNOWN_ERROR';
