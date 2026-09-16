<template>
  <header class="landing-header">
    <div class="landing-header-inner">
      <div class="landing-title-group">
        <router-link to="/" class="landing-home-link" aria-label="Accueil">
          <svg class="landing-home-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </router-link>
        <router-link to="/" class="landing-title-link">
          <h1 class="landing-title">
            <strong>{{ territory.productTitle }}</strong> de {{ territory.name }}
          </h1>
        </router-link>
      </div>
      <a
        :href="agency.website"
        target="_blank"
        rel="noopener noreferrer"
        class="landing-logo"
        :aria-label="`${agency.name} - Site officiel`"
      >
        <img
          v-if="!logoError"
          src="@/assets/images/logo-Audiar.svg"
          :alt="agency.name"
          class="landing-logo-img"
          @error="logoError = true"
        />
        <span v-else class="landing-logo-fallback">{{ agency.shortName }}</span>
      </a>
    </div>
  </header>
</template>

<script setup lang="ts">
/**
 * Header commun pour la page d'accueil et les pages secondaires (mentions légales).
 * Style : bandeau bleu eucalyptus, titre à gauche, logo agence à droite.
 */
import { ref } from 'vue'
import { siteConfig } from '@/config/site'

const agency = siteConfig.agency
const territory = siteConfig.territory
const logoError = ref(false)
</script>

<style scoped>
.landing-header {
  background: #ebf5f6;
  padding: 1.25rem 2.5rem 1rem;
  flex-shrink: 0;
}

.landing-header-inner {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  min-height: 55px;
}

.landing-title-group {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.landing-home-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  color: var(--bleu-eucalyptus, #316d7b);
  border: 1px solid rgba(49, 109, 123, 0.2);
  background: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.landing-home-link:hover {
  background: #ffffff;
  border-color: rgba(49, 109, 123, 0.35);
}

.landing-title-link {
  text-decoration: none;
  color: inherit;
}

.landing-title {
  font-family: var(--font-body, 'Montserrat', sans-serif);
  font-size: 2.25rem;
  font-weight: 300;
  color: var(--bleu-eucalyptus, #316d7b);
  margin: 0;
  line-height: 1.2;
}

.landing-title strong {
  font-weight: 700;
}

.landing-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;
  align-self: flex-start;
}

.landing-logo-img {
  height: 52px;
  width: auto;
}

.landing-logo-fallback {
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--bleu-eucalyptus, #316d7b);
}

@media (max-width: 768px) {
  .landing-header {
    padding: 1rem 1.5rem;
  }

  .landing-header-inner {
    align-items: center;
  }

  .landing-title-group {
    gap: 0.6rem;
  }

  .landing-home-link {
    width: 34px;
    height: 34px;
  }

  .landing-title {
    font-size: 1.5rem;
  }

  .landing-logo-img {
    height: 40px;
  }
}
</style>
