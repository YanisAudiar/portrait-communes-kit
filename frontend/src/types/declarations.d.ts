declare module '@/stores' {
  import { StoreDefinition } from 'pinia'
  
  export const useMapStore: StoreDefinition
  export const useCommuneStore: StoreDefinition
  export const useFilterStore: StoreDefinition
}

declare module '@/utils/mapHelpers' {
  export function getFeatureCode(feature: any): string
  export function getFeatureName(feature: any): string
}



declare module '@/components/Map/MapContainer.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@/assets/css/sidebar-right.css'
