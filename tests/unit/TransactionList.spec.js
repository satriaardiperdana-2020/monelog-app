import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it } from 'vitest'

import TransactionList from '../../src/components/TransactionList.vue'

describe('TransactionList', () => {
  it('links transaction rows to edit pages and labels their signed amounts', () => {
    const router = createRouter({ history: createMemoryHistory(), routes: [] })
    const wrapper = mount(TransactionList, {
      props: {
        items: [{ id: 'transaction-1', title: 'Makan siang', type: 'expense', amount: '25000.00' }],
      },
      global: { plugins: [router] },
    })

    expect(wrapper.get('a').attributes('href')).toBe('/transaksi/transaction-1/edit')
    expect(wrapper.text()).toContain('Makan siang')
    expect(wrapper.text()).toContain('Pengeluaran')
    expect(wrapper.text()).toContain('− Rp25.000,00')
  })
})
