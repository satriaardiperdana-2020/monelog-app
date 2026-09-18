import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ request: vi.fn() }))
vi.mock('../../src/services/http', () => ({ request: mocks.request }))

import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  restoreTransaction,
  updateTransaction,
} from '../../src/services/api/transactions-api'

afterEach(() => mocks.request.mockReset())

describe('transactions API', () => {
  it('requests only active transactions for the inclusive selected day', async () => {
    mocks.request.mockResolvedValue({ data: [], page: { next_cursor: null } })

    await listTransactions({ endDate: '2026-09-18', startDate: '2026-09-18' })

    expect(mocks.request).toHaveBeenCalledWith(
      '/transactions?isDelete=false&limit=30&start_date=2026-09-18&end_date=2026-09-18',
      { signal: undefined, unwrapData: false },
    )
  })

  it('sends exact create, update-version, and quoted soft-delete requests', async () => {
    const createPayload = {
      transaction_date: '2026-09-18',
      type: 'expense',
      category_id: 'category-1',
      amount: '12.50',
      title: 'Makan',
      client_request_id: 'request-1',
    }
    mocks.request.mockResolvedValue({})

    await createTransaction(createPayload)
    await updateTransaction('transaction-1', { ...createPayload, version: 3 })
    await deleteTransaction('transaction-1', 3)

    expect(mocks.request).toHaveBeenNthCalledWith(1, '/transactions', {
      body: createPayload,
      method: 'POST',
    })
    expect(mocks.request).toHaveBeenNthCalledWith(2, '/transactions/transaction-1', {
      body: { ...createPayload, version: 3 },
      method: 'PATCH',
    })
    expect(mocks.request).toHaveBeenNthCalledWith(3, '/transactions/transaction-1', {
      headers: { 'If-Match': '"3"' },
      method: 'DELETE',
    })
  })

  it('restores with the freshly supplied version in the request body', async () => {
    mocks.request.mockResolvedValue({})

    await restoreTransaction('transaction-1', 7)

    expect(mocks.request).toHaveBeenCalledWith('/transactions/transaction-1/restore', {
      body: { version: 7 },
      method: 'POST',
    })
  })
})
