import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const mocks = vi.hoisted(() => ({
  getCategory: vi.fn(), listCategories: vi.fn(), restoreCategory: vi.fn(),
  getTransaction: vi.fn(), listTransactions: vi.fn(), restoreTransaction: vi.fn(),
}))
vi.mock('../../src/services/api/categories-api', () => ({
  getCategory: mocks.getCategory, listCategories: mocks.listCategories, restoreCategory: mocks.restoreCategory,
}))
vi.mock('../../src/services/api/transactions-api', () => ({
  getTransaction: mocks.getTransaction, listTransactions: mocks.listTransactions, restoreTransaction: mocks.restoreTransaction,
}))

import { useTrashStore } from '../../src/stores/trash'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('trash store', () => {
  it('loads only deleted resources', async () => {
    mocks.listTransactions.mockResolvedValue({ data: [{ id: 'transaction-1' }] })
    mocks.listCategories.mockResolvedValue([{ id: 'category-1' }])
    const trash = useTrashStore()

    await trash.load()

    expect(mocks.listTransactions).toHaveBeenCalledWith({ isDelete: true })
    expect(mocks.listCategories).toHaveBeenCalledWith({ isDelete: true })
    expect(trash.status).toBe('ready')
  })

  it('reloads Trash details before restores to use the newest version', async () => {
    mocks.getTransaction.mockResolvedValue({ id: 'transaction-1', version: 7 })
    mocks.restoreTransaction.mockResolvedValue({ id: 'transaction-1' })
    mocks.getCategory.mockResolvedValue({ id: 'category-1', version: 8 })
    mocks.restoreCategory.mockResolvedValue({ id: 'category-1' })
    const trash = useTrashStore()

    await trash.restoreTransaction('transaction-1')
    await trash.restoreCategory('category-1')

    expect(mocks.getTransaction).toHaveBeenCalledWith('transaction-1', { isDelete: true })
    expect(mocks.restoreTransaction).toHaveBeenCalledWith('transaction-1', 7)
    expect(mocks.getCategory).toHaveBeenCalledWith('category-1', { isDelete: true })
    expect(mocks.restoreCategory).toHaveBeenCalledWith('category-1', 8)
  })
})
