<template>
  <section class="commune-header">
    <div class="commune-header-content">
      <div class="commune-info">
        <div class="commune-badge" :class="getDepartmentClass(communeData?.departement)">
          {{ getDepartmentIcon(communeData?.departement) }}
        </div>
        <div class="commune-identity">
          <h1 class="commune-name title">{{ communeData?.nom || 'Commune' }}</h1>
          <div class="commune-meta">
            <span class="commune-code description">{{ codeInsee }}</span>
            <span class="commune-department description">{{ getDepartmentName(communeData?.departement) }}</span>
            <span class="commune-population description" v-if="communeData?.population">
              {{ parseInt(String(communeData.population)).toLocaleString() }} habitants
            </span>
          </div>
        </div>
      </div>
      <div class="commune-actions">
        <slot name="actions"></slot>
        <button @click="$emit('goBack')" class="btn-secondary">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
          </svg>
          Retour
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface CommuneData {
  nom: string
  departement: string
  population?: number | string
  [key: string]: any
}

defineProps({
  communeData: {
    type: Object as () => CommuneData,
    default: null
  },
  codeInsee: {
    type: String,
    required: true
  }
})

defineEmits<{
  (e: 'goBack'): void
}>()

const getDepartmentName = (dept: string): string => {
  const departments: Record<string, string> = {
    '22': 'Côtes-d\'Armor',
    '29': 'Finistère', 
    '35': 'Ille-et-Vilaine',
    '56': 'Morbihan'
  }
  return departments[dept] || `Département ${dept}`
}

const getDepartmentIcon = (dept: string): string => {
  const icons: Record<string, string> = {
    '22': '🌊',
    '29': '🏰',
    '35': '🌳', 
    '56': '⛵'
  }
  return icons[dept] || '🏛️'
}

const getDepartmentClass = (dept: string): string => {
  const classes: Record<string, string> = {
    '22': 'economie',
    '29': 'tourisme',
    '35': 'ressources',
    '56': 'mobilite'
  }
  return classes[dept] || 'solidarite'
}
</script>

<style scoped>
.commune-header {
  margin-bottom: 20px;
  animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.commune-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  padding: 16px 22px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 
    0 2px 10px rgba(0, 0, 0, 0.05),
    0 6px 20px rgba(0, 0, 0, 0.07);
  position: relative;
  overflow: visible;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
}

.commune-header-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #1e2972 0%, #316d7b 50%, #f17e08 100%);
  z-index: 0;
  pointer-events: none;
}

.commune-header-content::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.8s ease;
  z-index: 0;
  pointer-events: none;
}

.commune-header-content:hover {
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 16px 48px rgba(241, 126, 8, 0.15);
  transform: translateY(-4px);
}

.commune-header-content:hover::after {
  left: 100%;
}

.commune-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.commune-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  font-size: 26px;
  color: white;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.commune-badge::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.commune-badge::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 18px;
  background: inherit;
  opacity: 0.4;
  filter: blur(16px);
  z-index: -1;
}

.commune-badge:hover {
  transform: scale(1.15) rotate(10deg);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.3);
}

.commune-badge:hover::before {
  opacity: 1;
}

.commune-badge.economie { 
  background: linear-gradient(135deg, #316D7B 0%, #638C97 100%);
}
.commune-badge.tourisme { 
  background: linear-gradient(135deg, #A9CCD7 0%, #BCD8E0 100%);
}
.commune-badge.ressources { 
  background: linear-gradient(135deg, #749586 0%, #94AFA1 100%);
}
.commune-badge.mobilite { 
  background: linear-gradient(135deg, #DAB300 0%, #E3C55D 100%);
}
.commune-badge.solidarite { 
  background: linear-gradient(135deg, #9A9E80 0%, #B0B396 100%);
}

.commune-identity h1 {
  margin: 0 0 6px 0;
  background: linear-gradient(135deg, #1e2972 0%, #f17e08 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 24px;
  font-weight: 700;
}

.commune-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.commune-meta span {
  padding: 4px 10px;
  background: rgba(49, 109, 123, 0.08);
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  color: #374151;
  border: 1px solid rgba(49, 109, 123, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.commune-meta span:hover {
  background: rgba(241, 126, 8, 0.1);
  border-color: rgba(241, 126, 8, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(241, 126, 8, 0.15);
}

/* Responsive */
.commune-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 6000;
  overflow: visible;
}

@media (max-width: 1024px) {
  .commune-header-content {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .commune-actions {
    width: 100%;
    flex-direction: column;
  }
  
  .commune-actions .btn-secondary {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .commune-info {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .commune-badge {
    align-self: center;
  }
  
  .commune-name {
    font-size: 22px;
  }
  
  .commune-meta {
    flex-direction: column;
    gap: 6px;
  }
  
  .commune-meta span {
    font-size: 11px;
  }
}
</style>
