import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useAdminSelectedUserStore } from '../../src/stores/admin-selected-user'

beforeEach(() => setActivePinia(createPinia()))

describe('admin selected-user store', () => {
  it('keeps only the currently selected user in memory', () => {
    const store = useAdminSelectedUserStore()
    store.selectUser({ email: 'target@example.com', id: 'target-1', timezone: 'Asia/Jakarta' })

    expect(store.selectedUserId).toBe('target-1')
    expect(store.selectedUser).toEqual({
      email: 'target@example.com',
      id: 'target-1',
      timezone: 'Asia/Jakarta',
    })

    store.clearSelectedUser()
    expect(store.selectedUserId).toBeNull()
  })

  it('rejects a target without an ID', () => {
    expect(() => useAdminSelectedUserStore().selectUser({ email: 'missing@example.com' })).toThrow('tidak valid')
  })
})
