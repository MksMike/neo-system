'use client';

import { NavItem, SidebarSection } from '@neo/ui';
import { Activity, Boxes, Building2, LayoutDashboard, Wallet, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavEntry {
  href: string;
  key: 'home' | 'companies' | 'payments' | 'modules' | 'system';
  icon: LucideIcon;
  exact?: boolean;
}

/** Super Admin menu (layer 00, section 5). */
export const SUPER_NAV: { section?: 'clients' | 'platform'; items: NavEntry[] }[] = [
  { items: [{ href: '/super', key: 'home', icon: LayoutDashboard, exact: true }] },
  {
    section: 'clients',
    items: [
      { href: '/super/empresas', key: 'companies', icon: Building2 },
      { href: '/super/pagamentos', key: 'payments', icon: Wallet },
    ],
  },
  {
    section: 'platform',
    items: [
      { href: '/super/modulos', key: 'modules', icon: Boxes },
      { href: '/super/sistema', key: 'system', icon: Activity },
    ],
  },
];

export function isActive(pathname: string, entry: { href: string; exact?: boolean }): boolean {
  return entry.exact
    ? pathname === entry.href
    : pathname === entry.href || pathname.startsWith(`${entry.href}/`);
}

export function SuperNav({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations('super.nav');
  const pathname = usePathname();
  return (
    <>
      {SUPER_NAV.map((group) => (
        <div key={group.section ?? 'top'} className="flex flex-col gap-0.5">
          {group.section ? <SidebarSection>{t(`sections.${group.section}`)}</SidebarSection> : null}
          {group.items.map(({ href, key, icon: Icon, exact }) => (
            <NavItem key={href} asChild active={isActive(pathname, { href, exact })}>
              <Link href={href} onClick={onNavigate}>
                <Icon aria-hidden />
                {t(key)}
              </Link>
            </NavItem>
          ))}
        </div>
      ))}
    </>
  );
}
