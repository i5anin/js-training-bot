/**
 * @Author: sergey.isanin+github@gmail.com
 * @Date: 2025-12-24 09:55:51
 * @LastEditors: sergey.isanin+github@gmail.com
 * @LastEditTime: 2025-12-24 09:55:59
 * @FilePath: src/app/replace-src-alias.js
 * @Description: 这是默认设置,可以在设置》工具》File Description中进行配置
 */
// scripts/replace-src-alias.js
import { promises as fs } from 'node:fs'
import path from 'node:path'

const ROOT_DIR = path.resolve(process.cwd(), 'src')
const EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts', '.tsx', '.vue'])

const REPLACEMENTS = [
  { from: /(['"])#src\//g, to: "$1@/" },
  { from: /(\bfrom\s+['"])#src\//g, to: "$1@/" },
  { from: /(\bimport\s+['"])#src\//g, to: "$1@/" }
]

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

function applyReplacements(content) {
  let updated = content
  for (const { from, to } of REPLACEMENTS) {
    updated = updated.replace(from, to)
  }
  return updated
}

async function updateFile(filePath) {
  const original = await fs.readFile(filePath, 'utf8')
  const updated = applyReplacements(original)

  if (updated === original) return { changed: false }

  await fs.writeFile(filePath, updated, 'utf8')
  return { changed: true }
}

async function main() {
  const files = await walk(ROOT_DIR)

  let changedCount = 0
  let scannedCount = 0

  for (const filePath of files) {
    scannedCount += 1
    const { changed } = await updateFile(filePath)
    if (changed) {
      changedCount += 1
      console.log(`✔ updated: ${path.relative(process.cwd(), filePath)}`)
    }
  }

  console.log(`\nDone. Scanned: ${scannedCount}, Updated: ${changedCount}`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exitCode = 1
})
