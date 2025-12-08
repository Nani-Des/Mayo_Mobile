export class VectorClock {
  private clock: Map<string, number> = new Map();

  increment(deviceId: string): void {
    this.clock.set(deviceId, (this.clock.get(deviceId) || 0) + 1);
  }

  get(deviceId: string): number {
    return this.clock.get(deviceId) || 0;
  }

  merge(other: VectorClock): void {
    for (const [deviceId, timestamp] of other.clock) {
      this.clock.set(deviceId, Math.max(this.clock.get(deviceId) || 0, timestamp));
    }
  }

  happenedBefore(other: VectorClock): boolean {
    let hasStrictlyLess = false;

    for (const [deviceId, thisTimestamp] of this.clock) {
      const otherTimestamp = other.get(deviceId);
      if (thisTimestamp > otherTimestamp) {
        return false;
      }
      if (thisTimestamp < otherTimestamp) {
        hasStrictlyLess = true;
      }
    }

    for (const deviceId of other.clock.keys()) {
      if (!this.clock.has(deviceId)) {
        hasStrictlyLess = true;
      }
    }

    return hasStrictlyLess;
  }

  isConcurrentWith(other: VectorClock): boolean {
    return !this.happenedBefore(other) && !other.happenedBefore(this);
  }

  copy(): VectorClock {
    const newClock = new VectorClock();
    newClock.clock = new Map(this.clock);
    return newClock;
  }

  toJson(): string {
    return JSON.stringify(Object.fromEntries(this.clock));
  }

  static fromJson(json: string): VectorClock {
    const vectorClock = new VectorClock();
    const parsed = JSON.parse(json);
    vectorClock.clock = new Map(Object.entries(parsed));
    return vectorClock;
  }

  getClock(): Map<string, number> {
    return new Map(this.clock);
  }
}