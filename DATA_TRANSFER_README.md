# Mayo EMR Data Transfer Feature

This document describes the implementation of the data transfer feature for the Mayo EMR mobile application.

## Overview

The data transfer feature enables secure transfer of medical records between devices using multiple methods:
- Bluetooth (BLE)
- WiFi Direct
- USB Cable
- QR Code Scanning/Generation

The feature also includes version management and conflict resolution capabilities.

## Components

### 1. Main Data Transfer Screen
Located at `app/data-transfer.tsx`, this is the primary interface for all data transfer operations.

### 2. UI Components
All components are located in `components/ui/`:

#### TransferMethodCard
A reusable card component for selecting transfer methods.

#### TransferProgress
Displays progress during data transfer operations.

#### VersionInfo
Shows version information and sync status.

#### QRScanner
Enables scanning of QR codes for data transfer initiation.

#### QRGenerator
Generates QR codes containing encrypted transfer information.

#### DataReception
Manages incoming data connections and displays received data previews.

#### BLEDeviceList
Discovers and lists nearby Bluetooth devices for connection.

#### WiFiDirectManager
Manages WiFi Direct connections for high-speed transfers.

#### USBTransfer
Handles USB-based data transfers.

## Features

### Transfer Methods

1. **Bluetooth Transfer**
   - Discovers nearby devices
   - Establishes encrypted connections
   - Transfers data with progress indication

2. **WiFi Direct Transfer**
   - Creates direct WiFi connections between devices
   - Enables high-speed transfers without internet
   - Manages connection status and IP information

3. **USB Transfer**
   - Connects devices via USB cable
   - Supports both sending and receiving data
   - Shows transfer progress

4. **QR Code Transfer**
   - Generates QR codes for sharing transfer information
   - Scans QR codes to initiate transfers
   - Uses encrypted payloads for security

### Version Management

The system tracks:
- Current application version
- Last update timestamp
- Number of synced devices
- Automatic conflict resolution using Last-Writer-Wins algorithm

### Data Reception

- Listens for incoming data transfers
- Previews received data before acceptance
- Allows users to accept or reject incoming transfers

## Security

- All transfers use encrypted payloads
- Bluetooth and WiFi connections use secure protocols
- USB transfers are protected by device authentication
- QR codes contain encrypted information, not raw data

## Usage

Native BLE (react-native-ble-plx) notes
--------------------------------------
- This project supports an optional native BLE implementation using `react-native-ble-plx`.
- Requirements:
   - Install native dependency: `pnpm add react-native-ble-plx buffer` and follow the library's installation steps (iOS Pod install, Android manifest permissions).
   - Android: request runtime permissions (ACCESS_FINE_LOCATION or BLUETOOTH_SCAN / BLUETOOTH_CONNECT on newer SDKs). The app includes a helper at `lib/services/ble-permissions.ts` that requests Android location permission.
   - iOS: ensure `Info.plist` contains appropriate Bluetooth usage descriptions (`NSBluetoothAlwaysUsageDescription`, `NSBluetoothPeripheralUsageDescription`).

Framing and robustness
----------------------
- BLE transfers use an explicit length-prefixed framing protocol: the sender prepends an 8-byte ASCII length header (zero-padded) followed by the JSON payload. The receiver accumulates chunks until it has the full payload, then parses JSON. This avoids heuristic parsing and is deterministic.

Fallback and UX
---------------
- The code checks for the presence of the native BLE module and throws a descriptive error when missing. UI code should catch that error and present a graceful fallback (e.g., a simulated path or prompt to install native modules).

Security
--------
- BLE transfers are offline and local; still consider encrypting payloads or using short-lived tokens if sensitive data is transported over insecure links.
1. Navigate to the Data Transfer tab in the app
2. Select a transfer method
3. Follow the specific workflow for that method
4. Monitor transfer progress
5. Review version information for conflict resolution

## Future Enhancements

- Integration with backend services for cloud sync
- Advanced conflict resolution algorithms
- Support for additional transfer protocols
- Enhanced encryption methods