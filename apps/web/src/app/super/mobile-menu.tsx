'use client';

import { Button, Dialog, DialogContent, DialogTitle, DialogTrigger, SidebarBrand } from '@neo/ui';
import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';
import { SuperNav } from './super-nav';

/** On small screens the side menu opens as a drawer from the left. */
export function MobileMenu({ footer }: { footer?: ReactNode }) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" iconOnly aria-label={t('super.nav.open')} className="md:hidden">
          <Menu aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent
        layout="drawer-start"
        closeLabel={t('common.close')}
        aria-describedby={undefined}
      >
        <nav
          aria-label={t('super.nav.label')}
          className="flex h-full flex-col gap-0.5 overflow-y-auto px-3 py-4"
        >
          <DialogTitle className="sr-only">{t('super.nav.label')}</DialogTitle>
          <SidebarBrand mark="NEO" title="NEO-SYSTEM" subtitle={t('super.title')} />
          <SuperNav
            onNavigate={() => {
              setOpen(false);
            }}
          />
          {footer ? <div className="mt-auto border-t border-line pt-4">{footer}</div> : null}
        </nav>
      </DialogContent>
    </Dialog>
  );
}
