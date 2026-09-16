<template>
  <div class="overview-tab">
    <div class="overview-grid">
      <div class="overview-card">
        <h3 class="title-b">📊 Indicateurs clés</h3>
        <div class="indicators-grid">
          <div class="indicator-item" v-if="communeData?.nb_menages">
            <div class="indicator-icon habitat">🏠</div>
            <div class="indicator-content">
              <span class="indicator-value cc-value">{{ parseInt(String(communeData.nb_menages)).toLocaleString() }}</span>
              <span class="indicator-label description">Ménages</span>
            </div>
          </div>
          <div class="indicator-item" v-if="communeData?.part_personnes_seules">
            <div class="indicator-icon demographie">👤</div>
            <div class="indicator-content">
              <span class="indicator-value cc-value">{{ parseFloat(String(communeData.part_personnes_seules)).toFixed(1) }}%</span>
              <span class="indicator-label description">Personnes seules</span>
            </div>
          </div>
          <div class="indicator-item" v-if="communeData?.taille_moyenne_menage">
            <div class="indicator-icon solidarite">👨‍👩‍👧‍👦</div>
            <div class="indicator-content">
              <span class="indicator-value cc-value">{{ parseFloat(String(communeData.taille_moyenne_menage)).toFixed(2) }}</span>
              <span class="indicator-label description">Taille moy. ménage</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="overview-card">
        <h3 class="title-b">🗺️ Localisation</h3>
        <div class="mini-map-placeholder">
          <p class="description">Carte de localisation de la commune</p>
          <p class="content">(À implémenter avec MapLibre)</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CommuneData {
  nb_menages?: number | string
  part_personnes_seules?: number | string
  taille_moyenne_menage?: number | string
  [key: string]: any
}

defineProps({
  communeData: {
    type: Object as () => CommuneData,
    default: null
  }
})
</script>

<style scoped>
.overview-tab {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.overview-card {
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  padding: 28px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.overview-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-blue), var(--accent-orange));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.overview-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
  transform: translateY(-2px);
}

.overview-card:hover::before {
  opacity: 1;
}

.overview-card h3 {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  letter-spacing: -0.01em;
  position: relative;
}

.overview-card h3::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 50px;
  height: 2px;
  background: var(--accent-orange);
}

.indicators-grid {
  display: grid;
  gap: 16px;
}

.indicator-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.indicator-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--primary-blue);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.indicator-item:hover {
  background: linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%);
  border-color: #d1d5db;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

.indicator-item:hover::before {
  transform: scaleY(1);
}

.indicator-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  font-size: 18px;
  color: white;
}

.indicator-icon.habitat { background: var(--habitat); }
.indicator-icon.demographie { background: var(--demographie); }
.indicator-icon.solidarite { background: var(--solidarite); }

.indicator-content {
  display: flex;
  flex-direction: column;
}

.indicator-value {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  line-height: 1.2;
}

.indicator-label {
  font-size: 12px;
  margin-top: 2px;
}

.mini-map-placeholder {
  height: 200px;
  background: #f9fafb;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed #d1d5db;
  color: #6b7280;
}

/* Responsive */
@media (max-width: 1024px) {
  .overview-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .overview-card {
    padding: 16px;
  }
  
  .indicators-grid {
    gap: 12px;
  }
  
  .indicator-item {
    padding: 12px;
  }
  
  .indicator-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
  
  .indicator-value {
    font-size: 16px;
  }
  
  .mini-map-placeholder {
    height: 150px;
  }
}
</style>
