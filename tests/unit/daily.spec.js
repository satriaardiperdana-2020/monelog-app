import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const mocks = vi.hoisted(() => ({ listDailySummaries: vi.fn() }))
vi.mock('../../src/services/api/daily-api', () => ({
  listDailySummaries: mocks.listDailySummaries,
}))

import { useDailyStore } from '../../src/stores/daily'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('daily store', () => {
  it('uses server totals and supplies a zero-value today fallback', async () => {
    mocks.listDailySummaries.mockResolvedValue({
      data: [{ date: '2020-01-01', expense: '25000.00', income: '0.00' }],
      page: { next_cursor: 'cursor-2' },
    })
    const daily = useDailyStore()

    await daily.loadInitial('Asia/Jakarta')

    expect(daily.today).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(daily.summaries).toEqual([
      { date: '2020-01-01', expense: '25000.00', income: '0.00' },
    ])
    expect(daily.nextCursor).toBe('cursor-2')
    expect(mocks.listDailySummaries).toHaveBeenCalledWith(
      expect.objectContaining({ endDate: daily.today, limit: 30, startDate: daily.startDate }),
    )
    expect(daily.todaySummary).toEqual({
      date: daily.today,
      expense: '0.00',
      income: '0.00',
      difference: '0.00',
    })
  })

  it('appends cursor pages without calculating totals', async () => {
    mocks.listDailySummaries
      .mockResolvedValueOnce({
        data: [{ date: '2026-09-18', expense: '1.00', income: '2.00' }],
        page: { next_cursor: 'cursor-2' },
      })
      .mockResolvedValueOnce({
        data: [{ date: '2026-09-17', expense: '3.00', income: '4.00' }],
        page: { next_cursor: null },
      })
    const daily = useDailyStore()

    await daily.loadInitial('Asia/Jakarta')
    await daily.loadMore()

    expect(daily.summaries).toEqual([
      { date: '2026-09-18', expense: '1.00', income: '2.00' },
      { date: '2026-09-17', expense: '3.00', income: '4.00' },
    ])
    expect(mocks.listDailySummaries).toHaveBeenLastCalledWith({
      cursor: 'cursor-2',
      endDate: daily.endDate,
      limit: 30,
      startDate: daily.startDate,
    })
  })

  it('exposes a retryable error state', async () => {
    mocks.listDailySummaries.mockRejectedValue(new Error('offline'))
    const daily = useDailyStore()

    await daily.loadInitial('Asia/Jakarta')

    expect(daily.status).toBe('error')
    expect(daily.error).toBeInstanceOf(Error)
  })
})
