<template>
  <div class="print-footer">
    <p class="footer-text">
      Source des données : {{ agency.name }} - {{ new Date().getFullYear() }}
    </p>
    <p class="footer-text">
      Document généré automatiquement le {{ date }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { siteConfig } from '@/config/site'

defineProps<{
  /** Date formatée (ex. 01/01/2025) */
  date: string
}>()

const agency = siteConfig.agency
</script>

<style scoped>
.print-footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 2px solid #e0e0e0;
  text-align: center;
}

.footer-text {
  font-size: 11px;
  color: #999;
  margin: 4px 0;
}
</style>
