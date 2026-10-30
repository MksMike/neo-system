// nav-002 · Árvore com subitens — o item ativo abre os subitens logo abaixo, com linha guia.
import * as Collapsible from '@radix-ui/react-collapsible';
import * as Tooltip from '@radix-ui/react-tooltip';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { NAV, itemPath, type NavItem } from '../../app/nav';
import { cn } from '../../lib/cn';

function ItemRow({
  item,
  collapsed,
  open,
  active,
  onToggle,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  open: boolean;
  active: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const navigate = useNavigate();
  const Icon = item.icon;
  const row = (
    <button
      type="button"
      onClick={() => {
        if (active && item.subs.length > 0 && !collapsed) {
          onToggle(); // clicking again folds it
          return;
        }
        navigate(itemPath(item));
        if (item.subs.length === 0) onNavigate?.();
        if (!open) onToggle();
      }}
      aria-current={active && item.subs.length === 0 ? 'page' : undefined}
      aria-expanded={item.subs.length > 0 && !collapsed ? open : undefined}
      className={cn(
        'relative flex h-10 w-full cursor-pointer items-center gap-3 rounded-field border-0 bg-transparent px-3 text-left text-sm text-fg transition-colors duration-[var(--speed)] hover:bg-surface-2',
        active && 'bg-primary/10 font-semibold text-primary',
        'focus-visible:outline-2 focus-visible:outline-primary',
      )}
    >
      {active ? (
        <span
          aria-hidden
          className="absolute top-2 bottom-2 -left-3 w-[3px] rounded-r-full bg-primary shadow-[0_0_10px_var(--primary)]"
        />
      ) : null}
      <Icon
        aria-hidden
        className={cn('size-5 shrink-0', active ? 'text-primary' : 'text-icon')}
        strokeWidth={1.3}
      />
      <span className={cn('min-w-0 flex-1 truncate', collapsed && 'sr-only')}>{item.label}</span>
      {item.subs.length > 0 && !collapsed ? (
        <ChevronDown
          aria-hidden
          className={cn(
            'size-4 shrink-0 text-muted transition-transform duration-[var(--speed)]',
            open && 'rotate-180',
          )}
          strokeWidth={1.3}
        />
      ) : null}
    </button>
  );
  if (!collapsed) return row;
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{row}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="right"
          sideOffset={10}
          className="z-50 rounded-field border border-card-border bg-surface px-2.5 py-1.5 text-xs text-fg shadow-[var(--shadow-card)]"
        >
          {item.label}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

/** Tree of items and subitems. Collapsed: icons only, with a tooltip (240 → 72 px). */
export function NavTree({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const { pathname } = useLocation();
  const activeSlug = pathname.split('/')[1];
  const [openSlugs, setOpenSlugs] = useState<Set<string>>(
    () => new Set(activeSlug ? [activeSlug] : []),
  );

  return (
    <Tooltip.Provider delayDuration={200}>
      <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
        {NAV.map((item) => {
          const active = item.slug === activeSlug;
          const open = openSlugs.has(item.slug) || active;
          return (
            <li key={item.slug}>
              <Collapsible.Root open={open && !collapsed && item.subs.length > 0}>
                <ItemRow
                  item={item}
                  collapsed={collapsed}
                  open={open}
                  active={active}
                  onNavigate={onNavigate}
                  onToggle={() => {
                    setOpenSlugs((s) => {
                      const next = new Set(s);
                      if (next.has(item.slug)) next.delete(item.slug);
                      else next.add(item.slug);
                      return next;
                    });
                  }}
                />
                <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-none">
                  <ul className="m-0 my-1 ml-[22px] flex list-none flex-col gap-0.5 border-l border-border py-0.5 pl-3">
                    {item.subs.map((sub) => (
                      <li key={sub.slug}>
                        <NavLink
                          to={`/${item.slug}/${sub.slug}`}
                          onClick={onNavigate}
                          className={({ isActive }) =>
                            cn(
                              'block rounded-field px-3 py-1.5 text-[13px] text-muted no-underline transition-colors duration-[var(--speed)] hover:bg-surface-2 hover:text-fg focus-visible:outline-2 focus-visible:outline-primary',
                              isActive && 'font-semibold text-primary',
                            )
                          }
                        >
                          {sub.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </Collapsible.Content>
              </Collapsible.Root>
            </li>
          );
        })}
      </ul>
    </Tooltip.Provider>
  );
}
