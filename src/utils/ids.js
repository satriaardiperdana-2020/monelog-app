const INT64_MAX_TEXT = '9223372036854775807'

function isCanonicalPositiveInteger(value) {
  return /^[1-9][0-9]*$/.test(value)
}

export function isBigintId(value) {
  if (typeof value === 'number') return Number.isSafeInteger(value) && value > 0
  if (typeof value !== 'string' || !isCanonicalPositiveInteger(value)) return false

  return value.length < INT64_MAX_TEXT.length
    || (value.length === INT64_MAX_TEXT.length && value <= INT64_MAX_TEXT)
}

export function bigintIdPath(value) {
  if (!isBigintId(value)) throw new TypeError('ID harus berupa bigint positif.')
  return String(value)
}

export function createClientRequestId() {
  const words = new Uint32Array(2)
  crypto.getRandomValues(words)

  // JSON has no bigint primitive. Restrict generated IDs to the positive,
  // exactly representable integer range while retaining 53 random bits.
  const value = (words[0] & 0x1fffff) * 0x100000000 + words[1]
  return value || 1
}
