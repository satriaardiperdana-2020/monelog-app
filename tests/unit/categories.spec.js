import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const mocks = vi.hoisted(() => ({ createCategory: vi.fn(), deleteCategory: vi.fn(), listCategories: vi.fn(), updateCategory: vi.fn() }))
vi.mock('../../src/services/api/categories-api', () => mocks)

import { useCategoriesStore } from '../../src/stores/categories'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('categories store', () => {
  it('keeps active income and expense lists isolated', async () => {
    mocks.listCategories.mockResolvedValueOnce([{ id: 101, type: 'expense' }]).mockResolvedValueOnce([{ id: 102, type: 'income' }])
    const categories = useCategoriesStore()

    await categories.load('expense')
    await categories.load('income')

    expect(categories.byType.expense).toEqual([{ id: 101, type: 'expense' }])
    expect(categories.byType.income).toEqual([{ id: 102, type: 'income' }])
    expect(mocks.listCategories).toHaveBeenCalledWith({ isDelete: false, type: 'income' })
  })

  it('exposes retryable loading errors and forwards versioned mutations', async () => {
    mocks.listCategories.mockRejectedValue(new Error('offline'))
    const categories = useCategoriesStore()
    await categories.load('expense')

    expect(categories.statusByType.expense).toBe('error')
    await categories.update(101, { name: 'Makan', version: 2 })
    await categories.delete(101, 2)
    expect(mocks.updateCategory).toHaveBeenCalledWith(101, { name: 'Makan', version: 2 })
    expect(mocks.deleteCategory).toHaveBeenCalledWith(101, 2)
  })
})
