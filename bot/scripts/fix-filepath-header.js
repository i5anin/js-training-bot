import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PROJECT_ROOT = path.resolve(__dirname, '..')
const SRC_ROOT = path.join(PROJECT_ROOT, 'src')

const EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.vue'])

const FILEPATH_TAG = '@FilePath:'
const HEADER_START = '/**'
const HEADER_END = '*/'

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)))
      continue
    }

    if (entry.isFile() && EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath)
    }
  }

  return files
}

function toPosix(p) {
  return p.split(path.sep).join('/')
}

function normalizeLineEndings(s) {
  return s.replace(/\r\n/g, '\n')
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getExpectedFilePath(fileAbsolutePath) {
  const relativeFromSrc = path.relative(SRC_ROOT, fileAbsolutePath)
  return `src/${toPosix(relativeFromSrc)}`
}

function findFirstBlockComment(content) {
  const startIdx = content.indexOf(HEADER_START)
  if (startIdx !== 0) return null

  const endIdx = content.indexOf(HEADER_END)
  if (endIdx === -1) return null

  return {
    startIdx,
    endIdx: endIdx + HEADER_END.length,
    block: content.slice(startIdx, endIdx + HEADER_END.length)
  }
}

function buildHeader(expectedFilePath) {
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  return `/**\n * ${FILEPATH_TAG} ${expectedFilePath}\n * @LastEditTime: ${now}\n */\n`
}

/**
 * Удаляет строку вида `// #...` сразу после хедера,
 * но только если хедер содержит `@FilePath:`.
 */
function removeLegacyPathLineAfterHeader(content) {
  const normalized = normalizeLineEndings(content)
  const firstBlock = findFirstBlockComment(normalized)
  if (!firstBlock) return { updated: normalized, changed: false }

  if (!firstBlock.block.includes(FILEPATH_TAG)) {
    return { updated: normalized, changed: false }
  }

  const afterHeader = normalized.slice(firstBlock.endIdx)

  const match = afterHeader.match(/^\s*\n*(\/\/\s*#.*\n)/)
  if (!match) return { updated: normalized, changed: false }

  const updated =
    normalized.slice(0, firstBlock.endIdx) + afterHeader.replace(match[0], '\n')

  return { updated, changed: true }
}

function updateOrInsertHeader(content, expectedFilePath) {
  const normalized = normalizeLineEndings(content)
  const firstBlock = findFirstBlockComment(normalized)

  // 1) Нет блока в начале — вставляем хедер
  if (!firstBlock) {
    const withHeader = buildHeader(expectedFilePath) + normalized
    const cleaned = removeLegacyPathLineAfterHeader(withHeader)
    return { updated: cleaned.updated, changed: true }
  }

  const block = firstBlock.block

  // 2) Блок есть, но в нём нет @FilePath — заменяем блок на правильный хедер
  if (!block.includes(FILEPATH_TAG)) {
    const rest = normalized.slice(firstBlock.endIdx).replace(/^\n+/, '')
    const withHeader = buildHeader(expectedFilePath) + rest
    const cleaned = removeLegacyPathLineAfterHeader(withHeader)
    return { updated: cleaned.updated, changed: true }
  }

  // 3) Блок есть и содержит @FilePath — обновляем путь внутри блока
  const updatedBlock = block.replace(
    new RegExp(`\\*\\s+${escapeRegExp(FILEPATH_TAG)}\\s+.*`, 'g'),
    `* ${FILEPATH_TAG} ${expectedFilePath}`
  )

  const updated = updatedBlock + normalized.slice(firstBlock.endIdx)

  // 4) Удаляем legacy `// #...` после блока (если есть)
  const cleaned = removeLegacyPathLineAfterHeader(updated)

  const changed = updated !== normalized || cleaned.changed

  return { updated: cleaned.updated, changed }
}

async function updateFile(filePath) {
  const original = await fs.readFile(filePath, 'utf8')
  const expectedFilePath = getExpectedFilePath(filePath)

  const { updated, changed } = updateOrInsertHeader(original, expectedFilePath)
  if (!changed) return { changed: false }

  await fs.writeFile(filePath, updated, 'utf8')
  return { changed: true }
}

async function main() {
  try {
    await fs.access(SRC_ROOT)
  } catch {
    throw new Error(`Каталог src не найден: ${SRC_ROOT}`)
  }

  const files = await walk(SRC_ROOT)

  let scanned = 0
  let updated = 0

  for (const filePath of files) {
    scanned += 1
    const result = await updateFile(filePath)
    if (result.changed) {
      updated += 1
      console.log(`✔ fixed: ${path.relative(PROJECT_ROOT, filePath)}`)
    }
  }

  console.log(`\nDone. Scanned: ${scanned}, Updated: ${updated}`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exitCode = 1
})
