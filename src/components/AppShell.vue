<script setup>
import BottomNavigation from './BottomNavigation.vue'
import DesktopNavigation from './DesktopNavigation.vue'
import { translate } from '../i18n'
import { useAppStore } from '../stores/app'

const app = useAppStore()
</script>

<template>
  <div class="app-shell">
    <DesktopNavigation />
    <div class="app-shell__content">
      <header class="app-shell__mobile-header"><p>{{ translate(app.locale, 'appName') }}</p></header>
      <main id="konten-utama" class="app-shell__main" tabindex="-1"><slot /></main>
    </div>
    <BottomNavigation />
  </div>
</template>
