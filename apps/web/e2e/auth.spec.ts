import { expect, test, type Page } from '@playwright/test';

// Dev seed users (local database only): supabase/seeds/10_dev_data.sql
const PASSWORD = 'neo-local-2026';

async function signIn(page: Page, email: string, password = PASSWORD) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
}

test('anonymous visitor gets 404 on /super (the area does not reveal itself)', async ({ page }) => {
  const response = await page.goto('/super');
  expect(response?.status()).toBe(404);
});

test('anonymous visitor on /admin is sent to the login', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login$/);
});

test('a wrong password shows a generic message and stays on the login', async ({ page }) => {
  await signIn(page, 'admin@neo.local', 'senha-errada-123');
  // scoped to main: Next.js also renders a hidden route announcer with role=alert
  await expect(page.getByRole('main').getByRole('alert')).toContainText(
    'E-mail ou senha incorretos.',
  );
  await expect(page).toHaveURL(/\/login$/);
});

test('the Super Admin lands on /super and can sign out', async ({ page }) => {
  await signIn(page, 'admin@neo.local');
  await expect(page).toHaveURL(/\/super$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Início' })).toBeVisible();

  await page.getByRole('button', { name: 'Sair' }).click();
  await expect(page).toHaveURL(/\/login$/);
  const response = await page.goto('/super');
  expect(response?.status()).toBe(404);
});

test('a company owner lands on /admin and gets 404 on /super', async ({ page }) => {
  await signIn(page, 'dono.demo@neo.local');
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: 'デモ' })).toBeVisible();

  const response = await page.goto('/super');
  expect(response?.status()).toBe(404);
});
