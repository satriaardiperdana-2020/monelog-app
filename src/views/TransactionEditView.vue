<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ConfirmDialog from '../components/ConfirmDialog.vue'
import PageState from '../components/PageState.vue'
import TransactionForm from '../components/TransactionForm.vue'
import { listActiveCategories } from '../services/api/categories-api'
import { useAuthStore } from '../stores/auth'
import { useDailyStore } from '../stores/daily'
import { useTransactionsStore } from '../stores/transactions'

const auth = useAuthStore()
const daily = useDailyStore()
const route = useRoute()
const router = useRouter()
const transactions = useTransactionsStore()
const categories = ref([])
const deleteOpen = ref(false)
const loadError = ref('')
const submitting = ref(false)
const submitError = ref('')
const transaction = ref(null)

async function load() {
  loadError.value = ''
  try {
    const [record, activeCategories] = await Promise.all([
      transactions.get(route.params.id),
      listActiveCategories(),
    ])
    transaction.value = record
    categories.value = activeCategories
  } catch {
    loadError.value = 'Transaksi belum dapat dimuat. Coba lagi.'
  }
}

async function refreshAndReturn(date) {
  await Promise.all([transactions.loadForDate(date), daily.loadInitial(auth.user.timezone)])
  router.push({ name: 'day-detail', params: { date } })
}

async function save(payload) {
  submitting.value = true
  submitError.value = ''
  try {
    const updated = await transactions.update(route.params.id, { ...payload, version: transaction.value.version })
    await refreshAndReturn(updated.transaction_date)
  } catch {
    submitError.value = 'Transaksi belum dapat diperbarui. Muat ulang jika ada perubahan dari perangkat lain.'
  } finally {
    submitting.value = false
  }
}

async function remove() {
  submitting.value = true
  submitError.value = ''
  try {
    const date = transaction.value.transaction_date
    await transactions.delete(transaction.value.id, transaction.value.version)
    await refreshAndReturn(date)
  } catch {
    deleteOpen.value = false
    submitError.value = 'Transaksi belum dapat dihapus. Muat ulang jika ada perubahan dari perangkat lain.'
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>

<template>
  <section aria-labelledby="edit-transaction-title"><h1 id="edit-transaction-title">Ubah transaksi</h1><PageState v-if="loadError" state="error" title="Transaksi belum dapat dimuat" :description="loadError" @retry="load" /><PageState v-else-if="!transaction" state="loading" title="Memuat transaksi" /><template v-else><TransactionForm :categories="categories" :include-client-request-id="false" :initial-draft="transaction" :max-date="todayInTimezone(auth.user.timezone)" :submitting="submitting" :submit-error="submitError" @cancel="router.back()" @submit="save" /><button type="button" @click="deleteOpen = true">Hapus transaksi</button><ConfirmDialog :open="deleteOpen" title="Hapus transaksi?" description="Transaksi dipindahkan ke Sampah dan dapat dipulihkan." @cancel="deleteOpen = false" @confirm="remove" /></template></section>
</template>
