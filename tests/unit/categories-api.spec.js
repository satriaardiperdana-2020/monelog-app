import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ request: vi.fn() }))
vi.mock('../../src/services/http', () => ({ request: mocks.request }))

import {
  createCategory,
  deleteCategory,
  listActiveCategories,
  listCategories,
  restoreCategory,
  updateCategory,
} from '../../src/services/api/categories-api'

afterEach(() => mocks.request.mockReset())

describe('categories API', () => {
  it('lists active categories and supports type filters', async () => {
    mocks.request.mockResolvedValue([])

    await listActiveCategories()
    await listCategories({ type: 'expense' })

    expect(mocks.request).toHaveBeenNthCalledWith(1, '/categories?isDelete=false')
    expect(mocks.request).toHaveBeenNthCalledWith(2, '/categories?isDelete=false&type=expense')
  })

  it('sends create, version-aware update, and quoted soft-delete requests', async () => {
    mocks.request.mockResolvedValue({})

    await createCategory({ name: 'Makan', type: 'expense' })
    await updateCategory('category-1', { name: 'Makan rumah', version: 2 })
    await deleteCategory('category-1', 2)

    expect(mocks.request).toHaveBeenNthCalledWith(1, '/categories', { body: { name: 'Makan', type: 'expense' }, method: 'POST' })
    expect(mocks.request).toHaveBeenNthCalledWith(2, '/categories/category-1', { body: { name: 'Makan rumah', version: 2 }, method: 'PATCH' })
    expect(mocks.request).toHaveBeenNthCalledWith(3, '/categories/category-1', { headers: { 'If-Match': '"2"' }, method: 'DELETE' })
  })

  it('restores with the current version body', async () => {
    mocks.request.mockResolvedValue({})

    await restoreCategory('category-1', 8)

    expect(mocks.request).toHaveBeenCalledWith('/categories/category-1/restore', {
      body: { version: 8 },
      method: 'POST',
    })
  })
})
