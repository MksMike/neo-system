import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
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
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: { ...globals.node } },
  },
  prettier,
);
