import { expect, test } from '@playwright/test';
import { signInAsDemoOwner } from './helpers';

const SECTIONS = [
  { name: 'Funcionários', path: '/admin/funcionarios', tab: 'Holerites', tabPath: '/holerites' },
  { name: 'Clientes', path: '/admin/clientes', tab: 'Documentos', tabPath: '/documentos' },
  { name: 'Escalações', path: '/admin/escalacoes', tab: 'Histórico', tabPath: '/historico' },
  { name: 'Documentos', path: '/admin/documentos', tab: 'Excel', tabPath: '/excel' },
  { name: 'Fluxo de caixa', path: '/admin/fluxo-de-caixa', tab: 'Despesas', tabPath: '/despesas' },
  { name: 'Inteligência Artificial', path: '/admin/ia' },
  { name: 'Configurações', path: '/admin/configuracoes', tab: 'Sistema', tabPath: '/sistema' },
];

test('every menu item opens its screen with the title of the open screen', async ({ page }) => {
  await signInAsDemoOwner(page);
  const menu = page.getByRole('navigation', { name: 'Menu do painel' });
  await expect(page.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
  await expect(menu.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
    'aria-current',
    'page',
  );

  for (const s of SECTIONS) {
    await menu.getByRole('link', { name: s.name }).click();
    await expect(page).toHaveURL(new RegExp(`${s.path}$`));
    await expect(page.getByRole('heading', { level: 1, name: s.name })).toBeVisible();
    await expect(menu.getByRole('link', { name: s.name })).toHaveAttribute('aria-current', 'page');
    await expect(menu.locator('[aria-current="page"]')).toHaveCount(1);

    if (s.tab && s.tabPath) {
      const tabs = page.getByRole('navigation', { name: `Telas de ${s.name}` });
      await tabs.getByRole('link', { name: s.tab }).click();
      await expect(page).toHaveURL(new RegExp(`${s.path}${s.tabPath}$`));
      await expect(page.getByRole('heading', { level: 1, name: s.name })).toBeVisible();
      await expect(page.getByRole('heading', { level: 2, name: s.tab })).toBeVisible();
      await expect(tabs.getByRole('link', { name: s.tab })).toHaveAttribute('aria-current', 'page');
      // The section stays highlighted in the menu on any of its screens
      await expect(menu.getByRole('link', { name: s.name })).toHaveAttribute(
        'aria-current',
        'page',
      );
    }
  }
});

test('the menu collapses to icons, expands on hover and remembers the choice', async ({ page }) => {
  await signInAsDemoOwner(page);
  const menu = page.getByRole('navigation', { name: 'Menu do painel' });
  await expect(menu).toHaveJSProperty('offsetWidth', 248);

  await menu.getByRole('button', { name: 'Recolher menu' }).click();
  await page.mouse.move(900, 500);
  await expect(menu).toHaveJSProperty('offsetWidth', 68);

  await menu.getByRole('link', { name: 'Clientes' }).hover();
  await expect(menu).toHaveJSProperty('offsetWidth', 248);
  await page.mouse.move(900, 500);
  await expect(menu).toHaveJSProperty('offsetWidth', 68);

  await page.reload();
  await page.mouse.move(900, 500);
  await expect(menu).toHaveJSProperty('offsetWidth', 68);
  await expect(menu.getByRole('button', { name: 'Manter menu aberto' })).toBeAttached();
});

test('on a phone the logo opens the menu and choosing a screen closes it', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signInAsDemoOwner(page);
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('navigation', { name: 'Menu do painel' })).toBeHidden();

  await page.getByRole('button', { name: 'Abrir menu', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'Menu do painel' });
  await expect(drawer).toBeVisible();
  await drawer.getByRole('link', { name: 'Escalações' }).click();
  await expect(page).toHaveURL(/\/admin\/escalacoes$/);
  await expect(drawer).toBeHidden();
  await expect(page.getByRole('heading', { level: 1, name: 'Escalações' })).toBeVisible();

  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(390);
});

test('an unknown screen answers 404', async ({ page }) => {
  await signInAsDemoOwner(page);
  const response = await page.goto('/admin/funcionarios/nao-existe');
  expect(response?.status()).toBe(404);
});

test('the account menu holds the theme and the logout', async ({ page }) => {
  await signInAsDemoOwner(page);
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /Abrir menu da conta/ }).click();
  const menu = page.getByRole('dialog', { name: 'Menu da conta' });
  await expect(menu.getByRole('link', { name: 'Gerenciar conta' })).toBeVisible();

  await menu.getByRole('switch', { name: 'Modo escuro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-mode', /escuro|claro/);
  // MK-UI identity (ADR 0026): one palette, no hue picker.
  await expect(menu.getByRole('radio')).toHaveCount(0);

  await menu.getByRole('link', { name: 'Gerenciar conta' }).click();
  await expect(page).toHaveURL(/\/admin\/conta$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Minha conta' })).toBeVisible();

  await page.getByRole('button', { name: /Abrir menu da conta/ }).click();
  await page.getByRole('button', { name: 'Sair' }).click();
  await expect(page).toHaveURL(/\/login$/);
});
