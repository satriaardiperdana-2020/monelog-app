<script setup>
defineProps({
  description: { type: String, default: '' },
  state: { type: String, required: true },
  title: { type: String, required: true },
})

defineEmits(['retry'])
</script>

<template>
  <section class="page-state" :class="`page-state--${state}`" :aria-busy="state === 'loading'">
    <div v-if="state === 'loading'" class="page-state__spinner" aria-hidden="true" />
    <h2>{{ title }}</h2>
    <p v-if="description">{{ description }}</p>
    <button v-if="state === 'error'" type="button" @click="$emit('retry')">Coba lagi</button>
  </section>
</template>
