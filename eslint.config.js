import js from '@eslint/js';
import globals from 'globals';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import jsdoc from 'eslint-plugin-jsdoc';

export default [
  // ✅ Global base — first so everything below can override it
  js.configs.recommended,

  {
    files: ['api/**/*.{js,ts}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        fetch: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
      },
    },
    rules: { 'no-console': 'off' },
  },

  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
      globals: {
        ...globals.browser,
        console: 'readonly',
        HTMLElement: 'readonly',
      },
    },
    plugins: { '@typescript-eslint': tseslint, jsdoc },
    rules: {
      ...tseslint.configs.recommended.rules,
      'jsdoc/require-jsdoc': ['error', { contexts: ['TSClassDeclaration'] }],
    },
  },

  {
    files: ['src/**/*.spec.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
      globals: {
        describe: 'readonly',
        beforeEach: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        HTMLElement: 'readonly',
      },
    },
    plugins: { '@typescript-eslint': tseslint },
    rules: { ...tseslint.configs.recommended.rules },
  },

  // ✅ Last — wins over js.configs.recommended for script files
  {
    files: ['scripts/**/*.{js,mjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        console: 'readonly',
        process: 'readonly',
      },
    },
    rules: { 'no-console': 'off' },
  },
];