import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useAuthStore } from '../../src/stores/auth'
import {
  createMemoryHistory,
  createMonelogRouter,
  isValidCalendarDate,
} from '../../src/router'

function createRouterWithAuth({ authenticated = false, expired = false } = {}) {
  setActivePinia(createPinia())
  const auth = useAuthStore()
  auth.accessToken = authenticated ? 'memory-token' : null
  auth.user = authenticated ? { id: 'user-1' } : null
  auth.sessionExpired = expired
  auth.bootstrap = vi.fn().mockResolvedValue(authenticated)

  return { auth, router: createMonelogRouter(createMemoryHistory()) }
}

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('router', () => {
  it('waits for bootstrap and preserves an unauthenticated intended URL', async () => {
    const { auth, router } = createRouterWithAuth()

    await router.push('/kategori?tab=pemasukan')
    await router.isReady()

    expect(auth.bootstrap).toHaveBeenCalled()
    expect(router.currentRoute.value).toMatchObject({
      name: 'login',
      query: { lanjut: '/kategori?tab=pemasukan' },
    })
    expect(auth.intendedRoute).toBe('/kategori?tab=pemasukan')
  })

  it('marks expired sessions at login', async () => {
    const { router } = createRouterWithAuth({ expired: true })

    await router.push('/sampah')
    await router.isReady()

    expect(router.currentRoute.value.query).toMatchObject({
      lanjut: '/sampah',
      alasan: 'sesi-berakhir',
    })
  })

  it('redirects authenticated users away from login to a safe intended URL', async () => {
    const { router } = createRouterWithAuth({ authenticated: true })

    await router.push('/login?lanjut=/pengaturan')
    await router.isReady()

    expect(router.currentRoute.value.fullPath).toBe('/pengaturan')
  })

  it('allows valid calendar dates and rejects invalid date parameters locally', async () => {
    const { router } = createRouterWithAuth({ authenticated: true })

    await router.push('/hari/2026-02-28')
    await router.isReady()
    expect(router.currentRoute.value.name).toBe('day-detail')

    await router.push('/hari/2026-02-29')
    expect(router.currentRoute.value.name).toBe('home')
    expect(isValidCalendarDate('2026-02-29')).toBe(false)
    expect(isValidCalendarDate('2024-02-29')).toBe(true)
  })

  it('does not authorize opaque resource IDs in the client', async () => {
    const { router } = createRouterWithAuth({ authenticated: true })

    await router.push('/transaksi/not-a-uuid/edit')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('transaction-edit')
  })
})
