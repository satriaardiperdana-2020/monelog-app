<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import TransactionForm from '../components/TransactionForm.vue'
import { translate } from '../i18n'
import { useAppStore } from '../stores/app'
import { listActiveCategories } from '../services/api/categories-api'
import { useAuthStore } from '../stores/auth'
import { useDailyStore } from '../stores/daily'
import { useTransactionsStore } from '../stores/transactions'
import { isValidDate, todayInTimezone } from '../utils/dates'

const auth = useAuthStore()
const app = useAppStore()
const daily = useDailyStore()
const route = useRoute()
const router = useRouter()
const transactions = useTransactionsStore()
const categories = ref([])
const submitting = ref(false)
const submitError = ref('')
const selectedDate = computed(() =>
  isValidDate(route.query.tanggal) ? route.query.tanggal : todayInTimezone(auth.user.timezone),
)
const initialDraft = computed(() => ({
  transaction_date: selectedDate.value,
  type: 'expense',
  category_id: '',
  amount: '',
  title: '',
}))

onMounted(async () => {
  try {
    categories.value = await listActiveCategories()
  } catch {
    submitError.value = 'Kategori belum dapat dimuat. Coba lagi.'
  }
})

async function save(payload) {
  submitting.value = true
  submitError.value = ''
  try {
    const transaction = await transactions.create(payload)
    const date = transaction.transaction_date
    await Promise.all([transactions.loadForDate(date), daily.loadInitial(auth.user.timezone)])
    router.push({ name: 'day-detail', params: { date } })
  } catch {
    submitError.value = 'Transaksi belum dapat disimpan. Periksa data Anda lalu coba lagi.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section aria-labelledby="create-transaction-title"><h1 id="create-transaction-title">{{ translate(app.locale, 'addTransaction') }}</h1><TransactionForm :categories="categories" :initial-draft="initialDraft" :max-date="todayInTimezone(auth.user.timezone)" :submitting="submitting" :submit-error="submitError" @cancel="router.back()" @submit="save" /></section>
</template>
