import { expect, test, type Page } from '@playwright/test';
import { signInAsDemoOwner, uniqueCode } from './helpers';

async function shot(page: Page, name: string) {
  await page.screenshot({ path: test.info().outputPath(`${name}.png`), fullPage: true });
}

async function createEmployee(page: Page, name: string) {
  await page.goto('/admin/funcionarios/novo');
  await page.waitForLoadState('networkidle');
  await page.getByRole('textbox', { name: /^Nome completo/ }).fill(name);
  await page.getByRole('combobox', { name: /^Vínculo/ }).selectOption('regular');
  await page.getByRole('combobox', { name: 'Nacionalidade' }).selectOption('BR');
  await page.getByRole('textbox', { name: /^Celular/ }).fill('09012345678');
  await expect(page.getByRole('textbox', { name: /^Celular/ })).toHaveValue('090-1234-5678');
  await page.getByRole('button', { name: 'Cadastrar funcionário' }).click();
  await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
  await page.waitForLoadState('networkidle');
}

test('registers an employee and creates the app access with an 8-digit ID and a PIN', async ({
  page,
}) => {
  const name = `Silva ${uniqueCode('')}`;
  await signInAsDemoOwner(page);
  await createEmployee(page, name);
  await expect(page.getByText('Ainda sem acesso.', { exact: false })).toBeVisible();

  await page.getByRole('button', { name: 'Criar acesso ao app' }).click();
  const dialog = page.getByRole('dialog', { name: 'Acesso criado' });
  await expect(dialog).toBeVisible();
  const loginId = (await dialog.getByTestId('login-id').innerText()).trim();
  expect(loginId).toMatch(/^\d{4}-\d{4}$/);
  await expect(dialog.getByTestId('pin')).toHaveText(/^\d{4}$/);
  await expect(dialog.getByText('O PIN aparece só agora')).toBeVisible();
  await shot(page, 'access-created');
  await dialog.getByRole('button', { name: 'Já entreguei' }).click();

  // The page shows the ID (never the PIN again); the list too
  await expect(page.getByText(loginId)).toBeVisible();
  await expect(page.getByTestId('pin')).toHaveCount(0);
  await page.goto(`/admin/funcionarios?q=${encodeURIComponent(name)}`);
  await expect(page.getByRole('row').filter({ hasText: name })).toContainText(loginId);
  await shot(page, 'employees-list');
});

test('resetting the PIN keeps the ID and gives a new PIN', async ({ page }) => {
  const name = `Tanaka ${uniqueCode('')}`;
  await signInAsDemoOwner(page);
  await createEmployee(page, name);
  await page.getByRole('button', { name: 'Criar acesso ao app' }).click();
  const created = page.getByRole('dialog', { name: 'Acesso criado' });
  const loginId = (await created.getByTestId('login-id').innerText()).trim();
  await created.getByRole('button', { name: 'Já entreguei' }).click();

  await page.getByRole('button', { name: 'Redefinir PIN' }).click();
  const confirm = page.getByRole('dialog', { name: `Redefinir o PIN de ${name}?` });
  await expect(confirm.getByText(/sessões abertas/)).toBeVisible();
  await confirm.getByRole('button', { name: 'Redefinir PIN' }).click();
  const reset = page.getByRole('dialog', { name: 'PIN redefinido' });
  await expect(reset.getByTestId('login-id')).toHaveText(loginId);
  await expect(reset.getByTestId('pin')).toHaveText(/^\d{4}$/);
});

test('edits an employee and marks them inactive, which blocks the access', async ({ page }) => {
  const name = `Nguyen ${uniqueCode('')}`;
  await signInAsDemoOwner(page);
  await createEmployee(page, name);
  await page.getByRole('button', { name: 'Editar funcionário' }).click();
  const drawer = page.getByRole('dialog', { name: 'Editar funcionário' });
  await drawer.getByRole('combobox', { name: 'Situação' }).selectOption('inactive');
  await drawer.getByRole('button', { name: 'Salvar' }).click();
  await expect(drawer).toBeHidden();
  await expect(
    page.getByText('Funcionário inativo: o acesso não pode ser criado nem redefinido.'),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Criar acesso ao app' })).toBeDisabled();
});
