/**
 * Sync Service
 * 
 * Note: Data synchronization is handled via manual offline transfer (SQLite -> Server).
 * This service is kept as a placeholder for potential future background sync logic.
 */

export async function sync() {
  console.log('Manual sync triggered. Note: Standard WatermelonDB sync is disabled.');
  return Promise.resolve();
}
