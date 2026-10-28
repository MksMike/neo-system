import { describe, expect, it } from 'vitest';
import { ADMIN_SECTIONS, findScreen, isActiveHref, screenHref } from './sections';

describe('admin screens', () => {
  it('finds the section and screen of a URL', () => {
    expect(findScreen(['funcionarios'])?.screen.key).toBe('list');
    expect(findScreen(['funcionarios', 'novo'])?.screen.key).toBe('new');
    expect(findScreen(['fluxo-de-caixa', 'seguros-sociais'])?.screen.key).toBe('socialInsurance');
  });

  it('refuses unknown sections, screens and deeper paths', () => {
    expect(findScreen(['nada'])).toBeNull();
    expect(findScreen(['funcionarios', 'nada'])).toBeNull();
    expect(findScreen(['funcionarios', 'novo', 'mais'])).toBeNull();
  });

  it('every screen has a unique URL', () => {
    const hrefs = ADMIN_SECTIONS.flatMap((s) => s.screens.map((sc) => screenHref(s, sc)));
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('the dashboard is active only on /admin; a section on all its screens', () => {
    expect(isActiveHref('/admin', '/admin')).toBe(true);
    expect(isActiveHref('/admin/clientes', '/admin')).toBe(false);
    expect(isActiveHref('/admin/clientes/novo', '/admin/clientes')).toBe(true);
    expect(isActiveHref('/admin/clientesx', '/admin/clientes')).toBe(false);
  });
});
