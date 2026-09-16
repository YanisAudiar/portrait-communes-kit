<template>
  <div class="search-section hide-mobile">
    <div class="search-box">
      <input 
        type="text" 
        :placeholder="placeholder" 
        class="search-input"
        v-model="searchQuery"
        @input="handleInput"
      >
      <button class="search-btn" @click="handleSearch">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Mot clé'
  }
})

const emit = defineEmits<{
  (e: 'search', value: string): void
  (e: 'input', value: string): void
}>()

const searchQuery = ref<string>('')

const handleInput = (): void => {
  emit('input', searchQuery.value)
}

const handleSearch = (): void => {
  emit('search', searchQuery.value)
}
</script>

<style scoped>
.search-section {
  display: flex;
  align-items: center;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  padding: 10px 40px 10px 16px;
  border: 2px solid rgba(229, 231, 235, 0.8);
  border-radius: 12px;
  font-size: 14px;
  width: 220px;
  font-family: 'Montserrat', sans-serif;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-input:focus {
  outline: none;
  border-color: #f17e08;
  box-shadow: 0 0 0 4px rgba(241, 126, 8, 0.1);
  transform: translateY(-1px);
  background: white;
}

.search-input::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.search-btn {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
}

.search-btn:hover {
  color: var(--accent-orange);
}

@media (max-width: 1024px) {
  .search-input {
    width: 160px;
  }
}
</style>

