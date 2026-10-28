'use client';

import { Check, Minus } from 'lucide-react';
import {
  Checkbox as CheckboxPrimitive,
  RadioGroup as RadioPrimitive,
  Switch as SwitchPrimitive,
} from 'radix-ui';
import { useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '../lib/cn';

const boxClasses = [
  'mt-0.5 grid size-[18px] shrink-0 cursor-pointer place-items-center border-[1.5px] border-line-strong bg-surface-1',
  'transition-[background-color,border-color] duration-(--dur-fast) hover:border-primary',
  'data-[state=checked]:border-primary data-[state=checked]:bg-primary',
  'data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary',
  'disabled:cursor-default disabled:opacity-45',
];

function ChoiceLabel({
  id,
  label,
  description,
}: {
  id: string;
  label: ReactNode;
  description?: ReactNode;
}) {
  return (
    <label htmlFor={id} className="cursor-pointer text-sm leading-[22px]">
      {label}
      {description ? (
        <small className="block text-xs leading-4 text-ink-subtle">{description}</small>
      ) : null}
    </label>
  );
}

export type CheckboxProps = ComponentProps<typeof CheckboxPrimitive.Root> & {
  label?: ReactNode;
  description?: ReactNode;
};

export function Checkbox({ label, description, className, id, ...props }: CheckboxProps) {
  const autoId = useId();
  const boxId = id ?? autoId;
  const box = (
    <CheckboxPrimitive.Root
      id={boxId}
      className={cn(boxClasses, 'rounded-xs', className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="text-on-primary">
        {props.checked === 'indeterminate' ? (
          <Minus className="size-3" strokeWidth={3} />
        ) : (
          <Check className="size-3" strokeWidth={3} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
  if (label == null) return box;
  return (
    <div className="inline-flex items-start gap-2">
      {box}
      <ChoiceLabel id={boxId} label={label} description={description} />
    </div>
  );
}

export function RadioGroup({ className, ...props }: ComponentProps<typeof RadioPrimitive.Root>) {
  return <RadioPrimitive.Root className={cn('flex flex-col gap-3', className)} {...props} />;
}

export type RadioProps = ComponentProps<typeof RadioPrimitive.Item> & {
  label: ReactNode;
  description?: ReactNode;
};

export function Radio({ label, description, className, id, ...props }: RadioProps) {
  const autoId = useId();
  const itemId = id ?? autoId;
  return (
    <div className="inline-flex items-start gap-2">
      <RadioPrimitive.Item
        id={itemId}
        className={cn(boxClasses, 'rounded-full', className)}
        {...props}
      >
        <RadioPrimitive.Indicator className="size-2 rounded-full bg-on-primary" />
      </RadioPrimitive.Item>
      <ChoiceLabel id={itemId} label={label} description={description} />
    </div>
  );
}

export type SwitchProps = ComponentProps<typeof SwitchPrimitive.Root> & { label?: ReactNode };

export function Switch({ label, className, id, ...props }: SwitchProps) {
  const autoId = useId();
  const switchId = id ?? autoId;
  const control = (
    <SwitchPrimitive.Root
      id={switchId}
      className={cn(
        'relative h-6 w-10 shrink-0 cursor-pointer rounded-full bg-line-strong transition-colors duration-(--dur-base) ease-standard',
        'data-[state=checked]:bg-primary disabled:cursor-default disabled:opacity-45',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-[18px] translate-x-[3px] rounded-full bg-surface-1 shadow-sm transition-transform duration-(--dur-base) ease-standard data-[state=checked]:translate-x-[19px]" />
    </SwitchPrimitive.Root>
  );
  if (label == null) return control;
  return (
    <div className="inline-flex items-center gap-3">
      {control}
      <label htmlFor={switchId} className="cursor-pointer">
        {label}
      </label>
    </div>
  );
}
