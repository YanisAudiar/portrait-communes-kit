<template>
  <div class="cover-page-header">
    <div class="header-left-text">{{ headerLeft }}</div>
    <div class="header-right-text">{{ headerRight }}</div>
  </div>
</template>

<script setup lang="ts">
import { siteConfig } from '@/config/site'

const headerLeft = `PORTRAIT DE TERRITOIRE - ${siteConfig.agency.shortName}`
const headerRight = `${siteConfig.territory.productTitle} - ${siteConfig.agency.name}`
</script>

<style scoped>
.cover-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5mm 18mm;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.header-left-text {
  font-size: 9px;
  color: #2c3e50;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: 'Montserrat', sans-serif;
}

.header-right-text {
  font-size: 9px;
  color: #2c3e50;
  font-weight: 400;
  font-family: 'Lato', sans-serif;
}
</style>
