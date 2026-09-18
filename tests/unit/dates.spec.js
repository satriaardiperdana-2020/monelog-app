import { describe, expect, it } from 'vitest'

import {
  daysBefore,
  formatIndonesianDate,
  isValidDate,
  todayInTimezone,
} from '../../src/utils/dates'
import { validateTransactionDraft } from '../../src/utils/validation'

describe('date and draft validation utilities', () => {
  it('validates real YYYY-MM-DD calendar dates', () => {
    expect(isValidDate('2024-02-29')).toBe(true)
    expect(isValidDate('2026-02-29')).toBe(false)
    expect(isValidDate('2026-13-01')).toBe(false)
    expect(isValidDate('18-09-2026')).toBe(false)
  })

  it('formats dates in UTC without an off-by-one shift', () => {
    expect(formatIndonesianDate('2026-09-18')).toBe('18 September 2026')
  })

  it('uses the profile timezone to determine today', () => {
    const instant = new Date('2026-09-18T17:30:00.000Z')

    expect(todayInTimezone('Asia/Jakarta', instant)).toBe('2026-09-19')
    expect(todayInTimezone('America/Los_Angeles', instant)).toBe('2026-09-18')
  })

  it('builds inclusive calendar ranges without local-time shifts', () => {
    expect(daysBefore('2026-03-01', 29)).toBe('2026-01-31')
  })

  it('returns normalized transaction data only when the draft is valid', () => {
    const result = validateTransactionDraft({
      transaction_date: '2026-09-18',
      type: 'expense',
      category_id: 'category-1',
      amount: '1234,5',
      title: ' Makan siang ',
    })

    expect(result).toEqual({
      valid: true,
      errors: {},
      value: {
        transaction_date: '2026-09-18',
        type: 'expense',
        category_id: 'category-1',
        amount: '1234.50',
        title: 'Makan siang',
      },
    })
  })
})
