<template>
  <div class="print-cover-page">
    <div class="cover-content">
      <div class="cover-header">
        <img src="@/assets/images/logo-Audiar.svg" :alt="agency.name" class="cover-logo" />
      </div>
      
      <div class="cover-main">
        <h1 class="cover-title">Portrait de<br><span class="highlight">Territoire</span></h1>
        <div class="cover-separator"></div>
        <h2 class="cover-commune">{{ communeName }}</h2>
        <p class="cover-code">Code INSEE : {{ codeInsee }}</p>
        
        <div class="cover-theme-badge" v-if="themeName">
          {{ themeName }}
        </div>
      </div>

      <div class="cover-footer">
        <div class="footer-info">
          <p class="cover-date">{{ date }}</p>
          <p class="cover-subtitle">{{ agency.fullTitle }}</p>
        </div>
      </div>
    </div>
    <div class="cover-decoration">
      <div class="deco-shape"></div>
    </div>
  </div>
</template>

<script setup>
import { siteConfig } from '@/config/site'

const agency = siteConfig.agency

defineProps({
  communeName: {
    type: String,
    default: ''
  },
  codeInsee: {
    type: String,
    default: ''
  },
  date: {
    type: String,
    default: ''
  },
  themeName: {
    type: String,
    default: null
  }
})
</script>

<style scoped>
.print-cover-page {
  width: 100%;
  /* Hauteur ajustée pour tenir compte des marges PDF (1cm haut/bas) */
  /* A4 (210mm) - 20mm marge = 190mm max. On prend 188mm par sécurité */
  height: 188mm; 
  page-break-after: always;
  position: relative;
  background: #ffffff;
  overflow: hidden;
  display: flex;
  font-family: 'Montserrat', sans-serif;
  margin: 0;
  box-sizing: border-box;
}

.cover-content {
  flex: 1;
  padding: 20mm;
  display: flex;
  flex-direction: column;
  z-index: 2;
  max-width: 65%;
}

.cover-header {
  margin-bottom: 40px;
}

.cover-logo {
  height: 60px;
  width: auto;
}

.cover-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.cover-title {
  font-size: 64px;
  line-height: 1.1;
  font-weight: 300;
  color: #2c3e50;
  margin: 0 0 30px 0;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.highlight {
  font-weight: 800;
  color: #316D7B;
}

.cover-separator {
  width: 100px;
  height: 6px;
  background: #e67e22; /* Touche de couleur contrastée */
  margin-bottom: 40px;
}

.cover-commune {
  font-size: 32px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.cover-code {
  font-size: 18px;
  color: #7f8c8d;
  margin: 0;
  font-weight: 400;
  font-family: 'Lato', sans-serif;
}

.cover-theme-badge {
  margin-top: 30px;
  display: inline-block;
  padding: 10px 20px;
  background: #f0f4f5;
  color: #316D7B;
  font-weight: 600;
  border-radius: 4px;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  align-self: flex-start;
}

.cover-footer {
  margin-top: auto;
}

.cover-date {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 5px 0;
}

.cover-subtitle {
  font-size: 12px;
  color: #95a5a6;
  margin: 0;
  font-family: 'Lato', sans-serif;
}

/* Partie décorative à droite */
.cover-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 35%;
  height: 100%;
  background: #316D7B;
  z-index: 1;
}

.deco-shape {
  position: absolute;
  top: 0;
  left: -50px;
  width: 100px;
  height: 100%;
  background: #ffffff;
  transform: skewX(-10deg);
}
</style>
