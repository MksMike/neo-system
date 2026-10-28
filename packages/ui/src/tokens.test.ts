import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildTokensCss, TOKENS_CSS, TOKENS_JSON } from '../scripts/build-tokens.mjs';

interface Tokens {
  color: { themes: { id: string }[]; tokens: { name: string; value: Record<string, string> }[] };
}

const tokens = JSON.parse(readFileSync(TOKENS_JSON, 'utf8')) as Tokens;
const css = readFileSync(TOKENS_CSS, 'utf8');

describe('design tokens', () => {
  it('tokens.css is in sync with docs/design-tokens.json (run `pnpm --filter @neo/ui tokens`)', () => {
    expect(css.replace(/\r\n/g, '\n')).toBe(buildTokensCss(tokens));
  });

  it('every color has a value in all 6 themes', () => {
    expect(tokens.color.themes).toHaveLength(6);
    for (const token of tokens.color.tokens) {
      for (const theme of tokens.color.themes) {
        expect(token.value[theme.id], `${token.name} in ${theme.id}`).toMatch(
          /^#[0-9A-F]{6}([0-9A-F]{2})?$/i,
        );
      }
    }
  });

  it('defines light, dark and system blocks for each hue', () => {
    for (const hue of ['azul', 'grafite', 'roxo']) {
      expect(css).toContain(`[data-hue="${hue}"][data-mode="claro"]`);
      expect(css).toContain(`[data-hue="${hue}"][data-mode="escuro"]`);
      expect(css).toContain(`[data-hue="${hue}"][data-mode="sistema"]`);
    }
  });
});
