<template>
  <header class="modern-header">
    <div class="modern-header-container">
      <!-- Breadcrumb -->
      <nav class="modern-breadcrumb">
        <router-link to="/" class="modern-breadcrumb-item">
          <svg class="modern-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Cartographie
        </router-link>
        <span class="modern-breadcrumb-separator">/</span>
        <span class="modern-breadcrumb-current">{{ communeName || 'Commune' }}</span>
      </nav>

      <!-- Barre de recherche -->
      <div class="modern-search">
        <svg class="modern-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          class="modern-search-input"
          placeholder="Rechercher un indicateur..."
          v-model="searchQuery"
          @input="$emit('search', searchQuery)"
        />
      </div>

      <!-- Actions -->
      <div class="modern-header-actions">
        <button
          v-if="ENABLE_PDF_EXPORT"
          class="modern-action-button modern-action-button--accent"
          @click="$emit('export-pdf')"
        >
          <svg class="modern-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exporter PDF
        </button>
        <button class="modern-action-button modern-action-button--primary" @click="$emit('back-to-map')">
          <svg class="modern-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Retour à la carte
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ENABLE_PDF_EXPORT } from '@/config/featureFlags'

defineProps({
  communeName: {
    type: String,
    default: ''
  }
})

defineEmits<{
  (e: 'search', query: string): void
  (e: 'export-pdf'): void
  (e: 'back-to-map'): void
}>()

const searchQuery = ref('')
</script>

<style scoped>
@import '@/assets/css/modern-dashboard.css';
</style>

