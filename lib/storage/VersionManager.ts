import * as Device from 'expo-device';
import { VectorClock } from './utils/vectorClock';

export class VersionManager {
  private deviceId: string;

  constructor() {
    this.deviceId = Device.deviceName || Device.modelName || 'unknown-device';
  }

  getDeviceId(): string {
    return this.deviceId;
  }

  createNewVectorClock(): VectorClock {
    const clock = new VectorClock();
    clock.increment(this.deviceId);
    return clock;
  }

  incrementVectorClock(clock: VectorClock): VectorClock {
    const newClock = clock.copy();
    newClock.increment(this.deviceId);
    return newClock;
  }

  mergeVectorClocks(clocks: VectorClock[]): VectorClock {
    const merged = new VectorClock();
    for (const clock of clocks) {
      merged.merge(clock);
    }
    return merged;
  }

  detectConflicts(localClock: VectorClock, remoteClock: VectorClock): boolean {
    return localClock.isConcurrentWith(remoteClock);
  }

  resolveConflict(localClock: VectorClock, remoteClock: VectorClock): VectorClock {
    // Simple resolution: merge and increment
    const resolved = localClock.copy();
    resolved.merge(remoteClock);
    resolved.increment(this.deviceId);
    return resolved;
  }
}