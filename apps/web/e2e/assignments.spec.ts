import { expect, test, type Page } from '@playwright/test';
import { signInAsDemoOwner, uniqueCode } from './helpers';

async function shot(page: Page, name: string) {
  await page.screenshot({ path: test.info().outputPath(`${name}.png`), fullPage: true });
}

/** Monday of the next week, in Tokyo: a period that never starts in the past. */
function nextMonday(): string {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' }).format(new Date());
  const d = new Date(`${today}T00:00:00Z`);
  const iso = ((d.getUTCDay() + 6) % 7) + 1;
  d.setUTCDate(d.getUTCDate() + (8 - iso));
  return d.toISOString().slice(0, 10);
}

function plus(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** A client with one subcontractor (abbreviation) and one site, plus two employees. */
async function arrange(page: Page, tag: string) {
  await page.goto('/admin/clientes/novo');
  await page.waitForLoadState('networkidle');
  await page.getByRole('textbox', { name: /^Nome do cliente/ }).fill(`鹿島建設${tag}`);
  await page.getByRole('button', { name: 'Cadastrar cliente' }).click();
  await expect(page.getByRole('heading', { level: 1, name: `鹿島建設${tag}` })).toBeVisible();
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Adicionar subcontratante' }).click();
  const link = page.getByRole('dialog', { name: 'Adicionar subcontratante' });
  await link.getByRole('textbox', { name: /^Subcontratante/ }).fill(`横浜工業${tag}`);
  await link.getByRole('textbox', { name: /^Sigla/ }).fill('YKH');
  await link.getByRole('button', { name: 'Vincular' }).click();
  await expect(link).toBeHidden();
  await page.getByRole('button', { name: 'Novo local' }).click();
  const site = page.getByRole('dialog', { name: 'Novo local' });
  await site.getByRole('textbox', { name: /^Nome do local/ }).fill(`横浜工場${tag}`);
  await site.getByRole('button', { name: 'Salvar' }).click();
  await expect(site).toBeHidden();

  for (const name of [`Silva ${tag}`, `Tanaka ${tag}`]) {
    await page.goto('/admin/funcionarios/novo');
    await page.waitForLoadState('networkidle');
    await page.getByRole('textbox', { name: /^Nome completo/ }).fill(name);
    await page.getByRole('combobox', { name: /^Vínculo/ }).selectOption('regular');
    await page.getByRole('button', { name: 'Cadastrar funcionário' }).click();
    await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
  }
}

async function newAssignment(
  page: Page,
  tag: string,
  opts: { start: string; end: string; startTime: string; endTime: string; extra?: boolean },
) {
  await page.goto('/admin/escalacoes/nova');
  await page.waitForLoadState('networkidle');
  await page.getByRole('combobox', { name: /^Cliente/ }).selectOption({ label: `鹿島建設${tag}` });
  await page
    .getByRole('combobox', { name: 'Subcontratante' })
    .selectOption({ label: `YKH · 横浜工業${tag}` });
  await page.getByRole('combobox', { name: 'Local' }).selectOption({ label: `横浜工場${tag}` });
  await page.getByLabel(/^Início/).fill(opts.start);
  await page.getByLabel(/^Fim/).fill(opts.end);
  await page.getByLabel(/^Entrada/).fill(opts.startTime);
  await page.getByLabel(/^Saída/).fill(opts.endTime);
  await page.getByRole('textbox', { name: /^Valor dia/ }).fill('20000');
  if (opts.extra) {
    await page.getByRole('switch', { name: /valor adicional por dia/ }).click();
    await page.getByRole('textbox', { name: /^Descrição do valor adicional/ }).fill('出張手当');
    await page.getByRole('textbox', { name: /^Contratante/ }).fill('3000');
    await page.getByRole('textbox', { name: /^Funcionário/ }).fill('2000');
  }
  await page.getByRole('button', { name: 'Salvar escalação' }).click();
  await expect(page.getByRole('button', { name: 'Escalar funcionário' })).toBeVisible();
  await page.waitForLoadState('networkidle');
}

async function putOnPeriod(page: Page, name: string) {
  await page.getByRole('button', { name: 'Escalar funcionário' }).click();
  const dialog = page.getByRole('dialog', { name: 'Escalar funcionário' });
  await dialog.getByRole('combobox', { name: /^Funcionário/ }).selectOption({ label: name });
  await dialog.getByRole('button', { name: 'Escalar' }).click();
  return dialog;
}

test('creates an assignment, puts employees on every day and edits one day', async ({ page }) => {
  test.slow();
  const tag = uniqueCode('');
  const start = nextMonday();
  await signInAsDemoOwner(page);
  await arrange(page, tag);
  await newAssignment(page, tag, {
    start,
    end: plus(start, 6),
    startTime: '08:00',
    endTime: '17:00',
    extra: true,
  });
  await expect(page.getByLabel('Escalação com valor adicional')).toBeVisible();

  await expect(await putOnPeriod(page, `Silva ${tag}`)).toBeHidden();
  await expect(await putOnPeriod(page, `Tanaka ${tag}`)).toBeHidden();

  // Seven day cards, each with both employees (weekends included, R06-07)
  const days = page.getByRole('button', { name: /^Abrir o dia/ });
  await expect(days).toHaveCount(7);
  await expect(days.last()).toContainText(`Silva ${tag}`);
  await expect(days.last()).toContainText('YKH');
  await shot(page, 'assignment-board');

  // Day details: todos 定時, then overtime for one employee (R06-08)
  await days.first().click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Todos 定時' }).click();
  await expect(dialog.getByText('定時').first()).toBeVisible();
  await dialog.getByRole('button', { name: new RegExp(`Silva ${tag}`) }).click();
  await dialog.getByRole('textbox', { name: /^Horas extras/ }).fill('1.5');
  await dialog.getByRole('button', { name: 'Salvar' }).click();
  await expect(
    dialog.getByRole('button', { name: new RegExp(`Silva ${tag}.*残業`) }),
  ).toBeVisible();
  await shot(page, 'day-details');
  await page.keyboard.press('Escape');
  await expect(days.first()).toContainText('1.5');

  // The month calendar lists the assignment
  await page.goto(`/admin/escalacoes?data=${start}`);
  await expect(page.getByRole('button', { name: new RegExp(`鹿島建設${tag}`) })).toBeVisible();
  await shot(page, 'month-calendar');
});

test('refuses an employee in two assignments at the same hours (R06-02)', async ({ page }) => {
  test.slow();
  const tag = uniqueCode('');
  const start = nextMonday();
  await signInAsDemoOwner(page);
  await arrange(page, tag);
  await newAssignment(page, tag, { start, end: start, startTime: '08:00', endTime: '17:00' });
  await expect(await putOnPeriod(page, `Silva ${tag}`)).toBeHidden();

  await newAssignment(page, tag, { start, end: start, startTime: '13:00', endTime: '18:00' });
  const dialog = await putOnPeriod(page, `Silva ${tag}`);
  await expect(dialog.getByText(/já tem outra escalação no mesmo horário/)).toBeVisible();
});
