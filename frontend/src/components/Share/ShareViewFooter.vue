<template>
  <footer class="share-footer">
    <p>&copy; {{ currentYear }} {{ agency.name }} - {{ productTitle }}</p>
    <router-link :to="communeLink" class="btn-context">
      Voir toutes les données de la commune
    </router-link>
  </footer>
</template>

<script setup lang="ts">
import { siteConfig } from '@/config/site'

defineProps<{
  communeLink: string
}>()

const agency = siteConfig.agency
const productTitle = siteConfig.territory.productTitle
const currentYear = new Date().getFullYear()
</script>

<style scoped>
.share-footer {
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #64748b;
}

.btn-context {
  color: #316d7b;
  text-decoration: none;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background: #f1f5f9;
  transition: all 0.2s;
}

.btn-context:hover {
  background: #e2e8f0;
  color: #24525c;
}

@media (max-width: 640px) {
  .share-footer {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
}
</style>
