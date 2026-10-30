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
 * Mapa de navegação do NEO-SYSTEM (docs/mapa-de-funcionalidades.md) no formato do kit:
 * cada item tem 0 ou mais subitens; rotas /<item>/<subitem>.
 */
export interface NavSub {
  slug: string;
  label: string;
}

export interface NavItem {
  slug: string;
  label: string;
  icon: LucideIcon;
  subs: NavSub[];
}

export const NAV: NavItem[] = [
  {
    slug: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    subs: [
      { slug: 'resumo', label: 'Resumo' },
      { slug: 'atividade', label: 'Atividade' },
    ],
  },
  {
    slug: 'funcionarios',
    label: 'Funcionários',
    icon: Users,
    subs: [
      { slug: 'lista', label: 'Lista' },
      { slug: 'novo', label: 'Novo cadastro' },
      { slug: 'documentos', label: 'Documentos' },
      { slug: 'holerites', label: 'Holerites' },
    ],
  },
  {
    slug: 'clientes',
    label: 'Clientes',
    icon: Building2,
    subs: [
      { slug: 'lista', label: 'Lista' },
      { slug: 'novo', label: 'Novo cadastro' },
      { slug: 'subcontratantes', label: 'Subcontratantes' },
      { slug: 'documentos', label: 'Documentos' },
      { slug: 'portal', label: 'Painel do Cliente' },
    ],
  },
  {
    slug: 'escalacoes',
    label: 'Escalações',
    icon: CalendarDays,
    subs: [
      { slug: 'calendario', label: 'Calendário' },
      { slug: 'nova', label: 'Nova escalação' },
      { slug: 'historico', label: 'Histórico' },
    ],
  },
  {
    slug: 'documentos',
    label: 'Documentos',
    icon: FolderOpen,
    subs: [
      { slug: 'pastas', label: 'Pastas' },
      { slug: 'excel', label: 'Excel' },
      { slug: 'word', label: 'Word' },
    ],
  },
  {
    slug: 'fluxo-de-caixa',
    label: 'Fluxo de caixa',
    icon: Wallet,
    subs: [
      { slug: 'faturas', label: 'Faturas' },
      { slug: 'despesas', label: 'Despesas' },
      { slug: 'adiantamentos', label: 'Adiantamentos' },
      { slug: 'seguros-sociais', label: 'Seguros sociais' },
      { slug: 'relatorios', label: 'Relatórios' },
    ],
  },
  { slug: 'ia', label: 'Inteligência Artificial', icon: Sparkles, subs: [] },
  {
    slug: 'configuracoes',
    label: 'Configurações',
    icon: Settings,
    subs: [
      { slug: 'empresa', label: 'Dados da empresa' },
      { slug: 'sistema', label: 'Sistema' },
    ],
  },
];

/** Barra de abas do celular: Início, três atalhos e Menu (especificação, seção 1). */
export const MOBILE_TABS = ['dashboard', 'escalacoes', 'funcionarios', 'clientes'] as const;

export function itemPath(item: NavItem): string {
  const first = item.subs[0];
  return first ? `/${item.slug}/${first.slug}` : `/${item.slug}`;
}

export function findRoute(pathname: string): { item: NavItem; sub?: NavSub } | null {
  const [, itemSlug, subSlug] = pathname.split('/');
  const item = NAV.find((i) => i.slug === itemSlug);
  if (!item) return null;
  const sub = item.subs.find((s) => s.slug === subSlug);
  return { item, sub };
}
