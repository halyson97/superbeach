import { api } from './api';
import type { Championship } from '../types';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function register(name: string, email: string, password: string) {
  return api<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  }, false);
}

export async function login(email: string, password: string) {
  return api<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }, false);
}

export async function getMe() {
  return api<AuthUser>('/api/auth/me');
}

export async function listGames() {
  return api<{ current: Championship | null; history: Championship[] }>('/api/games');
}

export async function createGame(championship: Championship) {
  return api<Championship>('/api/games', {
    method: 'POST',
    body: JSON.stringify({ championship }),
  });
}

export async function updateGame(championship: Championship) {
  return api<Championship>(`/api/games/${championship.id}`, {
    method: 'PUT',
    body: JSON.stringify({ championship }),
  });
}

export async function deleteGame(championshipId: string) {
  return api<void>(`/api/games/${championshipId}`, { method: 'DELETE' });
}

export async function getSharedGame(shareToken: string) {
  return api<{ championship: Championship; ownerName: string }>(
    `/api/share/${shareToken}`,
    {},
    false,
  );
}
