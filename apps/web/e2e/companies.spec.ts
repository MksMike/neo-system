import { expect, test, type Page } from '@playwright/test';

// Dev seed Super Admin and companies SUGITA and DEMO (local database only): supabase/seeds/10_dev_data.sql
async function signInAsSuperAdmin(page: Page) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('admin@neo.local');
  await page.getByLabel('Senha').fill('neo-local-2026');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/super$/);
}

/** Unique code per run: the local database keeps the companies of earlier runs. */
function uniqueCode(prefix: string): string {
  return `${prefix}${Date.now().toString(36).toUpperCase()}`.slice(0, 12);
}

/** Waits for the wizard to hydrate: a click before that would submit the form natively. */
async function openWizard(page: Page) {
  await page.goto('/super/empresas/nova');
  await page.waitForLoadState('networkidle');
}

/** First day of next month in Tokyo: a valid monthly billing day whatever today is (R00-14). */
function firstOfNextMonth(): string {
  const [y, m] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' })
    .format(new Date())
    .split('-')
    .map(Number);
  const year = m === 12 ? (y ?? 0) + 1 : (y ?? 0);
  const month = m === 12 ? 1 : (m ?? 0) + 1;
  return `${String(year)}-${String(month).padStart(2, '0')}-01`;
}

const next = (page: Page) => page.getByRole('button', { name: 'Continuar' }).click();
const stepHeading = (page: Page, n: number) =>
  page.getByRole('heading', { level: 2, name: new RegExp(`^Passo ${String(n)} de 4`) });

async function fillCompanyStep(page: Page, legalName: string, code: string) {
  await page.getByRole('textbox', { name: /^Razão social\s*\*?$/ }).fill(legalName);
  await page.getByRole('textbox', { name: /Código da empresa/ }).fill(code);
}

test('lists the seed companies and searches by code', async ({ page }) => {
  await signInAsSuperAdmin(page);
  await page.goto('/super/empresas');
  const table = page.getByRole('table', { name: 'Empresas' });
  await expect(table.getByRole('cell', { name: 'SUGITA', exact: true })).toBeVisible();
  await expect(table.getByRole('cell', { name: 'DEMO', exact: true })).toBeVisible();

  await page.getByRole('searchbox', { name: 'Buscar' }).fill('sugita');
  await page.getByRole('button', { name: 'Filtrar' }).click();
  await expect(page).toHaveURL(/q=sugita/);
  await expect(table.getByRole('cell', { name: 'SUGITA', exact: true })).toBeVisible();
  await expect(table.getByRole('cell', { name: 'DEMO', exact: true })).toHaveCount(0);

  await page.getByRole('searchbox', { name: 'Buscar' }).fill('nao-existe-xyz');
  await page.getByRole('button', { name: 'Filtrar' }).click();
  await expect(page.getByText('Nenhuma empresa encontrada')).toBeVisible();
});

test('creates a monthly company in 4 steps, with dependencies and the invitation queued', async ({
  page,
}) => {
  const code = uniqueCode('E2E');
  await signInAsSuperAdmin(page);
  await openWizard(page);

  // 1) Company: required fields are checked before moving on
  await next(page);
  await expect(page.getByText('Campo obrigatório.').first()).toBeVisible();
  await fillCompanyStep(page, `株式会社${code}`, code.toLowerCase());
  await page.getByRole('textbox', { name: 'CEP (郵便番号)' }).fill('1500001');
  await expect(page.getByRole('textbox', { name: 'CEP (郵便番号)' })).toHaveValue('150-0001');
  await next(page);

  // 2) Modules: turning on an add-on turns on what it needs (R00-04)
  await expect(stepHeading(page, 2)).toBeFocused();
  await page.getByRole('checkbox', { name: /^Extrato bancário automático/ }).click();
  await expect(page.getByText(/também ligamos: Financeiro, caixa e despesas/)).toBeVisible();
  await expect(
    page.getByRole('checkbox', { name: /^Financeiro, caixa e despesas/ }),
  ).toBeDisabled();
  await next(page);

  // 3) Contract
  await expect(stepHeading(page, 3)).toBeVisible();
  await page.getByRole('radio', { name: /^Mensal/ }).click();
  await next(page);
  await expect(page.getByText('Campo obrigatório.').first()).toBeVisible();
  await page.getByRole('textbox', { name: /Valor/ }).fill('48000');
  await expect(page.getByRole('textbox', { name: /Valor/ })).toHaveValue('48,000');
  await page.getByRole('radio', { name: /Transferência/ }).click();
  await page.getByRole('textbox', { name: /Início do contrato/ }).fill(firstOfNextMonth());
  await expect(page.getByText(/a cobrança vence todo dia 1\./)).toBeVisible();
  await next(page);

  // 4) Owner and review
  await expect(stepHeading(page, 4)).toBeVisible();
  await page.getByRole('textbox', { name: /Nome do Proprietário/ }).fill('Dono E2E');
  await page
    .getByRole('textbox', { name: /E-mail do Proprietário/ })
    .fill(`${code.toLowerCase()}@neo.local`);
  await expect(page.getByText(code, { exact: true })).toBeVisible();
  await expect(page.getByText('￥48,000')).toBeVisible();
  await page.getByRole('button', { name: 'Criar empresa' }).click();

  await expect(page).toHaveURL(new RegExp(`/super/empresas\\?criada=${code}$`));
  await expect(page.getByText(`Empresa ${code} criada`)).toBeVisible();
  const row = page.getByRole('row').filter({ hasText: code });
  await expect(row).toContainText('Mensal');
  await expect(row).toContainText('Ativa');
});

test('a code already in use is refused on the first step', async ({ page }) => {
  await signInAsSuperAdmin(page);
  await openWizard(page);
  await fillCompanyStep(page, '株式会社重複テスト', 'SUGITA');
  await next(page);
  await expect(page.getByText('Este código já está em uso. Escolha outro.')).toBeVisible();
  await expect(stepHeading(page, 1)).toBeVisible();
});

test('a partner contract needs no price and the company starts active', async ({ page }) => {
  const code = uniqueCode('PRT');
  await signInAsSuperAdmin(page);
  await openWizard(page);
  await fillCompanyStep(page, `${code} Partners`, code);
  await next(page);
  await expect(stepHeading(page, 2)).toBeVisible();
  await next(page);
  await page.getByRole('radio', { name: /^Parceiro/ }).click();
  await expect(page.getByRole('textbox', { name: /Valor/ })).toHaveCount(0);
  await next(page);
  await page.getByRole('textbox', { name: /Nome do Proprietário/ }).fill('Parceiro E2E');
  await page
    .getByRole('textbox', { name: /E-mail do Proprietário/ })
    .fill(`${code.toLowerCase()}@neo.local`);
  await page.getByRole('button', { name: 'Criar empresa' }).click();

  await expect(page.getByText(`Empresa ${code} criada`)).toBeVisible();
  const row = page.getByRole('row').filter({ hasText: code });
  await expect(row).toContainText('Parceiro (vitalício)');
  await expect(row).toContainText('Vitalício');
});
