import globals from 'globals'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import importPlugin from 'eslint-plugin-import'
import unusedImports from 'eslint-plugin-unused-imports'
import prettier from 'eslint-plugin-prettier'

const aliasMap = [
  ['@', './src'],
  ['~', './src'],
  ['@api', './src/shared/api'],
  ['@store', './src/shared/store'],
  ['@assets', './src/shared/assets'],
]

const importResolver = {
  'import/resolver': {
    alias: {
      map: aliasMap,
      extensions: ['.js', '.ts', '.vue', '.json'],
    },
    node: {
      extensions: ['.js', '.ts', '.vue', '.json'],
    },
  },
}

const prettierRules = {
  printWidth: 80,
  tabWidth: 2,
  singleQuote: true,
  semi: false,
  trailingComma: 'es5',
  endOfLine: 'lf',
  htmlWhitespaceSensitivity: 'strict',
  vueIndentScriptAndStyle: true,
  bracketSameLine: false,
  singleAttributePerLine: false,
}

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'src/components/ui/**',
    ],
  },

  /**
   * JS / TS files
   */
  {
    files: ['src/**/*.{js,ts}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: 'module',
      },
      globals: globals.browser,
    },
    settings: {
      ...importResolver,
    },
    plugins: {
      vue,
      import: importPlugin,
      '@typescript-eslint': tseslint,
      'unused-imports': unusedImports,
      prettier,
    },
    rules: {
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'no-dupe-args': 'error',
      'no-dupe-else-if': 'error',

      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': ['error', {ignoreDeclarationMerge: true}],

      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',

      'import/no-unresolved': 'error',
      'import/extensions': ['error', 'ignorePackages', {js: 'never', ts: 'never', vue: 'always'}],

      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      'prettier/prettier': ['error', prettierRules],
    },
  },

  /**
   * Vue SFC
   */
  {
    files: ['src/**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 2023,
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
      globals: globals.browser,
    },
    settings: {
      ...importResolver,
    },
    plugins: {
      vue,
      import: importPlugin,
      '@typescript-eslint': tseslint,
      'unused-imports': unusedImports,
      prettier,
    },
    rules: {
      ...vue.configs['flat/recommended'].rules,

      'import/no-unresolved': 'error',
      'import/extensions': [
        'error',
        'ignorePackages',
        {js: 'never', ts: 'never', vue: 'always'},
      ],

      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      'prettier/prettier': ['error', prettierRules],
    },

  },
]
