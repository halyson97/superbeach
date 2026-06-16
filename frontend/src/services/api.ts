const PRODUCTION_API_URL = 'https://superbeach.onrender.com';

function resolveApiBase(): string {
  const envUrl = import.meta.env.VITE_API_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (import.meta.env.DEV || isLocalhost) {
    return '';
  }

  return PRODUCTION_API_URL;
}

const API_BASE = resolveApiBase();

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getToken() {
  return localStorage.getItem('superbeach_token');
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem('superbeach_token', token);
  } else {
    localStorage.removeItem('superbeach_token');
  }
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor. Verifique se o backend está rodando.', 0);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = (await response.json().catch(() => ({}))) as { message?: string };

  if (!response.ok) {
    throw new ApiError(data.message ?? `Erro na requisição (${response.status})`, response.status);
  }

  return data as T;
}
