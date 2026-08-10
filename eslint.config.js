import importPlugin from 'eslint-plugin-import';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Global ignores
  {
    ignores: ['dist', '.eslintrc.cjs'],
  },

  // Base and TypeScript recommended configs
  ...tseslint.configs.recommended,

  // React configs
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],

  // React version (silences eslint-plugin-react version detection warning)
  {
    settings: {
      react: {
        version: '18.3',
      },
    },
  },

  // React Hooks (without React Compiler rules — project uses manual memoization)
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Disable React Compiler rules — this project uses manual useCallback/useMemo
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/compiler': 'off',
    },
  },

  // Import plugin
  {
    plugins: {
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message:
                'Relative parent imports are not allowed. Use the @/ path alias instead (e.g., import { Foo } from \'@/components/Foo\').',
            },
          ],
        },
      ],
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
          'newlines-between': 'never',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': 'warn',
    },
  },

  // React Refresh (disabled for hooks that co-export providers)
  {
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },

  // Target all source files
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
  },
);
