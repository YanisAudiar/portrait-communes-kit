<template>
  <aside class="sidebar sidebar-right" :class="{ 'sidebar-collapsed': isCollapsed }">
    <div class="sidebar-content">
      <SidebarHeader 
        title="Informations"
        :show-toggle="true"
        :is-collapsed="isCollapsed"
        @toggle="toggleCollapse"
      />
      
      <DataInfoSection />
    </div>
  </aside>
</template>

<script setup lang="ts">
/**
 * Composant SidebarRight - Barre latérale droite avec informations
 * Refactorisé - Légende désactivée (carte simple sans aplat de couleurs)
 */
import { ref } from 'vue'
import SidebarHeader from './SidebarHeader.vue'
import DataInfoSection from './DataInfoSection.vue'
import '@/assets/css/components/sidebar-right.css'

// Emits
const emit = defineEmits<{
  (e: 'toggle-collapse', value: boolean): void
}>()

// État local
const isCollapsed = ref<boolean>(false)

/**
 * Bascule l'état de collapse de la sidebar
 */
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  emit('toggle-collapse', isCollapsed.value)
}
</script>

<style scoped>
/* Styles importés depuis le fichier CSS externe */
</style>
