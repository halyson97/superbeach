import { env } from '../config/env.js';

const FETCH_TIMEOUT_MS = 10_000;

async function ping(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    console.log(`[KeepAlive] ${response.status} ${url}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'erro desconhecido';
    console.warn(`[KeepAlive] falha ao acessar ${url}: ${message}`);
  } finally {
    clearTimeout(timeout);
  }
}

export function startKeepAliveSchedule() {
  if (!env.keepAliveEnabled) {
    return;
  }

  const { keepAliveUrl, keepAliveIntervalMs } = env;

  console.log(
    `[KeepAlive] ativo — requisição a cada ${keepAliveIntervalMs / 1000}s em ${keepAliveUrl}`,
  );

  void ping(keepAliveUrl);

  return setInterval(() => {
    void ping(keepAliveUrl);
  }, keepAliveIntervalMs);
}
