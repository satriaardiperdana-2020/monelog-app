<script setup>
import { computed, watch } from 'vue'
import { RouterLink } from 'vue-router'

import DailySummaryCard from '../components/DailySummaryCard.vue'
import PageState from '../components/PageState.vue'
import { translate } from '../i18n'
import { useAppStore } from '../stores/app'
import { useAuthStore } from '../stores/auth'
import { useDailyStore } from '../stores/daily'
import { formatDate } from '../utils/dates'
import { formatRupiah } from '../utils/money'

const auth = useAuthStore()
const app = useAppStore()
const daily = useDailyStore()
const today = computed(() => daily.todaySummary)

function loadSummaries() {
  if (auth.user?.timezone) daily.loadInitial(auth.user.timezone)
}

watch(() => auth.user?.timezone, loadSummaries, { immediate: true })
</script>

<template>
  <section class="home-view" aria-labelledby="home-title">
    <header class="home-view__header">
      <div>
        <p class="eyebrow">{{ translate(app.locale, 'todaySummary') }}</p>
        <h1 id="home-title">{{ formatDate(daily.today, app.locale) || translate(app.locale, 'appName') }}</h1>
      </div>
      <RouterLink class="home-view__add" :to="{ name: 'transaction-create', query: { tanggal: daily.today } }">
        {{ app.locale === 'en' ? 'Add' : 'Tambah' }}
      </RouterLink>
    </header>

    <PageState
      v-if="daily.status === 'loading'"
      state="loading"
      title="Memuat ringkasan"
      description="Menyiapkan catatan keuangan Anda."
    />
    <PageState
      v-else-if="daily.status === 'error'"
      state="error"
      title="Ringkasan belum dapat dimuat"
      description="Periksa koneksi Anda, lalu coba lagi."
      @retry="loadSummaries"
    />
    <template v-else>
      <section class="today-summary" aria-label="Total hari ini">
        <div>
          <span>{{ translate(app.locale, 'expense') }}</span>
          <strong>{{ formatRupiah(today.expense) }}</strong>
        </div>
        <div>
          <span>{{ translate(app.locale, 'income') }}</span>
          <strong>{{ formatRupiah(today.income) }}</strong>
        </div>
      </section>

      <section class="home-view__history" aria-labelledby="history-title">
        <h2 id="history-title">{{ translate(app.locale, 'earlier') }}</h2>
        <PageState
          v-if="daily.earlierSummaries.length === 0"
          state="empty"
          :title="translate(app.locale, 'noEarlierRecords')"
          :description="app.locale === 'en' ? 'Add a transaction to see daily summaries.' : 'Tambahkan transaksi untuk mulai melihat ringkasan harian.'"
        />
        <div v-else class="daily-summary-list">
          <DailySummaryCard v-for="summary in daily.earlierSummaries" :key="summary.date" :summary="summary" />
        </div>
        <button v-if="daily.nextCursor" class="home-view__more" type="button" :disabled="daily.status === 'loading-more'" @click="daily.loadMore">
          {{ daily.status === 'loading-more' ? translate(app.locale, 'loading') : (app.locale === 'en' ? 'Load more' : 'Muat lagi') }}
        </button>
      </section>
    </template>
  </section>
</template>
