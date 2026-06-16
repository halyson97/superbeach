import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const nodeModules = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'node_modules');

function assertFile(relativePath: string, hint: string) {
  const fullPath = join(nodeModules, relativePath);
  if (!existsSync(fullPath)) {
    throw new Error(`${hint}\nArquivo ausente: ${relativePath}`);
  }
}

export function validateRuntimeDeps() {
  assertFile(
    'iconv-lite/encodings/index.js',
    'Dependência "iconv-lite" incompleta. Isso costuma indicar node_modules corrompido ou instalação na pasta errada (ex.: "server" em vez de "backend").',
  );
}
