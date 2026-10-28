/** Module catalog row, as read from `public.module` (layer 00, section 3). */
export interface ModuleDef {
  key: string;
  kind: 'base' | 'optional' | 'addon';
  depends_on: string[];
  depends_any: string[];
}

/**
 * Turns `key` on together with everything it needs (R00-04), like `app.apply_modules` does in
 * the database. Returns the new selection and the modules added as dependencies.
 */
export function enableModule(
  selected: readonly string[],
  key: string,
  catalog: readonly ModuleDef[],
): { selected: string[]; added: string[] } {
  const byKey = new Map(catalog.map((m) => [m.key, m]));
  const result = new Set(selected);
  const added: string[] = [];
  const queue = [key];
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined || result.has(current)) continue;
    const def = byKey.get(current);
    if (!def || def.kind === 'base') continue;
    result.add(current);
    if (current !== key) added.push(current);
    queue.push(...def.depends_on);
  }
  return { selected: sortByCatalog([...result], catalog), added: sortByCatalog(added, catalog) };
}

/** Optional modules turned on by a plan template, with their dependencies. */
export function modulesForPlan(keys: readonly string[], catalog: readonly ModuleDef[]): string[] {
  return keys.reduce<string[]>((acc, key) => enableModule(acc, key, catalog).selected, []);
}

/**
 * Modules in the selection that stop working without `key` (R00-04): it is in their
 * `depends_on`, or it is the only one of their `depends_any` still on.
 */
export function dependentsOf(
  key: string,
  selected: readonly string[],
  catalog: readonly ModuleDef[],
): string[] {
  const on = new Set(selected);
  return catalog
    .filter((m) => m.key !== key && on.has(m.key))
    .filter(
      (m) =>
        m.depends_on.includes(key) ||
        (m.depends_any.includes(key) && !m.depends_any.some((alt) => alt !== key && on.has(alt))),
    )
    .map((m) => m.key);
}

/** Modules on whose "one of" dependency is missing (e.g. finance without billing or payroll). */
export function missingAnyDependency<T extends ModuleDef>(
  selected: readonly string[],
  catalog: readonly T[],
): T[] {
  const on = new Set(selected);
  return catalog.filter(
    (m) => on.has(m.key) && m.depends_any.length > 0 && !m.depends_any.some((k) => on.has(k)),
  );
}

function sortByCatalog(keys: string[], catalog: readonly ModuleDef[]): string[] {
  const order = new Map(catalog.map((m, i) => [m.key, i]));
  return keys.sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));
}
