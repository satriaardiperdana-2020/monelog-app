import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  refresh: vi.fn(),
  logout: vi.fn(),
  getMe: vi.fn(),
  updateMe: vi.fn(),
  configureHttpAuth: vi.fn(),
}))

vi.mock('../../src/services/api/auth-api', () => ({
  login: mocks.login,
  refresh: mocks.refresh,
  logout: mocks.logout,
}))
vi.mock('../../src/services/api/profile-api', () => ({
  getMe: mocks.getMe,
  updateMe: mocks.updateMe,
}))
vi.mock('../../src/services/http', () => ({ configureHttpAuth: mocks.configureHttpAuth }))

import {
  GENERIC_LOGIN_ERROR,
  registerSessionStoreReset,
  useAuthStore,
} from '../../src/stores/auth'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('auth store', () => {
  it('keeps the access token in memory and loads /me after login', async () => {
    mocks.login.mockResolvedValue({ access_token: 'memory-token' })
    mocks.getMe.mockResolvedValue({ id: 'user-1', email: 'user@example.com' })
    const auth = useAuthStore()

    await expect(auth.login({ email: 'user@example.com', password: 'password' })).resolves.toEqual({
      id: 'user-1',
      email: 'user@example.com',
    })

    expect(auth.accessToken).toBe('memory-token')
    expect(auth.user).toEqual({ id: 'user-1', email: 'user@example.com' })
    expect(mocks.getMe).toHaveBeenCalledTimes(1)
  })

  it('uses refresh then /me during browser-reload bootstrap', async () => {
    mocks.refresh.mockResolvedValue({ access_token: 'refreshed-token' })
    mocks.getMe.mockResolvedValue({ id: 'user-1' })
    const auth = useAuthStore()

    await expect(auth.bootstrap()).resolves.toBe(true)

    expect(mocks.refresh).toHaveBeenCalledTimes(1)
    expect(mocks.getMe).toHaveBeenCalledTimes(1)
    expect(auth.accessToken).toBe('refreshed-token')
    expect(auth.isAuthenticated).toBe(true)
  })

  it('treats the first rejected refresh as logged out, not an expired app session', async () => {
    mocks.refresh.mockRejectedValue(new Error('csrf rejected'))
    const auth = useAuthStore()

    await expect(auth.bootstrap()).resolves.toBe(false)

    expect(auth.sessionExpired).toBe(false)
    expect(auth.isAuthenticated).toBe(false)
  })

  it('clears the session and reports a generic login error', async () => {
    mocks.login.mockRejectedValue(new Error('account does not exist'))
    const auth = useAuthStore()
    auth.accessToken = 'old-token'

    await expect(auth.login({ email: 'user@example.com', password: 'wrong' })).rejects.toThrow(
      GENERIC_LOGIN_ERROR,
    )
    expect(auth.accessToken).toBeNull()
    expect(auth.user).toBeNull()
  })

  it('clears registered stores when a refresh session expires', async () => {
    const reset = vi.fn()
    const unregister = registerSessionStoreReset(reset)
    mocks.refresh.mockRejectedValue(new Error('expired'))
    const auth = useAuthStore()

    await expect(auth.bootstrap()).resolves.toBe(false)

    expect(reset).toHaveBeenCalledTimes(1)
    expect(auth.isAuthenticated).toBe(false)
    unregister()
  })

  it('preserves only safe intended routes until login navigation consumes them', () => {
    const auth = useAuthStore()

    auth.setIntendedRoute('/transaksi/tambah?tanggal=2026-09-18')
    expect(auth.consumeIntendedRoute()).toBe('/transaksi/tambah?tanggal=2026-09-18')

    auth.setIntendedRoute('//untrusted.example')
    expect(auth.consumeIntendedRoute()).toBe('/')
  })

  it('calls logout then clears the in-memory session', async () => {
    mocks.logout.mockResolvedValue(undefined)
    const auth = useAuthStore()
    auth.accessToken = 'memory-token'
    auth.user = { id: 'user-1' }

    await auth.logout()

    expect(mocks.logout).toHaveBeenCalledTimes(1)
    expect(auth.isAuthenticated).toBe(false)
  })

  it('updates the profile timezone with the current version', async () => {
    mocks.updateMe.mockResolvedValue({ id: 'user-1', timezone: 'Asia/Makassar', version: 4 })
    const auth = useAuthStore()
    auth.user = { id: 'user-1', timezone: 'Asia/Jakarta', version: 3 }

    await auth.updateProfile('Asia/Makassar')

    expect(mocks.updateMe).toHaveBeenCalledWith({ timezone: 'Asia/Makassar', version: 3 })
    expect(auth.user.timezone).toBe('Asia/Makassar')
  })
})
