<script setup>
import { computed, nextTick, ref, watch } from 'vue'

import { translate } from '../i18n'
import { useAppStore } from '../stores/app'
import { createClientRequestId } from '../utils/ids'
import { validateTransactionDraft } from '../utils/validation'

const props = defineProps({
  categories: { type: Array, default: () => [] },
  initialDraft: {
    type: Object,
    default: () => ({
      amount: '',
      category_id: '',
      title: '',
      transaction_date: '',
      type: 'expense',
    }),
  },
  includeClientRequestId: { type: Boolean, default: true },
  maxDate: { type: String, default: '' },
  submitError: { type: String, default: '' },
  submitting: { type: Boolean, default: false },
})

const emit = defineEmits(['cancel', 'submit'])
const app = useAppStore()
const draft = ref({ ...props.initialDraft })
const errors = ref({})
const dateInput = ref(null)
const typeInput = ref(null)
const categoryInput = ref(null)
const amountInput = ref(null)
const titleInput = ref(null)
let clientRequestId = ''

const compatibleCategories = computed(() =>
  props.categories.filter((category) => category.type === draft.value.type),
)

function isCompatibleCategory(categoryId) {
  return compatibleCategories.value.some((category) => category.id === categoryId)
}

watch(
  () => draft.value.type,
  () => {
    if (!isCompatibleCategory(draft.value.category_id)) draft.value.category_id = ''
  },
)

watch(
  draft,
  () => {
    clientRequestId = ''
  },
  { deep: true },
)

watch(
  () => props.initialDraft,
  (nextDraft) => {
    draft.value = { ...nextDraft }
    errors.value = {}
    clientRequestId = ''
  },
  { deep: true },
)

function inputFor(field) {
  return {
    transaction_date: dateInput,
    type: typeInput,
    category_id: categoryInput,
    amount: amountInput,
    title: titleInput,
  }[field]
}

async function focusFirstInvalid() {
  const field = ['transaction_date', 'type', 'category_id', 'amount', 'title'].find(
    (name) => errors.value[name],
  )
  await nextTick()
  inputFor(field)?.value?.focus()
}

async function submit() {
  const result = validateTransactionDraft(draft.value, app.locale)
  errors.value = result.errors
  if (!result.valid) {
    await focusFirstInvalid()
    return
  }

  if (!props.includeClientRequestId) {
    emit('submit', result.value)
    return
  }

  if (!clientRequestId) clientRequestId = createClientRequestId()
  emit('submit', { ...result.value, client_request_id: clientRequestId })
}
</script>

<template>
  <form class="transaction-form" novalidate @submit.prevent="submit">
    <div class="transaction-form__field">
      <label for="transaction-date">{{ translate(app.locale, 'date') }}</label>
      <input id="transaction-date" ref="dateInput" v-model="draft.transaction_date" type="date" :max="maxDate || undefined" :aria-describedby="errors.transaction_date ? 'transaction-date-error' : undefined" :aria-invalid="Boolean(errors.transaction_date)">
      <p v-if="errors.transaction_date" id="transaction-date-error" class="field-error">{{ errors.transaction_date }}</p>
    </div>

    <fieldset class="transaction-form__field" :aria-describedby="errors.type ? 'transaction-type-error' : undefined">
      <legend>{{ translate(app.locale, 'transactionType') }}</legend>
      <label><input ref="typeInput" v-model="draft.type" type="radio" value="income"> {{ translate(app.locale, 'income') }}</label>
      <label><input v-model="draft.type" type="radio" value="expense"> {{ translate(app.locale, 'expense') }}</label>
      <p v-if="errors.type" id="transaction-type-error" class="field-error">{{ errors.type }}</p>
    </fieldset>

    <div class="transaction-form__field">
      <label for="transaction-category">{{ translate(app.locale, 'category') }}</label>
      <select id="transaction-category" ref="categoryInput" v-model="draft.category_id" :aria-describedby="errors.category_id ? 'transaction-category-error' : undefined" :aria-invalid="Boolean(errors.category_id)">
        <option value="">{{ translate(app.locale, 'selectCategory') }}</option>
        <option v-for="category in compatibleCategories" :key="category.id" :value="category.id">{{ category.name }}</option>
      </select>
      <p v-if="errors.category_id" id="transaction-category-error" class="field-error">{{ errors.category_id }}</p>
    </div>

    <div class="transaction-form__field">
      <label for="transaction-amount">{{ translate(app.locale, 'amount') }}</label>
      <input id="transaction-amount" ref="amountInput" v-model="draft.amount" inputmode="decimal" autocomplete="off" :aria-describedby="errors.amount ? 'transaction-amount-error' : undefined" :aria-invalid="Boolean(errors.amount)">
      <p class="field-hint">{{ translate(app.locale, 'exampleAmount') }}</p>
      <p v-if="errors.amount" id="transaction-amount-error" class="field-error">{{ errors.amount }}</p>
    </div>

    <div class="transaction-form__field">
      <label for="transaction-title">{{ translate(app.locale, 'title') }}</label>
      <input id="transaction-title" ref="titleInput" v-model="draft.title" maxlength="200" :aria-describedby="errors.title ? 'transaction-title-error' : undefined" :aria-invalid="Boolean(errors.title)">
      <p v-if="errors.title" id="transaction-title-error" class="field-error">{{ errors.title }}</p>
    </div>

    <p v-if="submitError" class="transaction-form__submit-error" aria-live="assertive">{{ submitError }}</p>
    <div class="transaction-form__actions">
      <button type="button" @click="emit('cancel')">{{ translate(app.locale, 'cancel') }}</button>
      <button type="submit" :disabled="submitting">{{ submitting ? translate(app.locale, 'saving') : translate(app.locale, 'save') }}</button>
    </div>
  </form>
</template>
