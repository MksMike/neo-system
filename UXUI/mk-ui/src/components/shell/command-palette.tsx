// fbk-010 · Paleta de comandos — Ctrl/⌘+K leva a qualquer tela (especificação, seção 1).
import * as Dialog from '@radix-ui/react-dialog';
import { CornerDownLeft, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NAV } from '../../app/nav';
import { cn } from '../../lib/cn';

interface Entry {
  path: string;
  label: string;
  section: string;
}

const ENTRIES: Entry[] = NAV.flatMap((item) =>
  item.subs.length === 0
    ? [{ path: `/${item.slug}`, label: item.label, section: item.label }]
    : item.subs.map((sub) => ({
        path: `/${item.slug}/${sub.slug}`,
        label: sub.label,
        section: item.label,
      })),
);

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpenChange(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [onOpenChange]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? ENTRIES.filter((e) => `${e.section} ${e.label}`.toLowerCase().includes(q)) : ENTRIES;
  }, [query]);

  function go(entry: Entry | undefined) {
    if (!entry) return;
    navigate(entry.path);
    onOpenChange(false);
    setQuery('');
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setQuery('');
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-bg/70 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fx-card fixed top-[14vh] left-1/2 z-50 w-[min(560px,calc(100vw-32px))] -translate-x-1/2 overflow-hidden p-0"
        >
          <Dialog.Title className="sr-only">Ir para uma tela</Dialog.Title>
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Search aria-hidden className="size-4 text-icon" strokeWidth={1.3} />
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setActive((a) => Math.min(a + 1, results.length - 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setActive((a) => Math.max(a - 1, 0));
                } else if (e.key === 'Enter') {
                  go(results[active]);
                }
              }}
              placeholder="Buscar tela…"
              aria-label="Buscar tela"
              className="h-12 flex-1 border-0 bg-transparent text-sm text-fg outline-none placeholder:text-muted"
            />
            <kbd className="rounded-[6px] border border-border px-1.5 font-mono text-[11px] text-muted">
              Esc
            </kbd>
          </div>
          <ul
            role="listbox"
            aria-label="Telas"
            className="m-0 max-h-[50vh] list-none overflow-y-auto p-2"
          >
            {results.map((entry, i) => (
              <li key={entry.path} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  onMouseEnter={() => {
                    setActive(i);
                  }}
                  onClick={() => {
                    go(entry);
                  }}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-3 rounded-field border-0 bg-transparent px-3 py-2.5 text-left text-sm text-fg',
                    i === active && 'bg-surface-2',
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block">{entry.label}</span>
                    <span className="block text-xs text-muted">{entry.section}</span>
                  </span>
                  {i === active ? (
                    <CornerDownLeft aria-hidden className="size-4 text-muted" strokeWidth={1.3} />
                  ) : null}
                </button>
              </li>
            ))}
            {results.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted">Nenhuma tela encontrada.</li>
            ) : null}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
