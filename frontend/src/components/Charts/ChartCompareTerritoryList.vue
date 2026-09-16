<template>
  <div v-if="territories.length > 0" class="active-comparisons">
    <span class="comparisons-label">Comparaisons actives :</span>
    <div class="comparison-tags">
      <span
        v-for="(territory, index) in territories"
        :key="territory.code"
        class="comparison-tag"
        :style="{
          backgroundColor: colors[index] + '20',
          borderColor: colors[index]
        }"
      >
        <span class="tag-dot" :style="{ backgroundColor: colors[index] }"></span>
        {{ territory.label }}
        <button
          type="button"
          class="tag-remove"
          @click="$emit('remove', territory.code)"
        >
          ×
        </button>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    territories: { code: string; label: string }[]
    colors?: string[]
  }>(),
  { colors: () => ['#10B981', '#8B5CF6'] }
)

defineEmits<{
  (e: 'remove', code: string): void
}>()
</script>

<style scoped>
.active-comparisons {
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.comparisons-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.comparison-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.comparison-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: white;
  border: 1px solid;
  border-radius: 20px;
  font-size: 0.813rem;
  font-weight: 500;
  color: #1e293b;
}

.tag-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-left: 0.25rem;
  background: transparent;
  border: none;
  border-radius: 50%;
  font-size: 14px;
  line-height: 1;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tag-remove:hover {
  background: #fee2e2;
  color: #dc2626;
}
</style>
