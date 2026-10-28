import { base } from '@neo/config/eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig(globalIgnores(['src/database.types.ts']), base, {
  languageOptions: { parserOptions: { tsconfigRootDir: import.meta.dirname } },
});
