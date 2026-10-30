// tbl-001 · Tabela completa — ordenação, seleção (com indeterminado), status, zebrado e paginação.
// tbl-002 · Lista em cards — substitui a tabela abaixo de 640 px.
import * as Checkbox from '@radix-ui/react-checkbox';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
  Search,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { GenbaRow, GenbaStatus } from '../../data/mock';
import { cn } from '../../lib/cn';
import { Badge, type BadgeTone } from './badge';

const STATUS: Record<GenbaStatus, { label: string; tone: BadgeTone }> = {
  confirmado: { label: 'Confirmado', tone: 'success' },
  pendente: { label: 'Pendente', tone: 'warning' },
  'em-andamento': { label: 'Em andamento', tone: 'primary' },
  cancelado: { label: 'Cancelado', tone: 'danger' },
};

type SortKey = 'site' | 'client' | 'people' | 'meeting';
const PAGE_SIZE = 6;

function Box({
  checked,
  onChange,
  label,
}: {
  checked: boolean | 'indeterminate';
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <Checkbox.Root
      checked={checked}
      onCheckedChange={(c) => {
        onChange(c === true);
      }}
      aria-label={label}
      className="grid size-[18px] cursor-pointer place-items-center rounded-[5px] border border-border-strong bg-surface transition-colors data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <Checkbox.Indicator className="text-primary-foreground">
        {checked === 'indeterminate' ? (
          <Minus className="size-3" strokeWidth={3} />
        ) : (
          <Check className="size-3" strokeWidth={3} />
        )}
      </Checkbox.Indicator>
    </Checkbox.Root>
  );
}

export function GenbaTable({ rows }: { rows: GenbaRow[] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<GenbaStatus | 'todos'>('todos');
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: 'meeting',
    dir: 'asc',
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = rows.filter(
      (r) =>
        (status === 'todos' || r.status === status) &&
        (!q || `${r.site} ${r.client} ${r.sub} ${r.id}`.toLowerCase().includes(q)),
    );
    return [...list].sort((a, b) => {
      const va = a[sort.key];
      const vb = b[sort.key];
      const cmp =
        typeof va === 'number' && typeof vb === 'number'
          ? va - vb
          : String(va).localeCompare(String(vb), 'ja');
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [rows, query, status, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const visible = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const allSelected = visible.length > 0 && visible.every((r) => selected.has(r.id));
  const someSelected = visible.some((r) => selected.has(r.id));

  function toggleSort(key: SortKey) {
    setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));
  }
  function toggle(id: string, on: boolean) {
    setSelected((s) => {
      const next = new Set(s);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const header = (key: SortKey, label: string, align: 'left' | 'right' = 'left') => {
    const active = sort.key === key;
    const Icon = !active ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown;
    return (
      <th
        scope="col"
        aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
        className={cn('px-3 py-2.5 font-medium', align === 'right' ? 'text-right' : 'text-left')}
      >
        <button
          type="button"
          onClick={() => {
            toggleSort(key);
          }}
          className={cn(
            'inline-flex cursor-pointer items-center gap-1 rounded-field border-0 bg-transparent p-0 text-xs tracking-wide text-muted uppercase hover:text-fg focus-visible:outline-2 focus-visible:outline-primary',
            active && 'text-fg',
          )}
        >
          {label}
          <Icon aria-hidden className="size-3.5" strokeWidth={1.6} />
        </button>
      </th>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative flex min-w-[200px] flex-1 items-center">
          <span className="sr-only">Buscar genba</span>
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 size-4 text-muted"
            strokeWidth={1.3}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Local, cliente ou sub"
            className="h-10 w-full rounded-field border border-border-strong bg-surface pr-3 pl-9 text-sm text-fg outline-none placeholder:text-muted focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary)_25%,transparent)]"
          />
        </label>
        <div role="group" aria-label="Filtrar por status" className="flex flex-wrap gap-1.5">
          {(['todos', 'confirmado', 'pendente', 'em-andamento', 'cancelado'] as const).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={status === s}
              onClick={() => {
                setStatus(s);
                setPage(0);
              }}
              className="h-8 cursor-pointer rounded-control border border-border bg-surface px-3 text-xs font-semibold text-muted transition-colors hover:border-border-strong hover:text-fg aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary focus-visible:outline-2 focus-visible:outline-primary"
            >
              {s === 'todos' ? 'Todos' : STATUS[s].label}
            </button>
          ))}
        </div>
      </div>

      {selected.size > 0 ? (
        <p className="m-0 text-xs text-muted" role="status">
          {selected.size} selecionado(s)
        </p>
      ) : null}

      {/* Tabela: a partir de 640 px */}
      <div className="overflow-x-auto max-sm:hidden">
        <table className="w-full border-collapse text-sm">
          <thead className="border-b border-border">
            <tr>
              <th scope="col" className="w-10 px-3 py-2.5">
                <Box
                  checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                  onChange={(on) => {
                    for (const r of visible) toggle(r.id, on);
                  }}
                  label="Selecionar todos da página"
                />
              </th>
              {header('site', 'Genba')}
              {header('client', 'Cliente')}
              <th
                scope="col"
                className="px-3 py-2.5 text-left text-xs font-medium tracking-wide text-muted uppercase"
              >
                Sub
              </th>
              {header('people', 'Pessoas', 'right')}
              {header('meeting', '集合')}
              <th
                scope="col"
                className="px-3 py-2.5 text-left text-xs font-medium tracking-wide text-muted uppercase"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr
                key={r.id}
                aria-selected={selected.has(r.id)}
                className="border-b border-border transition-colors last:border-b-0 even:bg-surface-2/50 hover:bg-surface-2 aria-selected:bg-primary/10"
              >
                <td className="px-3 py-3">
                  <Box
                    checked={selected.has(r.id)}
                    onChange={(on) => {
                      toggle(r.id, on);
                    }}
                    label={`Selecionar ${r.site}`}
                  />
                </td>
                <td className="px-3 py-3">
                  <span className="block font-medium">{r.site}</span>
                  <span className="font-mono text-xs text-muted">{r.id}</span>
                </td>
                <td className="px-3 py-3">{r.client}</td>
                <td className="px-3 py-3 font-mono text-xs font-semibold">{r.sub}</td>
                <td className="num px-3 py-3 text-right font-mono">{r.people}</td>
                <td className="num px-3 py-3 font-mono">{r.meeting}</td>
                <td className="px-3 py-3">
                  <Badge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Lista em cards: abaixo de 640 px (tbl-002) */}
      <ul className="m-0 flex list-none flex-col gap-2 p-0 sm:hidden">
        {visible.map((r) => (
          <li
            key={r.id}
            className="flex items-center gap-3 rounded-field border border-card-border bg-surface-2/50 p-3"
          >
            <div className="min-w-0 flex-1">
              <b className="block truncate text-sm">{r.site}</b>
              <span className="font-mono text-xs text-muted">
                {r.client} · {r.sub} · {r.meeting}
              </span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="num font-mono text-sm">{r.people}人</span>
              <Badge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Badge>
            </div>
          </li>
        ))}
      </ul>

      {filtered.length === 0 ? (
        <p className="m-0 rounded-field border border-dashed border-border-strong p-6 text-center text-sm text-muted">
          Nenhum genba com esses filtros.
        </p>
      ) : null}

      <nav
        aria-label="Páginas"
        className="flex items-center justify-between gap-3 text-xs text-muted"
      >
        <span className="num font-mono">
          {filtered.length === 0 ? 0 : current * PAGE_SIZE + 1}–
          {Math.min((current + 1) * PAGE_SIZE, filtered.length)} de {filtered.length}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            disabled={current === 0}
            onClick={() => {
              setPage(current - 1);
            }}
            aria-label="Página anterior"
            className="grid size-8 cursor-pointer place-items-center rounded-control border border-border bg-surface text-fg disabled:cursor-default disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-primary"
          >
            <ChevronLeft aria-hidden className="size-4" />
          </button>
          <button
            type="button"
            disabled={current >= pages - 1}
            onClick={() => {
              setPage(current + 1);
            }}
            aria-label="Próxima página"
            className="grid size-8 cursor-pointer place-items-center rounded-control border border-border bg-surface text-fg disabled:cursor-default disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-primary"
          >
            <ChevronRight aria-hidden className="size-4" />
          </button>
        </div>
      </nav>
    </div>
  );
}
