import { expect, type Page } from '@playwright/test';

// Dev seed Super Admin and companies SUGITA and DEMO (local database only): supabase/seeds/10_dev_data.sql
export async function signInAsSuperAdmin(page: Page) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('admin@neo.local');
  await page.getByLabel('Senha').fill('neo-local-2026');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/super$/);
}

/** Unique code per run: the local database keeps the companies of earlier runs. */
export function uniqueCode(prefix: string): string {
  return `${prefix}${Date.now().toString(36).toUpperCase()}`.slice(0, 12);
}

/** Waits for the wizard to hydrate: a click before that would submit the form natively. */
export async function openWizard(page: Page) {
  await page.goto('/super/empresas/nova');
  await page.waitForLoadState('networkidle');
}

/** First day of next month in Tokyo: a valid monthly billing day whatever today is (R00-14). */
export function firstOfNextMonth(): string {
  const [y, m] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' })
    .format(new Date())
    .split('-')
    .map(Number);
  const year = m === 12 ? (y ?? 0) + 1 : (y ?? 0);
  const month = m === 12 ? 1 : (m ?? 0) + 1;
  return `${String(year)}-${String(month).padStart(2, '0')}-01`;
}

export const next = (page: Page) => page.getByRole('button', { name: 'Continuar' }).click();
export const stepHeading = (page: Page, n: number) =>
  page.getByRole('heading', { level: 2, name: new RegExp(`^Passo ${String(n)} de 4`) });

export async function fillCompanyStep(page: Page, legalName: string, code: string) {
  await page.getByRole('textbox', { name: /^Razão social\s*\*?$/ }).fill(legalName);
  await page.getByRole('textbox', { name: /Código da empresa/ }).fill(code);
}

/**
 * Creates a partner company through the wizard (no price, no charges; modules of the
 * "Padrão" plan) and opens its page.
 * Each test gets its own company, so runs never depend on what earlier runs changed.
 */
export async function createPartnerCompany(page: Page, code: string): Promise<string> {
  await openWizard(page);
  await fillCompanyStep(page, `${code} 株式会社`, code);
  await next(page);
  await expect(stepHeading(page, 2)).toBeVisible();
  await next(page);
  await page.getByRole('radio', { name: /^Parceiro/ }).click();
  await next(page);
  await page.getByRole('textbox', { name: /Nome do Proprietário/ }).fill(`Dono ${code}`);
  await page
    .getByRole('textbox', { name: /E-mail do Proprietário/ })
    .fill(`${code.toLowerCase()}@neo.local`);
  await page.getByRole('button', { name: 'Criar empresa' }).click();
  await expect(page.getByText(`Empresa ${code} criada`)).toBeVisible();
  await page.getByRole('link', { name: code, exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: `${code} 株式会社` })).toBeVisible();
  await page.waitForLoadState('networkidle');
  return page.url();
}
