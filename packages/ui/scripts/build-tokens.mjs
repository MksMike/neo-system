// Generates src/styles/tokens.css from docs/design-tokens.json.
// Run with `pnpm --filter @neo/ui tokens`. A test fails if the committed file is out of date.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
export const TOKENS_JSON = resolve(here, '../../../docs/design-tokens.json');
export const TOKENS_CSS = resolve(here, '../src/styles/tokens.css');

const HUES = ['azul', 'grafite', 'roxo'];
const DEFAULT_HUE = 'azul';

const indent = (text, spaces) => text.replace(/^/gm, ' '.repeat(spaces));

/** Per-theme properties. Shadows get the `nx-` prefix so the Tailwind `--shadow-*`
 * keys can point at them without a reference cycle. */
function themeVars(tokens, themeId) {
  const lines = tokens.color.tokens.map((t) => `--${t.name}: ${t.value[themeId]};`);
  for (const s of tokens.shadow.tokens) lines.push(`--nx-${s.name}: ${s.value[themeId]};`);
  return lines.join('\n');
}

/** Raw properties that do not collide with Tailwind theme keys. */
function rootVars(tokens) {
  const raw = [tokens.spacing, tokens.size, tokens.zIndex]
    .flatMap((g) => g.tokens)
    .map((t) => `--${t.name}: ${t.value};`);
  const sans = tokens.type.families.sans.replace(/^"IBM Plex Sans JP", /, '');
  const mono = tokens.type.families.mono.replace(/^"IBM Plex Mono", /, '');
  // The app loads IBM Plex with next/font and exposes it as --font-plex-*.
  raw.push(`--nx-font-sans: var(--font-plex-sans, "IBM Plex Sans JP"), ${sans};`);
  raw.push(`--nx-font-mono: var(--font-plex-mono, "IBM Plex Mono"), ${mono};`);
  return raw.join('\n');
}

/** Tailwind keys with fixed values: radius and control sizes (`rounded-md`, `h-control-md`). */
function tailwindStatic(tokens) {
  const lines = tokens.radius.tokens.map((t) => `--${t.name}: ${t.value};`);
  for (const t of tokens.size.tokens) lines.push(`--spacing-${t.name}: ${t.value};`);
  return lines.join('\n');
}

/** Tailwind keys that follow the theme (`bg-surface-1`, `text-ink`, `shadow-md`, `font-mono`). */
function tailwindInline(tokens) {
  const lines = tokens.color.tokens.map((t) => `--color-${t.name}: var(--${t.name});`);
  for (const s of tokens.shadow.tokens) lines.push(`--${s.name}: var(--nx-${s.name});`);
  lines.push('--font-sans: var(--nx-font-sans);', '--font-mono: var(--nx-font-mono);');
  return lines.join('\n');
}

function typographyUtilities(tokens) {
  const families = { sans: 'var(--nx-font-sans)', mono: 'var(--nx-font-mono)' };
  return tokens.type.groups
    .flatMap((group) =>
      group.styles.map((s) => {
        const decl = [
          `font-family: ${families[group.family]};`,
          `font-size: ${s.fontSize};`,
          `line-height: ${s.lineHeight};`,
          `font-weight: ${s.fontWeight};`,
        ];
        if (s.letterSpacing) decl.push(`letter-spacing: ${s.letterSpacing};`);
        if (group.family === 'mono') decl.push('font-variant-numeric: tabular-nums;');
        return `@utility type-${s.name} {\n${indent(decl.join('\n'), 2)}\n}`;
      }),
    )
    .join('\n\n');
}

export function buildTokensCss(tokens) {
  const blocks = [
    '/* GERADO de docs/design-tokens.json por packages/ui/scripts/build-tokens.mjs. Não edite à mão. */',
    '/* Tema: <html data-hue="azul|grafite|roxo" data-mode="claro|escuro|sistema">. */',
    `:root {\n${indent(rootVars(tokens), 2)}\n}`,
    `@theme static {\n${indent(tailwindStatic(tokens), 2)}\n}`,
    `@theme inline {\n${indent(tailwindInline(tokens), 2)}\n}`,
  ];

  for (const hue of HUES) {
    const light = [
      `[data-hue="${hue}"][data-mode="claro"]`,
      `[data-hue="${hue}"][data-mode="sistema"]`,
    ];
    if (hue === DEFAULT_HUE) light.unshift(':root');
    const dark = themeVars(tokens, `${hue}-escuro`);
    blocks.push(
      `${light.join(',\n')} {\n  color-scheme: light;\n${indent(themeVars(tokens, `${hue}-claro`), 2)}\n}`,
    );
    blocks.push(
      `[data-hue="${hue}"][data-mode="escuro"] {\n  color-scheme: dark;\n${indent(dark, 2)}\n}`,
    );
    const system = [`[data-hue="${hue}"][data-mode="sistema"]`];
    if (hue === DEFAULT_HUE) system.push(':root:not([data-hue])');
    blocks.push(
      `@media (prefers-color-scheme: dark) {\n  ${system.join(',\n  ')} {\n    color-scheme: dark;\n${indent(dark, 4)}\n  }\n}`,
    );
  }

  blocks.push(typographyUtilities(tokens));
  return `${blocks.join('\n\n')}\n`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const tokens = JSON.parse(readFileSync(TOKENS_JSON, 'utf8'));
  writeFileSync(TOKENS_CSS, buildTokensCss(tokens));
  console.log(
    `tokens.css gerado (${tokens.color.themes.length} temas, ${tokens.color.tokens.length} cores)`,
  );
}
