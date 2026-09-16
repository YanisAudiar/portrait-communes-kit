<template>
  <nav
    v-if="isVisible"
    class="bottom-nav"
    :class="{ 'bottom-nav-hidden': isHidden }"
  >
    <div class="bottom-nav-container">
      <BottomNavItem to="/" :active="isHome" label="Carte">
        <template #icon>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </template>
      </BottomNavItem>

      <BottomNavItem :active="showSearch" label="Recherche" @click="toggleSearch">
        <template #icon>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </template>
      </BottomNavItem>

      <BottomNavItem
        v-if="isCommune"
        :is-primary="true"
        label="Thèmes"
        @click="toggleThemes"
      >
        <template #icon>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </template>
      </BottomNavItem>

      <BottomNavItem label="Menu" @click="toggleMenu">
        <template #icon>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </template>
      </BottomNavItem>
    </div>

    <BottomNavSearchOverlay
      :open="showSearch"
      v-model="searchQuery"
      :results="searchResults"
      @close="toggleSearch"
      @select="selectCommune"
    />
  </nav>
</template>

<script setup lang="ts">
/**
 * BottomNavigation - Barre de navigation mobile fixe en bas
 * Délègue les items à BottomNavItem et la recherche à BottomNavSearchOverlay
 */
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCommuneStore } from '@/stores'
import BottomNavItem from './BottomNavItem.vue'
import BottomNavSearchOverlay from './BottomNavSearchOverlay.vue'
import type { SearchResult } from './BottomNavSearchOverlay.vue'

const route = useRoute()
const router = useRouter()
const communeStore = useCommuneStore()

const props = defineProps({
  forceHide: { type: Boolean, default: false }
})

const emit = defineEmits<{
  (e: 'toggle-themes'): void
  (e: 'toggle-menu'): void
}>()

const isVisible = ref(false)
const isHidden = ref(false)
const showSearch = ref(false)
const searchQuery = ref('')
const searchResults = ref<SearchResult[]>([])
let lastScrollY = 0

const isHome = computed(() => route.name === 'dashboard')
const isCommune = computed(() => route.name === 'commune-detail')

function checkVisibility() {
  isVisible.value = window.innerWidth < 768 && !props.forceHide
}

function handleScroll() {
  const currentScrollY = window.scrollY
  if (currentScrollY > lastScrollY && currentScrollY > 100) {
    isHidden.value = true
  } else {
    isHidden.value = false
  }
  lastScrollY = currentScrollY
}

function toggleSearch() {
  showSearch.value = !showSearch.value
  if (!showSearch.value) {
    searchQuery.value = ''
    searchResults.value = []
  }
}

function toggleThemes() {
  emit('toggle-themes')
}

function toggleMenu() {
  emit('toggle-menu')
}

async function handleSearch() {
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }
  try {
    const results = await communeStore.searchCommunes(searchQuery.value, 8)
    type SearchGeoFeature = {
      properties?: { code_insee?: string; code_insee_concat?: string; nom?: string }
      code_insee?: string
      nom?: string
    }
    searchResults.value = results.map((feature: SearchGeoFeature) => ({
      code_insee: feature.properties?.code_insee ?? feature.properties?.code_insee_concat ?? feature.code_insee ?? '',
      nom: feature.properties?.nom ?? feature.nom ?? ''
    }))
  } catch {
    searchResults.value = []
  }
}

function selectCommune(commune: SearchResult) {
  router.push(`/commune/${commune.code_insee}`)
  toggleSearch()
}

onMounted(() => {
  checkVisibility()
  window.addEventListener('resize', checkVisibility)
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('resize', checkVisibility)
  window.removeEventListener('scroll', handleScroll)
})

watch(() => props.forceHide, checkVisibility)
watch(searchQuery, handleSearch)
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-top: 1px solid rgba(229, 231, 235, 0.6);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(0);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.bottom-nav-hidden {
  transform: translateY(100%);
}

.bottom-nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 12px;
  max-width: 500px;
  margin: 0 auto;
  gap: 2px;
}

/* Très petits écrans : barre plus compacte pour éviter le débordement */
@media (max-width: 360px) {
  .bottom-nav-container {
    padding: 6px 4px;
    gap: 0;
  }
}

@media (min-width: 768px) {
  .bottom-nav {
    display: none;
  }
}
</style>
