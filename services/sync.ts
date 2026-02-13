import { synchronize } from '@nozbe/watermelondb/sync'
import { database } from '../model'

const SYNC_API_URL = process.env.EXPO_PUBLIC_SYNC_API_URL || 'http://localhost:8080/api/v1/sync'

export async function sync() {
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
      const response = await fetch(
        `${SYNC_API_URL}/pull?last_pulled_at=${lastPulledAt || 0}&schema_version=${schemaVersion}`
      )
      if (!response.ok) {
        throw new Error(await response.text())
      }

      const { changes, timestamp } = await response.json()
      return { changes, timestamp }
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      const response = await fetch(`${SYNC_API_URL}/push?last_pulled_at=${lastPulledAt}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      })
      if (!response.ok) {
        throw new Error(await response.text())
      }
    },
    migrationsEnabledAtVersion: 1,
  })
}
