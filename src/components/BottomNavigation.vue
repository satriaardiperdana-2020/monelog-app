<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <nav class="bottom-navigation" aria-label="Navigasi utama">
    <RouterLink class="navigation-item" to="/"><span class="navigation-item__icon" aria-hidden="true">⌂</span><span>Utama</span></RouterLink>
    <span class="navigation-item navigation-item--disabled" aria-disabled="true"><span class="navigation-item__icon" aria-hidden="true">▤</span><span>Laporan</span></span>
    <RouterLink class="navigation-item" to="/pengaturan"><span class="navigation-item__icon" aria-hidden="true">⚙</span><span>Setelan</span></RouterLink>
  </nav>
</template>
