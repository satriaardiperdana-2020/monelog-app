<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import ConfirmDialog from '../components/ConfirmDialog.vue'
import { useAppStore } from '../stores/app'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const app = useAppStore()
const router = useRouter()
const timezone = ref(auth.user.timezone)
const language = ref(app.locale)
const error = ref('')
const logoutOpen = ref(false)
const saving = ref(false)

const text = computed(() => language.value === 'en' ? {
  account: 'Profile',
  email: 'Email',
  language: 'Language',
  logout: 'Sign out',
  save: 'Save settings',
  saving: 'Saving…',
  settings: 'Settings',
  timezone: 'Timezone',
  timezoneFailed: 'Timezone could not be updated. Reload if it changed on another device.',
  timezoneRequired: 'Timezone is required.',
  trash: 'Trash',
} : {
  account: 'Profil',
  email: 'Email',
  language: 'Bahasa',
  logout: 'Keluar',
  save: 'Simpan setelan',
  saving: 'Menyimpan…',
  settings: 'Setelan',
  timezone: 'Timezone',
  timezoneFailed: 'Timezone belum dapat diperbarui. Muat ulang jika ada perubahan dari perangkat lain.',
  timezoneRequired: 'Timezone wajib diisi.',
  trash: 'Sampah',
})

watch(() => auth.user.timezone, (value) => { timezone.value = value })

async function save() {
  if (!timezone.value.trim()) {
    error.value = text.value.timezoneRequired
    return
  }

  saving.value = true
  error.value = ''
  app.setLocale(language.value)
  try {
    await auth.updateProfile(timezone.value.trim())
  } catch {
    error.value = text.value.timezoneFailed
  } finally {
    saving.value = false
  }
}

async function logout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <section class="settings-view" aria-labelledby="settings-title">
    <header class="settings-view__header">
      <div>
        <p class="eyebrow">{{ text.account }}</p>
        <h1 id="settings-title">{{ text.settings }}</h1>
      </div>
      <RouterLink to="/sampah">{{ text.trash }}</RouterLink>
    </header>

    <dl class="settings-summary">
      <div><dt>{{ text.email }}</dt><dd>{{ auth.user.email }}</dd></div>
    </dl>

    <form class="category-form" novalidate @submit.prevent="save">
      <label for="profile-language">{{ text.language }}</label>
      <select id="profile-language" v-model="language">
        <option value="id">Bahasa Indonesia</option>
        <option value="en">English</option>
      </select>

      <label for="profile-timezone">{{ text.timezone }}</label>
      <input id="profile-timezone" v-model="timezone" :aria-describedby="error ? 'timezone-error' : undefined" :aria-invalid="Boolean(error)">
      <p v-if="error" id="timezone-error" class="field-error" aria-live="assertive">{{ error }}</p>
      <div><button type="submit" :disabled="saving">{{ saving ? text.saving : text.save }}</button></div>
    </form>

    <button class="settings-view__logout" type="button" @click="logoutOpen = true">{{ text.logout }}</button>
    <ConfirmDialog :open="logoutOpen" title="Keluar dari akun?" description="Anda perlu masuk kembali untuk mengakses catatan keuangan." @cancel="logoutOpen = false" @confirm="logout" />
  </section>
</template>
