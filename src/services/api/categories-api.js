import { request } from '../http'

export function listActiveCategories() {
  return request('/categories?isDelete=false')
}

export function listCategories({ isDelete = false, type } = {}) {
  const query = new URLSearchParams({ isDelete: String(isDelete) })
  if (type) query.set('type', type)
  return request(`/categories?${query}`)
}

export function createCategory(payload) {
  return request('/categories', { body: payload, method: 'POST' })
}

export function updateCategory(id, payload) {
  return request(`/categories/${id}`, { body: payload, method: 'PATCH' })
}

export function deleteCategory(id, version) {
  return request(`/categories/${id}`, {
    headers: { 'If-Match': `"${version}"` },
    method: 'DELETE',
  })
}

export function getCategory(id, { isDelete = false } = {}) {
  return request(`/categories/${id}?isDelete=${isDelete}`)
}

export function restoreCategory(id, version) {
  return request(`/categories/${id}/restore`, {
    body: { version },
    method: 'POST',
  })
}
