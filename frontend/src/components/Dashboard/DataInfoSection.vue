<template>
  <div class="data-info">
    <div class="info-header">
      <div class="header-icon">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5v2.25a.75.75 0 001.5 0V10a.75.75 0 00-.75-.75H9z" clip-rule="evenodd"/>
        </svg>
      </div>
      <h4 class="title-c">Informations</h4>
    </div>
    <div class="info-content">
      <div class="info-card">
        <div class="info-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 4.42 3.58 8 8 8 4.42 0 8-3.58 8-8 0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
            <path d="M8 4a1 1 0 100 2 1 1 0 000-2zM6 8a1 1 0 011-1h1a1 1 0 011 1v3a1 1 0 01-2 0V9a1 1 0 00-1-1z"/>
          </svg>
        </div>
        <p class="description">
          Les données présentées sont issues des dernières statistiques disponibles 
          sur les ménages bretons.
        </p>
      </div>
      <div class="info-card">
        <div class="info-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 4.754a3.246 3.246 0 100 6.492 3.246 3.246 0 000-6.492zM5.754 8a2.246 2.246 0 114.492 0 2.246 2.246 0 01-4.492 0z"/>
            <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 01-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 01-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 01.52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 011.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 011.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 01.52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 01-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 01-1.255-.52l-.094-.319z"/>
          </svg>
        </div>
        <p class="description">
          Cliquez sur une commune pour voir le détail des indicateurs.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Pas de logique nécessaire pour ce composant statique
</script>

<style scoped>
.data-info {
  margin-top: 24px;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.info-header .header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--text-secondary);
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  border-left: 3px solid var(--primary-blue);
}

.info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: var(--primary-blue);
  flex-shrink: 0;
  margin-top: 2px;
}

.info-card p {
  margin: 0;
  line-height: 1.5;
}
</style>

