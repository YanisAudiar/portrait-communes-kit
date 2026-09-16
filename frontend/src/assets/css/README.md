# Structure des fichiers CSS

## Point d'entrée unique

**main.ts** ne charge qu'un seul fichier : **main.css** (plus maplibre-gl).

**main.css** importe dans l'ordre :
1. Polices (Google Fonts)
2. `modern-dashboard-responsive.css` (responsive global, une seule fois)
3. **main/** : variables, base, components, utilities, responsive, charts
4. **modern-ui.css** (shell → modern-ui/*)
5. **utilities.css** (glass-panel, scroll-thumb-gradient)
6. Tailwind (base, components, utilities)

## Organisation par rôle

| Dossier / fichier | Rôle |
|-------------------|------|
| **main.css** | Point d'entrée, ordre des imports |
| **main/** | Fondations : variables, reset, typo, boutons/cartes/forms globaux, utilitaires, responsive, styles Chart.js |
| **modern-dashboard.css** + **modern-dashboard-*.css** | Design dashboard (variables, base, header, indicateurs, graphiques, typo, utilitaires). *Ne contient plus* modern-dashboard-responsive (éviter doublon). |
| **modern-ui.css** + **modern-ui/** | Design system : boutons, cartes, formulaires, animations, utilitaires modernes |
| **utilities.css** | Utilitaires globaux (glass-panel, etc.) |
| **views/** | Styles par vue : **views/dashboard.css**, **views/commune-detail.css** + **views/commune-detail/** (partials). Importés dans Dashboard.vue et CommuneDetail.vue. |
| **components/** | Styles liés à un composant : app-header, sidebar-right, theme-tab, theme-indicators, indicators-list. Importés dans le composant concerné. |
| **features/** | Styles par fonctionnalité : **map-container.css**, **map-popups.css** (carte). Importés dans MapContainer.vue. |
| **_deprecated/** | Fichiers non utilisés (ex. premium-charts.css), conservés pour référence |

## Conventions

- Un **fichier shell** (ex. main.css, modern-ui.css, views/commune-detail.css) ne contient que des `@import` et éventuellement des commentaires.
- Les **partials** sont regroupés par thème (main/, modern-ui/, views/commune-detail/, modern-dashboard-*).
- Le **responsive global** est chargé une seule fois (dans main.css).
- Les styles **par vue** sont dans **views/** et chargés dans la vue (Dashboard → views/dashboard.css, CommuneDetail → views/commune-detail.css).
- Les styles **par composant** sont dans **components/** et chargés dans le composant (AppHeader, SidebarRight, ThemeTab, etc.).
- Les styles **par fonctionnalité** (carte) sont dans **features/** et chargés dans le composant (MapContainer).

## Voir aussi

- **docs/css-structure.md** : analyse détaillée (fichiers utilisés / non utilisés, structure actuelle).
