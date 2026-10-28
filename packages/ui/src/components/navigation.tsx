'use client';

import { Tabs as TabsPrimitive, ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';
import { createContext, useContext, type ComponentProps } from 'react';
import { cn } from '../lib/cn';

/* ---------- Tabs ---------- */

type TabsVariant = 'segment' | 'line';
const TabsVariantContext = createContext<TabsVariant>('segment');

export function Tabs({
  variant = 'segment',
  ...props
}: ComponentProps<typeof TabsPrimitive.Root> & { variant?: TabsVariant }) {
  return (
    <TabsVariantContext.Provider value={variant}>
      <TabsPrimitive.Root {...props} />
    </TabsVariantContext.Provider>
  );
}

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  const variant = useContext(TabsVariantContext);
  return (
    <TabsPrimitive.List
      className={cn(
        variant === 'segment' &&
          'inline-flex gap-0.5 rounded-md border border-line bg-surface-2 p-[3px]',
        variant === 'line' && 'flex gap-4 border-b border-line',
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  const variant = useContext(TabsVariantContext);
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'cursor-pointer border-0 bg-transparent text-[13px] font-semibold leading-none text-ink-muted hover:text-ink',
        'transition-[background-color,color,box-shadow] duration-(--dur-base) ease-standard',
        variant === 'segment' &&
          'h-8 rounded-[8px] px-3 data-[state=active]:bg-surface-1 data-[state=active]:text-ink data-[state=active]:shadow-sm',
        variant === 'line' &&
          'relative h-10 px-0.5 data-[state=active]:text-primary-text data-[state=active]:after:absolute data-[state=active]:after:inset-x-0 data-[state=active]:after:-bottom-px data-[state=active]:after:h-0.5 data-[state=active]:after:rounded-[2px] data-[state=active]:after:bg-grad-brand',
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn('pt-4 outline-none', className)} {...props} />;
}

/* ---------- Segmented control (single choice, e.g. theme or language) ---------- */

export interface SegmentedOption {
  value: string;
  label: string;
  swatch?: string;
}

export interface SegmentedControlProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SegmentedOption[];
  /** Accessible name of the group (already translated). */
  label: string;
  className?: string;
}

export function SegmentedControl({
  value,
  onValueChange,
  options,
  label,
  className,
}: SegmentedControlProps) {
  return (
    <ToggleGroupPrimitive.Root
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v) onValueChange(v);
      }}
      aria-label={label}
      className={cn(
        'inline-flex gap-0.5 rounded-md border border-line bg-surface-2 p-[3px]',
        className,
      )}
    >
      {options.map((o) => (
        <ToggleGroupPrimitive.Item
          key={o.value}
          value={o.value}
          className={cn(
            'inline-flex h-[30px] cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[7px] border-0 bg-transparent px-2.5 text-xs font-semibold leading-none text-ink-muted',
            'transition-[background-color,color] duration-(--dur-fast) hover:text-ink',
            'data-[state=on]:bg-surface-1 data-[state=on]:text-ink data-[state=on]:shadow-sm',
          )}
        >
          {o.swatch ? (
            <span aria-hidden className="size-3 rounded-full" style={{ background: o.swatch }} />
          ) : null}
          {o.label}
        </ToggleGroupPrimitive.Item>
      ))}
    </ToggleGroupPrimitive.Root>
  );
}

/* ---------- Steps (wizard progress) ---------- */

export interface StepsProps {
  /** Step names, already translated. */
  steps: string[];
  /** Index of the current step (0-based). */
  current: number;
  /** Accessible name of the list (already translated). */
  label: string;
  className?: string;
}

/** Progress of a wizard: done, current and next steps. The current one has `aria-current="step"`. */
export function Steps({ steps, current, label, className }: StepsProps) {
  return (
    <ol aria-label={label} className={cn('m-0 flex list-none gap-2 p-0', className)}>
      {steps.map((name, index) => {
        const state = index < current ? 'done' : index === current ? 'current' : 'next';
        return (
          <li
            key={name}
            aria-current={state === 'current' ? 'step' : undefined}
            data-state={state}
            className="group flex min-w-0 flex-1 flex-col gap-2"
          >
            <span
              aria-hidden
              className="h-1 rounded-full bg-surface-3 group-data-[state=current]:bg-grad-brand group-data-[state=done]:bg-primary"
            />
            <span className="flex items-center gap-2 text-[13px] leading-4 font-semibold text-ink-subtle group-data-[state=current]:text-ink group-data-[state=done]:text-ink-muted">
              <span className="type-num grid size-5 shrink-0 place-items-center rounded-full border border-line text-[11px] group-data-[state=current]:border-primary group-data-[state=current]:text-primary-text group-data-[state=done]:border-primary group-data-[state=done]:bg-primary group-data-[state=done]:text-on-primary">
                {index + 1}
              </span>
              <span className="truncate max-sm:sr-only max-sm:group-data-[state=current]:not-sr-only">
                {name}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
