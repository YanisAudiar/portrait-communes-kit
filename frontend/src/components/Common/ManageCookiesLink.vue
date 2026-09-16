<template>
  <a
    v-if="analyticsEnabled"
    href="#"
    class="manage-cookies-link"
    :class="linkClass"
    @click.prevent="manageCookies"
  >
    Gérer mes cookies
  </a>
</template>

<script setup lang="ts">
import { useCookieConsent } from '@/composables/useCookieConsent'

withDefaults(
  defineProps<{
    linkClass?: string
  }>(),
  { linkClass: '' }
)

const { manageCookies, analyticsEnabled } = useCookieConsent()
</script>
