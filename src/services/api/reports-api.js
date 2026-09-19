import { request } from '../http'

function reportQuery({ endDate, groupBy, range = 'custom', startDate }) {
  const query = new URLSearchParams({ range })

  if (range === 'custom') {
    if (startDate) query.set('start_date', startDate)
    if (endDate) query.set('end_date', endDate)
  }
  if (groupBy) query.set('group_by', groupBy)

  return query.toString()
}

function reportBasePath({ isAdmin = false, selectedUserId } = {}) {
  if (!isAdmin) return '/reports'
  if (!selectedUserId) throw new Error('Pilih pengguna terlebih dahulu.')

  return `/admin/users/${encodeURIComponent(selectedUserId)}/reports`
}

export function getReportSummary(options = {}) {
  const basePath = reportBasePath(options)
  return request(`${basePath}/summary?${reportQuery(options)}`, { signal: options.signal })
}

export function getReportBreakdown(options = {}) {
  const basePath = reportBasePath(options)
  return request(`${basePath}/breakdown?${reportQuery({ ...options, groupBy: options.groupBy || 'category' })}`, {
    signal: options.signal,
  })
}
