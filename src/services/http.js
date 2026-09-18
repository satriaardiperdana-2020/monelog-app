const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '')

const defaultAuth = {
  getAccessToken: () => null,
  refreshAccessToken: async () => false,
  clearSession: () => {},
}

let auth = { ...defaultAuth }
let refreshPromise = null

export class HttpError extends Error {
  constructor({ status = 0, code = 'request_failed', message, cause }) {
    super(message || 'Permintaan tidak dapat diselesaikan.')
    this.name = 'HttpError'
    this.status = status
    this.code = code
    this.cause = cause
  }
}

export function configureHttpAuth(handlers) {
  auth = { ...defaultAuth, ...handlers }
}

export function resetHttpAuth() {
  auth = { ...defaultAuth }
  refreshPromise = null
}

function apiUrl(path) {
  return `${apiBaseUrl}/${String(path).replace(/^\//, '')}`
}

function canRetry(method) {
  return ['GET', 'HEAD', 'OPTIONS'].includes(method)
}

async function parseResponse(response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function send(path, options) {
  const headers = new Headers(options.headers)

  if (options.protected) {
    const token = auth.getAccessToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  let body
  if (options.body !== undefined) {
    body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body)
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  }

  let response
  try {
    response = await fetch(apiUrl(path), {
      method: options.method,
      headers,
      body,
      credentials: 'include',
      signal: options.signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error

    throw new HttpError({
      code: 'network_error',
      message: 'Koneksi ke server gagal. Coba lagi.',
      cause: error,
    })
  }

  const payload = await parseResponse(response)
  if (!response.ok) {
    throw new HttpError({
      status: response.status,
      code: payload?.error?.code || 'request_failed',
      message: payload?.error?.message || 'Permintaan tidak dapat diselesaikan.',
    })
  }

  return options.unwrapData === false ? payload : payload?.data ?? payload
}

function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = Promise.resolve()
      .then(() => auth.refreshAccessToken())
      .then((refreshed) => {
        if (refreshed === false) throw new Error('Refresh session was rejected.')
      })
      .catch((error) => {
        auth.clearSession()
        throw error
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

/** Tokens are supplied by the Pinia auth store and are never persisted here. */
export async function request(path, requestOptions = {}) {
  const options = {
    method: 'GET',
    headers: {},
    protected: true,
    ...requestOptions,
  }
  options.method = options.method.toUpperCase()

  try {
    return await send(path, options)
  } catch (error) {
    if (error?.status !== 401 || !options.protected || options.retryAttempted) {
      throw error
    }

    try {
      await refreshSession()
    } catch (refreshError) {
      throw new HttpError({
        status: 401,
        code: 'session_expired',
        message: 'Sesi Anda telah berakhir. Silakan masuk kembali.',
        cause: refreshError,
      })
    }

    if (!canRetry(options.method)) throw error
    return send(path, { ...options, retryAttempted: true })
  }
}
