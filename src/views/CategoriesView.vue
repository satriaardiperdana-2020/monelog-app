<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import ConfirmDialog from '../components/ConfirmDialog.vue'
import PageState from '../components/PageState.vue'
import { useCategoriesStore } from '../stores/categories'
import { requiredText } from '../utils/validation'

const categories = useCategoriesStore()
const activeType = ref('expense')
const draftName = ref('')
const editing = ref(null)
const deleteTarget = ref(null)
const formError = ref('')
const submitting = ref(false)
const activeCategories = computed(() => categories.byType[activeType.value])
const status = computed(() => categories.statusByType[activeType.value])

function typeLabel(type) { return type === 'income' ? 'Pemasukan' : 'Pengeluaran' }

function resetForm() {
  draftName.value = ''
  editing.value = null
  formError.value = ''
}

function startEdit(category) {
  editing.value = category
  draftName.value = category.name
  formError.value = ''
}

async function save() {
  const nameError = requiredText(draftName.value, { label: 'Nama kategori', maxLength: 80 })
  if (nameError) {
    formError.value = nameError
    return
  }

  submitting.value = true
  formError.value = ''
  try {
    if (editing.value) {
      await categories.update(editing.value.id, { name: draftName.value.trim(), version: editing.value.version })
    } else {
      await categories.create({ name: draftName.value.trim(), type: activeType.value })
    }
    resetForm()
    await categories.load(activeType.value)
  } catch {
    formError.value = 'Kategori belum dapat disimpan. Muat ulang jika ada perubahan dari perangkat lain.'
  } finally {
    submitting.value = false
  }
}

async function remove() {
  const target = deleteTarget.value
  if (!target) return

  submitting.value = true
  formError.value = ''
  try {
    await categories.delete(target.id, target.version)
    deleteTarget.value = null
    if (editing.value?.id === target.id) resetForm()
    await categories.load(activeType.value)
  } catch {
    deleteTarget.value = null
    formError.value = 'Kategori belum dapat dihapus. Muat ulang jika ada perubahan dari perangkat lain.'
  } finally {
    submitting.value = false
  }
}

watch(activeType, () => {
  resetForm()
  categories.load(activeType.value)
})

onMounted(() => categories.load(activeType.value))
</script>

<template>
  <section class="categories-view" aria-labelledby="categories-title">
    <header class="categories-view__header"><div><p class="eyebrow">Pengelolaan kategori</p><h1 id="categories-title">Kategori</h1></div><RouterLink to="/sampah">Sampah</RouterLink></header>
    <div class="category-tabs" role="tablist" aria-label="Tipe kategori"><button :aria-selected="activeType === 'income'" role="tab" type="button" @click="activeType = 'income'">Pemasukan</button><button :aria-selected="activeType === 'expense'" role="tab" type="button" @click="activeType = 'expense'">Pengeluaran</button></div>
    <form class="category-form" novalidate @submit.prevent="save"><label for="category-name">{{ editing ? `Ubah kategori ${typeLabel(activeType)}` : `Kategori ${typeLabel(activeType)}` }}</label><input id="category-name" v-model="draftName" maxlength="80" :aria-describedby="formError ? 'category-form-error' : undefined" :aria-invalid="Boolean(formError)"><p v-if="formError" id="category-form-error" class="field-error" aria-live="assertive">{{ formError }}</p><div><button type="button" :disabled="submitting" @click="resetForm">Batal</button><button type="submit" :disabled="submitting">{{ submitting ? 'Menyimpan…' : editing ? 'Simpan perubahan' : 'Tambah kategori' }}</button></div></form>
    <PageState v-if="status === 'loading'" state="loading" title="Memuat kategori" />
    <PageState v-else-if="status === 'error'" state="error" title="Kategori belum dapat dimuat" description="Periksa koneksi Anda, lalu coba lagi." @retry="categories.load(activeType)" />
    <PageState v-else-if="activeCategories.length === 0" state="empty" :title="`Belum ada kategori ${typeLabel(activeType).toLowerCase()}`" description="Tambahkan kategori untuk mulai mencatat transaksi." />
    <ul v-else class="category-list"><li v-for="category in activeCategories" :key="category.id"><span>{{ category.name }}</span><div><button type="button" @click="startEdit(category)">Ubah</button><button type="button" @click="deleteTarget = category">Hapus</button></div></li></ul>
    <ConfirmDialog :open="Boolean(deleteTarget)" title="Hapus kategori?" description="Kategori dipindahkan ke Sampah dan tidak lagi tersedia untuk transaksi baru." @cancel="deleteTarget = null" @confirm="remove" />
  </section>
</template>
