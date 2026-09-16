<template>
  <header class="section-header" :style="{ '--theme-color': themeColor }">
    <div class="header-number">{{ badge }}</div>
    <div class="header-content">
      <span class="header-theme">{{ themeTag }}</span>
      <h1 class="header-title">{{ title }}</h1>
    </div>
  </header>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    badge: string
    themeTag: string
    title: string
    themeColor?: string
  }>(),
  { themeColor: '#5A4C8C' }
)
</script>

<style scoped>
.section-header {
  background-color: var(--theme-color, #5a4c8c);
  color: white;
  padding: 12px 20px;
  margin-bottom: 30px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-number {
  font-size: 2.5rem;
  font-weight: 800;
  margin-right: 20px;
  opacity: 0.3;
  line-height: 1;
  display: none;
}

.header-content {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 15px;
  width: 100%;
}

.header-theme {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  opacity: 0.8;
  font-weight: 500;
}

.header-title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #fff;
  flex: 1;
}
</style>
