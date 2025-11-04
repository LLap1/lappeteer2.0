import tseslint from 'typescript-eslint';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default tseslint.config(js.configs.recommended, tseslint.configs.recommended, prettier, {
  ignores: ['dist'],
  files: ['**/*.{ts,tsx}'],
  plugins: {
    prettier: prettierPlugin,
  },
  rules: {},
});
