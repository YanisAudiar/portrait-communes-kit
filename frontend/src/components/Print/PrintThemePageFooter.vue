<template>
  <footer v-if="footnote || date" class="page-footer">
    <p v-if="footnote" class="footnote">{{ footnote }}</p>
    <p v-if="date" class="footnote">{{ date }}</p>
  </footer>
</template>

<script setup lang="ts">
defineProps<{
  footnote?: string
  date?: string
}>()
</script>

<style scoped>
.page-footer {
  margin-top: auto;
  padding: 10px 18mm;
  border-top: 1px solid #eee;
}

.footnote {
  font-size: 0.7rem;
  color: #999;
  text-align: right;
}
</style>
