<template>
  <div v-if="displayLinks.length > 0" class="pour-en-savoir-plus">
    <h3 class="pour-en-savoir-plus-title">Pour en savoir plus</h3>
    <hr class="pour-en-savoir-plus-hr" />
    <nav class="pour-en-savoir-plus-content">
      <!-- Liens texte (sans image) -->
      <a
        v-for="(link, idx) in textLinks"
        :key="`text-${idx}`"
        :href="link.url"
        class="pour-en-savoir-plus-link classic-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ link.alias }}
      </a>
      <!-- Liens avec image (.mt-5 dans l'ancienne app) -->
      <div v-if="imageLinks.length" class="pour-en-savoir-plus-images">
        <a
          v-for="(link, idx) in imageLinks"
          :key="`img-${idx}`"
          :href="link.url"
          class="pour-en-savoir-plus-link-img"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img :src="link.img" :alt="link.alias" height="50" />
        </a>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
/**
 * Liens "Pour en savoir plus" par thématique.
 * Inspiré de l'ancienne app : config/dashboard/*.json avec propriété links.
 *
 * - themeId fourni : affiche les liens du thème uniquement (ex: CommuneDetail)
 * - themeId absent : affiche tous les liens (Dashboard, Landing, Mentions légales)
 *
 * Structure d'un lien : alias, url, img? (optionnel).
 * Sans img : lien texte. Avec img : lien avec image (hauteur 50px).
 */
import { computed } from 'vue'
import { getLinksByTheme, getAllLinks } from '@/config/dashboard/links'

const props = withDefaults(
  defineProps<{
    /** Id du thème actif (ex: 'demographie'). Si fourni, affiche uniquement les liens du thème. */
    themeId?: string
  }>(),
  { themeId: undefined }
)

const displayLinks = computed(() =>
  props.themeId ? getLinksByTheme(props.themeId) : getAllLinks()
)

const textLinks = computed(() => displayLinks.value.filter((l) => !l.img))
const imageLinks = computed(() => displayLinks.value.filter((l) => l.img))
</script>

<style scoped>
/* Structure inspirée de l'ancienne app : .title-b, hr, .content, a.classic-link */
.pour-en-savoir-plus {
  display: flex;
  flex-direction: column;
}

.pour-en-savoir-plus-title {
  margin: 0 0 1rem 0;
  font-size: 17px;
  font-weight: bold;
  color: inherit;
}

.pour-en-savoir-plus-hr {
  margin: 0 0 1rem 0;
  border: none;
  border-top: 1px solid #e2e2e2;
}

.pour-en-savoir-plus-content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.5rem;
  font-size: 14px;
  margin-bottom: 10px;
}

/* Style classic-link : couleur grise, soulignement discret (comme ancienne app) */
.pour-en-savoir-plus-link.classic-link {
  color: #868686;
  border-bottom: 1px solid #e2e2e2;
  text-decoration: none;
  cursor: pointer;
}

.pour-en-savoir-plus-link.classic-link:hover {
  text-decoration: none;
  color: #5a5a5a;
}

/* Liens avec image : marge haute 3rem comme .mt-5 dans l'ancienne app */
.pour-en-savoir-plus-images {
  margin-top: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.pour-en-savoir-plus-link-img img {
  height: 50px;
  display: block;
}
</style>
