// eslint.config.js
import js from '@eslint/js'
import globals from './eslint.globals.js'
import importPlugin from 'eslint-plugin-import'
import boundaries from 'eslint-plugin-boundaries'
import unusedImports from 'eslint-plugin-unused-imports'
import jsdoc from 'eslint-plugin-jsdoc'
import prettier from 'eslint-config-prettier'
import nPlugin from 'eslint-plugin-n'
import unicorn from 'eslint-plugin-unicorn'
import github from 'eslint-plugin-github'

/**
 * Единый канон суффиксов (ТОЛЬКО в единственном числе).
 * Плюрализация запрещена намеренно: util, commands, services, handlers и т.д. НЕ поддерживаются.
 */
const SUFFIXES =
  '(?:module|service|controller|handler|repository|dto|entity|gateway|middleware|guard|pipe|filter|interceptor|factory|mapper|adapter|cron|command|registry|constants|utils|config|resolver|schema|scalar|strategy|subscriber|provider|processor|queue|model|health|input|listener|dataloader|decorator|e2e|type)'

/**
 * Канон имен файлов в src/**
 * Разрешаем:
 * - index.js | main.js | bootstrap.js
 * - kebab-case.js
 * - kebab-case.<suffix>.js, где suffix ∈ SUFFIXES
 *
 * Важно: расширение .js не входит в regex github/filenames-match-regex,
 * потому что правило проверяет basename файла (без .js).
 */
const SRC_FILENAME_REGEX = `^(?:index|main|bootstrap|[a-z0-9]+(?:-[a-z0-9]+)*(?:\\.${SUFFIXES})?)$`

/**
 * Канон для shared/**:
 * - kebab-case
 * - kebab-case.utils
 */
const SHARED_FILENAME_REGEX = `^[a-z0-9]+(?:-[a-z0-9]+)*(?:\\.(?:utils|service|repository|gateway|adapter|mapper|factory|controller|handler|decorator|provider|type|model|resolver|schema))?$`

/**
 * Канон для config/constants:
 * - kebab-case
 * - kebab-case.constants
 */
const CONSTANTS_FILENAME_REGEX = '^[a-z0-9]+(?:-[a-z0-9]+)*(?:\\.constants)?$'

const common = {
  files: ['**/*.js'],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    globals
  },
  plugins: {
    import: importPlugin,
    boundaries,
    'unused-imports': unusedImports,
    jsdoc,
    n: nPlugin,
    unicorn,
    github
  },
  settings: {
    'n/version': '>=20.10.0',
    'import/resolver': {
      node: {
        extensions: ['.js', '.mjs', '.json'],
        paths: ['.']
      },
      alias: {
        map: [
          ['#src', './src'],
          ['@', './src']
        ],
        extensions: ['.js', '.mjs', '.json']
      }
    },
    'boundaries/elements': [
      { type: 'shared', pattern: 'shared/*' },
      { type: 'entities', pattern: 'entities/*' },
      { type: 'features', pattern: 'features/*' },
      { type: 'widgets', pattern: 'widgets/*' },
      { type: 'pages', pattern: 'pages/*' },
      { type: 'app', pattern: 'app/*' }
    ],
    jsdoc: { mode: 'typescript' }
  },
  rules: {
    ...js.configs.recommended.rules,

    'no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_'
      }
    ],

    'import/named': 'error',
    'import/no-unresolved': 'error',
    'import/no-extraneous-dependencies': 'error',

    'no-console': 'off',
    'no-debugger': 'off',

    'boundaries/no-private': 'error',
    'boundaries/element-types': [
      'error',
      {
        default: 'disallow',
        rules: [
          {
            from: 'app',
            allow: ['pages', 'widgets', 'features', 'entities', 'shared']
          },
          {
            from: 'pages',
            allow: ['widgets', 'features', 'entities', 'shared']
          },
          { from: 'widgets', allow: ['features', 'entities', 'shared'] },
          { from: 'features', allow: ['entities', 'shared'] },
          { from: 'entities', allow: ['shared'] },
          { from: 'shared', allow: ['shared'] }
        ]
      }
    ],

    'require-await': 'error',
    'n/no-unsupported-features/es-builtins': 'error',
    'no-sync': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'warn',

    /**
     * unicorn/filename-case проверяет кейс (kebabCase),
     * но не умеет ограничивать суффиксы.
     * Поэтому суффиксы контролирует github/filenames-match-regex.
     */
    'unicorn/filename-case': [
      'error',
      {
        case: 'kebabCase',
        ignore: [
          '^index\\.js$',
          '^main\\.js$',
          '^bootstrap\\.js$',
          '^eslint\\.config\\.js$',
          '^eslint\\.globals\\.js$'
        ]
      }
    ]
  }
}

const namingRules = [
  /**
   * 1) Базовое правило для src/**
   */
  {
    files: ['src/**/*.js'],
    rules: {
      'github/filenames-match-regex': ['error', SRC_FILENAME_REGEX]
    }
  },

  /**
   * 2) shared/** — только .utils как разрешённый суффикс
   */
  {
    files: [
      'src/shared/lib/**/*.js',
      'src/shared/format/**/*.js',
      'src/shared/utils/**/*.js'
    ],
    rules: {
      'github/filenames-match-regex': ['error', SHARED_FILENAME_REGEX]
    }
  },

  /**
   * 3) config/constants — только .constants как разрешённый суффикс
   */
  {
    files: ['src/**/config/*.js', 'src/**/constants/*.js'],
    rules: {
      'github/filenames-match-regex': ['error', CONSTANTS_FILENAME_REGEX]
    }
  }
]

export default [common, ...namingRules, prettier]
