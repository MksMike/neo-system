'use client';

import { X } from 'lucide-react';
import {
  Dialog as DialogPrimitive,
  DropdownMenu as MenuPrimitive,
  Tooltip as TooltipPrimitive,
} from 'radix-ui';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../lib/cn';

/* ---------- Tooltip ---------- */

export function TooltipProvider(props: ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider delayDuration={300} {...props} />;
}

export function Tooltip({ content, children }: { content: ReactNode; children: ReactNode }) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          sideOffset={8}
          className="z-(--z-dropdown) animate-nx-enter rounded-sm bg-ink px-2.5 py-1.5 text-xs font-medium leading-4 text-surface-1"
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

/* ---------- Dropdown menu ---------- */

export const DropdownMenu = MenuPrimitive.Root;
export const DropdownMenuTrigger = MenuPrimitive.Trigger;

export function DropdownMenuContent({
  className,
  sideOffset = 6,
  ...props
}: ComponentProps<typeof MenuPrimitive.Content>) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          'z-(--z-dropdown) min-w-[220px] animate-nx-enter rounded-lg border border-line bg-surface-1 p-1.5 shadow-md',
          className,
        )}
        {...props}
      />
    </MenuPrimitive.Portal>
  );
}

const itemClasses =
  'flex min-h-9 w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2.5 text-sm leading-none text-ink outline-none data-[highlighted]:bg-surface-3 data-[disabled]:pointer-events-none data-[disabled]:opacity-45 [&_svg]:size-4 [&_svg]:stroke-[1.75]';

export function DropdownMenuItem({
  className,
  danger = false,
  shortcut,
  children,
  ...props
}: ComponentProps<typeof MenuPrimitive.Item> & { danger?: boolean; shortcut?: string }) {
  return (
    <MenuPrimitive.Item className={cn(itemClasses, danger && 'text-danger', className)} {...props}>
      {children}
      {shortcut ? (
        <kbd className="ml-auto font-mono text-[11px] font-medium text-ink-subtle">{shortcut}</kbd>
      ) : null}
    </MenuPrimitive.Item>
  );
}

export function DropdownMenuCheckboxItem({
  className,
  ...props
}: ComponentProps<typeof MenuPrimitive.CheckboxItem>) {
  return (
    <MenuPrimitive.CheckboxItem
      className={cn(
        itemClasses,
        'data-[state=checked]:font-semibold data-[state=checked]:text-primary-text',
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: ComponentProps<typeof MenuPrimitive.Label>) {
  return (
    <MenuPrimitive.Label
      className={cn(
        'px-2.5 pt-2 pb-1 text-[11px] font-semibold leading-none tracking-[.06em] text-ink-subtle',
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof MenuPrimitive.Separator>) {
  return (
    <MenuPrimitive.Separator className={cn('mx-1 my-1.5 h-px bg-line', className)} {...props} />
  );
}

/* ---------- Dialog and drawer ---------- */

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content> & {
  /** `dialog` is centered; `drawer` slides in from the right. */
  layout?: 'dialog' | 'drawer';
  /** Accessible label of the close button (already translated). */
  closeLabel: string;
};

export function DialogContent({
  layout = 'dialog',
  closeLabel,
  className,
  children,
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-(--z-overlay) animate-nx-enter bg-overlay" />
      <DialogPrimitive.Content
        className={cn(
          'fixed z-(--z-modal) flex flex-col gap-4 border border-line bg-surface-1 p-6 shadow-lg outline-none',
          layout === 'dialog' &&
            'top-1/2 left-1/2 w-[min(480px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 animate-nx-enter rounded-xl',
          layout === 'drawer' &&
            'top-0 right-0 h-full w-[min(420px,100vw)] animate-nx-enter rounded-l-xl border-r-0',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label={closeLabel}
          className="absolute top-4 right-4 grid size-8 cursor-pointer place-items-center rounded-sm text-ink-muted hover:bg-surface-3 hover:text-ink"
        >
          <X aria-hidden className="size-5" strokeWidth={1.75} />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn('m-0 pr-8 type-h2', className)} {...props} />;
}

export function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn('m-0 text-ink-muted', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-wrap justify-end gap-2', className)} {...props} />;
}
