<template>
  <div class="menu-footer">
    <span class="footer-text">© {{ agency.name }} {{ currentYear }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { siteConfig } from '@/config/site'

const currentYear = computed(() => new Date().getFullYear())
const agency = siteConfig.agency
</script>

<style scoped>
.menu-footer {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  text-align: center;
}

.footer-text {
  font-size: 12px;
  color: #9ca3af;
}
</style>
