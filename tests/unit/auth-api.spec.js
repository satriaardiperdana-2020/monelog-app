import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ request: vi.fn() }))
vi.mock('../../src/services/http', () => ({ request: mocks.request }))

import * as authApi from '../../src/services/api/auth-api'

afterEach(() => {
  mocks.request.mockReset()
  vi.restoreAllMocks()
})

describe('auth API', () => {
  it('sends web login credentials without storing them', async () => {
    mocks.request.mockResolvedValue({ access_token: 'token' })

    await authApi.login({ email: 'user@example.com', password: 'password' })

    expect(mocks.request).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      protected: false,
      body: {
        email: 'user@example.com',
        password: 'password',
        client_type: 'web',
      },
    })
  })

  it('uses the readable CSRF cookie for refresh and logout', async () => {
    vi.spyOn(document, 'cookie', 'get').mockReturnValue(
      '__Host-monelog-csrf=csrf-value',
    )
    mocks.request.mockResolvedValue({ access_token: 'token' })

    await authApi.refresh()
    await authApi.logout()

    expect(mocks.request).toHaveBeenNthCalledWith(
      1,
      '/auth/refresh',
      expect.objectContaining({ headers: { 'X-CSRF-Token': 'csrf-value' } }),
    )
    expect(mocks.request).toHaveBeenNthCalledWith(
      2,
      '/auth/logout',
      expect.objectContaining({ headers: { 'X-CSRF-Token': 'csrf-value' } }),
    )
  })
})
