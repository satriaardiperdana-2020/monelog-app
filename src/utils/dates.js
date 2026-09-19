const DAYS_PER_MONTH = {
  '01': '31',
  '02': '28',
  '03': '31',
  '04': '30',
  '05': '31',
  '06': '30',
  '07': '31',
  '08': '31',
  '09': '30',
  '10': '31',
  '11': '30',
  '12': '31',
}

function isLeapYear(yearText) {
  const year = BigInt(yearText)
  return year % 400n === 0n || (year % 4n === 0n && year % 100n !== 0n)
}

/** Validates an ISO calendar date without parsing it in the browser timezone. */
export function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const year = value.slice(0, 4)
  const month = value.slice(5, 7)
  const day = value.slice(8, 10)
  if (year === '0000' || !DAYS_PER_MONTH[month] || day < '01') return false

  const maximumDay = month === '02' && isLeapYear(year) ? '29' : DAYS_PER_MONTH[month]
  return day <= maximumDay
}

export function formatDate(value, locale = 'id') {
  if (!isValidDate(value)) return ''

  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'id-ID', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00.000Z`))
}

export function formatIndonesianDate(value) {
  return formatDate(value, 'id')
}

/** Returns an earlier calendar date without interpreting the input in local time. */
export function daysBefore(value, days) {
  if (!isValidDate(value)) return ''

  const date = new Date(`${value}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() - days)
  return date.toISOString().slice(0, 10)
}

/** Returns YYYY-MM-DD for an instant in the signed-in user's IANA timezone. */
export function todayInTimezone(timezone, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: timezone,
  }).formatToParts(now)
  const valueFor = (type) => parts.find((part) => part.type === type)?.value

  return `${valueFor('year')}-${valueFor('month')}-${valueFor('day')}`
}
