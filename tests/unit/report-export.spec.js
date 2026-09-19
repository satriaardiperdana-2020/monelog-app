import { describe, expect, it, vi } from 'vitest'

import { exportExcelReport, exportPdfReport, reportFilename } from '../../src/services/export/report-export'

const report = {
  breakdown: { categories: [{ amount: '769500.00', name: 'Makan', type: 'expense' }] },
  endDate: '2026-09-19',
  startDate: '2026-09-01',
  summary: { difference: '230500.00', expense: '769500.00', income: '1000000.00' },
  targetLabel: 'Satria / Test',
}

describe('report export', () => {
  it('creates deterministic sanitized filenames', () => {
    expect(reportFilename({ ...report, extension: 'xlsx' })).toBe('laporan-satria-test-2026-09-01-2026-09-19.xlsx')
    expect(reportFilename({ ...report, extension: 'xlsx', locale: 'en' })).toBe('report-satria-test-2026-09-01-2026-09-19.xlsx')
  })

  it('writes monetary Excel cells as numbers and delegates saving', async () => {
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
    const saveFile = vi.fn()

    class Workbook {
      constructor() { return workbook }
    }
    await exportExcelReport(report, { loadExcelJs: async () => ({ Workbook }), saveFile })

    expect(rows).toContainEqual(['Pemasukan', 1000000])
    expect(rows).toContainEqual(['Makan', 'Pengeluaran', 769500])
    expect(cells.get('B6').numFmt).toContain('Rp')
    expect(saveFile).toHaveBeenCalledWith(expect.objectContaining({
      filename: 'laporan-satria-test-2026-09-01-2026-09-19.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }))
  })

  it('formats PDF amounts in Indonesian Rupiah and delegates saving', async () => {
    const document = {
      lastAutoTable: { finalY: 60 },
      output: vi.fn(() => new ArrayBuffer(1)),
      setFontSize: vi.fn(),
      text: vi.fn(),
    }
    const autoTable = vi.fn()
    const saveFile = vi.fn()

    await exportPdfReport(report, {
      loadAutoTable: async () => ({ default: autoTable }),
      loadJsPdf: async () => ({ jsPDF: class JsPdf { constructor() { return document } } }),
      saveFile,
    })

    expect(autoTable).toHaveBeenCalledWith(document, expect.objectContaining({
      body: expect.arrayContaining([['Pengeluaran', 'Rp769.500,00']]),
    }))
    expect(saveFile).toHaveBeenCalledWith(expect.objectContaining({
      filename: 'laporan-satria-test-2026-09-01-2026-09-19.pdf',
      mimeType: 'application/pdf',
    }))
  })

  it('uses English labels and filenames for an English export', async () => {
    const document = {
      lastAutoTable: { finalY: 60 },
      output: vi.fn(() => new ArrayBuffer(1)),
      setFontSize: vi.fn(),
      text: vi.fn(),
    }
    const autoTable = vi.fn()
    const saveFile = vi.fn()

    await exportPdfReport({ ...report, locale: 'en' }, {
      loadAutoTable: async () => ({ default: autoTable }),
      loadJsPdf: async () => ({ jsPDF: class JsPdf { constructor() { return document } } }),
      saveFile,
    })

    expect(document.text).toHaveBeenCalledWith('Financial summary', 14, 18)
    expect(autoTable).toHaveBeenCalledWith(document, expect.objectContaining({ head: [['Summary', 'Total']] }))
    expect(saveFile).toHaveBeenCalledWith(expect.objectContaining({
      filename: 'report-satria-test-2026-09-01-2026-09-19.pdf',
    }))
  })
})
