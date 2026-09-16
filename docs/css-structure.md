# Structure et utilisation des fichiers CSS

Document d’analyse et de référence pour le rangement des styles du frontend.

---

## 1. Point d’entrée actuel (main.ts)

| Fichier           | Rôle                          |
|-------------------|--------------------------------|
| `main.css`        | Fondations, variables, base, composants globaux, responsive, charts |
| `modern-ui.css`   | Design system (boutons, cartes, formulaires, animations, utilitaires) |
| `utilities.css`   | Classes utilitaires (glass-panel, scroll-thumb-gradient) |
| `maplibre-gl.css` | Vendor MapLibre                |

---

## 2. Chaîne d’imports

### main.css
- Polices (Google Fonts)
- **modern-dashboard-responsive.css** ← chargé une fois en global
- main/variables.css
- main/base.css
- main/components.css
- main/utilities.css
- main/responsive.css
- main/charts.css
- Puis @tailwind base/components/utilities

### modern-ui.css
- modern-ui/buttons.css
- modern-ui/cards.css
- modern-ui/forms.css
- modern-ui/animations.css
- modern-ui/utilities.css

### modern-dashboard.css (chargé par commune-detail + composants)
- modern-dashboard-variables.css
- modern-dashboard-base.css
- modern-dashboard-header.css
- modern-dashboard-theme-selector.css
- modern-dashboard-indicators.css
- modern-dashboard-charts.css
- modern-dashboard-typography.css
- **modern-dashboard-responsive.css** ← doublon avec main.css
- modern-dashboard-utilities.css

### views/commune-detail.css (vue CommuneDetail)
- modern-dashboard.css
- ./commune-detail/layout.css, header-actions.css, theme-subthemes.css, kpis.css, charts.css, states.css, responsive.css

---

## 3. Fichiers utilisés par vue / composant

| Fichier CSS | Importé par |
|-------------|-------------|
| **views/commune-detail.css** | CommuneDetail.vue |
| **views/dashboard.css** | Dashboard.vue |
| **features/map-container.css** | MapContainer.vue |
| **features/map-popups.css** | MapContainer.vue |
| **components/sidebar-right.css** | SidebarRight.vue |
| **components/app-header.css** | AppHeader.vue |
| **components/theme-tab.css** | ThemeTab.vue |
| **components/theme-indicators.css** | ThemeIndicators.vue, SubthemeFilterButtons.vue, IndicatorCard.vue |
| **components/indicators-list.css** | ThemeGroup.vue, IndicatorsList.vue, ScrollIndicator.vue |
| modern-dashboard.css | views/commune-detail.css + @import dans ThemeBanner, ChartComponent, ModernHeader, IndicatorsList |

---

## 4. Fichier non utilisé

| Fichier            | Statut |
|--------------------|--------|
| **premium-charts.css** | Jamais importé. Contient .premium-chart-container, variables --premium-*. Soit à supprimer, soit à intégrer (ex. modern-dashboard-charts) si besoin. |

---

## 5. Problèmes identifiés

1. **Doublon** : `modern-dashboard-responsive.css` est importé par `main.css` et par `modern-dashboard.css` → chargé deux fois sur la vue Commune.
2. **Trois “utilities”** : `main/utilities.css`, `modern-ui/utilities.css`, `utilities.css` (racine) → risque de confusion.
3. **Point d’entrée multiple** : main.ts charge 3 CSS (main, modern-ui, utilities) au lieu d’un seul.
4. **Fichier orphelin** : premium-charts.css jamais référencé.

---

## 6. Structure cible recommandée

```
assets/css/
├── README.md                    ← Ce document (résumé + convention)
├── app.css                      ← Point d'entrée unique (optionnel, ou garder main.css)
├── main.css                     ← Entrée principale : imports ordonnés
├── utilities.css                ← Utilitaires globaux (glass-panel, etc.)
│
├── foundation/                  ← Variables, reset, polices (optionnel : garder main/)
│   └── (ou garder main/variables, main/base)
├── main/                        ← Déjà en place
│   ├── variables.css
│   ├── base.css
│   ├── components.css
│   ├── utilities.css
│   ├── responsive.css
│   └── charts.css
│
├── layout/                      ← Responsive global (une seule fois)
│   └── responsive.css           ← Renommage possible de modern-dashboard-responsive
├── modern-dashboard.css         ← Shell dashboard
├── modern-dashboard-*.css       ← Partials (variables, base, header, etc.)
├── modern-dashboard-responsive.css  ← Importé UNE SEULE FOIS (dans main.css)
│
├── modern-ui.css
├── modern-ui/
│   ├── buttons.css
│   ├── cards.css
│   ├── forms.css
│   ├── animations.css
│   └── utilities.css
│
├── views/                       ← Styles par vue (en place)
│   ├── commune-detail.css
│   ├── commune-detail/         ← Partials commune
│   └── dashboard.css
│
├── components/                  ← Styles liés à un composant (en place)
│   ├── app-header.css
│   ├── sidebar-right.css
│   ├── theme-tab.css
│   ├── theme-indicators.css
│   └── indicators-list.css
│
├── features/                   ← Par fonctionnalité (en place)
│   ├── map-container.css
│   └── map-popups.css
│
└── _deprecated/                 ← Fichiers non utilisés (ex. premium-charts)
    └── premium-charts.css
```

Convention proposée :
- **Un seul point d’entrée** dans main.ts : `main.css` (qui peut importer modern-ui et utilities).
- **Responsive global** : un seul fichier (ex. modern-dashboard-responsive) importé une seule fois dans main.css.
- **Vues** : un fichier par vue (dashboard, commune-detail) importé dans la vue.
- **Composants** : un fichier par composant ou par petit groupe, importé dans le composant.

---

## 7. Actions appliquées (refactor)

- **Suppression du doublon** : `modern-dashboard-responsive` retiré de `modern-dashboard.css`, conservé uniquement dans `main.css` (chargé une seule fois pour toute l’app).
- **Point d’entrée unique** : `main.css` importe `modern-ui.css` et `utilities.css` ; **main.ts** n’importe plus que `main.css` (et maplibre-gl.css).
- **Fichier orphelin** : `premium-charts.css` déplacé vers `assets/css/_deprecated/` avec un README expliquant le statut ; fichier racine supprimé.
- **Documentation** : `assets/css/README.md` (résumé structure + conventions) et `docs/css-structure.md` (analyse détaillée).
- **Regroupement components/** : app-header, sidebar-right, theme-tab, theme-indicators, indicators-list déplacés dans `assets/css/components/` ; imports mis à jour dans les composants Vue ; anciens fichiers racine supprimés.
- **Regroupement views/** : dashboard.css et commune-detail.css (+ partials commune-detail/) déplacés dans `assets/css/views/` ; Dashboard.vue et CommuneDetail.vue mis à jour ; anciens fichiers racine et dossier commune-detail/ racine supprimés.
- **Regroupement features/** : map-container.css et map-popups.css déplacés dans `assets/css/features/` ; MapContainer.vue mis à jour ; anciens fichiers racine supprimés.
