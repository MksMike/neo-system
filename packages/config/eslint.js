import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Shared flat config. Each package spreads it and sets `tsconfigRootDir`:
 *
 *   export default defineConfig(base, {
 *     languageOptions: { parserOptions: { tsconfigRootDir: import.meta.dirname } },
 *   });
 */
export const base = defineConfig(
  globalIgnores(['**/dist/**', '**/.next/**', '**/coverage/**', '**/.turbo/**']),
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      globals: { ...globals.es2023 },
      parserOptions: { projectService: true },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      // Text is always rendered as text, never as HTML (ADR 0019).
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message: 'dangerouslySetInnerHTML is forbidden (ADR 0019). Render text as text.',
        },
      ],
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: { ...globals.node } },
  },
  prettier,
);

/** React packages and the Next.js app: base + hooks rules + browser globals. */
export const react = defineConfig(base, reactHooks.configs.flat['recommended-latest'], {
  languageOptions: { globals: { ...globals.browser } },
});

/** The Next.js app: react + Next.js rules (core web vitals). */
export const next = defineConfig(react, {
  plugins: { '@next/next': nextPlugin },
  rules: {
    ...nextPlugin.configs.recommended.rules,
    ...nextPlugin.configs['core-web-vitals'].rules,
  },
});
