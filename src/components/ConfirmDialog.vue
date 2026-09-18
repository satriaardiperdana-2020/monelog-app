<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  description: { type: String, default: '' },
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
})

const emit = defineEmits(['cancel', 'confirm'])
const dialog = ref(null)

watch(
  () => props.open,
  (open) => {
    if (!dialog.value) return
    if (open && !dialog.value.open) dialog.value.showModal()
    if (!open && dialog.value.open) dialog.value.close()
  },
)
</script>

<template>
  <dialog ref="dialog" class="confirm-dialog" @cancel.prevent="emit('cancel')">
    <h2>{{ title }}</h2>
    <p v-if="description">{{ description }}</p>
    <div><button type="button" @click="emit('cancel')">Batal</button><button type="button" @click="emit('confirm')">Hapus</button></div>
  </dialog>
</template>
