<script setup>
import { ref } from 'vue'

import { translate } from '../i18n'
import { useAppStore } from '../stores/app'
import { exportExcelReport, exportPdfReport } from '../services/export/report-export'

const props = defineProps({
  breakdown: { type: Object, required: true },
  disabled: { type: Boolean, default: false },
  endDate: { type: String, required: true },
  startDate: { type: String, required: true },
  summary: { type: Object, required: true },
  targetLabel: { type: String, required: true },
})

const exporting = ref('')
const error = ref('')
const app = useAppStore()

async function exportReport(type) {
  exporting.value = type
  error.value = ''
  const report = {
    breakdown: props.breakdown,
    endDate: props.endDate,
    locale: app.locale,
    startDate: props.startDate,
    summary: props.summary,
    targetLabel: props.targetLabel,
  }
  try {
    if (type === 'excel') await exportExcelReport(report)
    else await exportPdfReport(report)
  } catch {
    error.value = translate(app.locale, 'errorExport')
  } finally {
    exporting.value = ''
  }
}
</script>

<template>
  <section class="report-export-actions" aria-labelledby="report-export-title">
    <h2 id="report-export-title">{{ translate(app.locale, 'exportReport') }}</h2>
    <p>{{ translate(app.locale, 'exportDescription') }}</p>
    <p v-if="error" class="field-error" aria-live="assertive">{{ error }}</p>
    <div class="report-export-actions__buttons">
      <button type="button" :disabled="disabled || Boolean(exporting)" @click="exportReport('excel')">
        {{ exporting === 'excel' ? translate(app.locale, 'makingExcel') : translate(app.locale, 'downloadExcel') }}
      </button>
      <button type="button" :disabled="disabled || Boolean(exporting)" @click="exportReport('pdf')">
        {{ exporting === 'pdf' ? translate(app.locale, 'makingPdf') : translate(app.locale, 'downloadPdf') }}
      </button>
    </div>
  </section>
</template>
