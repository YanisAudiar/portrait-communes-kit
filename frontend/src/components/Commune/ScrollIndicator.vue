<template>
  <div class="scroll-indicator">
    <div
      class="scroll-thumb scroll-thumb-gradient"
      :style="{
        height: thumbHeight + '%',
        transform: `translateY(${thumbPosition}px)`
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  thumbHeight: {
    type: Number,
    default: 0
  },
  thumbPosition: {
    type: Number,
    default: 0
  }
})
</script>

<style scoped>
@import '@/assets/css/components/indicators-list.css';
</style>

