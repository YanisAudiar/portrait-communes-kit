<template>
  <div
    class="chart-component-body"
    :class="{ 'chart-component-body--print': isPrintMode }"
  >
    <canvas
      :id="chartId"
      class="chart-component-canvas"
      :class="{ 'chart-component-canvas--print': isPrintMode }"
      :style="canvasStyle"
    />
    <div
      v-if="loading"
      class="chart-component-overlay chart-component-overlay--loading"
    >
      <div class="chart-component-spinner" />
      <p class="chart-component-overlay-text">Chargement du graphique...</p>
    </div>
    <div
      v-if="error"
      class="chart-component-overlay chart-component-overlay--error"
    >
      <p class="chart-component-error-text">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  chartId: string
  canvasStyle: Record<string, string>
  isPrintMode: boolean
  loading: boolean
  error: string | null
}>()
</script>

<style scoped>
.chart-component-body {
  position: relative;
  padding: 0;
  background: transparent;
  width: 100%;
  min-width: 0; /* Réduit correctement dans une grille flex/grid */
  overflow: visible; /* Tooltips visibles au-dessus du graphique */
}

.chart-component-body--print {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.chart-component-canvas {
  width: 100%;
  max-width: 100%;
}

.chart-component-canvas--print {
  max-width: none;
  display: block;
  margin-left: auto;
  margin-right: auto;
  flex-shrink: 0;
}

.chart-component-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  padding: 1.25rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.chart-component-overlay--loading .chart-component-spinner {
  width: 2rem;
  height: 2rem;
  margin: 0 auto 0.75rem;
  border-radius: 50%;
  border: 4px solid #f3f4f6;
  border-top-color: #f97316;
  animation: chart-spin 0.8s linear infinite;
}

.chart-component-overlay-text {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
  font-family: inherit;
}

.chart-component-error-text {
  margin: 0;
  font-weight: 500;
  color: #ef4444;
}

@keyframes chart-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
