import { base } from '@neo/config/eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig(base, {
  languageOptions: { parserOptions: { tsconfigRootDir: import.meta.dirname } },
});
