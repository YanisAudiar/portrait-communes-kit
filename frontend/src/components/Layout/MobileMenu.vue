<template>
  <div class="mobile-menu" :class="{ 'mobile-menu-open': isOpen }" @click="handleBackdropClick">
    <div class="mobile-menu-content" @click.stop>
      <MobileMenuHeader @close="handleClose" />

      <div class="menu-search">
        <HeaderSearch placeholder="Rechercher une commune..." @search="handleSearch" />
      </div>

      <div class="menu-section">
        <span class="section-label">Navigation</span>
        <nav class="menu-nav">
          <router-link to="/" class="nav-item" @click="handleClose">
            <div class="nav-icon-wrapper nav-icon-home">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <span>Accueil</span>
          </router-link>
        </nav>
      </div>

      <MobileMenuHelpSection
        @info-click="handleInfoClick"
        @settings-click="handleSettingsClick"
      />

      <MobileMenuFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * MobileMenu - Menu latéral mobile
 * Délègue header, export, aide et footer aux sous-composants
 */
import HeaderSearch from './HeaderSearch.vue'
import MobileMenuHeader from './MobileMenuHeader.vue'
import MobileMenuHelpSection from './MobileMenuHelpSection.vue'
import MobileMenuFooter from './MobileMenuFooter.vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false }
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'info-click'): void
  (e: 'settings-click'): void
  (e: 'search', query: string): void
}>()

function handleBackdropClick() {
  emit('close')
}

function handleClose() {
  emit('close')
}

function handleInfoClick() {
  emit('info-click')
  emit('close')
}

function handleSettingsClick() {
  emit('settings-click')
  emit('close')
}

function handleSearch(query: string) {
  emit('search', query)
}
</script>

<style scoped>
.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 100000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-menu-open {
  opacity: 1;
  visibility: visible;
}

.mobile-menu-content {
  position: absolute;
  top: 0;
  right: 0;
  width: 320px;
  max-width: 85vw;
  height: 100%;
  height: 100dvh;
  background: #ffffff;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.25);
  transform: translateX(100%);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  z-index: 100001;
}

.mobile-menu-open .mobile-menu-content {
  transform: translateX(0);
}

.menu-search {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.menu-section {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.section-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
  margin-bottom: 12px;
}

.menu-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  color: #374151;
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
  transform: translateX(4px);
}

.nav-item.router-link-active {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-color: #93c5fd;
  color: #1d4ed8;
}

.nav-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  flex-shrink: 0;
}

.nav-icon-home {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
}

@media (max-width: 480px) {
  .mobile-menu-content {
    width: 100%;
    max-width: 100%;
  }
}
</style>
