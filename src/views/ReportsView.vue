<script setup>
import { computed, ref, watch } from 'vue'

import PageState from '../components/PageState.vue'
import ReportExportActions from '../components/ReportExportActions.vue'
import { useAdminSelectedUserStore } from '../stores/admin-selected-user'
import { useAuthStore } from '../stores/auth'
import { useReportsStore } from '../stores/reports'
import { daysBefore, formatIndonesianDate, todayInTimezone } from '../utils/dates'
import { formatRupiah } from '../utils/money'

const auth = useAuthStore()
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
      <p class="eyebrow">Laporan</p>
      <h1 id="reports-title">Ringkasan keuangan</h1>
      <p v-if="isAdmin">Laporan dibuat untuk pengguna yang dipilih administrator.</p>
    </header>

    <form class="report-filter" novalidate @submit.prevent="load">
      <label for="report-start-date">Tanggal mulai</label>
      <input id="report-start-date" v-model="startDate" type="date" required>
      <label for="report-end-date">Tanggal selesai</label>
      <input id="report-end-date" v-model="endDate" type="date" required>
      <p v-if="reports.validationError" class="field-error" aria-live="assertive">{{ reports.validationError }}</p>
      <button type="submit" :disabled="reports.status === 'loading'">Tampilkan laporan</button>
    </form>

    <PageState
      v-if="isAdmin && !adminSelectedUser.selectedUserId"
      state="empty"
      title="Pilih pengguna terlebih dahulu"
      description="Administrator hanya dapat mengekspor data pengguna yang sedang dipilih."
    />
    <PageState v-else-if="reports.status === 'loading'" state="loading" title="Memuat laporan" />
    <PageState
      v-else-if="reports.status === 'error'"
      state="error"
      title="Laporan belum dapat dimuat"
      description="Periksa koneksi Anda, lalu coba lagi."
      @retry="load"
    />
    <PageState
      v-else-if="reports.isEmpty"
      state="empty"
      title="Belum ada transaksi aktif"
      description="Tidak ada data aktif pada rentang tanggal ini."
    />
    <template v-else-if="reports.status === 'ready'">
      <section class="report-summary" aria-label="Ringkasan laporan">
        <p>Periode {{ formatIndonesianDate(reports.summary.period.start_date) }} – {{ formatIndonesianDate(reports.summary.period.end_date) }}</p>
        <dl>
          <div><dt>Pemasukan</dt><dd>{{ formatRupiah(reports.summary.income) }}</dd></div>
          <div><dt>Pengeluaran</dt><dd>{{ formatRupiah(reports.summary.expense) }}</dd></div>
          <div><dt>Selisih</dt><dd>{{ formatRupiah(reports.summary.difference) }}</dd></div>
        </dl>
      </section>
      <section class="report-categories" aria-labelledby="report-categories-title">
        <h2 id="report-categories-title">Per kategori</h2>
        <ul>
          <li v-for="category in reports.breakdown.categories" :key="category.category_id">
            <span>{{ category.name }} · {{ category.type === 'income' ? 'Pemasukan' : 'Pengeluaran' }}</span>
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
