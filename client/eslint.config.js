import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import pluginUnusedImports from 'eslint-plugin-unused-imports'
import pluginPrettier from 'eslint-plugin-prettier'
import vueParser from 'vue-eslint-parser'
import pluginBoundaries from 'eslint-plugin-boundaries'

export default [
  {
    files: ['src/**/*.{js,ts,vue}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: 'module',
      },
      globals: globals.browser,
    },
    settings: {
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/**', mode: 'file' },
        { type: 'pages', pattern: 'src/pages/**' },
        { type: 'widgets', pattern: 'src/widgets/**', allow: ['features', 'entities', 'shared'] },
        { type: 'features', pattern: 'src/features/**', allow: ['entities', 'shared'] },
        { type: 'entities', pattern: 'src/entities/**', allow: ['shared'] },
        { type: 'shared', pattern: 'src/shared/**' },
      ],
    },
    plugins: {
      vue: pluginVue,
      '@typescript-eslint': tseslint.plugin,
      'unused-imports': pluginUnusedImports,
      prettier: pluginPrettier,
      boundaries: pluginBoundaries,
    },
    rules: {
      // 'vue/component-api-style': ['error', ['script-setup']],
      'vue/no-setup-props-destructure': 'error',
      'vue/script-setup-uses-vars': 'error',

      'boundaries/no-unknown-files': 'error',
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          message: '${file.type} is not allowed to import ${dependency.type}',
          rules: [
            {
              from: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'],
              allow: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'],
            },
          ],
        },
      ],

      'no-debugger': 'error',
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],

      'no-dupe-args': 'error',
      'no-dupe-else-if': 'error',
      'no-duplicate-imports': 'error',

      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': ['error', { ignoreDeclarationMerge: true }],

      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': ['error'],

      'prettier/prettier': [
        'error',
        {
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
        },
      ],
    },
  },

  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 2023,
        sourceType: 'module',
      },
    },
    plugins: { vue: pluginVue },
    rules: {
      ...pluginVue.configs['flat/recommended'].rules,

      'vue/no-dupe-keys': 'error',
      'vue/no-duplicate-attributes': 'error',

      'vue/attribute-hyphenation': ['warn', 'always'],
      'vue/v-on-event-hyphenation': ['warn', 'always'],
      'vue/attributes-order': 'warn',
      'vue/html-indent': ['warn', 2, { attribute: 1, baseIndent: 1, alignAttributesVertically: true }],
      'vue/max-len': [
        'warn',
        {
          code: 80,
          template: 80,
          tabWidth: 2,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
          ignoreComments: true,
        },
      ],
      'vue/multi-word-component-names': 'off',
    },
  },
]
