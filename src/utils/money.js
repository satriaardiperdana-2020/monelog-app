const POSITIVE_MONEY = /^(0|[1-9][0-9]{0,11})([,.][0-9]{1,2})?$/
const DISPLAY_MONEY = /^-?(0|[1-9][0-9]*)(\.[0-9]{2})$/

/**
 * Validates a user-entered positive amount without converting it to a JS number.
 * The returned value is the exact API money-string format.
 */
export function normalizeMoney(value) {
  if (typeof value !== 'string') return null

  const draft = value.trim()
  if (!POSITIVE_MONEY.test(draft)) return null

  const [integer, fractional = ''] = draft.replace(',', '.').split('.')
  const cents = fractional.padEnd(2, '0')
  if (integer === '0' && cents === '00') return null

  return `${integer}.${cents}`
}

export function isValidMoney(value) {
  return normalizeMoney(value) !== null
}

function groupInteger(value) {
  let remaining = value
  const groups = []

  while (remaining.length > 3) {
    groups.unshift(remaining.slice(-3))
    remaining = remaining.slice(0, -3)
  }

  groups.unshift(remaining)
  return groups.join('.')
}

/** Formats exact API money strings without floating-point arithmetic. */
export function formatRupiah(value) {
  if (typeof value !== 'string' || !DISPLAY_MONEY.test(value)) return ''

  const negative = value.startsWith('-')
  const [integer, cents] = (negative ? value.slice(1) : value).split('.')
  return `${negative ? '-' : ''}Rp${groupInteger(integer)},${cents}`
}
