import {
  Building2,
  CalendarDays,
  FolderOpen,
  LayoutDashboard,
  Settings,
  Sparkles,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

/**
 * Menu and screens of the office panel, from the feature map (docs/mapa-de-funcionalidades.md).
 * Each section has its screens as tabs, each one with its own URL. A screen without its own
 * page file is drawn by app/admin/[...slug] with its title and what it will do.
 */

/**
 * Remembers the collapsed side menu between visits (a display preference, not sensitive).
 * Here, not in the client menu module: a server file importing a value from a "use client"
 * module gets a client reference, not the value.
 */
export const SIDEBAR_COOKIE = 'neo-sidebar';

/** Milestone of the anchor document (roadmap) in which the screen arrives. */
export type Milestone = 'demo' | 'm1' | 'm2' | 'm3' | 'm4' | 'phase2';

export interface AdminScreen {
  /** i18n key under admin.screens.<section>.<key> */
  key: string;
  /** Path after the section path; '' is the section's first screen. */
  path: string;
  milestone: Milestone;
}

export interface AdminSection {
  key: string;
  href: string;
  icon: LucideIcon;
  screens: AdminScreen[];
}

export const ADMIN_SECTIONS: AdminSection[] = [
  {
    key: 'employees',
    href: '/admin/funcionarios',
    icon: Users,
    screens: [
      { key: 'list', path: '', milestone: 'demo' },
      { key: 'new', path: 'novo', milestone: 'demo' },
      { key: 'documents', path: 'documentos', milestone: 'm3' },
      { key: 'payslips', path: 'holerites', milestone: 'm4' },
    ],
  },
  {
    key: 'clients',
    href: '/admin/clientes',
    icon: Building2,
    screens: [
      { key: 'list', path: '', milestone: 'demo' },
      { key: 'new', path: 'novo', milestone: 'demo' },
      { key: 'subcontractors', path: 'subcontratantes', milestone: 'demo' },
      { key: 'documents', path: 'documentos', milestone: 'm3' },
      { key: 'portal', path: 'portal', milestone: 'm3' },
    ],
  },
  {
    key: 'assignments',
    href: '/admin/escalacoes',
    icon: CalendarDays,
    screens: [
      { key: 'calendar', path: '', milestone: 'demo' },
      { key: 'new', path: 'nova', milestone: 'demo' },
      { key: 'history', path: 'historico', milestone: 'm3' },
    ],
  },
  {
    key: 'documents',
    href: '/admin/documentos',
    icon: FolderOpen,
    screens: [
      { key: 'folders', path: '', milestone: 'm3' },
      { key: 'excel', path: 'excel', milestone: 'phase2' },
      { key: 'word', path: 'word', milestone: 'phase2' },
    ],
  },
  {
    key: 'cashflow',
    href: '/admin/fluxo-de-caixa',
    icon: Wallet,
    screens: [
      { key: 'invoices', path: '', milestone: 'm3' },
      { key: 'expenses', path: 'despesas', milestone: 'm4' },
      { key: 'advances', path: 'adiantamentos', milestone: 'm4' },
      { key: 'socialInsurance', path: 'seguros-sociais', milestone: 'm4' },
      { key: 'reports', path: 'relatorios', milestone: 'm4' },
    ],
  },
  {
    key: 'ai',
    href: '/admin/ia',
    icon: Sparkles,
    screens: [{ key: 'integration', path: '', milestone: 'phase2' }],
  },
  {
    key: 'settings',
    href: '/admin/configuracoes',
    icon: Settings,
    screens: [
      { key: 'company', path: '', milestone: 'm1' },
      { key: 'system', path: 'sistema', milestone: 'm1' },
    ],
  },
];

/** Dashboard: the panel's home, outside the sections. */
export const ADMIN_HOME = { key: 'dashboard', href: '/admin', icon: LayoutDashboard } as const;

export function screenHref(section: AdminSection, screen: AdminScreen): string {
  return screen.path ? `${section.href}/${screen.path}` : section.href;
}

/** Section and screen of a URL under /admin, from its segments (e.g. ['funcionarios', 'novo']). */
export function findScreen(
  segments: string[],
): { section: AdminSection; screen: AdminScreen } | null {
  const [sectionPath, screenPath = '', ...rest] = segments;
  if (rest.length > 0) return null;
  const section = ADMIN_SECTIONS.find((s) => s.href === `/admin/${sectionPath ?? ''}`);
  const screen = section?.screens.find((s) => s.path === screenPath);
  return section && screen ? { section, screen } : null;
}

/** Menu entry for a path: the dashboard only on /admin itself, a section on any of its screens. */
export function isActiveHref(pathname: string, href: string): boolean {
  return href === ADMIN_HOME.href
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}
