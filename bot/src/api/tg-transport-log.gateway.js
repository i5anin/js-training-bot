/**
 * @FilePath: src/shared/api/tg-transport-log.gateway.js
 * @LastEditTime: 2025-12-24 09:55:59
 */
import { promises as fs } from 'node:fs'
import { join, resolve } from 'node:path'
import axios from 'axios'

const LOG_DIR = resolve('logs')

/**
 *
 */
async function ensureLogDir() {
  try {
    await fs.access(LOG_DIR)
  } catch {
    await fs.mkdir(LOG_DIR, { recursive: true })
  }
}

/**
 * Отправляет лог на удалённый сервер или сохраняет локально при ошибке
 * @param {object} ctx - Telegraf-контекст
 * @param {string} responseText - текст отправленного ответа (опционально)
 */
export async function logInteraction(ctx, responseText) {
  await ensureLogDir()

  const logPayload = {
    source: process.env.NODE_ENV || 'development',
    context_id: String(ctx.from?.id || ctx.chat?.id || 'unknown'),
    raw: {
      timestamp: new Date().toISOString(),
      update: ctx.update,
      response: responseText || null
    }
  }

  try {
    await axios.post(
      `${process.env.WEB_API}/log/get_logs_flex.php`,
      logPayload,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 3000
      }
    )
  } catch {
    const filename = `log_${Date.now()}.json`
    const filepath = join(LOG_DIR, filename)

    await fs.writeFile(
      filepath,
      JSON.stringify(logPayload, null, 2),
      'utf-8'
    )
  }
}