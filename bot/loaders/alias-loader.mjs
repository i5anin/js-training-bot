/**
 * @Author: sergey.isanin+github@gmail.com
 * @Date: 2025-12-24 09:59:23
 * @LastEditors: sergey.isanin+github@gmail.com
 * @LastEditTime: 2025-12-24 09:59:31
 * @FilePath: loaders/alias-loader.mjs
 * @Description: 这是默认设置,可以在设置》工具》File Description中进行配置
 */
// loaders/alias-loader.mjs
import { pathToFileURL } from 'node:url'

const SRC_ALIAS_PREFIX = '@/'
const INTERNAL_ALIAS_PREFIX = '#src/'

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith(SRC_ALIAS_PREFIX)) {
    const rewritten = INTERNAL_ALIAS_PREFIX + specifier.slice(SRC_ALIAS_PREFIX.length)
    return nextResolve(rewritten, context)
  }

  return nextResolve(specifier, context)
}
