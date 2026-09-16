# Plan de décomposition des fichiers > 350 lignes

Document de référence pour découper les fichiers trop volumineux du projet, en visant **< 350 lignes** par fichier (et **< 200 lignes** par composant Vue selon les règles du projet).

---

## 1. Principes directeurs

| Principe | Application |
|----------|-------------|
| **Une responsabilité par fichier** | Chaque module expose un rôle clair (ex. un composant = un bloc UI, un composable = un flux métier). |
| **Découpage par fonctionnalité, pas par “nombre de lignes”** | Séparer par zone métier ou par section logique (template / config / helpers). |
| **Éviter les dépendances circulaires** | Composables et utils en bas de la pyramide ; composants qui les consomment au-dessus. |
| **Garder la compatibilité externe** | Ne pas changer les props/emits/public API des composants déjà utilisés ; refactorer l’interna seulement. |
| **CSS : cohérence avec le découpage Vue** | Préférer un CSS par “zone” ou par composant quand le fichier devient trop gros. |

**Ordre recommandé** : d’abord les **composables / services** (peu ou pas de UI), puis les **composants Vue**, enfin le **CSS** (souvent le plus long et le plus risqué visuellement).

---

## 2. Vue d’ensemble des fichiers à traiter

### 2.1 Priorité 1 – Composables et services (logique pure)

Ces fichiers n’ont pas de template ; le découpage est par “responsabilité” ou par “flux”.

| Fichier | Lignes | Stratégie proposée |
|---------|--------|---------------------|
| `usePdfExport.ts` | ~701 | Séparer **types**, **API Puppeteer**, **API PDFKit**, **état/UI** |
| `useScreenshot.ts` | ~439 | Séparer **options/types**, **capture DOM**, **watermark/canvas** |
| `chartPresets.ts` | ~522 | Grouper les presets par **famille** (bar, line, pie, etc.) dans des sous-fichiers |
| `chartDataFormatter.ts` | ~469 | Extraire **formatters par type** (bar, line, pie) dans des modules dédiés |
| `useChartConfig.ts` | ~413 | Extraire **buildPrintScalesConfig** et **buildResponsiveOptions** dans des fonctions dans un fichier dédié |

### 2.2 Priorité 2 – Composants Vue

Découpage par **blocs visuels** ou **sous-composants** + extraction de logique dans des composables si nécessaire.

| Fichier | Lignes | Stratégie proposée |
|---------|--------|---------------------|
| `ChartComparePanel.vue` | 653 | Extraire panneau de comparaison, liste territoires, boutons d’action en sous-composants |
| `MobileMenu.vue` | 506 | Extraire sections du menu (liens, actions) + styles dans sous-composants ou mixins |
| `BottomNavigation.vue` | 470 | Extraire item de navigation + barre de progression en composants |
| `ChartComponent.vue` | 455 | Garder le noyau ; extraire config par type (bar/line/pie) dans un module ou un composable |
| `PrintThemePage.vue` | 457 | Extraire en-tête, bloc graphiques, bloc KPIs en composants Print dédiés |
| `ThemeBanner.vue` | 411 | Extraire bouton de thème + indicateur de scroll en sous-composants |
| `PrintThemeCoverPage.vue` | 400 | Extraire header, bannière, colonne sujets, colonne chiffres clés |
| `ChartExportButtons.vue` | 381 | Extraire menu d’options + un composant par type d’export (CSV, PNG, partage) |
| `CommunePrint.vue` | 529 | Extraire sections par thème / par page en composants réutilisables |
| `MentionsLegales.vue` | 434 | Découper par section (mentions, crédits, cookies, etc.) |
| `ShareView.vue` | 376 | Extraire formulaire de partage et bloc d’aperçu en sous-composants |

### 2.3 Priorité 3 – CSS

Découpage par **zone d’écran** ou **composant** ; garder un fichier “shell” qui importe les parties.

| Fichier | Lignes | Stratégie proposée |
|---------|--------|---------------------|
| `commune-detail.css` | ~909 | Découper en : layout principal, header/actions, KPIs, graphiques, états (loading/error), responsive |
| `main.css` | ~540 | Variables + base dans `main.css` ; thèmes / composants globaux dans des fichiers séparés |
| `modern-ui.css` | ~550 | Par type : boutons, cartes, formulaires, typo |
| `modern-dashboard-responsive.css` | ~399 | Garder tel quel ou fusionner avec un seul fichier “responsive” du dashboard |

### 2.4 Backend

| Fichier | Lignes | Stratégie proposée |
|---------|--------|---------------------|
| `PdfGenerator.ts` | 596 | Extraire : génération page de garde, génération page thème, génération graphiques, styles PDF |

---

## 3. Découpage détaillé par fichier

### 3.1 `usePdfExport.ts` (~701 lignes)

**Objectif** : rester sous 350 lignes par fichier, garder une API unique `usePdfExport()`.

- **Créer** `composables/pdf/types.ts`  
  - Déplacer : `TerritoryInfo`, `ThemeInfo`, `KeyFigure`, `ChartExportRef`, `NativePdfRequest`.
- **Créer** `composables/pdf/usePdfExportApi.ts`  
  - `getApiBase`, appels fetch (Puppeteer + PDFKit), construction des payloads.
- **Créer** `composables/pdf/usePdfExportCharts.ts`  
  - `exportChartHighQuality`, tout ce qui touche à Chart.js pour l’export.
- **Garder** `composables/usePdfExport.ts`  
  - Imports des modules ci-dessus, `ref` (isExporting, exportError, exportProgress), et les fonctions exposées (`exportThemeToPDF`, `exportAllThemesToPDF`, etc.) qui appellent l’API et les helpers chart.  
  - Ce fichier reste le point d’entrée unique pour les composants.

**Ordre** : types → usePdfExportCharts → usePdfExportApi → refactor de usePdfExport.

---

### 3.2 `useScreenshot.ts` (~439 lignes)

**Objectif** : un fichier principal < 350 lignes, helpers et options isolés.

- **Créer** `composables/screenshot/screenshotOptions.ts`  
  - Types / interfaces (ex. `ScreenshotOptions`) et constantes (qualité, ratio, etc.).
- **Créer** `composables/screenshot/screenshotDom.ts`  
  - `hideElements`, `restoreElements`, `prepareCanvasForCapture`, logique de capture DOM (toPng, toBlob, options).
- **Créer** `composables/screenshot/screenshotWatermark.ts`  
  - Tout ce qui concerne watermark, logo, texte (draw sur canvas, positionnement).
- **Garder** `composables/useScreenshot.ts`  
  - Import des 3 modules, `ref` (isCapturing, captureError, captureProgress), et une fonction principale `captureElement()` qui orchestre DOM + watermark.  
  - Exposer la même API qu’aujourd’hui.

**Ordre** : screenshotOptions → screenshotDom → screenshotWatermark → refactor useScreenshot.

---

### 3.3 `chartPresets.ts` (~522 lignes)

**Objectif** : un fichier “index” qui réexporte tout ; presets groupés par type.

- **Créer** `services/chart/presets/chartPresetsBar.ts`  
  - `chartClassicBar`, `chartClassicBarNoLegend`, `chartClassicBarPercent`, `chartClassicBarPercentNoLegend`, `chartHorizontal`.
- **Créer** `services/chart/presets/chartPresetsLine.ts`  
  - `chartLine`.
- **Créer** `services/chart/presets/chartPresetsPie.ts`  
  - `chartClassicDoughnut`, etc.
- **Créer** `services/chart/presets/chartPresetsStacked.ts`  
  - `chartStackedSum`, `chartPyramide`.
- **Créer** `services/chart/presets/index.ts`  
  - Réexporter tous les presets + `chartPresets` (objet map) + `getChartPreset`, `hasChartPreset`.
- **Modifier** `services/chart/chartPresets.ts`  
  - Ne garder qu’un re-export depuis `./presets` (ou supprimer et mettre à jour les imports dans le projet pour pointer vers `presets/index.ts`).

**Ordre** : créer les 4 fichiers de presets par type → index → mettre à jour les imports (chartPresets, useThemeCharts, etc.).

---

### 3.4 `chartDataFormatter.ts` (~469 lignes)

**Objectif** : formatters par type de graphique dans des modules dédiés.

- **Créer** `services/chart/format/chartFormatBar.ts`  
  - Logique de formatage des données pour barres (single, multi-séries, stacked).
- **Créer** `services/chart/format/chartFormatLine.ts`  
  - Formatage pour line.
- **Créer** `services/chart/format/chartFormatPie.ts`  
  - Formatage pour pie/doughnut.
- **Créer** `services/chart/format/index.ts`  
  - Réexporter les formatters et la fonction principale utilisée par le reste de l’app (ex. `formatChartData(type, ...)`).
- **Modifier** `chartDataFormatter.ts`  
  - Importer depuis `./format` et réexporter, ou déplacer la logique dans `format/index.ts` et renommer/simplifier `chartDataFormatter.ts`.

**Ordre** : bar → line → pie → index → mise à jour des appels dans ChartComponent / useThemeCharts.

---

### 3.5 `useChartConfig.ts` (~413 lignes)

**Objectif** : réduire la taille en extrayant la construction des options.

- **Créer** `services/chart/useChartConfigPrint.ts`  
  - `buildPrintScalesConfig`, `buildPrintModeOptions`, tout ce qui est spécifique “impression”.
- **Créer** `services/chart/useChartConfigResponsive.ts`  
  - `buildResponsiveOptions`, fusion des options mobile/desktop.
- **Modifier** `useChartConfig.ts`  
  - Importer ces deux modules et garder `useChartConfig()` + les types partagés.  
  - Vérifier que les tests ou les composants qui importent `useChartConfig` ne cassent pas.

**Ordre** : useChartConfigPrint → useChartConfigResponsive → refactor useChartConfig.

---

### 3.6 `ChartComparePanel.vue` (653 lignes)

**Objectif** : composant “orchestrateur” < 250 lignes ; sous-composants pour chaque bloc.

- **Créer** `components/Charts/ChartComparePanelHeader.vue`  
  - Titre, sous-titre, bouton fermer.
- **Créer** `components/Charts/ChartCompareTerritoryList.vue`  
  - Liste des territoires comparés (chips / tags) + suppression.
- **Créer** `components/Charts/ChartCompareActions.vue`  
  - Boutons (ex. “Ajouter une comparaison”, “Exporter”).
- **Modifier** `ChartComparePanel.vue`  
  - Template : header + liste + zone graphique + actions.  
  - Script : garder la logique de données (fetch, état) ; déléguer l’affichage aux sous-composants.

**Ordre** : Header → TerritoryList → Actions → refactor du panel.

---

### 3.7 `commune-detail.css` (~909 lignes)

**Objectif** : un fichier principal qui importe des “partials” par zone.

- **Créer** `assets/css/commune-detail/layout.css`  
  - `.commune-detail`, `.commune-main`, `.dashboard-layout`, `.section-divider`.
- **Créer** `assets/css/commune-detail/header-actions.css`  
  - `.btn-retour`, `.header-context-*`, `.header-action-buttons`.
- **Créer** `assets/css/commune-detail/theme-subthemes.css`  
  - `.theme-header-section`, `.subthemes-buttons-container`, `.subtheme-button`.
- **Créer** `assets/css/commune-detail/kpis.css`  
  - `.key-indicators-section`, `.kpi-section`, etc.
- **Créer** `assets/css/commune-detail/charts.css`  
  - `.charts-main-section`, `.charts-grid`, `.chart-card`, `.chart-card-header`, `.chart-card-footer`, etc.
- **Créer** `assets/css/commune-detail/states.css`  
  - `.loading-state`, `.error-state`, skeletons.
- **Créer** `assets/css/commune-detail/responsive.css`  
  - Tous les `@media` déjà présents dans commune-detail.css.
- **Modifier** `assets/css/commune-detail.css`  
  - Remplacer le contenu par des `@import` vers les fichiers ci-dessus (dans un ordre cohérent : layout → header → theme → kpis → charts → states → responsive).

**Ordre** : extraire un premier partial (ex. charts) → tester → continuer section par section.

---

### 3.8 `PrintThemeCoverPage.vue` (400 lignes)

**Objectif** : page de garde = assemblage de blocs.

- **Créer** `components/Print/PrintCoverHeader.vue`  
  - Bandeau “Portrait de territoire - Audiar” + texte droit.
- **Créer** `components/Print/PrintCoverBanner.vue`  
  - Grande bannière couleur + badge + titre thème.
- **Créer** `components/Print/PrintCoverTopicsList.vue`  
  - Colonne gauche : liste des sujets avec numéros de page.
- **Créer** `components/Print/PrintCoverKeyFigures.vue`  
  - Colonne droite : chiffres clés.
- **Modifier** `PrintThemeCoverPage.vue`  
  - Template : Header + Banner + sous-bannière + zone en 2 colonnes (TopicsList + KeyFigures).  
  - Styles : garder uniquement le layout de la page ; les styles de détail peuvent aller dans chaque sous-composant (scoped).

**Ordre** : Header → Banner → TopicsList → KeyFigures → refactor PrintThemeCoverPage.

---

### 3.9 Backend `PdfGenerator.ts` (596 lignes)

**Objectif** : un générateur qui délègue à des “builders” de sections.

- **Créer** `utils/pdfNative/builders/coverPageBuilder.ts`  
  - Génération de la page de garde (titres, territoire, thème).
- **Créer** `utils/pdfNative/builders/themePageBuilder.ts`  
  - Une page par thème : titre, graphiques, KPIs.
- **Créer** `utils/pdfNative/builders/chartImageBuilder.ts`  
  - Placement des images de graphiques (base64), légendes, source.
- **Créer** `utils/pdfNative/builders/styles.ts`  
  - Définition des polices, couleurs, marges réutilisées.
- **Modifier** `PdfGenerator.ts`  
  - Importer les builders et les appeler dans `generate()` ; garder la logique de flux (ordre des pages, options).  
  - Réduire la taille en déléguant le détail à chaque builder.

**Ordre** : styles → coverPageBuilder → chartImageBuilder → themePageBuilder → refactor PdfGenerator.

---

## 4. Ordre d’exécution recommandé (global)

1. **Composables / services (sans UI)**  
   - `usePdfExport.ts` → `useScreenshot.ts` → `chartPresets.ts` → `chartDataFormatter.ts` → `useChartConfig.ts`.  
   - Après chaque étape : build + tests manuels (export PDF, capture PNG, affichage des graphiques).

2. **Composants Vue “print”**  
   - `PrintThemeCoverPage.vue` puis `PrintThemePage.vue` et `CommunePrint.vue`.  
   - Tester l’impression / export PDF après chaque découpage.

3. **Composants Vue “commune / charts”**  
   - `ChartComparePanel.vue` → `ChartComponent.vue` → `ChartExportButtons.vue` → `ThemeBanner.vue`.  
   - Puis `BottomNavigation.vue`, `MobileMenu.vue`.

4. **Vues**  
   - `CommunePrint.vue`, `MentionsLegales.vue`, `ShareView.vue`.

5. **CSS**  
   - `commune-detail.css` en dernier (beaucoup de sélecteurs, risque de régression visuelle).  
   - Puis `main.css` et `modern-ui.css` si besoin.

6. **Backend**  
   - `PdfGenerator.ts` quand le front PDF est stable.

---

## 5. Règles pratiques pour chaque refactor

- **Avant** : vérifier les imports du fichier (qui l’utilise) et ne pas changer la signature publique (exports, props, emits).
- **Pendant** : un seul type de découpage à la fois (ex. uniquement extraire les types, ou uniquement un sous-composant).
- **Après** : build `yarn build` (ou équivalent), test manuel de la fonctionnalité concernée, pas de régression sur les autres pages.
- **Commits** : un commit par fichier ou par “lot logique” (ex. “refactor(usePdfExport): extract types and API layer”) avec message clair.

---

## 6. Fichiers laissés en l’état (pour l’instant)

- **docs/config/**  
  - Fichiers de référence (dashboard.js, chart_options.js, etc.) : pas de découpage fonctionnel nécessaire.
- **modern-dashboard-responsive.css**  
  - ~399 lignes : proche de la limite ; à traiter seulement si on fusionne ou réorganise tout le CSS dashboard.

Ce plan peut être suivi par étapes ; chaque section (ex. 3.1, 3.2) peut être traitée indépendamment en respectant l’ordre recommandé du § 4.
