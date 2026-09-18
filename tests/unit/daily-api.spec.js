import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ request: vi.fn() }))
vi.mock('../../src/services/http', () => ({ request: mocks.request }))

import { listDailySummaries } from '../../src/services/api/daily-api'

afterEach(() => mocks.request.mockReset())

describe('daily API', () => {
  it('requests server daily summaries with cursor metadata intact', async () => {
    mocks.request.mockResolvedValue({ data: [], page: { next_cursor: null } })

    await listDailySummaries({
      cursor: 'next-page',
      endDate: '2026-09-18',
      limit: 20,
      startDate: '2026-08-20',
    })

    expect(mocks.request).toHaveBeenCalledWith(
      '/daily-summaries?limit=20&cursor=next-page&start_date=2026-08-20&end_date=2026-09-18',
      { signal: undefined, unwrapData: false },
    )
  })
})
