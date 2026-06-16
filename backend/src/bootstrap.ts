import { validateRuntimeDeps } from './utils/validateDeps.js';

const REINSTALL_HINT =
  'Execute na pasta backend:\n  rm -rf node_modules package-lock.json && npm install';

try {
  validateRuntimeDeps();
} catch (error) {
  const message = error instanceof Error ? error.message : 'Dependências inválidas';
  console.error('\n[Falha ao validar dependências]', message);
  console.error(`\n${REINSTALL_HINT}\n`);
  process.exit(1);
}

await import('./index.js');
