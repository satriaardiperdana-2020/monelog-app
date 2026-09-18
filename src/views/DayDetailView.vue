<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import PageState from '../components/PageState.vue'
import TransactionList from '../components/TransactionList.vue'
import { listDailySummaries } from '../services/api/daily-api'
import { useTransactionsStore } from '../stores/transactions'
import { formatIndonesianDate, isValidDate } from '../utils/dates'
import { formatRupiah } from '../utils/money'

const route = useRoute()
const router = useRouter()
const transactions = useTransactionsStore()
const selectedDate = computed(() => route.params.date)
const summary = ref(null)
const summaryStatus = ref('idle')

function zeroSummary(date) {
  return { date, expense: '0.00', income: '0.00', difference: '0.00' }
}

async function loadDay() {
  const date = selectedDate.value
  if (!isValidDate(date)) {
    router.replace({ name: 'home' })
    return
  }

  summaryStatus.value = 'loading'
  const [summaryResult] = await Promise.allSettled([
    listDailySummaries({ endDate: date, limit: 1, startDate: date }),
    transactions.loadForDate(date),
  ])
  if (summaryResult.status === 'fulfilled') {
    summary.value = summaryResult.value.data[0] || zeroSummary(date)
    summaryStatus.value = 'ready'
  } else {
    summaryStatus.value = 'error'
  }
}

watch(selectedDate, loadDay, { immediate: true })
</script>

<template>
  <section class="day-detail" aria-labelledby="day-title">
    <header class="day-detail__header"><div><p class="eyebrow">Ringkasan harian</p><h1 id="day-title">{{ formatIndonesianDate(selectedDate) }}</h1></div><RouterLink class="home-view__add" :to="{ name: 'transaction-create', query: { tanggal: selectedDate } }">Tambah</RouterLink></header>
    <PageState v-if="summaryStatus === 'loading'" state="loading" title="Memuat ringkasan" />
    <PageState v-else-if="summaryStatus === 'error'" state="error" title="Ringkasan belum dapat dimuat" description="Periksa koneksi Anda, lalu coba lagi." @retry="loadDay" />
    <section v-else-if="summary" class="today-summary" aria-label="Total tanggal terpilih"><div><span>Pengeluaran</span><strong>{{ formatRupiah(summary.expense) }}</strong></div><div><span>Pemasukan</span><strong>{{ formatRupiah(summary.income) }}</strong></div></section>
    <section class="day-detail__transactions" aria-labelledby="transactions-title"><h2 id="transactions-title">Transaksi</h2><PageState v-if="transactions.status === 'loading'" state="loading" title="Memuat transaksi" /><PageState v-else-if="transactions.status === 'error'" state="error" title="Transaksi belum dapat dimuat" description="Periksa koneksi Anda, lalu coba lagi." @retry="loadDay" /><PageState v-else-if="transactions.items.length === 0" state="empty" title="Belum ada transaksi" description="Tambahkan transaksi untuk tanggal ini." /><TransactionList v-else :items="transactions.items" :next-cursor="transactions.nextCursor" :loading-more="transactions.status === 'loading-more'" @load-more="transactions.loadMore" /></section>
  </section>
</template>
