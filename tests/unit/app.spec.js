import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useAppStore } from '../../src/stores/app'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('app language preference', () => {
  it('stores language separately from session data', () => {
    const app = useAppStore()
    app.setLocale('en')

    expect(app.locale).toBe('en')
    expect(localStorage.getItem('monelog-language')).toBe('en')
    expect(localStorage.getItem('monelog-display-preferences')).toBeNull()
  })
})
