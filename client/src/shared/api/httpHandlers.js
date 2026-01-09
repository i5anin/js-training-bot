import axios from 'axios'

/**
 * @template T
 * @param {import('axios').AxiosResponse<T>} response
 * @returns {T}
 */
export const handleResponse = (response) => response.data

/**
 * @param {unknown} error
 * @throws {Error}
 */
export const handleApiError = (error) => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const data = error.response?.data
    const message = normalizeMessage(data) ?? error.message

    throw new Error(status ? `API ${status}: ${message}` : `API: ${message}`)
  }

  if (error instanceof Error) {
    throw error
  }

  throw new Error('Unknown API error')
}

/**
 * @param {unknown} data
 * @returns {string | null}
 */
const normalizeMessage = (data) => {
  if (!data) return null
  if (typeof data === 'string') return data
  if (typeof data === 'object') {
    const maybeMessage = data.message
    if (typeof maybeMessage === 'string') return maybeMessage
  }
  return null
}
