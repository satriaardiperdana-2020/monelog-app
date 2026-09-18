import { request } from '../http'

export function getMe() {
  return request('/me')
}

export function updateMe({ timezone, version }) {
  return request('/me', {
    method: 'PATCH',
    body: { timezone, version },
  })
}
