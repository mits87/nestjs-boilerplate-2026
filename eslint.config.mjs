import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

const ROOT_DIR = dirname(fileURLToPath(import.meta.url));

/** @type {import('typescript-eslint').ConfigArray} */
const config = tseslint.config(
  {
    ignores: [
      'eslint.config.mjs',
      'node_modules',
      'dist',
      'build',
      'coverage',
      'coverage-integration',
      '*.d.ts',
      'src/sdk',
      'src/metadata.ts',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.vitest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: ROOT_DIR,
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
  },
  {
    rules: {
      curly: 'error',
      'no-shadow': 'off',
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [['^node:'], ['^@?\\w'], ['^@/'], ['^\\.']],
        },
      ],
      '@typescript-eslint/consistent-type-assertions': [
        'warn',
        {
          assertionStyle: 'never',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/member-ordering': [
        'error',
        {
          default: {
            memberTypes: [
              'public-field',
              'protected-field',
              'private-field',
              'field',
              'constructor',
              'method',
              'public-method',
              'protected-method',
              'private-method',
            ],
            order: 'alphabetically',
          },
        },
      ],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'explicit',
          overrides: {
            constructors: 'no-public',
          },
        },
      ],
    },
  },
  {
    files: ['**/*.dto.ts', '**/*.interface.ts'],
    rules: {
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          overrides: {
            constructors: 'no-public',
            properties: 'off',
          },
        },
      ],
      '@typescript-eslint/member-ordering': 'off',
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
    rules: {
      '@typescript-eslint/consistent-type-assertions': 'off',
      '@typescript-eslint/unbound-method': 'off',
    },
  },
);

export default config;
