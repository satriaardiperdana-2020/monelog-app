import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createPinia } from 'pinia'

import TransactionForm from '../../src/components/TransactionForm.vue'

const categories = [
  { id: 101, name: 'Makan', type: 'expense' },
  { id: 102, name: 'Gaji', type: 'income' },
]

function mountForm(props = {}) {
  return mount(TransactionForm, {
    attachTo: document.body,
    global: { plugins: [createPinia()] },
    props: {
      categories,
      initialDraft: {
        transaction_date: '2026-09-18',
        type: 'expense',
        category_id: 101,
        amount: '12500,5',
        title: 'Makan siang',
      },
      ...props,
    },
  })
}

describe('TransactionForm', () => {
  it('filters categories and clears an incompatible category after type changes', async () => {
    const wrapper = mountForm()

    expect(wrapper.get('#transaction-category').text()).toContain('Makan')
    expect(wrapper.get('#transaction-category').text()).not.toContain('Gaji')

    await wrapper.get('input[value="income"]').setValue()

    expect(wrapper.get('#transaction-category').text()).toContain('Gaji')
    expect(wrapper.get('#transaction-category').text()).not.toContain('Makan')
    expect(wrapper.get('#transaction-category').element.value).toBe('')
  })

  it('validates and focuses the first invalid field', async () => {
    const wrapper = mountForm({ initialDraft: { transaction_date: '', type: 'expense', category_id: '', amount: '0', title: '' } })

    await wrapper.get('form').trigger('submit')

    expect(wrapper.get('#transaction-date-error').text()).toContain('Tanggal')
    expect(document.activeElement).toBe(wrapper.get('#transaction-date').element)
    expect(wrapper.get('#transaction-date').attributes('aria-describedby')).toBe('transaction-date-error')
  })

  it('emits exact money text and retains the request ID for an unchanged retry', async () => {
    const getRandomValues = vi.fn((words) => words.set([0, 9001]))
    vi.stubGlobal('crypto', { getRandomValues })
    const wrapper = mountForm()

    await wrapper.get('form').trigger('submit')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')).toEqual([
      [{ transaction_date: '2026-09-18', type: 'expense', category_id: 101, amount: '12500.50', title: 'Makan siang', client_request_id: 9001 }],
      [{ transaction_date: '2026-09-18', type: 'expense', category_id: 101, amount: '12500.50', title: 'Makan siang', client_request_id: 9001 }],
    ])
    expect(getRandomValues).toHaveBeenCalledTimes(1)
    vi.unstubAllGlobals()
  })

  it('generates a new request ID after a draft change and emits cancel', async () => {
    const getRandomValues = vi.fn()
      .mockImplementationOnce((words) => words.set([0, 9001]))
      .mockImplementationOnce((words) => words.set([0, 9002]))
    vi.stubGlobal('crypto', { getRandomValues })
    const wrapper = mountForm()

    await wrapper.get('form').trigger('submit')
    await wrapper.get('#transaction-title').setValue('Makan malam')
    await wrapper.get('form').trigger('submit')
    await wrapper.get('button[type="button"]').trigger('click')

    expect(wrapper.emitted('submit')[1][0].client_request_id).toBe(9002)
    expect(wrapper.emitted('cancel')).toHaveLength(1)
    vi.unstubAllGlobals()
  })

  it('omits client_request_id when used for a versioned edit', async () => {
    const wrapper = mountForm({ includeClientRequestId: false })

    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')[0][0]).not.toHaveProperty('client_request_id')
  })
})
