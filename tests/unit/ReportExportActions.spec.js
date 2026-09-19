import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPinia } from 'pinia'

const mocks = vi.hoisted(() => ({ exportExcelReport: vi.fn(), exportPdfReport: vi.fn() }))
vi.mock('../../src/services/export/report-export', () => mocks)

import ReportExportActions from '../../src/components/ReportExportActions.vue'

afterEach(() => vi.clearAllMocks())

const props = {
  breakdown: { categories: [] },
  endDate: '2026-09-19',
  startDate: '2026-09-01',
  summary: { difference: '0.00', expense: '0.00', income: '0.00' },
  targetLabel: 'Saya',
}

describe('ReportExportActions', () => {
  it('exports Excel and disables actions while a file is generated', async () => {
    let resolveExport
    mocks.exportExcelReport.mockReturnValue(new Promise((resolve) => { resolveExport = resolve }))
    const wrapper = mount(ReportExportActions, { global: { plugins: [createPinia()] }, props })

    await wrapper.get('button').trigger('click')
    expect(mocks.exportExcelReport).toHaveBeenCalledWith(expect.objectContaining({ targetLabel: 'Saya' }))
    expect(wrapper.get('button').attributes('disabled')).toBeDefined()

    resolveExport()
    await Promise.resolve()
    await nextTick()
    expect(wrapper.get('button').attributes('disabled')).toBeUndefined()
  })

  it('shows a retryable error when PDF generation fails', async () => {
    mocks.exportPdfReport.mockRejectedValue(new Error('failed'))
    const wrapper = mount(ReportExportActions, { global: { plugins: [createPinia()] }, props })

    await wrapper.findAll('button')[1].trigger('click')
    await Promise.resolve()
    await nextTick()
    expect(wrapper.text()).toContain('Ekspor belum dapat dibuat')
  })
})
