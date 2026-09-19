import { isValidDate } from './dates'
import { translate } from '../i18n'
import { normalizeMoney } from './money'

export function requiredText(value, { maxLength = '', label = 'Field' } = {}) {
  if (typeof value !== 'string' || !value.trim()) return `${label} wajib diisi.`
  if (maxLength && value.trim().length > maxLength) {
    return `${label} terlalu panjang.`
  }

  return null
}

/** Validates the client-side transaction draft and preserves exact money strings. */
export function validateTransactionDraft(draft, locale = 'id') {
  const errors = {}
  const amount = normalizeMoney(draft.amount)

  if (!isValidDate(draft.transaction_date)) {
    errors.transaction_date = translate(locale, 'invalidDate')
  }
  if (!['income', 'expense'].includes(draft.type)) {
    errors.type = translate(locale, 'invalidType')
  }
  if (!draft.category_id) {
    errors.category_id = translate(locale, 'requiredCategory')
  }
  if (!amount) {
    errors.amount = translate(locale, 'invalidAmount')
  }

  const titleError = requiredText(draft.title, { maxLength: 200, label: 'Judul' })
  if (titleError) errors.title = titleError

  return {
    errors,
    valid: Object.keys(errors).length === 0,
    value: amount ? { ...draft, amount, title: draft.title.trim() } : null,
  }
}
