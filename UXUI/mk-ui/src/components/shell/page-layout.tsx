// PageLayout: breadcrumb (nav-011), título e subitens em abas horizontais (nav-007) com indicador
// deslizante; setas ← → navegam entre as abas (especificação, seção 1).
import { motion } from 'motion/react';
import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { findRoute } from '../../app/nav';
import { cn } from '../../lib/cn';

export function PageLayout({ actions, children }: { actions?: ReactNode; children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const route = findRoute(pathname);
  const tabs = useRef<(HTMLAnchorElement | null)[]>([]);
  if (!route) return <>{children}</>;
  const { item, sub } = route;

  function onKey(event: KeyboardEvent<HTMLAnchorElement>, index: number) {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + item.subs.length) % item.subs.length;
    const target = item.subs[next];
    if (!target) return;
    navigate(`/${item.slug}/${target.slug}`);
    tabs.current[next]?.focus();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="fx-title m-0 min-w-0 flex-1 text-2xl font-bold text-fg">{item.label}</h1>
          {actions}
        </div>
      </div>

      {item.subs.length > 0 ? (
        <div
          role="tablist"
          aria-label={`Telas de ${item.label}`}
          className="relative flex gap-1 overflow-x-auto overflow-y-hidden border-b border-border"
        >
          {item.subs.map((s, i) => {
            const active = s.slug === sub?.slug;
            return (
              <Link
                key={s.slug}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                to={`/${item.slug}/${s.slug}`}
                role="tab"
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                onKeyDown={(e) => {
                  onKey(e, i);
                }}
                className={cn(
                  'relative shrink-0 rounded-t-field px-3 py-2.5 text-sm no-underline transition-colors duration-[var(--speed)] focus-visible:outline-2 focus-visible:outline-primary',
                  active ? 'font-semibold text-primary' : 'text-muted hover:text-fg',
                )}
              >
                {s.label}
                {active ? (
                  <motion.span
                    layoutId="tab-indicator"
                    aria-hidden
                    className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]"
                    transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
                  />
                ) : null}
              </Link>
            );
          })}
        </div>
      ) : null}

      <div role={item.subs.length > 0 ? 'tabpanel' : undefined} aria-label={sub?.label}>
        {children}
      </div>
    </div>
  );
}
