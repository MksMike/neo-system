import { describe, expect, it } from 'vitest';
import { negotiateLocale } from '../i18n/config';
import { buildCsp, createNonce } from './csp';
import { parseHue, parseMode } from './theme';

describe('Content-Security-Policy (ADR 0023)', () => {
  const prod = buildCsp({ nonce: 'abc', dev: false });

  it('only runs scripts with the nonce, never inline or eval in production', () => {
    expect(prod).toContain("script-src 'self' 'nonce-abc' 'strict-dynamic'");
    expect(prod).not.toContain("'unsafe-eval'");
    expect(prod).not.toMatch(/script-src[^;]*'unsafe-inline'/);
  });

  it('blocks framing, plugins and foreign form targets', () => {
    expect(prod).toContain("frame-ancestors 'none'");
    expect(prod).toContain("object-src 'none'");
    expect(prod).toContain("form-action 'self'");
    expect(prod).toContain('upgrade-insecure-requests');
  });

  it('allows eval and websockets only in development (hot reload)', () => {
    const dev = buildCsp({ nonce: 'abc', dev: true });
    expect(dev).toContain("'unsafe-eval'");
    expect(dev).toContain('ws:');
    expect(dev).not.toContain('upgrade-insecure-requests');
  });

  it('creates a different nonce every time', () => {
    expect(createNonce()).not.toBe(createNonce());
    expect(createNonce()).toMatch(/^[A-Za-z0-9+/]{22}==$/);
  });
});

describe('theme cookies (ADR 0010)', () => {
  it('falls back to azul and sistema for missing or tampered values', () => {
    expect(parseHue('roxo')).toBe('roxo');
    expect(parseHue('"><script>')).toBe('azul');
    expect(parseHue(undefined)).toBe('azul');
    expect(parseMode('escuro')).toBe('escuro');
    expect(parseMode('x')).toBe('sistema');
  });
});

describe('locale negotiation', () => {
  it('picks the best supported language', () => {
    expect(negotiateLocale('pt-BR,pt;q=0.9,en;q=0.8')).toBe('pt');
    expect(negotiateLocale('en-US,ja;q=0.5')).toBe('ja');
    expect(negotiateLocale('en-US,fr;q=0.5')).toBe('ja');
    expect(negotiateLocale(null)).toBe('ja');
  });
});
