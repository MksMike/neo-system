/** Theme preference (ADR 0010): hue × mode, stored in cookies so the server renders
 * the right theme on the first paint, with no inline script. */
export const HUES = ['azul', 'grafite', 'roxo'] as const;
export const MODES = ['claro', 'escuro', 'sistema'] as const;

export type Hue = (typeof HUES)[number];
export type Mode = (typeof MODES)[number];

export const HUE_COOKIE = 'neo-hue';
export const MODE_COOKIE = 'neo-mode';

export function parseHue(value: string | undefined): Hue {
  return HUES.find((h) => h === value) ?? 'azul';
}

export function parseMode(value: string | undefined): Mode {
  return MODES.find((m) => m === value) ?? 'sistema';
}
