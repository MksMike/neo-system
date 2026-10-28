// Runs the job queue locally, standing in for the Hostinger cron (ADR 0014).
// Usage: pnpm jobs:run (once) or pnpm jobs:watch (every 60 s). Needs `pnpm dev` and `pnpm env:local`.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const envFile = resolve(import.meta.dirname, '../apps/web/.env.local');
const env = Object.fromEntries(
  readFileSync(envFile, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.match(/^([A-Z0-9_]+)=(.*)$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
);

const url = `${env.APP_URL ?? 'http://localhost:3000'}/api/jobs/run`;
const watch = process.argv.includes('--watch');

async function runOnce() {
  const started = Date.now();
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.CRON_SECRET}` },
    });
    const body = await response.json();
    console.log(
      `[${new Date().toISOString()}] ${response.status} ${JSON.stringify(body)} (${Date.now() - started} ms)`,
    );
    return response.ok;
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] falhou: ${error.message}. O app está rodando (pnpm dev)?`,
    );
    return false;
  }
}

if (watch) {
  console.log(`Disparando ${url} a cada 60 s. Ctrl+C para parar.`);
  await runOnce();
  setInterval(runOnce, 60_000);
} else {
  process.exit((await runOnce()) ? 0 : 1);
}
