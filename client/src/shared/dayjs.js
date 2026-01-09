import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

const MOSCOW_TZ = 'Europe/Moscow'
const DATE_TIME_FMT = 'DD.MM.YYYY, HH:mm'
const DATE_KEY_FMT = 'YYYY-MM-DD'

const toMoscowDayjs = (iso) => {
  if (!iso) return null

  const d = dayjs(iso)
  if (!d.isValid()) return null

  return d.tz(MOSCOW_TZ)
}

const formatIso = (iso) => {
  const d = toMoscowDayjs(iso)
  return d ? d.format(DATE_TIME_FMT) : iso || '-'
}

const formatDateKey = (iso) => {
  const d = toMoscowDayjs(iso)
  return d ? d.format(DATE_KEY_FMT) : ''
}

export { dayjs, toMoscowDayjs, formatIso, formatDateKey }

