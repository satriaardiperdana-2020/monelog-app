<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'

import AppShell from './components/AppShell.vue'

const route = useRoute()
const usesAppShell = computed(() => route.meta.requiresAuth)
</script>

<template>
  <AppShell v-if="usesAppShell"><RouterView /></AppShell>
  <RouterView v-else />
</template>
