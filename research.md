MAYO PROJECT — BACKEND & INFRASTRUCTURE RESEARCH REPORT
Prepared for: Product Manager — Nani
Prepared by: Samuel
Purpose: Define the technological foundation and data synchronization architecture for the MAYO medical records platform.

1. Project Goal & Context
The MAYO system is a cross-platform medical records platform composed of:
Mobile Application: React Native + Expo
Desktop Application: Electron + React
Cloud Backend: Supabase (PostgreSQL)
Local Offline Storage: SQLite (Mobile & Desktop)
The platform must support:
Offline-first operation
Synchronization across mobile, desktop, and cloud
Secure medical record transfer
Encrypted data storage
Eventual consistency
Safe updates without data loss
The research scope includes:
Defining the core backend technology
Identifying required service modules
Establishing methods for secure data transfer, updates, and synchronization

2. Backend Technology Research
The Product Manager has confirmed Supabase as the backend platform. Research compares alternative architectures but concludes with Supabase-based implementation guidance.
Option A — Backend-as-a-Service (Chosen): Supabase
Strengths
Fast development
PostgreSQL database
Built-in authentication
Built-in object storage
Real-time channels
Serverless Edge Functions
Database dashboard and management tools
Strong compatibility with React Native and Electron
Limitations (Critical for Medical Systems)
Not HIPAA compliant by default
No built-in encrypted offline sync
Requires custom synchronization engine
Lacks microservices containerization
Introduces vendor lock-in
Assessment
Supabase is acceptable for an MVP but requires additional architectural layers to support medical-grade data handling.

Option B — Traditional Backend (Not Adopted)
(Spring Boot / Node.js / Go + PostgreSQL)
Advantages
Full control over backend architecture
Easier integration of compliance requirements
Native support for microservices
Flexible custom sync engine implementation
Disadvantages
Increased development time
Requires DevOps, server management, and CI/CD setup
Not approved by Product Manager
Conclusion
While traditional backends offer long-term scalability, the project must operate using the Supabase ecosystem.

Overall Research Conclusion
Supabase is the selected backend, but additional systems must be implemented:
A custom synchronization engine
A secure encryption layer
A data versioning and conflict-resolution module
Offline-to-online data merging logic
Local-first storage with change logs
These components act as functional “microservices” even if not containerized.

3. Required Service Modules
Although Supabase does not provide microservices in the traditional sense, the system can be structured into distinct service modules.

1. Authentication & Identity Service
Technologies
Supabase Auth
Row Level Security (RLS)
JWT-based authentication
Responsibilities
Authentication and session control
Role-based access for clinicians, patients, admins
Authorization enforcement through PostgreSQL RLS

2. Encryption & Security Service
Medical data requires strict security:
AES-256 encryption for local records
End-to-end encryption during transfers
Secure key storage (Expo SecureStore / OS Keychain)
Encrypted backups
Hash verification (SHA-256)

3. Local Database Sync Service
Each device (mobile and desktop) uses SQLite. The synchronization service includes:
A. Write-Ahead Log (WAL)
A local log of all changes:
| log_id | table | record_id | operation | timestamp | data |
B. Sync Dispatcher
Periodically:
Pushes local WAL entries to Supabase
Pulls remote changes
Applies updates to SQLite
C. Integrations
Supabase Realtime
WebSockets
Edge Functions
Background tasks

4. Device-to-Device Transfer Service
Required for offline hospitals or locations without cloud connectivity.
Supported Channels
Bluetooth
Wi-Fi Direct
Local Network (Hotspot, LAN)
Tools
React Native BLE PLX
react-native-wifi-p2p
Electron Bluetooth APIs
Node.js TCP/UDP sockets
Encrypted Payload Structure
{
  meta: { patient_id, version, timestamp },
  payload: AES256_encrypted_data,
  hash: SHA256_hash
}

5. Conflict Resolution Service
Handles scenarios where multiple devices modify the same patient record offline.
Approaches
Timestamp-based Last-Writer-Wins (recommended for MVP)
Vector clocks (advanced)
CRDTs (full distributed consistency)
Each update should maintain an audit trail.

6. Cloud Sync & Event Service
Implemented using Supabase features:
Row Level Security
Realtime Channels
Webhooks
Edge Functions
Background synchronization tasks
Core Functions
pushChanges()
pullChanges()
mergeRecords()
validateIntegrity()

7. Admin & Monitoring Service
Using the Supabase dashboard:
Schema management
Logs and metrics
Policy administration
API usage tracking
IAM configuration

4. Data Transfer, Update & Syncing Architecture
A complete multi-device synchronization solution requires the following workflow.
1. Offline-First Local Storage
Mobile: SQLite
Desktop: SQLite
2. Change Logging Layer
All local changes are written into a structured log table before any sync.
3. Synchronization Engine
The engine performs:
Detection of unsynchronized changes
Push of local changes to the cloud
Retrieval of remote changes
Conflict resolution
Updating of local SQLite
This provides resilience even during long offline periods.

4. Multi-Device Cloud Sync
Supabase Realtime channels propagate changes dynamically.
Channel example: patient_records

5. Device-to-Device Sync (No Internet)
Bluetooth Sync Process
Device discovery
Encrypted handshake
Exchange of change logs
Conflict merging
Hash validation
Wi-Fi Direct Sync Process
Establish peer-to-peer link
Bulk exchange of WAL data
Merge and update

6. Update Propagation Workflow
A device updates a record
Local WAL logs the change
The sync engine pushes to cloud
Supabase Realtime broadcasts the update
Other clients fetch and merge changes
Mobile and desktop remain consistent

5. Recommended Technology Stack
Backend
Supabase (PostgreSQL)
Supabase Auth
Supabase Realtime
Supabase Edge Functions
Sync Engine
React Native SQLite
Electron SQLite
Background fetch tasks
WebSockets
Bluetooth & Wi-Fi Direct modules
Encryption
AES-256-GCM
RSA key exchange
SHA-256 hashing
Secure key storage (SecureStore / OS Keychain)
Device-to-Device Communication
React Native BLE PLX
react-native-wifi-p2p
Electron Bluetooth API
Node.js UDP/TCP sockets
DevOps
Supabase Cloud
GitHub
EAS Build
Automated linting/testing pipelines
