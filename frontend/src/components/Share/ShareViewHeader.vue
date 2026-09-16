<template>
  <header class="share-header">
    <div class="logo">
      <span class="logo-audiar">{{ agency.name }}</span>
      <span class="logo-sub">Observatoire</span>
    </div>
    <div v-if="communeName" class="territory-info">
      <span class="territory-label">Commune de </span>
      <span class="territory-name">{{ communeName }}</span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { siteConfig } from '@/config/site'

defineProps<{
  communeName?: string
}>()

const agency = siteConfig.agency
</script>

<style scoped>
.share-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.logo {
  display: flex;
  flex-direction: column;
}

.logo-audiar {
  font-weight: 800;
  font-size: 1.5rem;
  color: #316d7b;
  letter-spacing: -0.025em;
}

.logo-sub {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.1em;
  margin-top: -4px;
}

.territory-info {
  text-align: right;
}

.territory-label {
  color: #64748b;
  font-size: 0.875rem;
}

.territory-name {
  display: block;
  font-weight: 600;
  font-size: 1.125rem;
  color: #1e293b;
}

@media (max-width: 640px) {
  .share-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  .territory-info {
    text-align: center;
  }
}
</style>
