import { describe, expect, it } from 'vitest'

import { formatRupiah, normalizeMoney } from '../../src/utils/money'

describe('money utilities', () => {
  it.each([
    ['1234,50', '1234.50'],
    ['1234.50', '1234.50'],
    ['1234', '1234.00'],
    ['0,01', '0.01'],
  ])('normalizes %s without number conversion', (draft, expected) => {
    expect(normalizeMoney(draft)).toBe(expected)
  })

  it.each(['1.000,00', '1,000.00', '-1.00', '0', '0.00', '1.234', '01.00'])(
    'rejects invalid amount %s',
    (draft) => {
      expect(normalizeMoney(draft)).toBeNull()
    },
  )

  it('formats exact strings as Indonesian Rupiah', () => {
    expect(formatRupiah('769500.00')).toBe('Rp769.500,00')
    expect(formatRupiah('1000000.50')).toBe('Rp1.000.000,50')
    expect(formatRupiah('-230.25')).toBe('-Rp230,25')
  })
})
