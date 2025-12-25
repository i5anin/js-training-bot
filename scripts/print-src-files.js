import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PROJECT_ROOT = path.resolve(__dirname, '..')
const SRC_ROOT = path.join(PROJECT_ROOT, 'src')

const EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.vue'])

const toPosix = (p) => p.split(path.sep).join('/')

const isTargetFile = (fileName) => EXTENSIONS.has(path.extname(fileName))

async function ensureDirectoryExists(dirPath) {
  try {
    const stat = await fs.stat(dirPath)
    if (!stat.isDirectory()) {
      throw new Error(`Путь существует, но не является директорией: ${dirPath}`)
    }
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error(`Каталог src не найден: ${dirPath}`)
    }
    throw error
  }
}

async function readDirectoryEntries(dirPath) {
  return fs.readdir(dirPath, { withFileTypes: true })
}

async function collectFiles(dirPath) {
  const entries = await readDirectoryEntries(dirPath)
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)))
      continue
    }

    if (entry.isFile() && isTargetFile(entry.name)) {
      files.push(fullPath)
    }
  }

  return files
}

async function printFileContent(filePath) {
  const content = await fs.readFile(filePath, 'utf8')
  process.stdout.write(content)
  if (!content.endsWith('\n')) process.stdout.write('\n')
}

function printFileHeader(relativePath) {
  process.stdout.write(`\n=== ${toPosix(relativePath)} ===\n\n`)
}

async function main() {
  await ensureDirectoryExists(SRC_ROOT)

  const files = await collectFiles(SRC_ROOT)

  for (const filePath of files) {
    const relativePath = path.relative(SRC_ROOT, filePath)
    printFileHeader(relativePath)
    await printFileContent(filePath)
  }

  process.stdout.write(`\nTotal files: ${files.length}\n`)
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exitCode = 1
})
