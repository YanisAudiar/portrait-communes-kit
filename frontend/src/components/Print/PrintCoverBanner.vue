<template>
  <div class="cover-banner-wrapper" :style="{ '--theme-color': themeColor }">
    <div class="cover-main-banner" :style="{ backgroundColor: themeColor }">
      <div class="banner-badge">
        <span class="badge-number">{{ badge }}</span>
      </div>
      <div class="banner-title">
        {{ themeLabel.toUpperCase() }}
      </div>
    </div>
    <div class="cover-sub-banner" :style="{ backgroundColor: subBannerColor }">
      <h2 class="sub-banner-title">{{ subBannerTitle }}</h2>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    themeColor: string
    themeLabel: string
    communeName?: string
    badge?: string
  }>(),
  { communeName: '', badge: '1' }
)

const subBannerColor = computed(() => {
  const color = props.themeColor || '#7067A3'
  if (!color) return 'rgba(112, 103, 163, 0.15)'
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, 0.15)`
  }
  return color
})

const subBannerTitle = computed(() =>
  (props.communeName || props.themeLabel || '').toUpperCase()
)
</script>

<style scoped>
.cover-main-banner {
  display: flex;
  align-items: center;
  padding: 10mm 18mm;
  background-color: var(--theme-color, #7067a3);
  color: #ffffff;
  margin-top: 0;
  flex-shrink: 0;
}

.banner-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20mm;
}

.badge-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 45px;
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 4px;
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  font-family: 'Montserrat', sans-serif;
}

.banner-title {
  flex: 1;
  font-size: 36px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: 'Montserrat', sans-serif;
  color: #ffffff;
}

.cover-sub-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6mm 18mm;
  flex-shrink: 0;
}

.sub-banner-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--theme-color, #7067a3);
  font-family: 'Montserrat', sans-serif;
}
</style>
