'use client';

import { Alert, Checkbox } from '@neo/ui';
import { useFormatter, useTranslations } from 'next-intl';
import { useState } from 'react';
import { dependentsOf, enableModule, missingAnyDependency, type ModuleDef } from '@/lib/modules';

export type NamedModule = ModuleDef & { name: string };

/**
 * Module selection with the dependency rules on the spot (R00-04): turning a module on turns
 * on what it needs and says so; a module another one needs cannot be turned off.
 * Used by the wizard and by the company page.
 */
export function ModuleChecklist({
  catalog,
  selected,
  onChange,
  error,
}: {
  catalog: NamedModule[];
  selected: string[];
  onChange: (selected: string[]) => void;
  /** Already translated; shown with the modules whose "one of" dependency is missing. */
  error?: string;
}) {
  const t = useTranslations('super.wizard.modules');
  const format = useFormatter();
  const [notice, setNotice] = useState('');

  const moduleName = (key: string) => catalog.find((m) => m.key === key)?.name ?? key;
  const list = (keys: string[]) => format.list(keys.map(moduleName), { type: 'conjunction' });
  const anyOf = (keys: string[]) => format.list(keys.map(moduleName), { type: 'disjunction' });

  function toggle(key: string, on: boolean) {
    if (on) {
      const result = enableModule(selected, key, catalog);
      setNotice(
        result.added.length > 0
          ? t('alsoEnabled', { module: moduleName(key), list: list(result.added) })
          : '',
      );
      onChange(result.selected);
    } else {
      setNotice('');
      onChange(selected.filter((k) => k !== key));
    }
  }

  const missingAny = missingAnyDependency(selected, catalog);

  return (
    <div className="flex flex-col gap-5">
      <p aria-live="polite" className="m-0 min-h-5 text-sm text-primary-text">
        {notice}
      </p>
      {error ? (
        <Alert variant="danger" title={error}>
          {missingAny
            .map((m) => t('needsOneOf', { module: m.name, list: anyOf(m.depends_any) }))
            .join(' ')}
        </Alert>
      ) : null}

      {(['base', 'optional', 'addon'] as const).map((kind) => (
        <fieldset
          key={kind}
          className="m-0 flex flex-col gap-3 rounded-lg border border-line bg-surface-1 p-5"
        >
          <legend className="px-1 type-label text-ink-muted">{t(`kinds.${kind}`)}</legend>
          <div className="grid gap-3 md:grid-cols-2">
            {catalog
              .filter((m) => m.kind === kind)
              .map((m) => {
                const on = kind === 'base' || selected.includes(m.key);
                const dependents =
                  on && kind !== 'base' ? dependentsOf(m.key, selected, catalog) : [];
                const description =
                  kind === 'base'
                    ? t('always')
                    : dependents.length > 0
                      ? t('requiredBy', { list: list(dependents) })
                      : m.depends_on.length > 0
                        ? t('needs', { list: list(m.depends_on) })
                        : m.depends_any.length > 0
                          ? t('needsAny', { list: anyOf(m.depends_any) })
                          : undefined;
                return (
                  <Checkbox
                    key={m.key}
                    checked={on}
                    disabled={kind === 'base' || dependents.length > 0}
                    onCheckedChange={(checked) => {
                      toggle(m.key, checked === true);
                    }}
                    label={m.name}
                    description={description}
                  />
                );
              })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
