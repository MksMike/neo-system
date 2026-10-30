import { useCallback, useState } from 'react';

const KEY = 'neo-theme';

/** Claro/escuro pela classe .dark no <html>; escolha salva, padrão pela preferência do sistema. */
export function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const toggle = useCallback(() => {
    setDark((current) => {
      const next = !current;
      document.documentElement.classList.toggle('dark', next);
      try {
        localStorage.setItem(KEY, next ? 'dark' : 'light');
      } catch {
        // Private mode: the choice lasts only for this page.
      }
      return next;
    });
  }, []);
  return { dark, toggle };
}
