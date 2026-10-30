// Shell do dashboard Clássico administrativo (especificação, seção 1): menu lateral em árvore
// (240 → 72 px), barra superior com busca e Ctrl/⌘+K; no celular, gaveta pelo logo e barra de abas.
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MOBILE_TABS, NAV, itemPath } from '../../app/nav';
import { useTheme } from '../../app/theme';
import { cn } from '../../lib/cn';
import { CommandPalette } from './command-palette';
import { NavTree } from './nav-tree';

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span className="fx-glow grid size-9 shrink-0 place-items-center rounded-[10px] bg-primary font-mono text-[13px] font-bold text-primary-foreground">
        NX
      </span>
      {compact ? null : (
        <span className="min-w-0">
          <span className="fx-title block truncate text-sm text-fg">NEO-SYSTEM</span>
          <span className="block truncate text-[11px] text-muted">株式会社杉田工業</span>
        </span>
      )}
    </span>
  );
}

function Profile({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-full border border-card-border bg-surface-2 font-mono text-xs font-semibold text-icon">
        SM
      </span>
      {compact ? null : (
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">Sugita Mike</span>
          <span className="block truncate text-[11px] text-muted">Proprietário</span>
        </span>
      )}
    </span>
  );
}

function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Mudar para o modo claro' : 'Mudar para o modo escuro'}
      className="relative grid size-10 cursor-pointer place-items-center overflow-hidden rounded-control border border-border bg-surface text-icon transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-primary"
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={dark ? 'moon' : 'sun'}
          initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
          className="grid place-items-center"
        >
          {dark ? (
            <Moon className="size-5" strokeWidth={1.3} />
          ) : (
            <Sun className="size-5" strokeWidth={1.3} />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const { pathname } = useLocation();
  const activeSlug = pathname.split('/')[1];

  return (
    <div className="fx-bg min-h-screen text-fg">
      <a
        href="#conteudo"
        className="sr-only rounded-field bg-surface px-4 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
      >
        Pular para o conteúdo
      </a>
      <div className="flex min-h-screen">
        {/* Menu lateral (a partir de 760 px): só ícones; expande sobre a página ao passar o mouse
            ou com o foco do teclado, e contrai ao sair. */}
        <div className="hidden w-[72px] shrink-0 min-[760px]:block" aria-hidden />
        <aside
          onMouseEnter={() => {
            setExpanded(true);
          }}
          onMouseLeave={() => {
            setExpanded(false);
          }}
          onFocus={() => {
            setExpanded(true);
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false);
          }}
          className={cn(
            'fixed inset-y-0 left-0 z-40 hidden flex-col gap-4 overflow-hidden border-r border-section-border bg-surface px-3 py-4 transition-[width,box-shadow] duration-[var(--speed)] min-[760px]:flex',
            expanded ? 'w-[240px] shadow-[var(--shadow-card)]' : 'w-[72px]',
          )}
        >
          <div className={cn('px-1.5 pt-1', !expanded && 'flex justify-center px-0')}>
            <Logo compact={!expanded} />
          </div>
          <nav
            aria-label="Menu principal"
            className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
          >
            <NavTree collapsed={!expanded} />
          </nav>
          <div className="fx-line" />
          <div className={cn('flex', expanded ? 'px-1.5' : 'justify-center')}>
            <Profile compact={!expanded} />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Barra superior */}
          <header className="sticky top-0 z-30 bg-section backdrop-blur-md">
            <div className="flex h-16 items-center gap-3 px-4 min-[760px]:px-8">
              {/* Celular: o logo abre a gaveta */}
              <Dialog.Root open={drawer} onOpenChange={setDrawer}>
                <Dialog.Trigger asChild>
                  <button
                    type="button"
                    aria-label="Abrir menu"
                    className="cursor-pointer rounded-[10px] border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-primary min-[760px]:hidden"
                  >
                    <Logo compact />
                  </button>
                </Dialog.Trigger>
                <AnimatePresence>
                  {drawer ? (
                    <Dialog.Portal forceMount>
                      <Dialog.Overlay asChild forceMount>
                        <motion.div
                          className="fixed inset-0 z-40 bg-bg/70 backdrop-blur-sm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      </Dialog.Overlay>
                      <Dialog.Content asChild forceMount aria-describedby={undefined}>
                        <motion.div
                          className="fixed inset-y-0 left-0 z-50 flex w-[min(320px,88vw)] flex-col gap-4 border-r border-card-border bg-surface p-4 pb-[max(16px,env(safe-area-inset-bottom))]"
                          initial={{ x: '-100%', opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: '-100%', opacity: 0 }}
                          transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
                        >
                          <Dialog.Title className="sr-only">Menu</Dialog.Title>
                          <div className="flex items-center justify-between">
                            <Logo />
                            <Dialog.Close
                              aria-label="Fechar menu"
                              className="grid size-10 cursor-pointer place-items-center rounded-field border-0 bg-transparent text-icon hover:bg-surface-2"
                            >
                              <X className="size-5" strokeWidth={1.3} />
                            </Dialog.Close>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setDrawer(false);
                              setPalette(true);
                            }}
                            className="flex h-10 cursor-pointer items-center gap-2 rounded-field border border-border-strong bg-surface px-3 text-sm text-muted"
                          >
                            <Search aria-hidden className="size-4" strokeWidth={1.3} />
                            Buscar
                          </button>
                          <nav
                            aria-label="Menu principal"
                            className="min-h-0 flex-1 overflow-y-auto"
                          >
                            <NavTree
                              onNavigate={() => {
                                setDrawer(false);
                              }}
                            />
                          </nav>
                          <div className="fx-line" />
                          <Profile />
                        </motion.div>
                      </Dialog.Content>
                    </Dialog.Portal>
                  ) : null}
                </AnimatePresence>
              </Dialog.Root>

              <button
                type="button"
                onClick={() => {
                  setPalette(true);
                }}
                className="flex h-10 min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-field border border-border bg-surface px-3 text-sm text-muted transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-primary min-[760px]:max-w-[420px]"
              >
                <Search aria-hidden className="size-4 shrink-0 text-icon" strokeWidth={1.3} />
                <span className="min-w-0 flex-1 truncate text-left">
                  Buscar telas, funcionários, genbas…
                </span>
                <kbd className="rounded-[6px] border border-border px-1.5 font-mono text-[11px] max-sm:hidden">
                  Ctrl K
                </kbd>
              </button>
              <div className="ml-auto flex items-center gap-2">
                <ThemeToggle />
                <button
                  type="button"
                  aria-label="Notificações: 3 novas"
                  className="relative grid size-10 cursor-pointer place-items-center rounded-control border border-border bg-surface text-icon hover:border-border-strong focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <Bell className="size-5" strokeWidth={1.3} />
                  <span className="absolute top-1.5 right-1.5 grid size-4 place-items-center rounded-full bg-danger font-mono text-[10px] font-bold text-primary-foreground">
                    3
                  </span>
                </button>
                <span className="max-[760px]:hidden">
                  <Profile compact />
                </span>
              </div>
            </div>
            <div className="fx-line" />
          </header>

          <main
            id="conteudo"
            tabIndex={-1}
            className="mx-auto w-full max-w-[1440px] flex-1 px-4 pt-6 pb-28 outline-none min-[760px]:px-8 min-[760px]:pb-10"
          >
            {children}
          </main>
        </div>
      </div>

      {/* Celular: barra de abas fixa na base (alvos de 44 px, área segura) */}
      <nav
        aria-label="Atalhos"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-section-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md min-[760px]:hidden"
      >
        {MOBILE_TABS.map((slug) => {
          const item = NAV.find((i) => i.slug === slug);
          if (!item) return null;
          const Icon = item.icon;
          const active = activeSlug === slug;
          return (
            <NavLink
              key={slug}
              to={itemPath(item)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] no-underline',
                active ? 'text-primary' : 'text-muted',
              )}
            >
              <Icon aria-hidden className="size-6" strokeWidth={1.3} />
              {slug === 'dashboard' ? 'Início' : item.label}
            </NavLink>
          );
        })}
        <button
          type="button"
          onClick={() => {
            setDrawer(true);
          }}
          className="flex min-h-14 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 border-0 bg-transparent text-[11px] text-muted"
        >
          <Menu aria-hidden className="size-6" strokeWidth={1.3} />
          Menu
        </button>
      </nav>

      <CommandPalette open={palette} onOpenChange={setPalette} />
    </div>
  );
}
