<template>
  <div class="mentions-legales">
    <LandingHeader />

    <div class="mentions-container">
      <h1 class="mentions-title">Mentions légales</h1>
      <div class="section-divider"></div>

      <MentionsSection number="1" title="Présentation">
        Ce tableau de bord est édité par {{ agency.name }}. Cette plateforme de visualisation en ligne permet de consulter ou extraire des données et indicateurs sur les communes de {{ territory.name }}. Les données présentées sont publiques et disponibles en open data.
      </MentionsSection>

      <MentionsSection number="2" title="Éditeur et responsabilités">
        <div class="contact-info">Éditeur du service : {{ agency.name }} (Siret : {{ agency.siret }})</div>
        <div class="contact-info">{{ agency.addressLines.join(' - ') }}</div>
        <div class="contact-info">Tél. : {{ agency.phone }} ; mail : {{ agency.email }}</div>
        <div class="contact-info">Directeur de la publication : {{ agency.director }}</div>
      </MentionsSection>

      <MentionsSection number="3" title="Mise en garde">
        <p>L'information contenue dans ces pages n'est fournie qu'à titre informatif et ne prétend aucunement à l'exhaustivité. {{ agency.name }} décline toute responsabilité quant au contenu des présentes pages et à l'utilisation qui pourrait en être faite. Il appartient aux utilisateurs de vérifier que leur configuration permet un accès sécurisé aux tableaux de bord.</p>
        <p>En accédant à ces tableaux de bord et en les utilisant, vous reconnaissez être lié par les présentes conditions d'utilisation et vous vous engagez à les respecter.</p>
      </MentionsSection>

      <MentionsSection number="4" title="Droits de propriété intellectuelle">
        <div class="subsection">
          <span class="subsection-number">4.1.</span>
          La structure générale, les textes, visualisations de données et tous les éléments composant ces tableaux de bord sont protégés et relèvent de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle.
        </div>
        <div class="subsection">
          <span class="subsection-number">4.2.</span>
          La réutilisation des visualisations et données présentées dans ce tableau de bord est possible en citant explicitement :
          <ul class="custom-list">
            <li>la source originale des données</li>
            <li>{{ agency.name }} comme source des traitements et analyses</li>
          </ul>
        </div>
      </MentionsSection>

      <MentionsSection number="6" title="Liens hypertextes">
        <div class="subsection">
          <span class="subsection-number">6.1.</span>
          Les liens hypertextes présents ne sauraient engager la responsabilité de {{ agency.name }}.
        </div>
      </MentionsSection>

      <MentionsSection number="7" title="Cookies – suivi d'audience">
        <p>
          Ce site peut utiliser Matomo (outil d'analyse d'audience de {{ agency.name }}) pour mesurer sa
          fréquentation et améliorer le contenu. Le suivi n'est activé qu'après votre accord, via la
          bannière affichée lors de votre visite ou le lien « Gérer mes cookies » en pied de page. Vous
          pouvez à tout moment retirer votre consentement. Un cookie de session, nécessaire au
          fonctionnement du site (connexion, accès aux contenus), est déposé indépendamment de ce choix.
        </p>
      </MentionsSection>

      <MentionsSection number="8" title="Modification des mentions légales">
        {{ agency.name }} se réserve le droit de modifier les présentes mentions légales et vous invite à les consulter régulièrement.
        <div class="update-info">Dernière mise à jour : {{ agency.mentionsUpdated }}</div>
      </MentionsSection>
    </div>

    <DashboardFooter :show-partner-column="false" />
  </div>
</template>

<script setup>
import LandingHeader from '@/components/Layout/LandingHeader.vue'
import MentionsSection from '@/components/Layout/MentionsSection.vue'
import DashboardFooter from '@/components/Dashboard/DashboardFooter.vue'
import { siteConfig } from '@/config/site'

const agency = siteConfig.agency
const territory = siteConfig.territory
</script>

<style scoped>
.mentions-legales {
  min-height: 100vh;
  background: var(--bg-light);
  display: flex;
  flex-direction: column;
}

.mentions-container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 40px 15px;
  flex: 1;
}

.mentions-title {
  font-size: 24px;
  font-weight: bold;
  margin-top: 30px;
  margin-bottom: 20px;
  color: var(--primary-blue);
  font-family: 'Montserrat', sans-serif;
}

.section-divider {
  border-top: 1px solid #e9ecef;
  margin-bottom: 30px;
}

@media (max-width: 768px) {
  .mentions-container {
    padding: 20px 15px;
  }

  .mentions-title {
    font-size: 20px;
    margin-top: 20px;
  }
}
</style>
