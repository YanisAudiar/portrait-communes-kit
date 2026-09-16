<template>
  <div class="skeleton-loader" :class="[`skeleton-${type}`, { 'skeleton-animated': animated }]">
    <div v-if="type === 'card'" class="skeleton-card">
      <div class="skeleton-header"></div>
      <div class="skeleton-content">
        <div class="skeleton-line" v-for="i in lines" :key="i" :style="{ width: getLineWidth(i) }"></div>
      </div>
    </div>
    
    <div v-else-if="type === 'chart'" class="skeleton-chart">
      <div class="skeleton-chart-header"></div>
      <div class="skeleton-chart-body">
        <div class="skeleton-bar" v-for="i in 5" :key="i" :style="{ height: `${20 + i * 15}%` }"></div>
      </div>
    </div>
    
    <div v-else-if="type === 'list'" class="skeleton-list">
      <div class="skeleton-list-item" v-for="i in items" :key="i">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-text">
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>
    </div>
    
    <div v-else class="skeleton-default">
      <div class="skeleton-line" v-for="i in lines" :key="i" :style="{ width: getLineWidth(i) }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'default' | 'card' | 'chart' | 'list'
  lines?: number
  items?: number
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  lines: 3,
  items: 3,
  animated: true
})

const getLineWidth = (index: number): string => {
  const widths = ['100%', '85%', '90%', '75%', '95%']
  return widths[index % widths.length] ?? '100%'
}
</script>

<style scoped>
.skeleton-loader {
  width: 100%;
}

.skeleton-animated .skeleton-shimmer {
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

/* Card Skeleton */
.skeleton-card {
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 24px;
  overflow: hidden;
}

.skeleton-header {
  height: 24px;
  width: 60%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 6px;
  margin-bottom: 20px;
  animation: shimmer 1.5s infinite;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-line {
  height: 12px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 6px;
  animation: shimmer 1.5s infinite;
}

.skeleton-line.short {
  width: 60% !important;
}

/* Chart Skeleton */
.skeleton-chart {
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 24px;
  overflow: hidden;
}

.skeleton-chart-header {
  height: 20px;
  width: 40%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 6px;
  margin-bottom: 24px;
  animation: shimmer 1.5s infinite;
}

.skeleton-chart-body {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 200px;
  padding: 0 8px;
}

.skeleton-bar {
  flex: 1;
  background: linear-gradient(180deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 100% 200%;
  border-radius: 4px 4px 0 0;
  animation: shimmer 1.5s infinite;
  min-height: 30px;
}

/* List Skeleton */
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-list-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  flex-shrink: 0;
}

.skeleton-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Default Skeleton */
.skeleton-default {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>

