<script setup>
import BottomNavigation from './BottomNavigation.vue'
import DesktopNavigation from './DesktopNavigation.vue'
</script>

<template>
  <div class="app-shell">
    <DesktopNavigation />
    <div class="app-shell__content">
      <header class="app-shell__mobile-header"><p>Catatan Keuangan</p></header>
      <main id="konten-utama" class="app-shell__main" tabindex="-1"><slot /></main>
    </div>
    <BottomNavigation />
  </div>
</template>
