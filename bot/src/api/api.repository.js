/**
 * @FilePath: src/api/api.repository.js
 * @LastEditTime: 2025-12-24 09:55:59
 */
import axios from 'axios'
import { startOfMonth, endOfMonth, format } from 'date-fns'

/**
 * @summary Унифицированный HTTP-запрос к внешним API.
 * @description Обёртка над axios: при успехе возвращает `response.data`, при ошибке логирует и возвращает `null`.
 * @param {string} url Полный URL эндпоинта.
 * @param {'get'|'post'|'put'|'patch'|'delete'} [method='get'] HTTP-метод.
 * @param {Record<string, any>} [data={}] Тело запроса для методов с телом.
 * @param {Record<string, any>} [params={}] Query-параметры.
 * @returns {Promise<any|null>} Данные ответа (`response.data`) или `null` при ошибке сети/протокола.
 * @throws {never} Исключения наружу не пробрасываются — вместо этого возвращается `null`.
 * @example
 * const res = await performRequest(`${global.WEB_API}/users/check.php`, 'get', {}, { id: 1, key: process.env.SECRET_KEY })
 * if (res === null) { /* обработать сетевую ошибку *\/ }
 * @since 2025.10
 */
async function performRequest(url, method = 'get', data = {}, params = {}) {
  try {
    const response = await axios({ method, url, data, params })
    return response.data
  } catch (error) {
    console.error(`Ошибка при запросе к ${url}: ${error.message}`)
    return null
  }
}

/**
 * @summary Получение расширенной информации о сотруднике.
 * @description Обращается к `comment/get_oper_info_for_master.php` и возвращает сырые данные по `user_id`.
 * @param {number|string} userId Идентификатор пользователя.
 * @returns {Promise<any>} Сырые данные ответа бэкенда.
 * @throws {Error} Если ответ `null` (ошибка сети/сервера) или пустой.
 * @example
 * const details = await getUserDetails(123)
 * @since 2025.10
 */
async function getUserDetails(userId) {
  const url = `${global.WEB_API}/comment/get_oper_info_for_master.php`
  const params = { user_id: userId, key: process.env.SECRET_KEY }

  const data = await performRequest(url, 'get', {}, params)
  if (data) return data
  throw new Error('Нет данных о сотрудниках')
}

/**
 * @summary Получение метрик «нач».
 * @description Запрашивает `/metrics/get_nach.php`. В случае ошибки отправляет лог и пробрасывает исключение.
 * @returns {Promise<any>} Данные метрик.
 * @throws {Error} При сетевой/серверной ошибке.
 * @example
 * const metrics = await getMetricsNach()
 * @since 2025.10
 */
async function getMetricsNach() {
  const url = `${global.WEB_API}/metrics/get_nach.php`
  const params = { key: SECRET_KEY } // см. замечания ниже

  try {
    const response = await axios.get(url, { params })
    return response.data
  } catch (error) {
    const logMessageToSend = {
      user_id: '',
      text: error.toString(),
      error: 1,
      ok: 0,
      test: process.env.NODE_ENV === 'production' ? 0 : 1
    }
    await sendLogData(logMessageToSend)
    console.error(
      `Ошибка при получении данных из endpoint /metrics/get_nach.php: ${error.message}`
    )
    throw error
  }
}

/**
 * @summary Отправка лог-сообщения на внешний сервис.
 * @description Валидирует вход, выставляет `ok/error/test` по умолчанию и отправляет `POST` на `/log/log.php`.
 * @param {{user_id: number|string, text: string, ok?: 0|1, error?: 0|1, test?: 0|1}} logData Данные лога.
 * @returns {Promise<void>} Ничего не возвращает.
 * @throws {never} Ошибки сети логируются, но не пробрасываются.
 * @example
 * await sendLogData({ user_id: 42, text: 'Ошибка парсинга', ok: 0 })
 * @since 2025.10
 */
async function sendLogData(logData) {
  if (!logData.user_id || !logData.text) {
    console.warn('[LOG] Данные для логирования отсутствуют, отправка отменена.')
    return
  }

  const isOkDefined = 'ok' in logData
  logData.ok = isOkDefined ? logData.ok : 1
  logData.error = isOkDefined ? (logData.ok === 1 ? 0 : 1) : 0
  logData.test = logData.test ?? Number(process.env.NODE_ENV !== 'production')

  try {
    const response = await axios.post(`${global.WEB_API}/log/log.php`, logData)
    if (response.status !== 200) {
      console.log('Сервер вернул ошибку:', response.status, response.data)
    }
  } catch (error) {
    console.error('Ошибка при отправке лога на внешний ресурс:', error)
  }
}

/**
 * @summary Получение метрик «мастер».
 * @description Запрашивает `/metrics/get_master.php`. При ошибке — логирует и пробрасывает исключение.
 * @returns {Promise<any>} Данные метрик.
 * @throws {Error} При сетевой/серверной ошибке.
 * @example
 * const metrics = await getMetricsMaster()
 * @since 2025.10
 */
async function getMetricsMaster() {
  const url = `${global.WEB_API}/metrics/get_master.php`
  const params = { key: SECRET_KEY } // см. замечания ниже
  try {
    const response = await axios.get(url, { params })
    return response.data
  } catch (error) {
    console.error(
      `Ошибка при получении данных с эндпоинта /metrics/get_master.php: ${error.message}`
    )
    throw error
  }
}

/**
 * @summary Получение агрегированных метрик из FACTORIO-API.
 * @description Делает GET на `${global.FACTORIO_API}/tg_metrics` с фиксированным `client_host`.
 * @returns {Promise<Record<string, any>>} Объект метрик, пустой объект при отсутствии данных.
 * @throws {Error} Пробрасывает ошибки axios.
 * @example
 * const tg = await fetchMetrics()
 * @since 2025.10
 */
async function fetchMetrics() {
  const url = `${global.FACTORIO_API}/tg_metrics`
  const params = { client_host: 'soft.pfforum' }
  const response = await axios.get(url, { params })
  return response.data || {}
}

/**
 * @summary Проверка состояния Bot по дате и инстансу.
 * @description Обращается к `/bot/check.php` через унифицированный `performRequest`.
 * @param {string} formattedDateTime Дата/время в формате, ожидаемом бэкендом.
 * @param {number} instanceNumber Уникальный номер инстанса.
 * @returns {Promise<any|null>} Данные ответа или `null` при сетевой ошибке.
 * @throws {never} Ошибки не пробрасываются наружу.
 * @example
 * const res = await checkBotData('2025-10-31 10:00:00', 2)
 * @since 2025.10
 */
async function checkBotData(formattedDateTime, instanceNumber) {
  const url = `${global.WEB_API}/bot/check.php`;
  const params = {
    key: SECRET_KEY, // см. замечания ниже
    date: formattedDateTime,
    random_key: instanceNumber
  };
  return await performRequest(url, 'get', {}, params);
}

/**
 * @summary Обновление состояния Bot по дате и инстансу.
 * @description Обращается к `/bot/update.php` через унифицированный `performRequest`.
 * @param {string} formattedDateTime Дата/время в формате, ожидаемом бэкендом.
 * @param {number} instanceNumber Уникальный номер инстанса.
 * @returns {Promise<any|null>} Данные ответа или `null` при сетевой ошибке.
 * @throws {never} Ошибки не пробрасываются наружу.
 * @example
 * await updateBotData('2025-10-31 10:05:00', 2)
 * @since 2025.10
 */
async function updateBotData(formattedDateTime, instanceNumber) {
  const url = `${global.WEB_API}/bot/update.php`
  const params = {
    key: SECRET_KEY, // см. замечания ниже
    date: formattedDateTime,
    random_key: instanceNumber
  }
  return await performRequest(url, 'get', {}, params)
}

/**
 * @summary Получение списка всех пользователей (ФИО).
 * @description Делает GET на `/users/get_all_fio.php`.
 * @returns {Promise<any|null>} Массив пользователей или `null` при сетевой ошибке.
 * @throws {never}
 * @example
 * const users = await getAllUsers()
 * @since 2025.10
 */
async function getAllUsers() {
  const url = `${global.WEB_API}/users/get_all_fio.php`
  const params = { key: SECRET_KEY } // см. замечания ниже
  return await performRequest(url, 'get', {}, params)
}

/**
 * @summary Проверка существования пользователя по chatId.
 * @description Делает GET на `/users/check.php`.
 * @param {number|string} chatId Идентификатор чата/пользователя.
 * @returns {Promise<any|null>} Данные по пользователю или `null` при сетевой ошибке.
 * @throws {never}
 * @example
 * const exists = await checkUser(987654321)
 * @since 2025.10
 */
async function checkUser(chatId) {
  const url = `${global.WEB_API}/users/check.php`
  const params = {
    id: chatId,
    key: SECRET_KEY // см. замечания ниже
  }
  return await performRequest(url, 'get', {}, params)
}

/**
 * @summary Добавление нового пользователя.
 * @description Делает GET на `/users/add.php` с указанием ФИО, username и статуса `active=1`.
 * @param {number|string} userId Идентификатор пользователя.
 * @param {string} cleanedText ФИО в требуемом формате.
 * @param {string} username Username (без `@`).
 * @returns {Promise<any|null>} Результат операции или `null` при сетевой ошибке.
 * @throws {never}
 * @example
 * await addUser(123, 'Иванов Иван Иванович', 'ivanovii')
 * @since 2025.10
 */
async function addUser(userId, cleanedText, username) {
  const url = `${global.WEB_API}/users/add.php`
  const params = {
    id: userId,
    fio: cleanedText,
    username: username,
    active: 1,
    key: SECRET_KEY // см. замечания ниже
  }
  return await performRequest(url, 'get', {}, params)
}

/**
 * @summary Получение всех комментариев.
 * @description Делает GET на `/comment/get_all.php`.
 * @returns {Promise<any|null>} Массив комментариев или `null` при сетевой ошибке.
 * @throws {never}
 * @example
 * const comments = await getAllComments()
 * @since 2025.10
 */
async function getAllComments() {
  const url = `${global.WEB_API}/comment/get_all.php`
  const params = { key: SECRET_KEY } // см. замечания ниже
  return await performRequest(url, 'get', {}, params)
}

/**
 * @summary Обновление комментария или отметка «отправлено».
 * @description Если `commentText` задан — обновляет текст `comments_op`. Если нет — выставляет `sent=1`.
 * @param {number|string} taskID Идентификатор задачи.
 * @param {string|null} [commentText=null] Текст комментария для обновления.
 * @returns {Promise<any|null>} Результат операции или `null` при сетевой ошибке.
 * @throws {never}
 * @example
 * await updateComment(55, 'Готово к проверке')
 * await updateComment(55) // пометить как отправлено
 * @since 2025.10
 */
async function updateComment(taskID, commentText = null) {
  const url = `${global.WEB_API}/comment/update.php`
  const params = {
    id_task: taskID,
    key: SECRET_KEY, // см. замечания ниже
    ...(commentText ? { comments_op: commentText } : { sent: 1 })
  }
  return await performRequest(url, 'get', {}, params)
}

/**
 * @summary Получение всех платежей.
 * @description В проде обращается к `/oplata/get_all.php`, в dev — к `/oplata/get_all_test.php`.
 * @returns {Promise<any|null>} Массив платежей или `null` при сетевой ошибке.
 * @throws {never}
 * @example
 * const payments = await getAllPayments()
 * @since 2025.10
 */
async function getAllPayments() {
  const basePath =
    process.env.NODE_ENV === 'production' ? 'get_all.php' : 'get_all_test.php'
  const url = `${global.WEB_API}/oplata/${basePath}`
  const params = {
    key: SECRET_KEY // см. замечания ниже
  }
  return await performRequest(url, 'get', {}, params)
}

/**
 * @summary Обновление статусов платежей по списку идентификаторов.
 * @description В проде обращается к `/oplata/update.php`, в dev — к `/oplata/update_test.php`.
 * @param {Array<number|string>} sentIds Список ID платежей для отметки.
 * @returns {Promise<any|null>} Результат операции или `null` при сетевой ошибке.
 * @throws {never}
 * @example
 * await updatePayments([101, 102, 103])
 * @since 2025.10
 */
async function updatePayments(sentIds) {
  const basePath =
    process.env.NODE_ENV === 'production' ? 'update.php' : 'update_test.php'
  const url = `${global.WEB_API}/oplata/${basePath}`
  const params = {
    key: SECRET_KEY, // см. замечания ниже
    sent_ids: sentIds.join(',')
  }
  return await performRequest(url, 'get', {}, params)
}

/**
 * @summary Фиксация данных фото-контроля.
 * @description Делает GET на `/photo/add.php` с параметрами партии, пользователя, комментария ОТК и локации.
 * @param {number|string} userId Идентификатор пользователя.
 * @param {string} party Партия/смена/заказ.
 * @param {string} commentsOtk Комментарий ОТК.
 * @param {string} location Локация/цех/участок.
 * @returns {Promise<any|null>} Результат операции или `null` при сетевой ошибке.
 * @throws {never}
 * @example
 * await addPhotoData(123, 'Партия-77', 'ОК', 'Цех-3')
 * @since 2025.10
 */
async function addPhotoData(userId, party, commentsOtk, location) {
  const url = `${global.WEB_API}/photo/add.php`
  const params = {
    party,
    user_id: userId,
    comments_otk: commentsOtk,
    location,
    key: SECRET_KEY // см. замечания ниже
  }
  return await performRequest(url, 'get', {}, params)
}

/**
 * @summary Получение всех мастеров.
 * @description Делает GET на `/comment/master.php` без `user_id`, возвращает список мастеров.
 * @returns {Promise<any[]>} Непустой массив мастеров.
 * @throws {Error} Если данных нет или пусто.
 * @example
 * const masters = await getAllMasters()
 * @since 2025.10
 */
async function getAllMasters() {
  const url = `${global.WEB_API}/comment/master.php`
  const params = { key: process.env.SECRET_KEY }

  const data = await performRequest(url, 'get', {}, params)
  if (data && data.length > 0) {
    return data
  } else {
    throw new Error('Нет данных о мастерах')
  }
}

/**
 * @summary Диапазон дат текущего месяца в формате `yyyy-MM-dd`.
 * @description Вычисляет первый и последний день текущего месяца и форматирует даты.
 * @returns {{from: string, to: string}} Объект с полями `from` и `to`.
 * @throws {never}
 * @example
 * const { from, to } = getCurrentMonthRange()
 * @since 2025.10
 */
function getCurrentMonthRange() {
  const now = new Date()
  return {
    from: format(startOfMonth(now), 'yyyy-MM-dd'),
    to: format(endOfMonth(now), 'yyyy-MM-dd')
  }
}

/**
 * @summary Аналитика смен для пользователя за текущий месяц.
 * @description Делает GET на `${FACTORIO_API}/smena_analyze` с `from/to` текущего месяца и фиксированным `client_host`.
 * @param {number|string} userId Идентификатор пользователя.
 * @returns {Promise<any|null>} Данные аналитики или `null` при сетевой ошибке.
 * @throws {never}
 * @example
 * const report = await getSmenaAnalyze(321)
 * @since 2025.10
 */
async function getSmenaAnalyze(userId) {
  const { from, to } = getCurrentMonthRange()
  const url = `${FACTORIO_API}/smena_analyze` // см. замечания ниже
  const params = {
    from,
    to,
    client_host: 'soft.pfforum',
    user_id: userId
  }

  console.log(`📡 Отправка запроса: ${url}?${new URLSearchParams(params)}`)
  return await performRequest(url, 'get', {}, params)
}

export {
  getSmenaAnalyze,
  getAllMasters,
  checkBotData,
  updateBotData,
  getAllUsers,
  checkUser,
  addUser,
  getAllComments,
  updateComment,
  getAllPayments,
  updatePayments,
  fetchMetrics,
  addPhotoData,
  getMetricsMaster,
  getMetricsNach,
  sendLogData,
  getUserDetails
}
