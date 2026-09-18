import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it } from 'vitest'

import App from '../../src/App.vue'
import router from '../../src/router'

describe('application shell', () => {
  it('renders the Monelog shell and home content', async () => {
    await router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router],
      },
    })

    expect(wrapper.get('.brand').text()).toBe('Monelog')
    expect(wrapper.get('h1').text()).toContain('Monelog siap dikembangkan')
  })
})
