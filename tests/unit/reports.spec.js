import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const mocks = vi.hoisted(() => ({
  getReportBreakdown: vi.fn(),
  getReportSummary: vi.fn(),
}))
vi.mock('../../src/services/api/reports-api', () => mocks)

import { useReportsStore } from '../../src/stores/reports'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('reports store', () => {
  it('loads active report aggregates using the admin selected-user scope', async () => {
    mocks.getReportSummary.mockResolvedValue({ income: '100.00', expense: '20.00', difference: '80.00' })
    mocks.getReportBreakdown.mockResolvedValue({ categories: [{ amount: '20.00', name: 'Makan' }] })
    const reports = useReportsStore()
    reports.setRange({ endDate: '2026-09-19', startDate: '2026-09-01' })

    await reports.load({ isAdmin: true, selectedUserId: 'target-1' })

    expect(mocks.getReportSummary).toHaveBeenCalledWith(expect.objectContaining({
      isAdmin: true,
      range: 'custom',
      selectedUserId: 'target-1',
    }))
    expect(mocks.getReportBreakdown).toHaveBeenCalledWith(expect.objectContaining({ groupBy: 'category' }))
    expect(reports.status).toBe('ready')
    expect(reports.isEmpty).toBe(false)
  })

  it('exposes validation instead of loading an invalid range or an admin without a target', async () => {
    const reports = useReportsStore()
    reports.setRange({ endDate: '2026-09-01', startDate: '2026-09-19' })
    await reports.load()
    expect(reports.validationError).toContain('Tanggal mulai')
    expect(mocks.getReportSummary).not.toHaveBeenCalled()

    reports.setRange({ endDate: '2026-09-19', startDate: '2026-09-01' })
    await reports.load({ isAdmin: true })
    expect(reports.validationError).toContain('Pilih pengguna')
    expect(mocks.getReportSummary).not.toHaveBeenCalled()
  })

  it('marks a report with no active categories as empty', async () => {
    mocks.getReportSummary.mockResolvedValue({ income: '0.00', expense: '0.00', difference: '0.00' })
    mocks.getReportBreakdown.mockResolvedValue({ categories: [] })
    const reports = useReportsStore()
    reports.setRange({ endDate: '2026-09-19', startDate: '2026-09-01' })

    await reports.load()
    expect(reports.isEmpty).toBe(true)
  })
})
