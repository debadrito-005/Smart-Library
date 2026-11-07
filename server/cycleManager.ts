import { db, formatIST, RegistrationCycle } from './db.js';

export interface CycleStatusReport {
  status: 'OPEN' | 'CLOSED';
  cycleId: string;
  cycleNumber: number;
  startTime: string;
  endTime: string;
  startTimeIST: string;
  endTimeIST: string;
  remainingSeconds: number;
  todayRegistrations: number;
  totalLifetimeRegistrations: number;
  timezone: string;
  isExpired: boolean;
}

const CYCLE_DURATION_MS = 24 * 60 * 60 * 1000; // Exactly 24 hours

export class RegistrationCycleManager {
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    this.ensureActiveCycle();
    // Start background monitor interval checking every 10 seconds
    this.startBackgroundMonitor();
  }

  /**
   * Ensures that an active 24-hour cycle exists.
   * If current cycle has exceeded 24 hours, automatically closes it,
   * archives historical registration count, resets the daily counter,
   * and opens cycle #N+1 without deleting any historical user registrations.
   */
  public ensureActiveCycle(): RegistrationCycle {
    const data = db.get();
    const now = new Date();
    const activeCycle = data.registrationCycles.find((c) => c.status === 'OPEN');

    if (!activeCycle) {
      // Create fresh cycle
      const cycleNumber = data.registrationCycles.length + 1;
      const startTime = now;
      const endTime = new Date(startTime.getTime() + CYCLE_DURATION_MS);
      const newCycle: RegistrationCycle = {
        id: `cycle_${Date.now()}_${cycleNumber}`,
        cycleNumber,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        startTimeIST: formatIST(startTime),
        endTimeIST: formatIST(endTime),
        status: 'OPEN',
        registrationsCount: 0,
      };

      db.update((d) => {
        d.registrationCycles.unshift(newCycle);
      });

      db.logActivity(
        'CYCLE_AUTOMATIC_START',
        `Automatic 24-hour cycle #${cycleNumber} started in Asia/Kolkata timezone.`,
        'CYCLE',
        'Auto Cycle Daemon'
      );
      return newCycle;
    }

    // Check if the existing active cycle has exceeded 24 hours
    const cycleEndTime = new Date(activeCycle.endTime);
    if (now >= cycleEndTime) {
      // 24 hours have elapsed: close current cycle and open new one
      console.log(`[CycleManager] Cycle #${activeCycle.cycleNumber} expired at ${activeCycle.endTimeIST}. Rolling over...`);
      return this.rolloverCycle(activeCycle);
    }

    return activeCycle;
  }

  /**
   * Closes the expired cycle and starts a new 24-hour cycle
   */
  public rolloverCycle(expiredCycle: RegistrationCycle): RegistrationCycle {
    const now = new Date();
    const nextCycleNumber = expiredCycle.cycleNumber + 1;
    const startTime = now;
    const endTime = new Date(startTime.getTime() + CYCLE_DURATION_MS);

    const newCycle: RegistrationCycle = {
      id: `cycle_${Date.now()}_${nextCycleNumber}`,
      cycleNumber: nextCycleNumber,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      startTimeIST: formatIST(startTime),
      endTimeIST: formatIST(endTime),
      status: 'OPEN',
      registrationsCount: 0,
    };

    db.update((data) => {
      // Find and close the expired cycle
      const existing = data.registrationCycles.find((c) => c.id === expiredCycle.id);
      if (existing) {
        existing.status = 'CLOSED';
        existing.closedAt = now.toISOString();
      }
      // Add the new cycle as the active one
      data.registrationCycles.unshift(newCycle);
    });

    db.logActivity(
      'CYCLE_AUTOMATIC_ROLLOVER',
      `24-Hour Cycle #${expiredCycle.cycleNumber} closed with ${expiredCycle.registrationsCount} registrations. New 24-hour cycle #${nextCycleNumber} started. All previous student/researcher records preserved permanently.`,
      'CYCLE',
      'Auto Cycle Daemon'
    );

    return newCycle;
  }

  /**
   * Manually trigger cycle rollover (for testing or admin override)
   */
  public forceManualRollover(): RegistrationCycle {
    const current = this.ensureActiveCycle();
    return this.rolloverCycle(current);
  }

  /**
   * Retrieves comprehensive cycle statistics
   */
  public getCycleReport(): CycleStatusReport {
    const cycle = this.ensureActiveCycle();
    const data = db.get();
    const now = new Date();
    const endTime = new Date(cycle.endTime);
    const diffMs = endTime.getTime() - now.getTime();
    const remainingSeconds = Math.max(0, Math.floor(diffMs / 1000));

    // Calculate today's registrations for this current active cycle
    const todayRegistrations = data.users.filter((u) => u.cycleId === cycle.id).length;
    const totalLifetimeRegistrations = data.users.length;

    return {
      status: cycle.status,
      cycleId: cycle.id,
      cycleNumber: cycle.cycleNumber,
      startTime: cycle.startTime,
      endTime: cycle.endTime,
      startTimeIST: cycle.startTimeIST,
      endTimeIST: cycle.endTimeIST,
      remainingSeconds,
      todayRegistrations,
      totalLifetimeRegistrations,
      timezone: 'Asia/Kolkata',
      isExpired: remainingSeconds <= 0,
    };
  }

  /**
   * Increments the registration count for the active cycle
   */
  public registerUserInCycle(cycleId: string): void {
    db.update((data) => {
      const cycle = data.registrationCycles.find((c) => c.id === cycleId);
      if (cycle) {
        cycle.registrationsCount += 1;
      }
    });
  }

  private startBackgroundMonitor() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.ensureActiveCycle();
    }, 10000); // Check every 10 seconds
  }
}

export const cycleManager = new RegistrationCycleManager();
