<script setup>
import { RouterLink } from 'vue-router'

import { translate } from '../i18n'
import { useAppStore } from '../stores/app'
import { formatDate } from '../utils/dates'
import { formatRupiah } from '../utils/money'

const app = useAppStore()

defineProps({
  summary: { type: Object, required: true },
})
</script>

<template>
  <RouterLink class="daily-summary-card" :to="`/hari/${summary.date}`">
    <span class="daily-summary-card__date">{{ formatDate(summary.date, app.locale) }}</span>
    <span class="daily-summary-card__totals">
      <span>
        <span class="daily-summary-card__label">{{ translate(app.locale, 'expense') }}</span>
        <strong class="daily-summary-card__expense">{{ formatRupiah(summary.expense) }}</strong>
      </span>
      <span>
        <span class="daily-summary-card__label">{{ translate(app.locale, 'income') }}</span>
        <strong class="daily-summary-card__income">{{ formatRupiah(summary.income) }}</strong>
      </span>
    </span>
  </RouterLink>
</template>
