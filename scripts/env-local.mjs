// Writes apps/web/.env.local from the running local Supabase (`pnpm db:start` first).
// Keeps an existing CRON_SECRET. The file is git-ignored; never commit real keys (CLAUDE.md, rule 10).
import { execSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const target = resolve(import.meta.dirname, '../apps/web/.env.local');

function parseEnv(text) {
  return Object.fromEntries(
    text
      .split(/\r?\n/)
      .map((line) => line.match(/^([A-Z0-9_]+)=(?:"(.*)"|(.*))$/))
      .filter(Boolean)
      .map((m) => [m[1], m[2] ?? m[3]]),
  );
}

const status = parseEnv(execSync('pnpm exec supabase status -o env', { encoding: 'utf8' }));
for (const key of ['API_URL', 'PUBLISHABLE_KEY', 'SECRET_KEY']) {
  if (!status[key]) {
    console.error(
      `supabase status did not return ${key}. Is the local database running? (pnpm db:start)`,
    );
    process.exit(1);
  }
}

const previous = existsSync(target) ? parseEnv(readFileSync(target, 'utf8')) : {};
const values = {
  NEXT_PUBLIC_SUPABASE_URL: status.API_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: status.PUBLISHABLE_KEY,
  SUPABASE_SECRET_KEY: status.SECRET_KEY,
  CRON_SECRET: previous.CRON_SECRET || randomBytes(32).toString('hex'),
  APP_URL: previous.APP_URL || 'http://localhost:3000',
  LOG_INFO_SAMPLE_RATE: previous.LOG_INFO_SAMPLE_RATE || '1',
};

writeFileSync(
  target,
  `# Gerado por pnpm env:local a partir do Supabase local. Não versionar.\n${Object.entries(values)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n')}\n`,
);
console.log(`apps/web/.env.local escrito (${Object.keys(values).length} variáveis).`);
