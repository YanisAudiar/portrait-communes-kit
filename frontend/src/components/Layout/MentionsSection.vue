<template>
  <div class="mentions-section">
    <div class="section-title">
      <span class="section-number">{{ number }}</span>
      {{ title }}
    </div>
    <div class="section-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  /** Numéro de section (affiché à gauche du titre) */
  number: string | number
  /** Titre de la section */
  title: string
}>()
</script>

<style scoped>
.mentions-section {
  margin-bottom: 40px;
}

.section-title {
  display: flex;
  align-items: baseline;
  margin-bottom: 15px;
  font-size: 20px;
  font-weight: bold;
  color: var(--primary-blue);
  font-family: 'Montserrat', sans-serif;
}

.section-number {
  color: var(--accent-orange);
  margin-right: 10px;
  font-weight: 700;
}

.section-content {
  margin-bottom: 30px;
  line-height: 1.6;
  color: var(--text-primary);
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
}

.section-content :deep(p) {
  margin-bottom: 15px;
}

.section-content :deep(.subsection) {
  margin-top: 15px;
}

.section-content :deep(.subsection-number) {
  color: var(--accent-orange);
  display: inline;
  margin-right: 5px;
  font-weight: 600;
}

.section-content :deep(.contact-info) {
  margin-bottom: 5px;
}

.section-content :deep(.custom-list) {
  padding-left: 20px;
  margin-top: 10px;
  margin-bottom: 15px;
}

.section-content :deep(.custom-list li) {
  margin-bottom: 8px;
}

.section-content :deep(.update-info) {
  font-style: italic;
  margin-top: 10px;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .section-title {
    font-size: 18px;
  }
}
</style>
