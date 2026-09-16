<template>
  <div
    v-if="(title || subtitle) && !isPrintMode"
    class="chart-component-header"
  >
    <h3 v-if="title" class="chart-component-title" :style="titleStyle">
      {{ displayTitle }}
    </h3>
    <p v-if="subtitle" class="chart-component-subtitle">
      {{ subtitle }}
    </p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    displayTitle?: string
    titleStyle?: Record<string, string>
    isPrintMode?: boolean
  }>(),
  { isPrintMode: false }
)
</script>

<style scoped>
.chart-component-header {
  position: relative;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  text-align: center;
  border-bottom: 1px solid rgba(30, 66, 93, 0.3);
}

.chart-component-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--primary-blue, #1e425d), transparent);
  opacity: 0.3;
}

.chart-component-title {
  margin-bottom: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e425d;
  letter-spacing: -0.01em;
  line-height: 1.3;
  font-family: inherit;
}

.chart-component-subtitle {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 400;
  color: #7b8794;
  line-height: 1.5;
  font-family: inherit;
}
</style>
