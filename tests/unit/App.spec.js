import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'

import App from '../../src/App.vue'
import {
  createMemoryHistory,
  createMonelogRouter,
} from '../../src/router'
import { useAuthStore } from '../../src/stores/auth'

describe('application shell', () => {
  it('renders the Monelog shell and home content', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const auth = useAuthStore()
    auth.accessToken = 'memory-token'
    auth.user = { id: 'user-1' }
    auth.initialized = true

    const router = createMonelogRouter(createMemoryHistory())
    await router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [pinia, router],
      },
    })

    expect(wrapper.get('.app-shell__mobile-header').text()).toBe('Catatan Keuangan')
    expect(wrapper.get('.bottom-navigation').text()).toContain('Laporan')
    expect(wrapper.get('h1').text()).toContain('Catatan Keuangan')
  })

  it('renders login without AppShell navigation', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const auth = useAuthStore()
    auth.initialized = true

    const router = createMonelogRouter(createMemoryHistory())
    await router.push('/login')
    await router.isReady()

    const wrapper = mount(App, { global: { plugins: [pinia, router] } })

    expect(wrapper.get('#login-title').text()).toBe('Masuk')
    expect(wrapper.find('.app-shell').exists()).toBe(false)
  })
})
