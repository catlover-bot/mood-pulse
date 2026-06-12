import type { MoodId, RegionId } from "../types/mood";

export const SUBMISSION_COOLDOWN_MS = 30 * 60 * 1000;

const SUBMISSION_COOLDOWN_KEY = "mood-pulse-submission-cooldowns-v1";

type CooldownEntry = {
  submittedAt: number;
  mood: MoodId;
};

type CooldownStore = Record<string, Partial<Record<RegionId, CooldownEntry>>>;

export type CooldownStatus = {
  isCoolingDown: boolean;
  remainingMs: number;
  remainingMinutes: number;
  submittedAt: number | null;
  mood: MoodId | null;
};

export function getCooldownStatus(
  clientId: string,
  regionId: RegionId,
  now = Date.now(),
): CooldownStatus {
  const entry = readStore(now)[clientId]?.[regionId] ?? null;

  if (!entry) {
    return createOpenStatus();
  }

  const remainingMs = Math.max(0, SUBMISSION_COOLDOWN_MS - (now - entry.submittedAt));

  if (remainingMs <= 0) {
    return createOpenStatus();
  }

  return {
    isCoolingDown: true,
    remainingMs,
    remainingMinutes: Math.max(1, Math.ceil(remainingMs / 60000)),
    submittedAt: entry.submittedAt,
    mood: entry.mood,
  };
}

export function getRemainingCooldownMs(
  clientId: string,
  regionId: RegionId,
  now = Date.now(),
): number {
  return getCooldownStatus(clientId, regionId, now).remainingMs;
}

export function recordSubmission(
  clientId: string,
  regionId: RegionId,
  mood: MoodId,
  submittedAt = Date.now(),
): void {
  const store = readStore(submittedAt);

  store[clientId] = {
    ...(store[clientId] ?? {}),
    [regionId]: {
      submittedAt,
      mood,
    },
  };

  writeStore(store);
}

function createOpenStatus(): CooldownStatus {
  return {
    isCoolingDown: false,
    remainingMs: 0,
    remainingMinutes: 0,
    submittedAt: null,
    mood: null,
  };
}

function readStore(now = Date.now()): CooldownStore {
  const rawStore = localStorage.getItem(SUBMISSION_COOLDOWN_KEY);

  if (!rawStore) {
    return {};
  }

  try {
    const parsedStore = JSON.parse(rawStore);

    if (!isCooldownStore(parsedStore)) {
      return {};
    }

    return pruneExpiredCooldowns(parsedStore, now);
  } catch {
    return {};
  }
}

function writeStore(store: CooldownStore): void {
  localStorage.setItem(SUBMISSION_COOLDOWN_KEY, JSON.stringify(store));
}

function pruneExpiredCooldowns(store: CooldownStore, now: number): CooldownStore {
  const nextStore: CooldownStore = {};

  Object.entries(store).forEach(([clientId, regionEntries]) => {
    const nextRegionEntries: Partial<Record<RegionId, CooldownEntry>> = {};

    Object.entries(regionEntries).forEach(([regionId, entry]) => {
      if (now - entry.submittedAt < SUBMISSION_COOLDOWN_MS) {
        nextRegionEntries[regionId as RegionId] = entry;
      }
    });

    if (Object.keys(nextRegionEntries).length > 0) {
      nextStore[clientId] = nextRegionEntries;
    }
  });

  writeStore(nextStore);

  return nextStore;
}

function isCooldownStore(value: unknown): value is CooldownStore {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((regionEntries) => {
    if (!regionEntries || typeof regionEntries !== "object" || Array.isArray(regionEntries)) {
      return false;
    }

    return Object.values(regionEntries).every((entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        return false;
      }

      const cooldownEntry = entry as CooldownEntry;

      return (
        typeof cooldownEntry.submittedAt === "number" &&
        Number.isFinite(cooldownEntry.submittedAt) &&
        typeof cooldownEntry.mood === "string"
      );
    });
  });
}
