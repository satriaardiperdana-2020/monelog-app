<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

function safeTarget(value) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
    ? value
    : '/'
}

async function submit() {
  submitting.value = true
  error.value = ''
  try {
    await auth.login({ email: email.value, password: password.value })
    const target = auth.intendedRoute || safeTarget(route.query.lanjut)
    auth.consumeIntendedRoute()
    await router.replace(target)
  } catch (requestError) {
    error.value = requestError.message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="login-view" aria-labelledby="login-title">
    <section class="login-view__card">
      <p class="eyebrow">Catatan Keuangan</p>
      <h1 id="login-title">Masuk</h1>
      <form novalidate @submit.prevent="submit">
        <label for="login-email">Email</label>
        <input id="login-email" v-model="email" type="email" autocomplete="email" required>
        <label for="login-password">Kata sandi</label>
        <input id="login-password" v-model="password" type="password" autocomplete="current-password" required>
        <p v-if="error" class="transaction-form__submit-error" aria-live="assertive">{{ error }}</p>
        <button type="submit" :disabled="submitting">{{ submitting ? 'Memproses…' : 'Masuk' }}</button>
      </form>
    </section>
  </main>
</template>
