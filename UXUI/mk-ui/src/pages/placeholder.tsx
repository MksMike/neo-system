// fbk-015 · Estado vazio — telas do mapa que ainda não foram desenhadas.
import { Construction } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { findRoute } from '../app/nav';
import { PageLayout } from '../components/shell/page-layout';
import { Card } from '../components/ui/card';

export function PlaceholderPage() {
  const route = findRoute(useLocation().pathname);
  return (
    <PageLayout>
      <Card className="flex flex-col items-center gap-3 py-12 text-center">
        <span className="grid size-12 place-items-center rounded-field border border-card-border bg-surface-2 text-icon">
          <Construction aria-hidden className="size-6" strokeWidth={1.3} />
        </span>
        <p className="fx-title m-0 text-sm">{route?.sub?.label ?? route?.item.label}</p>
        <p className="m-0 max-w-[48ch] text-sm text-muted">
          Esta tela entra nas próximas versões do protótipo. A navegação, o título e as abas já
          seguem o kit.
        </p>
      </Card>
    </PageLayout>
  );
}
