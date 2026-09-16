<template>
  <div class="comparison-tab">
    <div class="comparison-section">
      <h3 class="title-b">⚖️ Comparaison territoriale</h3>
      <div class="comparison-table">
        <table class="audiar-table">
          <thead>
            <tr>
              <th>Indicateur</th>
              <th>{{ communeData?.nom || 'Commune' }}</th>
              <th>Département</th>
              <th>Bretagne</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="content">Taille moy. ménage</td>
              <td class="cc-value">{{ communeData?.taille_moyenne_menage ? parseFloat(String(communeData.taille_moyenne_menage)).toFixed(2) : '-' }}</td>
              <td class="content">2.35</td>
              <td class="content">2.28</td>
            </tr>
            <tr>
              <td class="content">Part personnes seules</td>
              <td class="cc-value">{{ communeData?.part_personnes_seules ? parseFloat(String(communeData.part_personnes_seules)).toFixed(1) + '%' : '-' }}</td>
              <td class="content">32.5%</td>
              <td class="content">34.1%</td>
            </tr>
            <tr v-if="communeData?.nb_menages">
              <td class="content">Nombre de ménages</td>
              <td class="cc-value">{{ parseInt(String(communeData.nb_menages)).toLocaleString() }}</td>
              <td class="content">-</td>
              <td class="content">-</td>
            </tr>
            <tr v-if="communeData?.population">
              <td class="content">Population</td>
              <td class="cc-value">{{ parseInt(String(communeData.population)).toLocaleString() }}</td>
              <td class="content">-</td>
              <td class="content">-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CommuneData {
  nom: string
  taille_moyenne_menage?: number | string
  part_personnes_seules?: number | string
  nb_menages?: number | string
  population?: number | string
  [key: string]: any
}

defineProps({
  communeData: {
    type: Object as () => CommuneData,
    default: null
  }
})
</script>

<style scoped>
.comparison-tab {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.comparison-section {
  background: var(--bg-white);
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.audiar-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}

.audiar-table th,
.audiar-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--bg-light);
}

.audiar-table th {
  background: var(--bg-light-blue);
  font-weight: 600;
  color: var(--primary-blue);
}

.audiar-table tbody tr:hover {
  background: var(--bg-light);
}

/* Responsive */
@media (max-width: 1024px) {
  .comparison-section {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .comparison-section {
    padding: 16px;
  }
  
  .audiar-table {
    font-size: 12px;
  }
  
  .audiar-table th,
  .audiar-table td {
    padding: 8px 12px;
  }
}

@media (max-width: 480px) {
  .comparison-section {
    padding: 12px;
  }
  
  .audiar-table {
    font-size: 11px;
  }
  
  .audiar-table th,
  .audiar-table td {
    padding: 6px 8px;
  }
}
</style>
