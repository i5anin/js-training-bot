/**
 * @FilePath: src/shared/api/api-client.service.js
 * @LastEditTime: 2025-12-24 09:55:59
 */
import axios from 'axios'

/**
 * @summary Базовый экземпляр Axios для Factorio API.
 * @description Автоматически подставляет BASE URL из переменной окружения FACTORIO_API.
 * Настраивается с таймаутом и JSON-заголовками.
 * @type {import('axios').AxiosInstance}
 * @example
 * const res = await axiosInstance.get('/ping')
 */
export const axiosInstance = axios.create({
  baseURL: process.env.FACTORIO_API,
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

/**
 * @summary Унифицированный обработчик успешного HTTP-ответа.
 * @description Возвращает `response.data`, если код статуса в диапазоне 200–299.
 * Бросает ошибку, если код статуса вне диапазона.
 * @param {import('axios').AxiosResponse} response Ответ Axios.
 * @returns {any} Полезная нагрузка ответа.
 * @throws {Error} Если код статуса неуспешный или отсутствует `data`.
 * @example
 * const data = handleResponse(await axiosInstance.get('/users'));
 */
export function handleResponse(response) {
  if (!response || typeof response.status !== 'number') {
    throw new Error('handleResponse: отсутствует корректный объект ответа')
  }
  if (response.status < 200 || response.status >= 300) {
    const msg = `HTTP ${response.status}: ${response.statusText || 'ошибка'}`
    throw new Error(`handleResponse: ${msg}`)
  }
  return response.data ?? null
}

/**
 * @summary Унифицированный обработчик ошибок Axios.
 * @description Формирует осмысленное сообщение для логов и пробрасывает исключение.
 * Поддерживает ошибки сети, таймаута и ответы сервера с кодом вне 2xx.
 * @param {unknown} error Ошибка из Axios или неизвестный объект.
 * @returns {never} Бросает Error с читаемым текстом.
 * @throws {Error} Всегда — для единообразия цепочек .catch(handleApiError).
 * @example
 * axiosInstance.get('/x').catch(handleApiError);
 */
export function handleApiError(error) {
  if (error && typeof error === 'object' && 'response' in error) {
    const resp = /** @type {import('axios').AxiosError} */ (error).response
    const status = resp?.status ?? 'нет кода'
    const msg = resp?.data?.message || resp?.statusText || 'Неизвестная ошибка API'
    throw new Error(`Ошибка API: ${status} — ${msg}`)
  }

  if (error && typeof error === 'object' && 'request' in error) {
    throw new Error('Ошибка сети или таймаут при запросе к API')
  }

  if (error instanceof Error) {
    throw new Error(`Ошибка выполнения: ${error.message}`)
  }

  throw new Error('handleApiError: получен неизвестный тип ошибки')
}
