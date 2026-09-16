<template>
  <div class="cover-left-column" :style="{ '--theme-color': themeColor }">
    <ul class="topics-list">
      <li v-for="(topic, index) in topics" :key="topic.label || index" class="topic-item">
        <span class="topic-label">{{ topic.label }}</span>
        <span v-if="topic.page" class="topic-page">(p.{{ topic.page }})</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
export interface TopicItem {
  label: string
  page: number | null
}

withDefaults(
  defineProps<{
    topics: TopicItem[]
    themeColor?: string
  }>(),
  { themeColor: '#7067A3' }
)
</script>

<style scoped>
.cover-left-column {
  flex: 0 0 40%;
  display: flex;
  flex-direction: column;
}

.topics-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.topic-item {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 12px;
  color: var(--theme-color, #7067a3);
  font-family: 'Lato', sans-serif;
  line-height: 1.5;
}

.topic-label {
  flex: 1;
  font-weight: 400;
}

.topic-page {
  font-size: 11px;
  color: rgba(44, 62, 80, 0.6);
  font-style: italic;
}
</style>
