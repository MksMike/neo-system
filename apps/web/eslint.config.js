import { next } from '@neo/config/eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig(globalIgnores(['next-env.d.ts']), next, {
  languageOptions: { parserOptions: { tsconfigRootDir: import.meta.dirname } },
});
