import { describe, expect, it } from 'vitest';
import {
  dependentsOf,
  enableModule,
  missingAnyDependency,
  modulesForPlan,
  type ModuleDef,
} from './modules';

// Same shape as the seed catalog (layer 00, section 3).
const m = (key: string, depends_on: string[] = [], depends_any: string[] = []): ModuleDef => ({
  key,
  kind: key === 'platform' ? 'base' : 'optional',
  depends_on,
  depends_any,
});
const catalog = [
  m('platform'),
  m('organizations'),
  m('employees'),
  m('scheduling', ['organizations', 'employees']),
  m('attendance', ['scheduling']),
  m('documents'),
  m('billing', ['attendance', 'documents']),
  m('payroll', ['attendance', 'documents']),
  m('finance', [], ['billing', 'payroll']),
  m('bank_sync', ['finance']),
];

describe('module dependencies (R00-04)', () => {
  it('turning a module on turns on what it needs, transitively', () => {
    const result = enableModule([], 'attendance', catalog);
    expect(result.selected).toEqual(['organizations', 'employees', 'scheduling', 'attendance']);
    expect(result.added).toEqual(['organizations', 'employees', 'scheduling']);
  });

  it('base modules are never part of the selection', () => {
    expect(enableModule([], 'platform', catalog).selected).toEqual([]);
  });

  it('a plan template turns on its modules with dependencies', () => {
    expect(modulesForPlan(['billing'], catalog)).toEqual([
      'organizations',
      'employees',
      'scheduling',
      'attendance',
      'documents',
      'billing',
    ]);
  });

  it('lists who depends on a module, counting "one of" dependencies', () => {
    const on = modulesForPlan(['billing', 'payroll', 'finance'], catalog);
    expect(dependentsOf('attendance', on, catalog)).toEqual(['billing', 'payroll']);
    // finance still has payroll without billing
    expect(dependentsOf('billing', on, catalog)).toEqual([]);
    const onlyBilling = on.filter((k) => k !== 'payroll');
    expect(dependentsOf('billing', onlyBilling, catalog)).toEqual(['finance']);
  });

  it('flags a module whose "one of" dependency is missing', () => {
    expect(missingAnyDependency(['finance'], catalog).map((x) => x.key)).toEqual(['finance']);
    expect(missingAnyDependency(modulesForPlan(['payroll', 'finance'], catalog), catalog)).toEqual(
      [],
    );
  });
});
