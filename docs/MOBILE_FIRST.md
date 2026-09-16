# Stratégie Mobile-First — Portrait Communes

L’application est conçue **mobile first** : les styles de base ciblent le mobile, puis on améliore pour tablette et desktop avec des media queries `min-width`.

## Principes

1. **Styles par défaut = mobile**  
   Pas de media query pour le comportement de base (grilles 1 colonne, padding réduit, typo lisible sur petit écran).

2. **Progression par breakpoints**  
   On ajoute du confort pour les écrans plus larges avec `@media (min-width: …)` :
   - **&lt; 480px** : très petit mobile
   - **480px–767px** : mobile standard
   - **768px–1023px** : tablette
   - **1024px+** : desktop

3. **Viewport et safe area**  
   - `viewport-fit=cover` dans `index.html` pour les encoches.
   - Variables CSS `--safe-top`, `--safe-bottom`, etc. (dans `modern-dashboard-variables.css`).
   - Bottom nav et zones fixes utilisent `padding-bottom: var(--safe-bottom)` (ou `env(safe-area-inset-bottom)`).

4. **Touch**  
   Cibles tactiles minimales **44×44px** (`--touch-min: 44px`). Boutons et liens sur mobile respectent cette taille.

## Breakpoints (variables CSS)

Dans `frontend/src/assets/css/modern-dashboard-variables.css` :

| Variable   | Valeur  | Usage                |
|-----------|---------|----------------------|
| `--bp-xs` | 320px   | Très petit mobile    |
| `--bp-sm` | 480px   | Mobile standard      |
| `--bp-md` | 768px   | Tablette             |
| `--bp-lg` | 1024px  | Petit desktop        |
| `--bp-xl` | 1280px  | Desktop              |
| `--bp-2xl`| 1400px  | Grand desktop        |

Utiliser de préférence ces variables dans les media queries pour garder une seule source de vérité.

## Comportement par écran

- **Dashboard** : carte plein écran, sidebar en tiroir en bas sur mobile ; sidebar à gauche sur desktop.
- **Navigation** : barre fixe en bas sur mobile (`BottomNavigation`), header classique sur desktop.
- **Commune** : onglets et contenu en colonne sur mobile ; mise en page plus large sur desktop.
- **Graphiques** : config responsive (voir `mobileChartConfig.ts`, `useChartConfigResponsive.ts`).

## Fichiers clés

- `index.html` : viewport + `viewport-fit=cover`
- `frontend/src/assets/css/modern-dashboard-variables.css` : breakpoints, safe area, `--touch-min`
- `frontend/src/assets/css/modern-dashboard-responsive.css` : responsive du dashboard
- `frontend/src/assets/css/main/responsive.css` : grilles et container
- `frontend/src/assets/css/views/dashboard.css` : layout dashboard mobile (carte plein écran, sidebar en bas)
- `App.vue` : détection mobile (768px), affichage de la bottom nav, `min-height: 100dvh`

## Tester sur mobile

1. DevTools Chrome : mode appareil (Ctrl+Shift+M), choisir un appareil ou une résolution.
2. Vérifier : bottom nav, safe area en bas, sidebar tiroir, listes en 1 colonne, boutons ≥ 44px.
3. Tester en paysage sur petite hauteur (`orientation: landscape` géré dans les CSS).
