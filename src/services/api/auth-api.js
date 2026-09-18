import { request } from '../http'

// This is the non-HttpOnly companion cookie from the browser auth contract.
// The refresh cookie is HttpOnly and is intentionally never read by JavaScript.
export const CSRF_COOKIE_NAME = '__Host-monelog-csrf'

function csrfToken() {
  if (typeof document === 'undefined') return ''

  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${CSRF_COOKIE_NAME}=`))

  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : ''
}

function csrfHeaders() {
  const token = csrfToken()
  return token ? { 'X-CSRF-Token': token } : {}
}

export function login({ email, password }) {
  return request('/auth/login', {
    method: 'POST',
    protected: false,
    body: { email, password, client_type: 'web' },
  })
}

export function refresh() {
  return request('/auth/refresh', {
    method: 'POST',
    protected: false,
    headers: csrfHeaders(),
    body: { client_type: 'web' },
  })
}

export function logout() {
  return request('/auth/logout', {
    method: 'POST',
    protected: false,
    headers: csrfHeaders(),
    body: { client_type: 'web' },
  })
}
