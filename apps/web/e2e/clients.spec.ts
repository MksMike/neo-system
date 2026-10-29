import { expect, test, type Page } from '@playwright/test';
import { signInAsDemoOwner, uniqueCode } from './helpers';

/** Unique names per run: the local database keeps the data of earlier runs. */
function names() {
  const tag = uniqueCode('');
  return { client: `株式会社大成建設${tag}`, sub: `内山工業${tag}`, sub2: `(株)SFK${tag}`, tag };
}

async function shot(page: Page, name: string) {
  await page.screenshot({ path: test.info().outputPath(`${name}.png`), fullPage: true });
}

async function createClient(page: Page, name: string) {
  await page.goto('/admin/clientes/novo');
  await page.waitForLoadState('networkidle');
  await page.getByRole('textbox', { name: /^Nome do cliente/ }).fill(name);
  await page.getByRole('textbox', { name: 'CEP (郵便番号)' }).fill('1080075');
  await page.getByRole('button', { name: 'Cadastrar cliente' }).click();
  await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
  await page.waitForLoadState('networkidle');
}

test('registers a client, its chain of subcontractors with colors and a work site', async ({
  page,
}) => {
  const n = names();
  await signInAsDemoOwner(page);
  await createClient(page, n.client);
  await expect(page.getByText('〒108-0075')).toBeVisible();

  // Quick "+": a new subcontractor gets the first color of the design tokens
  await page.getByRole('button', { name: 'Adicionar subcontratante' }).click();
  const dialog = page.getByRole('dialog', { name: 'Adicionar subcontratante' });
  await dialog.getByRole('textbox', { name: /^Subcontratante/ }).fill(n.sub);
  await dialog.getByRole('textbox', { name: /^Sigla/ }).fill('UCH');
  await dialog.getByRole('button', { name: 'Vincular' }).click();
  await expect(dialog).toBeHidden();
  const chain = page.getByRole('table', { name: 'Cadeia de subcontratantes' });
  await expect(chain.getByRole('row').filter({ hasText: n.sub })).toContainText('Azul');

  // The second one gets the next free color
  await page.getByRole('button', { name: 'Adicionar subcontratante' }).click();
  await dialog.getByRole('textbox', { name: /^Subcontratante/ }).fill(n.sub2);
  await dialog.getByRole('combobox', { name: /^Posição/ }).selectOption('2');
  await dialog.getByRole('button', { name: 'Vincular' }).click();
  await expect(chain.getByRole('row').filter({ hasText: n.sub2 })).toContainText('Verde');

  // The color can be changed, only among the design token colors
  await chain.getByRole('button', { name: `Cor de ${n.sub}` }).click();
  await page.getByRole('radio', { name: 'Violeta' }).click();
  await expect(chain.getByRole('row').filter({ hasText: n.sub })).toContainText('Violeta');

  // Work site with the default radius
  await page.getByRole('button', { name: 'Novo local' }).click();
  const siteDialog = page.getByRole('dialog', { name: 'Novo local' });
  await siteDialog.getByRole('textbox', { name: /^Nome do local/ }).fill(`品川工場${n.tag}`);
  await siteDialog.getByRole('button', { name: 'Salvar' }).click();
  await expect(
    page
      .getByRole('table', { name: 'Locais de trabalho' })
      .getByRole('row')
      .filter({ hasText: `品川工場${n.tag}` }),
  ).toContainText('300 m');
  await shot(page, 'client-page');

  // The list shows the chain chips; the subcontractors screen shows the links
  await page.goto(`/admin/clientes?q=${encodeURIComponent(n.tag)}`);
  const row = page
    .getByRole('table', { name: 'Clientes' })
    .getByRole('row')
    .filter({ hasText: n.client });
  await expect(row).toContainText('UCH');
  await shot(page, 'clients-list');
  await page.goto('/admin/clientes/subcontratantes');
  await expect(page.getByRole('row').filter({ hasText: n.sub })).toContainText(n.client);
});

test('the quick "+" shows the organization already registered instead of a duplicate', async ({
  page,
}) => {
  const n = names();
  await signInAsDemoOwner(page);
  await createClient(page, n.client);
  await page.getByRole('button', { name: 'Adicionar subcontratante' }).click();
  const dialog = page.getByRole('dialog', { name: 'Adicionar subcontratante' });
  await dialog.getByRole('textbox', { name: /^Subcontratante/ }).fill(n.sub);
  await dialog.getByRole('button', { name: 'Vincular' }).click();
  await expect(dialog).toBeHidden();

  // A second client: typing the same company with another legal form finds it
  await createClient(page, `${n.client}二`);
  await page.getByRole('button', { name: 'Adicionar subcontratante' }).click();
  await dialog.getByRole('textbox', { name: /^Subcontratante/ }).fill(`株式会社${n.sub}`);
  await dialog.getByRole('button', { name: 'Usar esta' }).click();
  await expect(dialog.getByText('Organização já cadastrada: será só vinculada.')).toBeVisible();
  await shot(page, 'quick-add');
  await dialog.getByRole('button', { name: 'Vincular' }).click();
  await expect(dialog).toBeHidden();
  await expect(
    page
      .getByRole('table', { name: 'Cadeia de subcontratantes' })
      .getByRole('row')
      .filter({ hasText: n.sub }),
  ).toBeVisible();
});

test('a client with the same name in another legal form is refused', async ({ page }) => {
  const n = names();
  await signInAsDemoOwner(page);
  await createClient(page, n.client);
  await page.goto('/admin/clientes/novo');
  await page.waitForLoadState('networkidle');
  await page
    .getByRole('textbox', { name: /^Nome do cliente/ })
    .fill(n.client.replace('株式会社', '(株)'));
  await page.getByRole('button', { name: 'Cadastrar cliente' }).click();
  await expect(page.getByText(/Já existe uma organização com este nome/)).toBeVisible();
});
