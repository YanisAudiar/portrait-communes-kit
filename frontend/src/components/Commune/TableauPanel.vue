<template>
  <div class="tableau-container">
    <slot>
      <!-- Contenu par défaut: données brutes de l'indicateur sélectionné -->
      <div class="default-content">
        <div class="tableau-header">
          <h3 class="tableau-title">
            📋 Données brutes
          </h3>
          <p class="tableau-subtitle">
            {{ indicatorName || 'Sélectionnez un indicateur' }}
          </p>
        </div>

        <!-- Tableau de données -->
        <div class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Indicateur</th>
                <th>Valeur</th>
                <th>Unité</th>
                <th>Année</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in tableData" :key="row.id">
                <td class="cell-label">{{ row.label }}</td>
                <td class="cell-value">{{ row.value }}</td>
                <td class="cell-unit">{{ row.unit }}</td>
                <td class="cell-year">{{ row.year }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Boutons d'export -->
        <div class="export-actions">
          <button @click="handleExportCSV" class="export-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8.5 6.5a.5.5 0 0 0-1 0v3.793L6.354 9.146a.5.5 0 1 0-.708.708l2 2a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 10.293V6.5z"/>
              <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/>
            </svg>
            Exporter CSV
          </button>
          <button @click="handleExportExcel" class="export-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5.884 6.68a.5.5 0 1 0-.768.64L7.349 10l-2.233 2.68a.5.5 0 0 0 .768.64L8 10.781l2.116 2.54a.5.5 0 0 0 .768-.641L8.651 10l2.233-2.68a.5.5 0 0 0-.768-.64L8 9.219l-2.116-2.54z"/>
              <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/>
            </svg>
            Exporter Excel
          </button>
        </div>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { useDataExport, type ExportableData } from '@/composables/useDataExport'

interface TableRow {
  id: number | string
  label: string
  value: string | number
  unit?: string
  year?: string
  [key: string]: any
}

const props = defineProps({
  indicatorName: {
    type: String,
    default: null
  },
  tableData: {
    type: Array as () => TableRow[],
    default: () => []
  }
})

const { exportCSV, exportExcel } = useDataExport()

const handleExportCSV = () => {
  exportCSV(props.tableData as ExportableData[])
}

const handleExportExcel = () => {
  exportExcel(props.tableData as ExportableData[])
}
</script>

<style scoped>
.default-content {
  padding: 24px;
  height: 100%;
}

.tableau-header {
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(229, 231, 235, 0.6);
}

.tableau-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

.tableau-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
}

.data-table-wrapper {
  overflow-x: auto;
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 4px 16px rgba(0, 0, 0, 0.06);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table thead {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.data-table th {
  padding: 14px 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.5px;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  color: #6b7280;
}

.data-table tbody tr {
  transition: all 0.2s ease;
}

.data-table tbody tr:hover {
  background: rgba(241, 126, 8, 0.05);
}

.cell-label {
  font-weight: 500;
  color: #111827;
}

.cell-value {
  font-weight: 600;
  color: #f17e08;
  font-size: 15px;
}

.cell-unit {
  font-style: italic;
  font-size: 13px;
}

.cell-year {
  color: #9ca3af;
  font-size: 13px;
}

.export-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: linear-gradient(135deg, #f17e08 0%, #e36411 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(241, 126, 8, 0.2);
}

.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 20px rgba(241, 126, 8, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.1);
}

.export-btn:active {
  transform: translateY(0);
}

@media (max-width: 1024px) {
  .default-content {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .default-content {
    padding: 16px;
  }

  .tableau-title {
    font-size: 20px;
  }

  .data-table {
    font-size: 13px;
  }

  .data-table th,
  .data-table td {
    padding: 10px 12px;
  }

  .export-actions {
    flex-direction: column;
  }

  .export-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .default-content {
    padding: 12px;
  }
}
</style>
