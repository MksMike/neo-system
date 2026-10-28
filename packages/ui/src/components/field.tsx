'use client';

import { CircleAlert } from 'lucide-react';
import { createContext, useContext, useId, type ComponentProps, type ReactNode } from 'react';
import { cn } from '../lib/cn';

interface FieldContextValue {
  id: string;
  describedBy: string | undefined;
  invalid: boolean;
  disabled: boolean;
  required: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

/** Inside a Field: the id, aria wiring and state for the control. */
export function useField(): FieldContextValue | null {
  return useContext(FieldContext);
}

export interface FieldProps {
  label: ReactNode;
  /** Help text under the control. Hidden while there is an error. */
  help?: ReactNode;
  /** Error message (already translated). Marks the control as invalid. */
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

/** Field pattern: label + control + help or error (design system, "Campos"). */
export function Field({
  label,
  help,
  error,
  required = false,
  disabled = false,
  className,
  children,
}: FieldProps) {
  const id = useId();
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const invalid = error != null && error !== false;
  const describedBy = invalid ? errorId : help != null ? helpId : undefined;

  return (
    <FieldContext.Provider value={{ id, describedBy, invalid, disabled, required }}>
      <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
        <label htmlFor={id} className="type-label text-ink-muted">
          {label}
          {required ? (
            <span aria-hidden className="ml-0.5 text-danger">
              *
            </span>
          ) : null}
        </label>
        {children}
        {invalid ? (
          <p id={errorId} className="flex items-center gap-1.5 text-xs leading-4 text-danger">
            <CircleAlert aria-hidden className="size-4 shrink-0" strokeWidth={1.75} />
            {error}
          </p>
        ) : help != null ? (
          <p id={helpId} className="text-xs leading-4 text-ink-subtle">
            {help}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}

const controlClasses = [
  'relative flex items-center rounded-md border border-line bg-surface-1 text-ink',
  'transition-[border-color,box-shadow,background-color] duration-(--dur-fast)',
  'hover:border-line-strong focus-within:border-focus focus-within:shadow-[0_0_0_3px_var(--glow)]',
  'data-[invalid=true]:border-danger data-[invalid=true]:bg-danger-soft data-[invalid=true]:focus-within:shadow-[0_0_0_3px_var(--danger-soft)]',
  'data-[disabled=true]:pointer-events-none data-[disabled=true]:bg-surface-2 data-[disabled=true]:opacity-60',
];

const innerClasses =
  'h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-sm leading-[22px] text-inherit outline-none placeholder:text-ink-subtle';

interface ControlWrapperProps {
  size?: 'md' | 'lg';
  icon?: ReactNode;
  suffix?: ReactNode;
  className?: string;
  invalid: boolean;
  disabled: boolean;
  multiline?: boolean;
  children: ReactNode;
}

function ControlWrapper({
  size = 'md',
  icon,
  suffix,
  className,
  invalid,
  disabled,
  multiline,
  children,
}: ControlWrapperProps) {
  return (
    <div
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      className={cn(
        controlClasses,
        multiline ? 'h-auto items-stretch' : size === 'lg' ? 'h-control-lg' : 'h-control-md',
        className,
      )}
    >
      {icon ? (
        <span className="ml-3 flex text-ink-subtle [&_svg]:size-5 [&_svg]:stroke-[1.75]">
          {icon}
        </span>
      ) : null}
      {children}
      {suffix ? <span className="pr-3 text-[13px] text-ink-subtle">{suffix}</span> : null}
    </div>
  );
}

function useControlState(props: {
  id?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
}) {
  const field = useField();
  return {
    id: props.id ?? field?.id,
    describedBy: field?.describedBy,
    invalid: props.invalid ?? field?.invalid ?? false,
    disabled: props.disabled ?? field?.disabled ?? false,
    required: props.required ?? field?.required ?? false,
  };
}

export type InputProps = Omit<ComponentProps<'input'>, 'size'> & {
  size?: 'md' | 'lg';
  icon?: ReactNode;
  suffix?: ReactNode;
  invalid?: boolean;
  /** Classes for the wrapper (border, background). `className` goes to the input. */
  wrapperClassName?: string;
};

export function Input({
  size,
  icon,
  suffix,
  invalid,
  wrapperClassName,
  className,
  ...props
}: InputProps) {
  const state = useControlState({ ...props, invalid });
  return (
    <ControlWrapper
      size={size}
      icon={icon}
      suffix={suffix}
      className={wrapperClassName}
      invalid={state.invalid}
      disabled={state.disabled}
    >
      <input
        {...props}
        id={state.id}
        disabled={state.disabled}
        required={state.required}
        aria-invalid={state.invalid || undefined}
        aria-describedby={state.describedBy}
        className={cn(innerClasses, className)}
      />
    </ControlWrapper>
  );
}

export type TextareaProps = ComponentProps<'textarea'> & {
  invalid?: boolean;
  wrapperClassName?: string;
};

export function Textarea({ invalid, wrapperClassName, className, ...props }: TextareaProps) {
  const state = useControlState({ ...props, invalid });
  return (
    <ControlWrapper
      multiline
      className={wrapperClassName}
      invalid={state.invalid}
      disabled={state.disabled}
    >
      <textarea
        {...props}
        id={state.id}
        disabled={state.disabled}
        required={state.required}
        aria-invalid={state.invalid || undefined}
        aria-describedby={state.describedBy}
        className={cn(innerClasses, 'min-h-22 resize-y p-3', className)}
      />
    </ControlWrapper>
  );
}

export type NativeSelectProps = Omit<ComponentProps<'select'>, 'size'> & {
  size?: 'md' | 'lg';
  invalid?: boolean;
  wrapperClassName?: string;
};

/** Native select styled as a control: the most accessible choice for short lists. */
export function NativeSelect({
  size,
  invalid,
  wrapperClassName,
  className,
  children,
  ...props
}: NativeSelectProps) {
  const state = useControlState({ ...props, invalid });
  return (
    <ControlWrapper
      size={size}
      className={wrapperClassName}
      invalid={state.invalid}
      disabled={state.disabled}
    >
      <select
        {...props}
        id={state.id}
        disabled={state.disabled}
        required={state.required}
        aria-invalid={state.invalid || undefined}
        aria-describedby={state.describedBy}
        className={cn(innerClasses, 'cursor-pointer appearance-none pr-9', className)}
      >
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="pointer-events-none absolute right-3 size-4 fill-none stroke-current stroke-[1.75] text-ink-subtle"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </ControlWrapper>
  );
}
