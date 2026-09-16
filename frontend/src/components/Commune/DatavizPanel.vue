<template>
  <div class="dataviz-container">
    <slot>
      <!-- Contenu par défaut: graphiques de la thématique -->
      <div class="default-content">
        <div class="dataviz-header">
          <h3 class="dataviz-title">
            📊 Graphiques - {{ themeName }}
          </h3>
          <p class="dataviz-subtitle">
            Visualisations des données pour cette thématique
          </p>
        </div>
        
        <!-- Placeholder pour les graphiques -->
        <div class="charts-grid">
          <div v-for="i in 4" :key="i" class="chart-placeholder">
            <div class="placeholder-shimmer"></div>
          </div>
        </div>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
defineProps({
  themeName: {
    type: String,
    default: 'Démographie'
  }
})
</script>

<style scoped>
.default-content {
  padding: 24px;
  height: 100%;
}

.dataviz-header {
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(229, 231, 235, 0.6);
}

.dataviz-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

.dataviz-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.chart-placeholder {
  height: 250px;
  background: rgba(229, 231, 235, 0.3);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.placeholder-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.5) 50%,
    transparent 100%
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@media (max-width: 1024px) {
  .default-content {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .default-content {
    padding: 16px;
  }

  .charts-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .dataviz-title {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .default-content {
    padding: 12px;
  }
}
</style>

