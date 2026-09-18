import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  HttpError,
  configureHttpAuth,
  request,
  resetHttpAuth,
} from '../../src/services/http'

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

afterEach(() => {
  resetHttpAuth()
  vi.unstubAllGlobals()
})

describe('request', () => {
  it('uses the API base URL, credentials, bearer token, and data envelope', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: { id: 'abc' } }))
    vi.stubGlobal('fetch', fetchMock)
    configureHttpAuth({ getAccessToken: () => 'memory-only-token' })

    await expect(request('/me')).resolves.toEqual({ id: 'abc' })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/me',
      expect.objectContaining({ credentials: 'include' }),
    )
    expect(fetchMock.mock.calls[0][1].headers.get('Authorization')).toBe(
      'Bearer memory-only-token',
    )
  })

  it('normalizes API error envelopes', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(
          { error: { code: 'validation_failed', message: 'Data tidak valid.' } },
          422,
        ),
      ),
    )

    await expect(request('/transactions')).rejects.toMatchObject({
      name: 'HttpError',
      status: 422,
      code: 'validation_failed',
      message: 'Data tidak valid.',
    })
  })

  it('passes an AbortController signal through and preserves abort errors', async () => {
    const controller = new AbortController()
    const abortError = new DOMException('Aborted', 'AbortError')
    const fetchMock = vi.fn().mockRejectedValue(abortError)
    vi.stubGlobal('fetch', fetchMock)

    await expect(request('/daily-summaries', { signal: controller.signal })).rejects.toBe(abortError)
    expect(fetchMock.mock.calls[0][1].signal).toBe(controller.signal)
  })

  it('shares one refresh and retries concurrent protected GET requests once', async () => {
    const refreshAccessToken = vi.fn().mockResolvedValue(true)
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ error: { code: 'expired', message: 'Expired' } }, 401))
      .mockResolvedValueOnce(jsonResponse({ error: { code: 'expired', message: 'Expired' } }, 401))
      .mockResolvedValueOnce(jsonResponse({ data: { id: 'first' } }))
      .mockResolvedValueOnce(jsonResponse({ data: { id: 'second' } }))
    vi.stubGlobal('fetch', fetchMock)
    configureHttpAuth({ refreshAccessToken, getAccessToken: () => 'new-token' })

    await expect(Promise.all([request('/me'), request('/categories')])).resolves.toEqual([
      { id: 'first' },
      { id: 'second' },
    ])

    expect(refreshAccessToken).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it.each(['POST', 'PATCH', 'DELETE'])('refreshes but never replays %s mutations', async (method) => {
    const refreshAccessToken = vi.fn().mockResolvedValue(true)
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ error: { code: 'expired', message: 'Expired' } }, 401),
    )
    vi.stubGlobal('fetch', fetchMock)
    configureHttpAuth({ refreshAccessToken })

    await expect(request('/transactions', { method, body: { title: 'Makan' } })).rejects.toBeInstanceOf(HttpError)
    expect(refreshAccessToken).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('clears the session when refresh fails', async () => {
    const clearSession = vi.fn()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({ error: { code: 'expired', message: 'Expired' } }, 401),
      ),
    )
    configureHttpAuth({
      refreshAccessToken: vi.fn().mockRejectedValue(new Error('refresh rejected')),
      clearSession,
    })

    await expect(request('/me')).rejects.toMatchObject({ code: 'session_expired' })
    expect(clearSession).toHaveBeenCalledTimes(1)
  })
})
