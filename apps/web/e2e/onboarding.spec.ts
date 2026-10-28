import { expect, test } from '@playwright/test';
import { createPartnerCompany, invitationLink, signInAsSuperAdmin, uniqueCode } from './helpers';

// "Cadastrar e liberar acesso": the Super Admin creates the company, the invitation goes out
// at once (no cron needed), the owner sets a password and lands on the office panel.
test('a new company owner receives the invitation and gets into /admin', async ({
  page,
  browser,
}) => {
  const code = uniqueCode('ONB');
  const email = `${code.toLowerCase()}@neo.local`;
  await signInAsSuperAdmin(page);
  const url = await createPartnerCompany(page, code);

  const link = await invitationLink(email);

  const owner = await browser.newContext({ locale: 'pt-BR' });
  const ownerPage = await owner.newPage();
  await ownerPage.goto(link);
  await expect(ownerPage).toHaveURL(/\/convite$/);
  await ownerPage.waitForLoadState('networkidle');
  await ownerPage.getByLabel('Nova senha').fill('senha-do-dono-2026');
  await ownerPage.getByLabel('Repita a senha').fill('senha-do-dono-2026');
  await ownerPage.getByRole('button', { name: 'Salvar e entrar' }).click();
  await expect(ownerPage).toHaveURL(/\/admin$/);
  await owner.close();

  // The Super Admin sees the invitation accepted and the owner with access
  await page.goto(`${url}?aba=usuarios`);
  await expect(
    page
      .getByRole('table', { name: 'Convites do Proprietário' })
      .getByText('Aceito', { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole('table', { name: 'Pessoas com acesso' })
      .getByText('Proprietário', { exact: true }),
  ).toBeVisible();
});
