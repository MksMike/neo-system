import { Slot } from 'radix-ui';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../lib/cn';

/* Application shell pieces (design system, "Navegação"): side menu, nav items, page header. */

export function Sidebar({ className, ...props }: ComponentProps<'nav'>) {
  return (
    <nav
      className={cn(
        'flex w-sidebar shrink-0 flex-col gap-0.5 border-r border-line bg-surface-1 px-3 py-4',
        className,
      )}
      {...props}
    />
  );
}

export function SidebarBrand({
  mark,
  title,
  subtitle,
}: {
  mark: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 px-2 pt-1 pb-4">
      <span className="grid size-[34px] shrink-0 place-items-center rounded-[10px] bg-grad-brand text-[13px] font-bold leading-none text-on-grad">
        {mark}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-bold">{title}</span>
        {subtitle ? (
          <small className="block truncate text-xs text-ink-subtle">{subtitle}</small>
        ) : null}
      </span>
    </div>
  );
}

export function SidebarSection({ children }: { children: ReactNode }) {
  return (
    <div className="px-2.5 pt-3 pb-1.5 text-[11px] font-semibold leading-none tracking-[.06em] text-ink-subtle uppercase">
      {children}
    </div>
  );
}

export type NavItemProps = ComponentProps<'a'> & {
  /** Current page: highlighted and announced as aria-current="page". */
  active?: boolean;
  icon?: ReactNode;
  /** Renders the child (e.g. Next.js Link) with the nav item styles. */
  asChild?: boolean;
};

export function NavItem({
  active = false,
  icon,
  asChild = false,
  className,
  children,
  ...props
}: NavItemProps) {
  const Comp = asChild ? Slot.Root : 'a';
  return (
    <Comp
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative flex min-h-10 items-center gap-3 rounded-md px-2.5 font-medium text-ink-muted no-underline',
        'transition-colors duration-(--dur-fast) hover:bg-surface-3 hover:text-ink',
        '[&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:stroke-[1.75]',
        'aria-[current=page]:bg-primary-soft aria-[current=page]:font-semibold aria-[current=page]:text-primary-text',
        'aria-[current=page]:before:absolute aria-[current=page]:before:inset-y-2 aria-[current=page]:before:-left-3 aria-[current=page]:before:w-[3px] aria-[current=page]:before:rounded-r-[3px] aria-[current=page]:before:bg-grad-brand',
        className,
      )}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </Comp>
  );
}

export interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Buttons on the right (primary action last). */
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <header className={cn('flex flex-wrap items-start gap-3', className)}>
      <div className="min-w-0 flex-1">
        <h1 className="m-0 type-h1">{title}</h1>
        {description ? <p className="m-0 mt-1 max-w-[72ch] text-ink-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

/** First focusable element of the page: jumps over the menu to the content (keyboard users). */
export function SkipLink({ href = '#conteudo', children }: { href?: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="sr-only rounded-md bg-surface-1 px-4 py-2 font-semibold text-ink shadow-md focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-(--z-toast)"
    >
      {children}
    </a>
  );
}
