import { expect, test, type Page } from '@playwright/test';

// Dev seed Super Admin (local database only): supabase/seeds/10_dev_data.sql
async function signInAsSuperAdmin(page: Page) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('admin@neo.local');
  await page.getByLabel('Senha').fill('neo-local-2026');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/super$/);
}

const PAGES = [
  { link: 'Início', path: '/super', heading: 'Início' },
  { link: 'Empresas', path: '/super/empresas', heading: 'Empresas' },
  { link: 'Pagamentos', path: '/super/pagamentos', heading: 'Pagamentos' },
  { link: 'Módulos e planos', path: '/super/modulos', heading: 'Módulos e planos' },
  { link: 'Sistema', path: '/super/sistema', heading: 'Sistema' },
];

test('every menu item opens its page with title, empty state and the item marked as current', async ({
  page,
}) => {
  await signInAsSuperAdmin(page);
  const menu = page.getByRole('navigation', { name: 'Menu do Super Admin' });

  for (const p of PAGES) {
    await menu.getByRole('link', { name: p.link }).click();
    await expect(page).toHaveURL(new RegExp(`${p.path}$`));
    await expect(page.getByRole('heading', { level: 1, name: p.heading })).toBeVisible();
    await expect(menu.getByRole('link', { name: p.link })).toHaveAttribute('aria-current', 'page');
    await expect(menu.locator('[aria-current="page"]')).toHaveCount(1);
  }
});

test('"Nova empresa" opens the wizard page and keeps Empresas highlighted', async ({ page }) => {
  await signInAsSuperAdmin(page);
  await page.goto('/super/empresas');
  await page.getByRole('link', { name: 'Nova empresa' }).click();
  await expect(page).toHaveURL(/\/super\/empresas\/nova$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Nova empresa' })).toBeVisible();
  const menu = page.getByRole('navigation', { name: 'Menu do Super Admin' });
  await expect(menu.getByRole('link', { name: 'Empresas' })).toHaveAttribute(
    'aria-current',
    'page',
  );
});

test('on a phone the menu opens as a drawer and closes after navigating', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signInAsSuperAdmin(page);

  await expect(page.getByRole('navigation', { name: 'Menu do Super Admin' })).toBeHidden();
  await page.getByRole('button', { name: 'Abrir menu', exact: true }).click();
  const drawer = page.getByRole('dialog');
  await drawer.getByRole('link', { name: 'Pagamentos' }).click();

  await expect(page).toHaveURL(/\/super\/pagamentos$/);
  await expect(drawer).toBeHidden();
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(390); // no horizontal scroll
});

test('keyboard users can skip the menu', async ({ page }) => {
  await signInAsSuperAdmin(page);
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Pular para o conteúdo' });
  await expect(skip).toBeFocused();
  await skip.press('Enter');
  await expect(page.locator('#conteudo')).toBeFocused();
});
