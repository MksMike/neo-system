import { expect, test } from '@playwright/test';
import { createPartnerCompany, firstOfNextMonth, signInAsSuperAdmin, uniqueCode } from './helpers';

test('the company page has one URL per tab', async ({ page }) => {
  await signInAsSuperAdmin(page);
  const url = await createPartnerCompany(page, uniqueCode('TAB'));
  const tabs = page.getByRole('navigation', { name: 'Seções da empresa' });
  await expect(tabs.getByRole('link', { name: 'Resumo' })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByText('Dados da empresa')).toBeVisible();

  for (const [name, aba] of [
    ['Módulos', 'modulos'],
    ['Contrato e pagamentos', 'contrato'],
    ['Usuários', 'usuarios'],
    ['Histórico', 'historico'],
  ] as const) {
    await tabs.getByRole('link', { name }).click();
    await expect(page).toHaveURL(new RegExp(`aba=${aba}$`));
    await expect(tabs.getByRole('link', { name })).toHaveAttribute('aria-current', 'page');
  }
  await expect(page.getByText('Empresa cadastrada')).toBeVisible();

  await page.goto(`${url}?aba=usuarios`);
  await expect(page.getByRole('table', { name: 'Convites do Proprietário' })).toBeVisible();
});

test('turns a module on from a future date (R00-04, R00-05)', async ({ page }) => {
  await signInAsSuperAdmin(page);
  const url = await createPartnerCompany(page, uniqueCode('MOD'));
  await page.goto(`${url}?aba=modulos`);
  await page.waitForLoadState('networkidle');

  await page.getByRole('checkbox', { name: /^Aprendizado/ }).click();
  await expect(page.getByText('Liga: Aprendizado (japonês de genba).')).toBeVisible();
  const from = firstOfNextMonth();
  await page.getByLabel('Vale a partir de').fill(from);
  await page.getByRole('button', { name: 'Salvar módulos' }).click();
  await expect(page.getByText('Módulos salvos.')).toBeVisible();

  const row = page
    .getByRole('table', { name: 'Períodos de cada módulo' })
    .getByRole('row')
    .filter({ hasText: 'Aprendizado' });
  await expect(row).toContainText('Agendado');
  await expect(page.getByText('Nenhuma alteração.')).toBeVisible();
});

test('a change based on an old page is refused (ADR 0020)', async ({ page, context }) => {
  test.slow(); // two tabs: in local dev mode each one compiles its page
  await signInAsSuperAdmin(page);
  const url = await createPartnerCompany(page, uniqueCode('CNF'));
  await page.goto(`${url}?aba=modulos`);
  await page.waitForLoadState('networkidle');

  // Someone else changes the modules in another tab
  const other = await context.newPage();
  await other.goto(`${url}?aba=modulos`);
  await other.waitForLoadState('networkidle');
  await other.getByRole('checkbox', { name: /^Dashboard e relatórios/ }).click();
  await other.getByRole('button', { name: 'Salvar módulos' }).click();
  await expect(other.getByText('Módulos salvos.')).toBeVisible();
  await other.close();

  // The first tab still shows the old modules
  await page.getByRole('checkbox', { name: /^Aprendizado/ }).click();
  await page.getByRole('button', { name: 'Salvar módulos' }).click();
  await expect(page.getByText('Alterado por outra pessoa')).toBeVisible();
});

test('changes the contract from a date and records it in the history', async ({ page }) => {
  await signInAsSuperAdmin(page);
  const url = await createPartnerCompany(page, uniqueCode('CTR'));
  await page.goto(`${url}?aba=contrato`);
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: 'Trocar contrato' }).click();
  const dialog = page.getByRole('dialog', { name: 'Trocar contrato' });
  await dialog.getByRole('radio', { name: 'Mensal' }).click();
  await dialog.getByRole('button', { name: 'Salvar nova versão' }).click();
  await expect(dialog.getByText('Campo obrigatório.').first()).toBeVisible();

  await dialog.getByRole('textbox', { name: /Valor/ }).fill('30000');
  await dialog.getByRole('radio', { name: /Dinheiro/ }).click();
  await dialog.getByLabel('Vale a partir de').fill(firstOfNextMonth());
  await expect(dialog.getByText(/A versão atual vale até/)).toBeVisible();
  await dialog.getByRole('button', { name: 'Salvar nova versão' }).click();
  await expect(page.getByText('Nova versão do contrato salva.')).toBeVisible();

  const versions = page.getByRole('table', { name: 'Versões do contrato' }).locator('tbody tr');
  await expect(versions).toHaveCount(2);
  await expect(versions.first()).toContainText('￥30,000');
  await expect(page.getByText('Mudança agendada')).toBeVisible();

  await page.goto(`${url}?aba=historico`);
  await expect(page.getByText('Contrato alterado')).toBeVisible();
});

test('an unknown company id answers 404', async ({ page }) => {
  await signInAsSuperAdmin(page);
  const response = await page.goto('/super/empresas/00000000-0000-0000-0000-000000000000');
  expect(response?.status()).toBe(404);
  const bad = await page.goto('/super/empresas/nao-e-uuid');
  expect(bad?.status()).toBe(404);
});
