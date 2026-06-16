import type { Championship } from '../types';

const STORAGE_KEY = 'beach-tennis-championship';

export function saveChampionship(championship: Championship | null): void {
  if (championship) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(championship));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function loadChampionship(): Championship | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Championship;
  } catch {
    return null;
  }
}

export function clearChampionship(): void {
  localStorage.removeItem(STORAGE_KEY);
}
