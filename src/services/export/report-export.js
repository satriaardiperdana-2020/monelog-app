import { formatIndonesianDate } from '../../utils/dates'
import { formatRupiah } from '../../utils/money'

const MONEY = /^-?(0|[1-9][0-9]{0,11})\.[0-9]{2}$/

function displayType(type) {
  return type === 'income' ? 'Pemasukan' : 'Pengeluaran'
}

function safeText(value) {
  const text = String(value ?? '')
  return /^[=+\-@]/.test(text) ? `'${text}` : text
}

function amountAsExcelNumber(value) {
  if (typeof value !== 'string' || !MONEY.test(value)) {
    throw new Error('Nilai uang laporan tidak valid.')
  }

  // The OpenAPI maximum (12 integer digits plus cents) is inside IEEE-754's
  // exact cent range. Excel requires a JavaScript numeric cell value.
  return +value
}

function slug(value) {
  const normalized = String(value || 'pengguna')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized.slice(0, 60) || 'pengguna'
}

export function reportFilename({ endDate, extension, startDate, targetLabel }) {
  return `laporan-${slug(targetLabel)}-${startDate}-${endDate}.${extension}`
}

function summaryRows(summary) {
  return [
    ['Pemasukan', summary.income],
    ['Pengeluaran', summary.expense],
    ['Selisih', summary.difference],
  ]
}

function categoryRows(breakdown) {
  return (breakdown.categories || []).map((category) => [
    safeText(category.name),
    displayType(category.type),
    category.amount,
  ])
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function exportExcelReport(report, { loadExcelJs = () => import('exceljs') } = {}) {
  const module = await loadExcelJs()
  const ExcelJS = module.default || module
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Laporan')
  const filename = reportFilename({ ...report, extension: 'xlsx' })

  sheet.columns = [{ width: 28 }, { width: 20 }, { width: 20 }]
  sheet.addRow(['Laporan Keuangan'])
  sheet.addRow(['Periode', `${report.startDate} s.d. ${report.endDate}`])
  sheet.addRow(['Pengguna', safeText(report.targetLabel)])
  sheet.addRow([])
  sheet.addRow(['Ringkasan', '', ''])
  for (const [label, amount] of summaryRows(report.summary)) {
    sheet.addRow([label, amountAsExcelNumber(amount)])
  }
  sheet.addRow([])
  sheet.addRow(['Kategori', 'Tipe', 'Jumlah'])
  for (const [name, type, amount] of categoryRows(report.breakdown)) {
    sheet.addRow([name, type, amountAsExcelNumber(amount)])
  }

  for (const rowNumber of [6, 7, 8]) sheet.getCell(`B${rowNumber}`).numFmt = '[$Rp-id-ID] #,##0.00'
  for (let rowNumber = 11; rowNumber <= sheet.rowCount; rowNumber += 1) {
    sheet.getCell(`C${rowNumber}`).numFmt = '[$Rp-id-ID] #,##0.00'
  }

  const buffer = await workbook.xlsx.writeBuffer()
  downloadBlob(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename)
  return filename
}

export async function exportPdfReport(report, { loadAutoTable = () => import('jspdf-autotable'), loadJsPdf = () => import('jspdf') } = {}) {
  const [pdfModule, autoTableModule] = await Promise.all([loadJsPdf(), loadAutoTable()])
  const JsPdf = pdfModule.jsPDF || pdfModule.default
  const autoTable = autoTableModule.default || autoTableModule.autoTable
  const document = new JsPdf()
  const filename = reportFilename({ ...report, extension: 'pdf' })

  document.setFontSize(16)
  document.text('Laporan Keuangan', 14, 18)
  document.setFontSize(10)
  document.text(`Pengguna: ${report.targetLabel}`, 14, 25)
  document.text(`Periode: ${formatIndonesianDate(report.startDate)} – ${formatIndonesianDate(report.endDate)}`, 14, 31)
  autoTable(document, {
    body: summaryRows(report.summary).map(([label, amount]) => [label, formatRupiah(amount)]),
    head: [['Ringkasan', 'Jumlah']],
    startY: 38,
  })
  autoTable(document, {
    body: categoryRows(report.breakdown).map(([name, type, amount]) => [name, type, formatRupiah(amount)]),
    head: [['Kategori', 'Tipe', 'Jumlah']],
    startY: document.lastAutoTable.finalY + 10,
  })
  document.save(filename)
  return filename
}
