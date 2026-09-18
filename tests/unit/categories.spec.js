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
    mocks.listCategories.mockResolvedValueOnce([{ id: 'expense', type: 'expense' }]).mockResolvedValueOnce([{ id: 'income', type: 'income' }])
    const categories = useCategoriesStore()

    await categories.load('expense')
    await categories.load('income')

    expect(categories.byType.expense).toEqual([{ id: 'expense', type: 'expense' }])
    expect(categories.byType.income).toEqual([{ id: 'income', type: 'income' }])
    expect(mocks.listCategories).toHaveBeenCalledWith({ isDelete: false, type: 'income' })
  })

  it('exposes retryable loading errors and forwards versioned mutations', async () => {
    mocks.listCategories.mockRejectedValue(new Error('offline'))
    const categories = useCategoriesStore()
    await categories.load('expense')

    expect(categories.statusByType.expense).toBe('error')
    await categories.update('category-1', { name: 'Makan', version: 2 })
    await categories.delete('category-1', 2)
    expect(mocks.updateCategory).toHaveBeenCalledWith('category-1', { name: 'Makan', version: 2 })
    expect(mocks.deleteCategory).toHaveBeenCalledWith('category-1', 2)
  })
})
