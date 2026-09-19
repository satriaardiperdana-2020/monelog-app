import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it } from 'vitest'
import { createPinia } from 'pinia'

import DailySummaryCard from '../../src/components/DailySummaryCard.vue'

describe('DailySummaryCard', () => {
  it('shows labelled income and expense totals and links to its day', () => {
    const router = createRouter({ history: createMemoryHistory(), routes: [] })
    const wrapper = mount(DailySummaryCard, {
      props: {
        summary: { date: '2026-09-18', expense: '769500.00', income: '1000000.00' },
      },
      global: { plugins: [createPinia(), router] },
    })

    expect(wrapper.text()).toContain('Pengeluaran')
    expect(wrapper.text()).toContain('Rp769.500,00')
    expect(wrapper.text()).toContain('Pemasukan')
    expect(wrapper.text()).toContain('Rp1.000.000,00')
    expect(wrapper.get('a').attributes('href')).toBe('/hari/2026-09-18')
  })
})
