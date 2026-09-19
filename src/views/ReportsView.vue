<script setup>
import { computed, ref, watch } from 'vue'

import PageState from '../components/PageState.vue'
import ReportExportActions from '../components/ReportExportActions.vue'
import { translate } from '../i18n'
import { useAdminSelectedUserStore } from '../stores/admin-selected-user'
import { useAppStore } from '../stores/app'
import { useAuthStore } from '../stores/auth'
import { useReportsStore } from '../stores/reports'
import { daysBefore, formatDate, todayInTimezone } from '../utils/dates'
import { formatRupiah } from '../utils/money'

const auth = useAuthStore()
const app = useAppStore()
const adminSelectedUser = useAdminSelectedUserStore()
const reports = useReportsStore()
const startDate = ref('')
const endDate = ref('')

const isAdmin = computed(() => auth.user?.role === 'admin')
const targetLabel = computed(() => {
  if (!isAdmin.value) return auth.user?.email || 'Pengguna saya'
  return adminSelectedUser.selectedUser?.email || 'Pengguna terpilih'
})

function setDefaultRange() {
  if (!auth.user?.timezone || startDate.value || endDate.value) return
  endDate.value = todayInTimezone(auth.user.timezone)
  startDate.value = daysBefore(endDate.value, 29)
}

async function load() {
  reports.setRange({ endDate: endDate.value, startDate: startDate.value })
  await reports.load({
    isAdmin: isAdmin.value,
    selectedUserId: adminSelectedUser.selectedUserId,
  })
}

watch(() => auth.user?.timezone, setDefaultRange, { immediate: true })
watch(() => adminSelectedUser.selectedUserId, () => {
  if (isAdmin.value && adminSelectedUser.selectedUserId && startDate.value && endDate.value) load()
})
</script>

<template>
  <section class="reports-view" aria-labelledby="reports-title">
    <header>
      <p class="eyebrow">{{ translate(app.locale, 'report') }}</p>
      <h1 id="reports-title">{{ translate(app.locale, 'financialSummary') }}</h1>
      <p v-if="isAdmin">{{ app.locale === 'en' ? 'The report is created for the user selected by the administrator.' : 'Laporan dibuat untuk pengguna yang dipilih administrator.' }}</p>
    </header>

    <form class="report-filter" novalidate @submit.prevent="load">
      <label for="report-start-date">{{ translate(app.locale, 'dateStart') }}</label>
      <input id="report-start-date" v-model="startDate" type="date" required>
      <label for="report-end-date">{{ translate(app.locale, 'dateEnd') }}</label>
      <input id="report-end-date" v-model="endDate" type="date" required>
      <p v-if="reports.validationError" class="field-error" aria-live="assertive">{{ reports.validationError }}</p>
      <button type="submit" :disabled="reports.status === 'loading'">{{ translate(app.locale, 'showReport') }}</button>
    </form>

    <PageState
      v-if="isAdmin && !adminSelectedUser.selectedUserId"
      state="empty"
      :title="app.locale === 'en' ? 'Select a user first' : 'Pilih pengguna terlebih dahulu'"
      :description="app.locale === 'en' ? 'Administrators can export only the data of the currently selected user.' : 'Administrator hanya dapat mengekspor data pengguna yang sedang dipilih.'"
    />
    <PageState v-else-if="reports.status === 'loading'" state="loading" :title="translate(app.locale, 'reportLoading')" />
    <PageState
      v-else-if="reports.status === 'error'"
      state="error"
      :title="translate(app.locale, 'reportUnavailable')"
      :description="app.locale === 'en' ? 'Check your connection, then try again.' : 'Periksa koneksi Anda, lalu coba lagi.'"
      @retry="load"
    />
    <PageState
      v-else-if="reports.isEmpty"
      state="empty"
      :title="translate(app.locale, 'emptyActiveTransactions')"
      :description="translate(app.locale, 'noReportData')"
    />
    <template v-else-if="reports.status === 'ready'">
      <section class="report-summary" aria-label="Ringkasan laporan">
        <p>{{ translate(app.locale, 'selectedPeriod') }} {{ formatDate(reports.summary.period.start_date, app.locale) }} – {{ formatDate(reports.summary.period.end_date, app.locale) }}</p>
        <dl>
          <div><dt>{{ translate(app.locale, 'income') }}</dt><dd>{{ formatRupiah(reports.summary.income) }}</dd></div>
          <div><dt>{{ translate(app.locale, 'expense') }}</dt><dd>{{ formatRupiah(reports.summary.expense) }}</dd></div>
          <div><dt>{{ translate(app.locale, 'difference') }}</dt><dd>{{ formatRupiah(reports.summary.difference) }}</dd></div>
        </dl>
      </section>
      <section class="report-categories" aria-labelledby="report-categories-title">
        <h2 id="report-categories-title">{{ translate(app.locale, 'reportByCategory') }}</h2>
        <ul>
          <li v-for="category in reports.breakdown.categories" :key="category.category_id">
            <span>{{ category.name }} · {{ category.type === 'income' ? translate(app.locale, 'income') : translate(app.locale, 'expense') }}</span>
            <strong>{{ formatRupiah(category.amount) }}</strong>
          </li>
        </ul>
      </section>
      <ReportExportActions
        :breakdown="reports.breakdown"
        :end-date="reports.endDate"
        :start-date="reports.startDate"
        :summary="reports.summary"
        :target-label="targetLabel"
      />
    </template>
  </section>
</template>
