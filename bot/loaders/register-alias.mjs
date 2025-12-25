/**
 * @Author: sergey.isanin+github@gmail.com
 * @Date: 2025-12-24 10:12:11
 * @LastEditors: sergey.isanin+github@gmail.com
 * @LastEditTime: 2025-12-24 10:12:19
 * @FilePath: loaders/register-alias.mjs
 * @Description: 这是默认设置,可以在设置》工具》File Description中进行配置
 */
import { register } from 'node:module'
import { pathToFileURL } from 'node:url'

register('./loaders/alias-loader.mjs', pathToFileURL('./'))
