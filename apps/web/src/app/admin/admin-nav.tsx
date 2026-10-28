'use client';

import { cn, Dialog, DialogContent, DialogTitle, DialogTrigger } from '@neo/ui';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ADMIN_HOME, ADMIN_SECTIONS, isActiveHref, SIDEBAR_COOKIE } from './sections';

const COLLAPSED_WIDTH = 'w-[68px]';

const ENTRIES = [ADMIN_HOME, ...ADMIN_SECTIONS];

/** First character of the company name, the company symbol until logos exist (design system, panel). */
function initialOf(name: string): string {
  return Array.from(name.trim())[0]?.toUpperCase() ?? '?';
}

export function CompanyMark({ name }: { name: string }) {
  return (
    <span className="grid size-[34px] shrink-0 place-items-center rounded-[10px] bg-grad-brand text-[13px] font-bold leading-none text-on-grad">
      {initialOf(name)}
    </span>
  );
}

/** Company symbol and name, with the product name under it (design system, "Telas do painel"). */
function Brand({ company }: { company: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <CompanyMark name={company} />
      <span className="nav-label min-w-0">
        <span className="block truncate text-[13px] font-bold">{company}</span>
        <small className="block truncate text-xs text-ink-subtle">NEO-SYSTEM</small>
      </span>
    </span>
  );
}

function NavLinks({ entries, onNavigate }: { entries: typeof ENTRIES; onNavigate?: () => void }) {
  const t = useTranslations('admin.nav');
  const pathname = usePathname();
  return (
    <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
      {entries.map(({ key, href, icon: Icon }) => {
        const active = isActiveHref(pathname, href);
        return (
          <li key={key}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex min-h-10 items-center gap-3 rounded-md px-[11px] font-medium text-ink-muted no-underline',
                'transition-colors duration-(--dur-fast) hover:bg-surface-3 hover:text-ink',
                'focus-visible:outline-2 focus-visible:outline-focus',
                'aria-[current=page]:bg-primary-soft aria-[current=page]:font-semibold aria-[current=page]:text-primary-text',
                'aria-[current=page]:before:absolute aria-[current=page]:before:inset-y-2 aria-[current=page]:before:-left-3 aria-[current=page]:before:w-[3px] aria-[current=page]:before:rounded-r-[3px] aria-[current=page]:before:bg-grad-brand',
              )}
            >
              <Icon aria-hidden className="size-5 shrink-0" strokeWidth={1.75} />
              <span className="nav-label truncate">{t(key)}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Desktop side menu. Pinned open, or collapsed to icons; when collapsed, pointing at it (or
 * tabbing into it) expands it over the page and reveals the labels.
 */
export function AdminSidebar({
  company,
  initialCollapsed,
}: {
  company: string;
  initialCollapsed: boolean;
}) {
  const t = useTranslations('admin.nav');
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [peek, setPeek] = useState(false);
  const expanded = !collapsed || peek;

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    setPeek(false);
    document.cookie = `${SIDEBAR_COOKIE}=${next ? 'collapsed' : 'expanded'}; path=/; max-age=31536000; samesite=lax`;
  }

  return (
    <div
      className={cn(
        'shrink-0 transition-[width] duration-(--dur-base) ease-standard max-md:hidden',
        collapsed ? COLLAPSED_WIDTH : 'w-sidebar',
      )}
    >
      <nav
        aria-label={t('label')}
        data-expanded={expanded}
        onMouseEnter={() => {
          if (collapsed) setPeek(true);
        }}
        onMouseLeave={() => {
          setPeek(false);
        }}
        onFocus={() => {
          if (collapsed) setPeek(true);
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setPeek(false);
        }}
        className={cn(
          'group/side fixed inset-y-0 left-0 z-[calc(var(--z-sticky)+1)] flex flex-col gap-4 overflow-x-hidden overflow-y-auto border-r border-line bg-surface-1 px-3 py-4',
          'transition-[width,box-shadow] duration-(--dur-base) ease-standard',
          '[&_.nav-label]:transition-opacity [&_.nav-label]:duration-(--dur-base)',
          'data-[expanded=false]:[&_.nav-label]:opacity-0',
          expanded ? 'w-sidebar' : COLLAPSED_WIDTH,
          collapsed && peek && 'shadow-lg',
        )}
      >
        <Link
          href={ADMIN_HOME.href}
          className="rounded-md px-[5px] pt-1 text-ink no-underline focus-visible:outline-2 focus-visible:outline-focus"
        >
          <Brand company={company} />
        </Link>
        <NavLinks entries={ENTRIES} />
        <div className="mt-auto flex flex-col gap-0.5 border-t border-line pt-3">
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? t('pin') : t('collapse')}
            className="flex min-h-10 cursor-pointer items-center gap-3 rounded-md border-0 bg-transparent px-[11px] font-medium text-ink-subtle transition-colors duration-(--dur-fast) hover:bg-surface-3 hover:text-ink focus-visible:outline-2 focus-visible:outline-focus"
          >
            {collapsed ? (
              <PanelLeftOpen aria-hidden className="size-5 shrink-0" strokeWidth={1.75} />
            ) : (
              <PanelLeftClose aria-hidden className="size-5 shrink-0" strokeWidth={1.75} />
            )}
            <span className="nav-label truncate">{collapsed ? t('pin') : t('collapse')}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

/**
 * Phone menu: the logo at the top left opens it; choosing a screen closes it and opens the screen.
 * It enters fading in from the left and leaves fading out to the right (drawer-start).
 */
export function AdminMobileMenu({ company }: { company: string }) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={t('admin.nav.open')}
          className="cursor-pointer rounded-[10px] border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-focus md:hidden"
        >
          <CompanyMark name={company} />
        </button>
      </DialogTrigger>
      <DialogContent
        layout="drawer-start"
        closeLabel={t('common.close')}
        aria-describedby={undefined}
      >
        <nav
          aria-label={t('admin.nav.label')}
          className="flex h-full flex-col gap-4 overflow-y-auto px-3 py-4"
        >
          <DialogTitle className="sr-only">{t('admin.nav.label')}</DialogTitle>
          <div className="px-[5px] pt-1">
            <Brand company={company} />
          </div>
          <NavLinks entries={ENTRIES} onNavigate={close} />
        </nav>
      </DialogContent>
    </Dialog>
  );
}
