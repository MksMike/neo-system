import { react } from '@neo/config/eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig(react, {
  languageOptions: { parserOptions: { tsconfigRootDir: import.meta.dirname } },
});
