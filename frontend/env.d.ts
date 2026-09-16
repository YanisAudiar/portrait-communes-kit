/// <reference types="vite/client" />
/// <reference path="./src/types/shims-js-modules.d.ts" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
