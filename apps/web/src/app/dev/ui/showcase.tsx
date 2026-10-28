'use client';

import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  CardInset,
  CardTitle,
  Checkbox,
  Chip,
  DayCell,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmployeeIdInput,
  EmptyState,
  Field,
  Input,
  LandlinePhoneInput,
  MobilePhoneInput,
  NativeSelect,
  PostalCodeInput,
  Progress,
  Radio,
  RadioGroup,
  Skeleton,
  Stat,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  toast,
  Tooltip,
  type DayKind,
} from '@neo/ui';
import {
  employeeLoginId,
  formatYen,
  freeText,
  landlinePhone,
  mobilePhone,
  postalCode,
} from '@neo/validation';
import {
  Building2,
  CircleAlert,
  Ellipsis,
  Pause,
  Pencil,
  Plus,
  Search,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10 border-t border-line pt-8 first:mt-0 first:border-t-0 first:pt-0">
      <h2 className="m-0 mb-4 type-h2">{title}</h2>
      {children}
    </section>
  );
}

function Demo({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`flex min-w-0 flex-col gap-4 rounded-lg border border-line bg-surface-1 p-5 ${className}`}
    >
      {children}
    </div>
  );
}

/** Validates a field with its shared schema and returns the i18n key of the error. */
interface FieldSchema {
  safeParse: (
    value: unknown,
  ) => { success: true } | { success: false; error: { issues: { message: string }[] } };
}

function useValidated(schema: FieldSchema) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string>();
  return {
    value,
    error,
    onChange: (e: { currentTarget: { value: string } }) => {
      setValue(e.currentTarget.value);
      setError(undefined);
    },
    onBlur: () => {
      if (value === '') return;
      const result = schema.safeParse(value);
      setError(result.success ? undefined : result.error.issues[0]?.message);
    },
  };
}

const DAYS: { kind: DayKind; mark: string }[] = [
  { kind: 'teiji', mark: '定' },
  { kind: 'hannichi', mark: '半' },
  { kind: 'yasumi', mark: '休' },
  { kind: 'kekkin', mark: '欠' },
  { kind: 'chushi', mark: '中' },
  { kind: 'kyugyo', mark: '業' },
  { kind: 'yukyu', mark: '有' },
  { kind: 'pending', mark: '?' },
  { kind: 'empty', mark: '' },
];

const COMPANIES = [
  {
    code: 'SUGITA',
    name: '株式会社杉田工業',
    contract: 'partner',
    paidUntil: '—',
    status: 'active',
    amount: 0,
  },
  {
    code: 'DEMO',
    name: 'デモ株式会社',
    contract: 'monthly',
    paidUntil: '2026-10-31',
    status: 'pastDue',
    amount: 55000,
  },
  {
    code: 'TESTE',
    name: 'テスト建設',
    contract: 'annual',
    paidUntil: '2027-03-31',
    status: 'trial',
    amount: 480000,
  },
] as const;

const STATUS_VARIANT = { active: 'success', pastDue: 'warning', trial: 'info' } as const;

export function Showcase() {
  const t = useTranslations('devUi');
  const tc = useTranslations('common');
  const tv = useTranslations();

  const name = useValidated(freeText({ min: 1, max: 100 }));
  const postal = useValidated(postalCode);
  const mobile = useValidated(mobilePhone);
  const landline = useValidated(landlinePhone);
  const employeeId = useValidated(employeeLoginId);

  const [contract, setContract] = useState('monthly');
  const [modules, setModules] = useState({ employees: true, scheduling: false, attendance: false });
  const [trial, setTrial] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid'>('all');
  const [loading, setLoading] = useState(false);

  const fieldError = (key: string | undefined) => (key ? tv(key) : undefined);

  return (
    <div>
      <Section title={t('sections.buttons')}>
        <Demo>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">
              <Plus aria-hidden />
              {t('buttons.primary')}
            </Button>
            <Button variant="solid">{t('buttons.solid')}</Button>
            <Button variant="secondary">{t('buttons.secondary')}</Button>
            <Button variant="ghost">{t('buttons.ghost')}</Button>
            <Button variant="soft">{t('buttons.soft')}</Button>
            <Button variant="danger">{t('buttons.danger')}</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">{t('buttons.secondary')}</Button>
            <Button size="lg" variant="primary">
              {t('buttons.primary')}
            </Button>
            <Button
              variant="solid"
              loading={loading}
              onClick={() => {
                setLoading(true);
                setTimeout(() => {
                  setLoading(false);
                }, 1500);
              }}
            >
              {loading ? t('buttons.loading') : t('buttons.solid')}
            </Button>
            <Button disabled>{t('buttons.disabled')}</Button>
            <Button iconOnly variant="ghost" aria-label={t('buttons.icon')}>
              <Ellipsis aria-hidden />
            </Button>
          </div>
        </Demo>
      </Section>

      <Section title={t('sections.fields')}>
        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          <Demo>
            <Field
              label={t('fields.companyName')}
              help={t('fields.companyNameHelp')}
              error={fieldError(name.error)}
              required
            >
              <Input
                value={name.value}
                onChange={name.onChange}
                onBlur={name.onBlur}
                autoComplete="organization"
              />
            </Field>
            <Field label={t('fields.search')}>
              <Input
                icon={<Search aria-hidden />}
                placeholder={t('fields.searchPlaceholder')}
                type="search"
              />
            </Field>
            <Field label={t('fields.price')}>
              <Input inputMode="numeric" defaultValue="55,000" suffix="円" />
            </Field>
          </Demo>
          <Demo>
            <Field label={t('fields.contract')}>
              <NativeSelect
                value={contract}
                onChange={(e) => {
                  setContract(e.currentTarget.value);
                }}
              >
                <option value="monthly">{t('fields.contractMonthly')}</option>
                <option value="annual">{t('fields.contractAnnual')}</option>
                <option value="partner">{t('fields.contractPartner')}</option>
              </NativeSelect>
            </Field>
            <Field label={t('fields.note')}>
              <Textarea rows={3} />
            </Field>
            <Field label={t('fields.disabled')} disabled>
              <Input defaultValue="SUGITA" />
            </Field>
            <Field label={t('fields.errorExample')} error={tv('validation.required')}>
              <Input />
            </Field>
          </Demo>
        </div>
      </Section>

      <Section title={t('sections.masks')}>
        <Demo>
          <p className="m-0 text-ink-muted">{t('masks.help')}</p>
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <Field label={t('masks.postalCode')} error={fieldError(postal.error)}>
              <PostalCodeInput
                value={postal.value}
                onChange={postal.onChange}
                onBlur={postal.onBlur}
              />
            </Field>
            <Field label={t('masks.mobile')} error={fieldError(mobile.error)}>
              <MobilePhoneInput
                value={mobile.value}
                onChange={mobile.onChange}
                onBlur={mobile.onBlur}
              />
            </Field>
            <Field label={t('masks.landline')} error={fieldError(landline.error)}>
              <LandlinePhoneInput
                value={landline.value}
                onChange={landline.onChange}
                onBlur={landline.onBlur}
              />
            </Field>
            <Field label={t('masks.employeeId')} error={fieldError(employeeId.error)}>
              <EmployeeIdInput
                value={employeeId.value}
                onChange={employeeId.onChange}
                onBlur={employeeId.onBlur}
              />
            </Field>
          </div>
        </Demo>
      </Section>

      <Section title={t('sections.choices')}>
        <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-1">
          <Demo>
            <p className="m-0 type-label text-ink-muted">{t('choices.modules')}</p>
            <Checkbox
              label={t('choices.employees')}
              checked={modules.employees}
              onCheckedChange={(c) => {
                setModules((m) => ({ ...m, employees: c === true }));
              }}
            />
            <Checkbox
              label={t('choices.scheduling')}
              description={t('choices.schedulingHelp')}
              checked={modules.scheduling}
              onCheckedChange={(c) => {
                setModules((m) => ({ ...m, scheduling: c === true }));
              }}
            />
            <Checkbox label={t('choices.attendance')} checked="indeterminate" />
            <Checkbox label={t('fields.disabled')} disabled />
          </Demo>
          <Demo>
            <p className="m-0 type-label text-ink-muted">{t('choices.paymentMethod')}</p>
            <RadioGroup defaultValue="transfer">
              <Radio value="transfer" label={t('choices.transfer')} />
              <Radio value="cash" label={t('choices.cash')} />
            </RadioGroup>
          </Demo>
          <Demo>
            <Switch label={t('choices.trial')} checked={trial} onCheckedChange={setTrial} />
            <Switch label={t('fields.disabled')} disabled />
          </Demo>
        </div>
      </Section>

      <Section title={t('sections.cards')}>
        <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
          <Card>
            <Stat
              label={t('cards.active')}
              value="12"
              icon={<Building2 aria-hidden />}
              delta={t('cards.deltaUp')}
              tone="success"
            />
          </Card>
          <Card>
            <Stat
              label={t('cards.revenue')}
              value={formatYen(1047200)}
              icon={<Wallet aria-hidden />}
            />
          </Card>
          <Card variant="interactive" tabIndex={0}>
            <Stat
              label={t('cards.pastDue')}
              value="2"
              icon={<CircleAlert aria-hidden />}
              delta={t('cards.deltaDown')}
              tone="danger"
            />
          </Card>
          <Card variant="feature">
            <CardHeader>
              <CardTitle>{t('cards.feature')}</CardTitle>
              <TrendingUp aria-hidden className="size-5" />
            </CardHeader>
            <CardInset className="bg-[rgba(255,255,255,.14)] font-mono">
              {t('cards.featureText')}
            </CardInset>
          </Card>
        </div>
      </Section>

      <Section title={t('sections.badges')}>
        <Demo>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success" dot>
              {t('badges.active')}
            </Badge>
            <Badge variant="info" dot>
              {t('badges.trial')}
            </Badge>
            <Badge variant="warning" dot>
              {t('badges.pastDue')}
            </Badge>
            <Badge variant="neutral" dot>
              {t('badges.readOnly')}
            </Badge>
            <Badge variant="danger" dot>
              {t('badges.blocked')}
            </Badge>
            <Badge variant="primary">{t('badges.partner')}</Badge>
            <Badge variant="outline">{t('badges.canceled')}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Chip
              pressed={filter === 'all'}
              onPressedChange={() => {
                setFilter('all');
              }}
            >
              {t('badges.filterAll')}
            </Chip>
            <Chip
              pressed={filter === 'paid'}
              onPressedChange={() => {
                setFilter('paid');
              }}
            >
              {t('badges.filterPaid')}
            </Chip>
          </div>
        </Demo>
      </Section>

      <Section title={t('sections.days')}>
        <Demo>
          <div className="flex flex-wrap items-center gap-3">
            {DAYS.map((d) => (
              <div
                key={d.kind}
                className="flex items-center gap-2 rounded-md border border-line px-2.5 py-2"
              >
                <DayCell kind={d.kind} mark={d.mark} label={t(`days.${d.kind}`)} />
                <span className="text-[13px] font-semibold">{t(`days.${d.kind}`)}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 rounded-md border border-line px-2.5 py-2">
              <DayCell
                kind="teiji"
                mark="定"
                overtime="2"
                subColor="var(--day-chushi)"
                label={`${t('days.teiji')}, ${t('days.overtime', { hours: 2 })}`}
              />
              <span className="text-[13px] font-semibold">{t('days.overtime', { hours: 2 })}</span>
            </div>
          </div>
        </Demo>
      </Section>

      <Section title={t('sections.table')}>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>{t('table.code')}</TableHeaderCell>
              <TableHeaderCell>{t('table.name')}</TableHeaderCell>
              <TableHeaderCell>{t('table.contract')}</TableHeaderCell>
              <TableHeaderCell>{t('table.paidUntil')}</TableHeaderCell>
              <TableHeaderCell>{t('table.status')}</TableHeaderCell>
              <TableHeaderCell align="right">{t('table.amount')}</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {COMPANIES.map((c) => (
              <TableRow key={c.code}>
                <TableCell className="font-mono">{c.code}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>
                  {c.contract === 'partner' ? (
                    <Badge variant="primary">{t('badges.partner')}</Badge>
                  ) : (
                    t(c.contract === 'monthly' ? 'fields.contractMonthly' : 'fields.contractAnnual')
                  )}
                </TableCell>
                <TableCell className="font-mono">{c.paidUntil}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[c.status]} dot>
                    {t(`badges.${c.status}`)}
                  </Badge>
                </TableCell>
                <TableCell align="right" className="font-mono">
                  {formatYen(c.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>

      <Section title={t('sections.alerts')}>
        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <Alert variant="info" title={t('alerts.infoTitle')}>
            {t('alerts.infoText')}
          </Alert>
          <Alert variant="success" title={t('alerts.successTitle')}>
            {t('alerts.successText')}
          </Alert>
          <Alert variant="warning" title={t('alerts.warningTitle')}>
            {t('alerts.warningText')}
          </Alert>
          <Alert variant="danger" title={t('alerts.dangerTitle')}>
            {t('alerts.dangerText')}
          </Alert>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            onClick={() => {
              toast(t('alerts.toastSaved'), {
                action: { label: tc('undo'), onClick: () => undefined },
              });
            }}
          >
            {t('alerts.toastSuccess')}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              toast.error(t('alerts.toastFailed'));
            }}
          >
            {t('alerts.toastError')}
          </Button>
        </div>
      </Section>

      <Section title={t('sections.overlays')}>
        <Demo>
          <div className="flex flex-wrap items-center gap-3">
            <Tooltip content={t('overlays.tooltipText')}>
              <Button variant="secondary">{t('overlays.tooltip')}</Button>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary">
                  {t('overlays.menu')}
                  <Ellipsis aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>{t('overlays.menuLabel')}</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Pencil aria-hidden />
                  {t('overlays.edit')}
                </DropdownMenuItem>
                <DropdownMenuItem shortcut="⌘P">
                  <Wallet aria-hidden />
                  {t('overlays.payment')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem danger>
                  <Pause aria-hidden />
                  {t('overlays.suspend')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">{t('overlays.openDialog')}</Button>
              </DialogTrigger>
              <DialogContent closeLabel={tc('close')}>
                <DialogTitle>{t('overlays.dialogTitle')}</DialogTitle>
                <DialogDescription>{t('overlays.dialogText')}</DialogDescription>
                <Field label={t('overlays.reason')} required>
                  <Textarea rows={3} />
                </Field>
                <DialogFooter>
                  <Button variant="ghost">{tc('cancel')}</Button>
                  <Button variant="danger">{t('overlays.suspend')}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">{t('overlays.openDrawer')}</Button>
              </DialogTrigger>
              <DialogContent layout="drawer" closeLabel={tc('close')}>
                <DialogTitle>{t('overlays.drawerTitle')}</DialogTitle>
                <DialogDescription>{t('overlays.drawerText')}</DialogDescription>
                <Field label={t('table.amount')}>
                  <Input inputMode="numeric" suffix="円" />
                </Field>
                <DialogFooter className="mt-auto">
                  <Button variant="primary">{tc('save')}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </Demo>
      </Section>

      <Section title={t('sections.tabs')}>
        <div className="flex flex-col gap-6">
          <Tabs defaultValue="summary">
            <TabsList>
              {(['summary', 'modules', 'contract'] as const).map((tab) => (
                <TabsTrigger key={tab} value={tab}>
                  {t(`tabs.${tab}`)}
                </TabsTrigger>
              ))}
            </TabsList>
            {(['summary', 'modules', 'contract'] as const).map((tab) => (
              <TabsContent key={tab} value={tab}>
                {t('tabs.content', { tab: t(`tabs.${tab}`) })}
              </TabsContent>
            ))}
          </Tabs>
          <Tabs variant="line" defaultValue="summary">
            <TabsList>
              {(['summary', 'modules', 'contract', 'users', 'history'] as const).map((tab) => (
                <TabsTrigger key={tab} value={tab}>
                  {t(`tabs.${tab}`)}
                </TabsTrigger>
              ))}
            </TabsList>
            {(['summary', 'modules', 'contract', 'users', 'history'] as const).map((tab) => (
              <TabsContent key={tab} value={tab}>
                {t('tabs.content', { tab: t(`tabs.${tab}`) })}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </Section>

      <Section title={t('sections.states')}>
        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          <Demo>
            <div
              aria-busy
              role="status"
              aria-label={t('states.skeleton')}
              className="flex flex-col gap-3"
            >
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-9 rounded-full" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[13px] text-ink-muted">{t('states.progress')} · 3/4</span>
              <Progress value={75} label={t('states.progress')} />
            </div>
            <div className="flex">
              <Avatar initials="MI" brand />
              <Avatar initials="杉" className="-ml-2.5" />
              <Avatar initials="DE" className="-ml-2.5" />
            </div>
          </Demo>
          <EmptyState
            icon={<Building2 aria-hidden />}
            title={t('states.emptyTitle')}
            description={t('states.emptyText')}
            action={
              <Button variant="primary">
                <Plus aria-hidden />
                {t('states.emptyAction')}
              </Button>
            }
          />
        </div>
      </Section>
    </div>
  );
}
