<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <nav class="bottom-navigation" aria-label="Navigasi utama">
    <RouterLink class="navigation-item" to="/"><span class="navigation-item__icon" aria-hidden="true">⌂</span><span>Utama</span></RouterLink>
    <RouterLink class="navigation-item" to="/laporan"><span class="navigation-item__icon" aria-hidden="true">▤</span><span>Laporan</span></RouterLink>
    <RouterLink class="navigation-item" to="/pengaturan"><span class="navigation-item__icon" aria-hidden="true">⚙</span><span>Setelan</span></RouterLink>
  </nav>
</template>
