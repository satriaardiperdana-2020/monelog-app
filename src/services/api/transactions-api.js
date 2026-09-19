import { request } from '../http'
import { bigintIdPath } from '../../utils/ids'

export function listTransactions({ cursor, endDate, isDelete = false, limit = 30, signal, startDate } = {}) {
  const query = new URLSearchParams({ isDelete: String(isDelete), limit: String(limit) })
  if (startDate) query.set('start_date', startDate)
  if (endDate) query.set('end_date', endDate)
  if (cursor) query.set('cursor', cursor)

  return request(`/transactions?${query}`, { signal, unwrapData: false })
}

export function getTransaction(id, { isDelete = false } = {}) {
  return request(`/transactions/${bigintIdPath(id)}?isDelete=${isDelete}`)
}

export function createTransaction(payload) {
  return request('/transactions', { body: payload, method: 'POST' })
}

export function updateTransaction(id, payload) {
  return request(`/transactions/${bigintIdPath(id)}`, { body: payload, method: 'PATCH' })
}

export function deleteTransaction(id, version) {
  return request(`/transactions/${bigintIdPath(id)}`, {
    headers: { 'If-Match': `"${version}"` },
    method: 'DELETE',
  })
}

export function restoreTransaction(id, version) {
  return request(`/transactions/${bigintIdPath(id)}/restore`, {
    body: { version },
    method: 'POST',
  })
}
