import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ request: vi.fn() }))
vi.mock('../../src/services/http', () => ({ request: mocks.request }))

import { getReportBreakdown, getReportSummary } from '../../src/services/api/reports-api'

afterEach(() => mocks.request.mockReset())

describe('reports API', () => {
  const range = { endDate: '2026-09-19', startDate: '2026-09-01' }

  it('uses personal report endpoints for a regular user', () => {
    getReportSummary(range)
    getReportBreakdown(range)

    expect(mocks.request).toHaveBeenNthCalledWith(
      1,
      '/reports/summary?range=custom&start_date=2026-09-01&end_date=2026-09-19',
      { signal: undefined },
    )
    expect(mocks.request).toHaveBeenNthCalledWith(
      2,
      '/reports/breakdown?range=custom&start_date=2026-09-01&end_date=2026-09-19&group_by=category',
      { signal: undefined },
    )
  })

  it('uses selected-user admin endpoints only when an ID is supplied', () => {
    getReportSummary({ ...range, isAdmin: true, selectedUserId: 'target/user' })
    getReportBreakdown({ ...range, groupBy: 'month', isAdmin: true, selectedUserId: 'target/user' })

    expect(mocks.request).toHaveBeenNthCalledWith(
      1,
      '/admin/users/target%2Fuser/reports/summary?range=custom&start_date=2026-09-01&end_date=2026-09-19',
      { signal: undefined },
    )
    expect(mocks.request).toHaveBeenNthCalledWith(
      2,
      '/admin/users/target%2Fuser/reports/breakdown?range=custom&start_date=2026-09-01&end_date=2026-09-19&group_by=month',
      { signal: undefined },
    )
  })

  it('does not fall back to personal data for an admin without a selected user', () => {
    expect(() => getReportSummary({ ...range, isAdmin: true })).toThrow('Pilih pengguna')
    expect(mocks.request).not.toHaveBeenCalled()
  })
})
