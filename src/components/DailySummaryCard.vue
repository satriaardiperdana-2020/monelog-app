<script setup>
import { RouterLink } from 'vue-router'

import { formatIndonesianDate } from '../utils/dates'
import { formatRupiah } from '../utils/money'

defineProps({
  summary: { type: Object, required: true },
})
</script>

<template>
  <RouterLink class="daily-summary-card" :to="`/hari/${summary.date}`">
    <span class="daily-summary-card__date">{{ formatIndonesianDate(summary.date) }}</span>
    <span class="daily-summary-card__totals">
      <span>
        <span class="daily-summary-card__label">Pengeluaran</span>
        <strong class="daily-summary-card__expense">{{ formatRupiah(summary.expense) }}</strong>
      </span>
      <span>
        <span class="daily-summary-card__label">Pemasukan</span>
        <strong class="daily-summary-card__income">{{ formatRupiah(summary.income) }}</strong>
      </span>
    </span>
  </RouterLink>
</template>
