<template>
  <div class="logo-section">
    <a :href="agency.website" target="_blank" rel="noopener noreferrer" class="logo-audiar">
      <img 
        v-if="!logoError"
        src="@/assets/images/logo-Audiar.svg" 
        :alt="`${agency.name} - ${agency.copyrightProduct}`" 
        class="audiar-logo"
        @error="handleLogoError"
      />
      <!-- Fallback SVG si le logo n'est pas trouvé -->
      <svg v-else width="120" height="40" viewBox="0 0 120 40" class="audiar-logo">
        <rect x="0" y="0" width="40" height="40" fill="var(--primary-blue)" rx="4"/>
        <text x="45" y="16" font-family="Montserrat" font-weight="700" font-size="14" fill="var(--primary-blue)">BARO</text>
        <text x="45" y="30" font-family="Montserrat" font-size="10" fill="var(--text-secondary)">TERRITOIRES</text>
      </svg>
    </a>
    <nav class="main-nav hide-mobile">
      <router-link to="/" class="nav-item" exact-active-class="active">
        <span class="nav-icon">📋</span>
        Liste des communes
      </router-link>
      <router-link to="/" class="nav-item" active-class="active">
        <span class="nav-icon">🗺️</span>
        Carte
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { siteConfig } from '@/config/site'

const agency = siteConfig.agency
const logoError = ref(false)

function handleLogoError() {
  logoError.value = true
}
</script>

<style scoped>
.logo-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo-audiar {
  height: 40px;
  display: inline-block;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.logo-audiar:hover {
  transform: translateY(-2px);
  filter: drop-shadow(0 4px 8px rgba(241, 126, 8, 0.2));
}

.audiar-logo {
  height: 40px;
  width: auto;
  display: block;
}

.main-nav {
  display: flex;
  align-items: center;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #f17e08 0%, #e36411 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  box-shadow: 
    0 2px 8px rgba(241, 126, 8, 0.2),
    0 4px 16px rgba(241, 126, 8, 0.15);
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.nav-item:hover::before {
  left: 100%;
}

.nav-item:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 4px 12px rgba(241, 126, 8, 0.3),
    0 8px 24px rgba(241, 126, 8, 0.2);
}

.nav-item.active,
.nav-item.router-link-active {
  background: linear-gradient(135deg, #1e2972 0%, #316d7b 100%);
  box-shadow: 
    0 2px 8px rgba(30, 41, 114, 0.2),
    0 4px 16px rgba(30, 41, 114, 0.15);
}

.nav-icon {
  font-size: 16px;
}

@media (max-width: 768px) {
  .logo-section {
    gap: 16px;
  }
  
  .audiar-logo {
    height: 32px;
  }
}

@media (max-width: 480px) {
  .audiar-logo {
    height: 28px;
  }
}
</style>

