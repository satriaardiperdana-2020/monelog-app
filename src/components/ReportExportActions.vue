<script setup>
import { ref } from 'vue'

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

async function exportReport(type) {
  exporting.value = type
  error.value = ''
  const report = {
    breakdown: props.breakdown,
    endDate: props.endDate,
    startDate: props.startDate,
    summary: props.summary,
    targetLabel: props.targetLabel,
  }
  try {
    if (type === 'excel') await exportExcelReport(report)
    else await exportPdfReport(report)
  } catch {
    error.value = 'Ekspor belum dapat dibuat. Coba lagi.'
  } finally {
    exporting.value = ''
  }
}
</script>

<template>
  <section class="report-export-actions" aria-labelledby="report-export-title">
    <h2 id="report-export-title">Ekspor laporan</h2>
    <p>Unduh laporan untuk periode yang dipilih.</p>
    <p v-if="error" class="field-error" aria-live="assertive">{{ error }}</p>
    <div class="report-export-actions__buttons">
      <button type="button" :disabled="disabled || Boolean(exporting)" @click="exportReport('excel')">
        {{ exporting === 'excel' ? 'Membuat Excel…' : 'Unduh Excel' }}
      </button>
      <button type="button" :disabled="disabled || Boolean(exporting)" @click="exportReport('pdf')">
        {{ exporting === 'pdf' ? 'Membuat PDF…' : 'Unduh PDF' }}
      </button>
    </div>
  </section>
</template>
