import { isValidDate } from './dates'
import { normalizeMoney } from './money'

export function requiredText(value, { maxLength = '', label = 'Field' } = {}) {
  if (typeof value !== 'string' || !value.trim()) return `${label} wajib diisi.`
  if (maxLength && value.trim().length > maxLength) {
    return `${label} terlalu panjang.`
  }

  return null
}

/** Validates the client-side transaction draft and preserves exact money strings. */
export function validateTransactionDraft(draft) {
  const errors = {}
  const amount = normalizeMoney(draft.amount)

  if (!isValidDate(draft.transaction_date)) {
    errors.transaction_date = 'Tanggal tidak valid.'
  }
  if (!['income', 'expense'].includes(draft.type)) {
    errors.type = 'Tipe transaksi tidak valid.'
  }
  if (!draft.category_id) {
    errors.category_id = 'Kategori wajib dipilih.'
  }
  if (!amount) {
    errors.amount = 'Jumlah harus lebih dari nol dengan maksimal dua desimal.'
  }

  const titleError = requiredText(draft.title, { maxLength: 200, label: 'Judul' })
  if (titleError) errors.title = titleError

  return {
    errors,
    valid: Object.keys(errors).length === 0,
    value: amount ? { ...draft, amount, title: draft.title.trim() } : null,
  }
}
