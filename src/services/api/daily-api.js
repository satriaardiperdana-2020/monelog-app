import { request } from '../http'

export function listDailySummaries({ cursor, endDate, limit = 30, signal, startDate } = {}) {
  const query = new URLSearchParams({ limit: String(limit) })
  if (cursor) query.set('cursor', cursor)
  if (startDate) query.set('start_date', startDate)
  if (endDate) query.set('end_date', endDate)

  return request(`/daily-summaries?${query}`, { signal, unwrapData: false })
}
