import { afterEach, describe, expect, it, vi } from 'vitest'

import { exportExcelReport, exportPdfReport, reportFilename } from '../../src/services/export/report-export'

const report = {
  breakdown: { categories: [{ amount: '769500.00', name: 'Makan', type: 'expense' }] },
  endDate: '2026-09-19',
  startDate: '2026-09-01',
  summary: { difference: '230500.00', expense: '769500.00', income: '1000000.00' },
  targetLabel: 'Satria / Test',
}

afterEach(() => vi.unstubAllGlobals())

describe('report export', () => {
  it('creates deterministic sanitized filenames', () => {
    expect(reportFilename({ ...report, extension: 'xlsx' })).toBe('laporan-satria-test-2026-09-01-2026-09-19.xlsx')
    expect(reportFilename({ ...report, extension: 'xlsx', locale: 'en' })).toBe('report-satria-test-2026-09-01-2026-09-19.xlsx')
  })

  it('writes monetary Excel cells as numbers', async () => {
    const rows = []
    const cells = new Map()
    const sheet = {
      addRow: (row) => { rows.push(row); return row },
      columns: [],
      get rowCount() { return rows.length },
      getCell: (address) => {
        if (!cells.has(address)) cells.set(address, {})
        return cells.get(address)
      },
    }
    const workbook = {
      addWorksheet: vi.fn(() => sheet),
      xlsx: { writeBuffer: vi.fn().mockResolvedValue(new Uint8Array([1])) },
    }
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:test'), revokeObjectURL: vi.fn() })
    vi.spyOn(document, 'createElement').mockReturnValue({ click: vi.fn() })

    class Workbook {
      constructor() { return workbook }
    }
    await exportExcelReport(report, { loadExcelJs: async () => ({ Workbook }) })

    expect(rows).toContainEqual(['Pemasukan', 1000000])
    expect(rows).toContainEqual(['Makan', 'Pengeluaran', 769500])
    expect(cells.get('B6').numFmt).toContain('Rp')
  })

  it('formats PDF amounts in Indonesian Rupiah', async () => {
    const document = {
      lastAutoTable: { finalY: 60 },
      save: vi.fn(),
      setFontSize: vi.fn(),
      text: vi.fn(),
    }
    const autoTable = vi.fn()

    await exportPdfReport(report, {
      loadAutoTable: async () => ({ default: autoTable }),
      loadJsPdf: async () => ({
        jsPDF: class JsPdf {
          constructor() { return document }
        },
      }),
    })

    expect(autoTable).toHaveBeenCalledWith(document, expect.objectContaining({
      body: expect.arrayContaining([['Pengeluaran', 'Rp769.500,00']]),
    }))
    expect(document.save).toHaveBeenCalledWith('laporan-satria-test-2026-09-01-2026-09-19.pdf')
  })

  it('uses English labels and filenames for an English export', async () => {
    const document = { lastAutoTable: { finalY: 60 }, save: vi.fn(), setFontSize: vi.fn(), text: vi.fn() }
    const autoTable = vi.fn()

    await exportPdfReport({ ...report, locale: 'en' }, {
      loadAutoTable: async () => ({ default: autoTable }),
      loadJsPdf: async () => ({ jsPDF: class JsPdf { constructor() { return document } } }),
    })

    expect(document.text).toHaveBeenCalledWith('Financial summary', 14, 18)
    expect(autoTable).toHaveBeenCalledWith(document, expect.objectContaining({ head: [['Summary', 'Total']] }))
    expect(document.save).toHaveBeenCalledWith('report-satria-test-2026-09-01-2026-09-19.pdf')
  })
})
