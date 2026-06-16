import type { Championship } from '../types';

const STORAGE_KEY = 'beach-tennis-app';
const LEGACY_STORAGE_KEY = 'beach-tennis-championship';

export interface AppStorage {
  current: Championship | null;
  history: Championship[];
}

const EMPTY: AppStorage = { current: null, history: [] };

function isChampionship(value: unknown): value is Championship {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'status' in value &&
    'rounds' in value
  );
}

function migrateLegacy(): AppStorage {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as unknown;
    if (!isChampionship(parsed)) return EMPTY;
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return { current: parsed, history: [] };
  } catch {
    return EMPTY;
  }
}

export function loadAppStorage(): AppStorage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return migrateLegacy();

    const parsed = JSON.parse(raw) as unknown;

    if (isChampionship(parsed)) {
      return { current: parsed, history: [] };
    }

    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'current' in parsed &&
      'history' in parsed
    ) {
      const data = parsed as AppStorage;
      return {
        current: data.current ?? null,
        history: Array.isArray(data.history) ? data.history : [],
      };
    }

    return EMPTY;
  } catch {
    return migrateLegacy();
  }
}

export function saveAppStorage(state: AppStorage): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearAppStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
}

// Compat helpers used during transition
export function saveChampionship(championship: Championship | null): void {
  const state = loadAppStorage();
  saveAppStorage({ ...state, current: championship });
}

export function loadChampionship(): Championship | null {
  return loadAppStorage().current;
}

export function clearChampionship(): void {
  const state = loadAppStorage();
  saveAppStorage({ ...state, current: null });
}
