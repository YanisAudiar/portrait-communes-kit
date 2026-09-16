# 📄 Guide d'Export PDF - Portrait de Communes

Ce guide explique comment utiliser et configurer la fonctionnalité d'export PDF pour générer des rapports des données de communes par thématiques.

## 🎯 Fonctionnalités

### Export disponibles

1. **Export par thématique** : Génère un PDF pour une thématique spécifique d'une commune
2. **Export complet** : Génère un PDF avec toutes les thématiques d'une commune
3. **Export comparatif** (à venir) : Compare plusieurs communes sur une thématique

### Contenu des PDFs

Les PDFs générés contiennent :
- ✅ En-tête avec logo Audiar et informations de la commune
- ✅ Informations générales (population, superficie, densité, etc.)
- ✅ Graphiques organisés par thématiques et sous-thématiques
- ✅ Graphiques d'évolution temporelle (quand disponibles)
- ✅ Pied de page avec source et date de génération
- ❌ **Cartographie exclue** (comme souhaité)

## 🛠️ Installation

### 1. Backend - Installer Puppeteer

```bash
cd backend
npm install puppeteer
# ou
yarn add puppeteer
```

**Note** : Puppeteer téléchargera automatiquement une version de Chromium (~200 MB).

### 2. Configuration des variables d'environnement

Créez un fichier `.env` dans le dossier `backend` :

```env
# URL du frontend pour le rendu des graphiques
FRONTEND_URL=http://localhost:5173

# Autres configurations...
PORT=5000
NODE_ENV=development
```

### 3. Démarrer les serveurs

**Terminal 1 - Frontend :**
```bash
cd frontend
npm run dev
```

**Terminal 2 - Backend :**
```bash
cd backend
npm run dev
```

## 📖 Utilisation

### Depuis l'interface utilisateur

1. **Naviguer vers une commune** : Cliquez sur une commune dans la cartographie
2. **Sélectionner une thématique** : Parcourez les différentes thématiques dans la liste de gauche
3. **Cliquer sur "Exporter en PDF"** : Un menu s'ouvre avec deux options :
   - **Thématique actuelle** : Exporte uniquement la thématique sélectionnée
   - **Toutes les thématiques** : Exporte un rapport complet de la commune

### Via l'API (pour intégrations)

#### Export d'une thématique

```bash
GET /api/pdf/commune/:codeInsee/:themeId
```

**Exemple :**
```bash
curl -o rapport.pdf http://localhost:5000/api/pdf/commune/35238/demographie
```

#### Export complet

```bash
GET /api/pdf/commune/:codeInsee?allThemes=true
```

**Exemple :**
```bash
curl -o rapport-complet.pdf "http://localhost:5000/api/pdf/commune/35238?allThemes=true"
```

#### Vérifier le service

```bash
GET /api/pdf/health
```

**Réponse :**
```json
{
  "status": "OK",
  "message": "Service PDF opérationnel",
  "puppeteerVersion": "21.6.0"
}
```

## 🏗️ Architecture technique

### Structure des fichiers

```
backend/
├── controllers/
│   └── pdfController.js          # Logique de génération PDF (refactorisé)
├── utils/
│   └── pdfHelpers.js              # Utilitaires de nettoyage de page PDF
├── routes/
│   └── pdf.js                     # Routes API pour PDF
└── server.js                      # Intégration des routes

frontend/
├── src/
│   ├── views/
│   │   └── CommunePrint.vue       # Vue spéciale pour le rendu PDF
│   ├── components/
│   │   ├── Commune/
│   │   │   └── ExportPdfButton.vue # Composant bouton d'export
│   │   └── Print/
│   │       └── PrintThemePage.vue # Composant page thématique pour PDF
│   ├── config/
│   │   ├── printLayouts.js        # Configuration des layouts print
│   │   └── printPalettes.js       # Palettes de couleurs pour print
│   ├── composables/
│   │   ├── usePdfExport.js        # Hook pour gérer les exports
│   │   └── usePrintData.js         # Hook pour préparer les données print
│   └── router/
│       └── index.js                # Route /commune/:codeInsee/print
```

### Flux de génération

```
1. Utilisateur clique sur "Exporter PDF"
   ↓
2. Frontend appelle l'API backend /api/pdf/commune/:code/:theme
   ↓
3. Backend lance Puppeteer (navigateur headless)
   ↓
4. Puppeteer charge /commune/:code/print?theme=:theme
   ↓
5. Vue CommunePrint.vue charge et affiche les graphiques avec layouts print
   ↓
6. Une fois tous les graphiques rendus, la classe "print-ready" est ajoutée
   ↓
7. Puppeteer attend la classe "print-ready"
   ↓
8. Préparation de la page : nettoyage des éléments non nécessaires
   - Suppression des éléments darkmode
   - Suppression des éléments de navigation
   - Suppression des blocs vides
   - Suppression des footers de graphiques
   - Personnalisation des styles
   ↓
9. Puppeteer génère le PDF avec les options optimisées
   ↓
10. Backend retourne le PDF au frontend
   ↓
11. Téléchargement automatique dans le navigateur
```

### Architecture modulaire du contrôleur PDF

Le contrôleur PDF a été refactorisé selon les principes SOLID et DRY :

**Fonctions utilitaires** (`backend/utils/pdfHelpers.js`) :
- `removeDarkmodeElements()` - Supprime les éléments darkmode
- `removeNavigationElements()` - Supprime les éléments de navigation
- `removeEmptyElements()` - Supprime les blocs/colonnes/lignes vides
- `removeChartFooters()` - Supprime les footers de graphiques
- `customizeStyle()` - Personnalise les styles pour le PDF
- `preparePageForPdf()` - Fonction principale qui applique tous les nettoyages

**Fonctions du contrôleur** (`backend/controllers/pdfController.js`) :
- `launchBrowser()` - Lance une instance Puppeteer optimisée
- `configurePageForPdf()` - Configure le viewport pour le PDF
- `loadPageAndWait()` - Charge la page et attend le rendu complet
- `generatePdfFromPage()` - Génère le PDF à partir de la page
- `sendPdfResponse()` - Envoie le PDF avec les en-têtes HTTP appropriés
- `handlePdfError()` - Gère les erreurs de manière centralisée

## ⚙️ Configuration avancée

### Options Puppeteer

Dans `backend/controllers/pdfController.js`, vous pouvez ajuster les constantes de configuration :

```javascript
// Configuration du viewport (haute résolution pour les graphiques)
const PDF_VIEWPORT = {
  width: 1200,
  height: 1600,
  deviceScaleFactor: 2
}

// Configuration des marges PDF
const PDF_MARGINS = {
  top: '1cm',
  right: '1cm',
  bottom: '1cm',
  left: '1cm'
}

// Délai d'attente après le chargement (en millisecondes)
const RENDER_DELAY_MS = 2000

// Timeouts (en millisecondes)
const PAGE_LOAD_TIMEOUT = 30000
const READY_SELECTOR_TIMEOUT = 25000
```

### Personnalisation du nettoyage de page

Pour personnaliser les éléments supprimés avant la génération PDF, modifiez `backend/utils/pdfHelpers.js` :

```javascript
// Ajouter une nouvelle fonction de nettoyage
const removeCustomElements = async (page) => {
  await page.evaluate(() => {
    const customElements = document.querySelectorAll('.ma-classe-custom')
    customElements.forEach((el) => el.remove())
  })
}

// L'intégrer dans preparePageForPdf()
const preparePageForPdf = async (page) => {
  await removeDarkmodeElements(page)
  await removeNavigationElements(page)
  await removeKeyNumberBlocks(page)
  await removeEmptyElements(page)
  await removeChartFooters(page)
  await removeCustomElements(page) // Nouvelle fonction
  await customizeStyle(page)
}
```

### Personnalisation des PDFs

**Frontend** (`frontend/src/views/CommunePrint.vue`) :
- Changer la mise en page des pages thématiques
- Modifier les styles d'impression (CSS `@media print`)
- Ajuster les dimensions des graphiques (`PRINT_CHART_WIDTH`, `PRINT_CHART_HEIGHT`)

**Layouts print** (`frontend/src/config/printLayouts.js`) :
- Définir la structure éditoriale de chaque thématique
- Configurer les badges, titres, résumés et groupes de graphiques
- Personnaliser les couleurs et palettes (`frontend/src/config/printPalettes.js`)

### Timeout et délais

Si les graphiques mettent du temps à charger, ajustez les constantes dans `pdfController.js` :

```javascript
// Augmenter le délai de rendu
const RENDER_DELAY_MS = 4000  // 4 secondes au lieu de 2

// Augmenter les timeouts
const PAGE_LOAD_TIMEOUT = 60000  // 60 secondes
const READY_SELECTOR_TIMEOUT = 45000  // 45 secondes
```

## 🚀 Optimisations

### Performance

1. **Réutiliser l'instance Puppeteer** (pour production) :
   ```javascript
   // Créer une instance persistante
   const browser = await puppeteer.launch({ ... })
   // Réutiliser pour chaque requête
   ```

2. **Mise en cache des PDFs** :
   - Stocker les PDFs générés
   - Servir depuis le cache si données inchangées

3. **File d'attente** :
   - Utiliser Bull ou BeeQueue pour gérer les requêtes
   - Éviter la surcharge du serveur

### Production

Pour un déploiement en production :

```javascript
// backend/controllers/pdfController.js
const browser = await puppeteer.launch({
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--disable-extensions'
  ],
  // Sur certains serveurs (Docker, etc.)
  executablePath: '/usr/bin/chromium-browser'
})
```

## 🐛 Dépannage

### Problème : "Service PDF indisponible"

**Solution :**
1. Vérifier que Puppeteer est bien installé : `npm list puppeteer`
2. Vérifier les permissions d'exécution de Chromium
3. Sur Linux, installer les dépendances :
   ```bash
   sudo apt-get install -y chromium-browser
   ```

### Problème : "Graphiques non rendus"

**Solution :**
1. Augmenter le timeout dans `pdfController.js`
2. Vérifier que la route `/commune/:code/print` est accessible
3. Vérifier les logs dans la console du frontend

### Problème : "PDF vide ou incomplet"

**Solution :**
1. Vérifier que tous les graphiques sont bien rendus dans `CommunePrint.vue`
2. S'assurer que la classe `.print-ready` est bien ajoutée après le chargement complet
3. Augmenter `RENDER_DELAY_MS` dans `pdfController.js` pour laisser plus de temps au rendu
4. Vérifier les logs du backend pour voir si `preparePageForPdf()` s'exécute correctement
5. Tester la vue print directement dans le navigateur : `http://localhost:3000/commune/35238/print?theme=demographie`

### Problème : "Timeout lors de la génération"

**Solution :**
1. Réduire le nombre de graphiques par page
2. Augmenter les timeouts Puppeteer
3. Optimiser le chargement des données côté frontend

## 📚 Ressources

- [Documentation Puppeteer](https://pptr.dev/)
- [Options PDF](https://pptr.dev/#?product=Puppeteer&version=v21.6.0&show=api-pagepdfoptions)
- [Headless Chrome](https://developers.google.com/web/updates/2017/04/headless-chrome)

## 🔄 Évolutions futures

- [ ] Export comparatif multi-communes
- [ ] Choix du format (PDF, PNG, XLSX)
- [ ] Sélection personnalisée des graphiques
- [ ] Envoi par email
- [ ] Génération en arrière-plan avec notification
- [ ] Templates de rapports personnalisables
- [ ] Export avec commentaires/annotations

## 📝 Notes

- Les PDFs sont générés en temps réel (pas de cache par défaut)
- La génération prend environ 5-15 secondes selon la complexité
- Les graphiques Chart.js sont capturés comme images vectorielles avec haute résolution (deviceScaleFactor: 2)
- La cartographie est volontairement exclue des exports
- Les éléments d'interface (darkmode, navigation, footers) sont automatiquement supprimés avant génération
- Les layouts print utilisent des palettes de couleurs optimisées pour l'impression
- Les graphiques incluent des datalabels pour améliorer la lisibilité dans le PDF

---

**Contact** : Pour toute question, contactez l'équipe Audiar

