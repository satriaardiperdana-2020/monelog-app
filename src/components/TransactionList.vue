<script setup>
import { RouterLink } from 'vue-router'

import { formatRupiah } from '../utils/money'

defineProps({
  items: { type: Array, required: true },
  loadingMore: { type: Boolean, default: false },
  nextCursor: { type: String, default: null },
})

defineEmits(['load-more'])
</script>

<template>
  <div class="transaction-list">
    <RouterLink v-for="transaction in items" :key="transaction.id" class="transaction-list__item" :to="`/transaksi/${transaction.id}/edit`">
      <span class="transaction-list__title">{{ transaction.title }}</span>
      <span class="transaction-list__amount" :class="`transaction-list__amount--${transaction.type}`"><span>{{ transaction.type === 'expense' ? 'Pengeluaran' : 'Pemasukan' }}</span><strong>{{ transaction.type === 'expense' ? '−' : '+' }} {{ formatRupiah(transaction.amount) }}</strong></span>
    </RouterLink>
    <button v-if="nextCursor" class="transaction-list__more" type="button" :disabled="loadingMore" @click="$emit('load-more')">{{ loadingMore ? 'Memuat…' : 'Muat lagi' }}</button>
  </div>
</template>
