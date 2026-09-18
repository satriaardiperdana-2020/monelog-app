<script setup>
import { ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import ConfirmDialog from '../components/ConfirmDialog.vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const timezone = ref(auth.user.timezone)
const error = ref('')
const logoutOpen = ref(false)
const saving = ref(false)

watch(() => auth.user.timezone, (value) => { timezone.value = value })

async function save() {
  if (!timezone.value.trim()) {
    error.value = 'Timezone wajib diisi.'
    return
  }
  saving.value = true
  error.value = ''
  try {
    await auth.updateProfile(timezone.value.trim())
  } catch {
    error.value = 'Timezone belum dapat diperbarui. Muat ulang jika ada perubahan dari perangkat lain.'
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
  <section class="settings-view" aria-labelledby="settings-title"><header class="settings-view__header"><div><p class="eyebrow">Profil</p><h1 id="settings-title">Setelan</h1></div><RouterLink to="/sampah">Sampah</RouterLink></header><dl class="settings-summary"><div><dt>Email</dt><dd>{{ auth.user.email }}</dd></div><div><dt>Mata uang</dt><dd>IDR</dd></div></dl><form class="category-form" novalidate @submit.prevent="save"><label for="profile-timezone">Timezone</label><input id="profile-timezone" v-model="timezone" :aria-describedby="error ? 'timezone-error' : undefined" :aria-invalid="Boolean(error)"><p v-if="error" id="timezone-error" class="field-error" aria-live="assertive">{{ error }}</p><div><button type="submit" :disabled="saving">{{ saving ? 'Menyimpan…' : 'Simpan timezone' }}</button></div></form><button class="settings-view__logout" type="button" @click="logoutOpen = true">Keluar</button><ConfirmDialog :open="logoutOpen" title="Keluar dari akun?" description="Anda perlu masuk kembali untuk mengakses catatan keuangan." @cancel="logoutOpen = false" @confirm="logout" /></section>
</template>
