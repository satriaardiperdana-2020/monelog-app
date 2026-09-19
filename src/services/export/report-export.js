import { translate } from '../../i18n'
import { formatDate } from '../../utils/dates'
import { formatRupiah } from '../../utils/money'
import { saveExportFile } from './export-file'

const MONEY = /^-?(0|[1-9][0-9]{0,11})\.[0-9]{2}$/

function displayType(type, locale) {
  return type === 'income' ? translate(locale, 'income') : translate(locale, 'expense')
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

export function reportFilename({ endDate, extension, locale = 'id', startDate, targetLabel }) {
  return `${locale === 'en' ? 'report' : 'laporan'}-${slug(targetLabel)}-${startDate}-${endDate}.${extension}`
}

function summaryRows(summary, locale) {
  return [
    [translate(locale, 'income'), summary.income],
    [translate(locale, 'expense'), summary.expense],
    [translate(locale, 'difference'), summary.difference],
  ]
}

function categoryRows(breakdown, locale) {
  return (breakdown.categories || []).map((category) => [
    safeText(category.name),
    displayType(category.type, locale),
    category.amount,
  ])
}

export async function exportExcelReport(
  report,
  { loadExcelJs = () => import('exceljs'), saveFile = saveExportFile } = {},
) {
  const module = await loadExcelJs()
  const ExcelJS = module.default || module
  const workbook = new ExcelJS.Workbook()
  const locale = report.locale === 'en' ? 'en' : 'id'
  const sheet = workbook.addWorksheet(translate(locale, 'report'))
  const filename = reportFilename({ ...report, extension: 'xlsx' })

  sheet.columns = [{ width: 28 }, { width: 20 }, { width: 20 }]
  sheet.addRow([translate(locale, 'financialSummary')])
  sheet.addRow([translate(locale, 'selectedPeriod'), `${report.startDate} – ${report.endDate}`])
  sheet.addRow([translate(locale, 'user'), safeText(report.targetLabel)])
  sheet.addRow([])
  sheet.addRow([translate(locale, 'summary'), '', ''])
  for (const [label, amount] of summaryRows(report.summary, locale)) {
    sheet.addRow([label, amountAsExcelNumber(amount)])
  }
  sheet.addRow([])
  sheet.addRow([translate(locale, 'category'), translate(locale, 'type'), translate(locale, 'total')])
  for (const [name, type, amount] of categoryRows(report.breakdown, locale)) {
    sheet.addRow([name, type, amountAsExcelNumber(amount)])
  }

  for (const rowNumber of [6, 7, 8]) sheet.getCell(`B${rowNumber}`).numFmt = '[$Rp-id-ID] #,##0.00'
  for (let rowNumber = 11; rowNumber <= sheet.rowCount; rowNumber += 1) {
    sheet.getCell(`C${rowNumber}`).numFmt = '[$Rp-id-ID] #,##0.00'
  }

  const data = await workbook.xlsx.writeBuffer()
  await saveFile({
    data,
    filename,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  return filename
}

export async function exportPdfReport(
  report,
  {
    loadAutoTable = () => import('jspdf-autotable'),
    loadJsPdf = () => import('jspdf'),
    saveFile = saveExportFile,
  } = {},
) {
  const [pdfModule, autoTableModule] = await Promise.all([loadJsPdf(), loadAutoTable()])
  const JsPdf = pdfModule.jsPDF || pdfModule.default
  const autoTable = autoTableModule.default || autoTableModule.autoTable
  const document = new JsPdf()
  const locale = report.locale === 'en' ? 'en' : 'id'
  const filename = reportFilename({ ...report, extension: 'pdf' })

  document.setFontSize(16)
  document.text(translate(locale, 'financialSummary'), 14, 18)
  document.setFontSize(10)
  document.text(`${translate(locale, 'user')}: ${report.targetLabel}`, 14, 25)
  document.text(`${translate(locale, 'selectedPeriod')}: ${formatDate(report.startDate, locale)} – ${formatDate(report.endDate, locale)}`, 14, 31)
  autoTable(document, {
    body: summaryRows(report.summary, locale).map(([label, amount]) => [label, formatRupiah(amount)]),
    head: [[translate(locale, 'summary'), translate(locale, 'total')]],
    startY: 38,
  })
  autoTable(document, {
    body: categoryRows(report.breakdown, locale).map(([name, type, amount]) => [name, type, formatRupiah(amount)]),
    head: [[translate(locale, 'category'), translate(locale, 'type'), translate(locale, 'total')]],
    startY: document.lastAutoTable.finalY + 10,
  })
  await saveFile({ data: document.output('arraybuffer'), filename, mimeType: 'application/pdf' })
  return filename
}
