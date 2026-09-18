<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import PageState from '../components/PageState.vue'
import { useAuthStore } from '../stores/auth'
import { useCategoriesStore } from '../stores/categories'
import { useDailyStore } from '../stores/daily'
import { useTransactionsStore } from '../stores/transactions'
import { useTrashStore } from '../stores/trash'
import { formatRupiah } from '../utils/money'

const auth = useAuthStore()
const activeTab = ref('transactions')
const categories = useCategoriesStore()
const daily = useDailyStore()
const transactions = useTransactionsStore()
const trash = useTrashStore()
const restoreError = ref('')
const restoringId = ref('')
const activeItems = computed(() => activeTab.value === 'transactions' ? trash.transactions : trash.categories)

async function restoreTransaction(item) {
  restoringId.value = item.id
  restoreError.value = ''
  try {
    const restored = await trash.restoreTransaction(item.id)
    await Promise.all([
      transactions.loadForDate(restored.transaction_date),
      daily.loadInitial(auth.user.timezone),
      trash.load(),
    ])
  } catch {
    restoreError.value = 'Item belum dapat dipulihkan. Muat ulang jika ada perubahan dari perangkat lain.'
  } finally {
    restoringId.value = ''
  }
}

async function restoreCategory(item) {
  restoringId.value = item.id
  restoreError.value = ''
  try {
    const restored = await trash.restoreCategory(item.id)
    await Promise.all([categories.load(restored.type), trash.load()])
  } catch {
    restoreError.value = 'Kategori belum dapat dipulihkan. Muat ulang jika ada perubahan dari perangkat lain.'
  } finally {
    restoringId.value = ''
  }
}

onMounted(() => trash.load())
</script>

<template>
  <section class="trash-view" aria-labelledby="trash-title">
    <header class="trash-view__header"><div><p class="eyebrow">Data terhapus</p><h1 id="trash-title">Sampah</h1></div><RouterLink to="/kategori">Kategori</RouterLink></header>
    <div class="category-tabs" role="tablist" aria-label="Isi Sampah"><button :aria-selected="activeTab === 'transactions'" role="tab" type="button" @click="activeTab = 'transactions'">Transaksi</button><button :aria-selected="activeTab === 'categories'" role="tab" type="button" @click="activeTab = 'categories'">Kategori</button></div>
    <p v-if="restoreError" class="transaction-form__submit-error" aria-live="assertive">{{ restoreError }}</p>
    <PageState v-if="trash.status === 'loading'" state="loading" title="Memuat Sampah" />
    <PageState v-else-if="trash.status === 'error'" state="error" title="Sampah belum dapat dimuat" description="Periksa koneksi Anda, lalu coba lagi." @retry="trash.load" />
    <PageState v-else-if="activeItems.length === 0" state="empty" title="Sampah kosong" description="Item yang dihapus dapat dipulihkan dari sini." />
    <ul v-else class="trash-list"><li v-for="item in activeItems" :key="item.id"><div v-if="activeTab === 'transactions'"><strong>{{ item.title }}</strong><span>{{ item.type === 'expense' ? 'Pengeluaran' : 'Pemasukan' }} · {{ formatRupiah(item.amount) }}</span></div><div v-else><strong>{{ item.name }}</strong><span>{{ item.type === 'expense' ? 'Pengeluaran' : 'Pemasukan' }}</span></div><button type="button" :disabled="restoringId === item.id" @click="activeTab === 'transactions' ? restoreTransaction(item) : restoreCategory(item)">{{ restoringId === item.id ? 'Memulihkan…' : 'Pulihkan' }}</button></li></ul>
  </section>
</template>
