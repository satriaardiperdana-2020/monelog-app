import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const mocks = vi.hoisted(() => ({
  createTransaction: vi.fn(), deleteTransaction: vi.fn(), getTransaction: vi.fn(), listTransactions: vi.fn(), restoreTransaction: vi.fn(), updateTransaction: vi.fn(),
}))
vi.mock('../../src/services/api/transactions-api', () => mocks)

import { useTransactionsStore } from '../../src/stores/transactions'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('transactions store', () => {
  it('keeps backend transaction strings and cursor pages intact', async () => {
    mocks.listTransactions
      .mockResolvedValueOnce({
        data: [{ id: 'one', title: 'Makan', type: 'expense', amount: '25000.00' }],
        page: { next_cursor: 'next' },
      })
      .mockResolvedValueOnce({
        data: [{ id: 'two', title: 'Gaji', type: 'income', amount: '100000.00' }],
        page: { next_cursor: null },
      })
    const transactions = useTransactionsStore()

    await transactions.loadForDate('2026-09-18')
    await transactions.loadMore()

    expect(transactions.items.map((item) => item.amount)).toEqual(['25000.00', '100000.00'])
    expect(mocks.listTransactions).toHaveBeenLastCalledWith({
      cursor: 'next',
      endDate: '2026-09-18',
      limit: 30,
      startDate: '2026-09-18',
    })
  })

  it('forwards exact mutation payloads and versions without retry behavior', async () => {
    mocks.createTransaction.mockResolvedValue({ id: 'created' })
    mocks.updateTransaction.mockResolvedValue({ id: 'updated' })
    mocks.deleteTransaction.mockResolvedValue(undefined)
    const transactions = useTransactionsStore()
    const payload = { amount: '12.50', client_request_id: 'request-1' }

    await transactions.create(payload)
    await transactions.update('updated', { amount: '12.50', version: 3 })
    await transactions.delete('deleted', 4)

    expect(mocks.createTransaction).toHaveBeenCalledWith(payload)
    expect(mocks.updateTransaction).toHaveBeenCalledWith('updated', { amount: '12.50', version: 3 })
    expect(mocks.deleteTransaction).toHaveBeenCalledWith('deleted', 4)
  })
})
