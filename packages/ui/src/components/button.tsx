import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '../lib/cn';
import { Spinner } from './spinner';

export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent',
    'font-semibold leading-none no-underline cursor-pointer select-none',
    'transition-[background-color,border-color,color,box-shadow,transform,filter] duration-(--dur-fast) ease-standard',
    'active:not-disabled:scale-[.98] disabled:cursor-default disabled:opacity-45 aria-disabled:opacity-45',
    '[&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:stroke-[1.75]',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-grad-brand text-on-grad shadow-sm hover:not-disabled:brightness-[1.08] hover:not-disabled:shadow-[0_0_0_4px_var(--glow),var(--nx-shadow-md)]',
        solid: 'bg-primary text-on-primary hover:not-disabled:bg-primary-hover',
        secondary: 'bg-surface-1 text-ink border-line-strong hover:not-disabled:bg-surface-3',
        ghost: 'bg-transparent text-ink hover:not-disabled:bg-surface-3',
        soft: 'bg-primary-soft text-primary-text hover:not-disabled:bg-surface-3',
        danger: 'bg-danger text-surface-1 hover:not-disabled:brightness-[1.08]',
      },
      size: {
        sm: 'h-control-sm px-3 text-[13px]',
        md: 'h-control-md px-4 text-sm',
        lg: 'h-control-lg px-5 text-base rounded-[12px]',
      },
      iconOnly: { true: 'px-0', false: '' },
      block: { true: 'w-full', false: '' },
    },
    compoundVariants: [
      { iconOnly: true, size: 'sm', className: 'w-control-sm' },
      { iconOnly: true, size: 'md', className: 'w-control-md' },
      { iconOnly: true, size: 'lg', className: 'w-control-lg' },
    ],
    defaultVariants: { variant: 'secondary', size: 'md', iconOnly: false, block: false },
  },
);

export type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /** Renders the child element (e.g. a link) with the button styles. */
    asChild?: boolean;
    /** Shows a spinner, sets aria-busy and blocks clicks. */
    loading?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  iconOnly,
  block,
  asChild = false,
  loading = false,
  disabled,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size, iconOnly, block }), className);
  if (asChild) {
    return (
      <Slot.Root className={classes} {...props}>
        {children}
      </Slot.Root>
    );
  }
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled === true || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}
