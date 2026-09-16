# 🚀 Installation de la fonctionnalité Export PDF

Guide d'installation rapide pour la fonctionnalité d'export PDF avec Puppeteer.

## ✅ Ce qui a été mis en place

### Backend
- ✅ `backend/controllers/pdfController.js` - Controller pour la génération PDF
- ✅ `backend/routes/pdf.js` - Routes API (/api/pdf/...)
- ✅ `backend/server.js` - Intégration de la route PDF
- ✅ `backend/package.json` - Ajout de puppeteer en dépendance

### Frontend
- ✅ `frontend/src/views/CommunePrint.vue` - Vue spéciale pour le rendu PDF
- ✅ `frontend/src/components/Commune/ExportPdfButton.vue` - Bouton d'export
- ✅ `frontend/src/composables/usePdfExport.js` - Hook pour gérer les exports
- ✅ `frontend/src/router/index.js` - Route `/commune/:codeInsee/print`
- ✅ `frontend/src/views/CommuneDetail.vue` - Intégration du bouton

## 📦 Installation

### Étape 1 : Installer les dépendances

```bash
cd backend
yarn install
yarn add puppeteer
```

Cela installera automatiquement Puppeteer (~200 MB avec Chromium).

### Étape 2 : Configuration de l'environnement

Dans votre fichier `backend/.env`, ajoutez ou vérifiez :

```env
# URL du frontend (important pour Puppeteer)
FRONTEND_URL=http://localhost:3000

# Autres configurations existantes...
PORT=5000
NODE_ENV=development
```

### Étape 3 : Démarrer les serveurs

**Terminal 1 - Frontend :**
```bash
cd frontend
yarn dev
```

**Terminal 2 - Backend :**
```bash
cd backend
yarn dev
```

### Étape 4 : Tester le service

Vérifiez que le service PDF fonctionne :

```bash
curl http://localhost:5000/api/pdf/health
```

**Réponse attendue :**
```json
{
  "status": "OK",
  "message": "Service PDF opérationnel",
  "puppeteerVersion": "21.6.0"
}
```

## 🎯 Utilisation

### Depuis l'interface

1. Naviguez vers une commune
2. Cliquez sur le bouton **"Exporter en PDF"** (en haut à droite)
3. Choisissez :
   - **Thématique actuelle** : PDF d'une seule thématique
   - **Toutes les thématiques** : PDF complet

### Via l'API

#### Export d'une thématique

```bash
# Exporter la démographie de Rennes (35238)
curl -o rennes-demo.pdf http://localhost:5000/api/pdf/commune/35238/demographie
```

#### Export complet

```bash
# Exporter toutes les thématiques de Rennes
curl -o rennes-complet.pdf "http://localhost:5000/api/pdf/commune/35238?allThemes=true"
```

## 🔍 Points d'attention

### Variable FRONTEND_URL

**TRÈS IMPORTANT** : La variable `FRONTEND_URL` dans le backend doit pointer vers l'URL où tourne votre frontend.

- En développement : `http://localhost:3000`
- En production : `https://votre-domaine.fr`

### Délais de génération

La génération d'un PDF prend environ **5-15 secondes** :
- Le temps de charger la page
- Le temps de rendre tous les graphiques
- Le temps de générer le PDF

### Ressources serveur

Puppeteer est gourmand en ressources :
- ~200 MB d'espace disque (Chromium)
- ~100-200 MB RAM par génération
- CPU pour le rendu

## 🐛 Dépannage

### Erreur : Cannot find module 'puppeteer'

```bash
cd backend
yarn add puppeteer
```

### Erreur : Service PDF indisponible

1. Vérifier que le backend est bien démarré
2. Vérifier les logs du serveur
3. Sur Linux, installer les dépendances :
   ```bash
   sudo apt-get update
   sudo apt-get install -y chromium-browser
   ```

### Erreur : Timeout lors de la génération

Augmentez les timeouts dans `backend/controllers/pdfController.js` :

```javascript
await page.goto(printUrl, {
  waitUntil: 'networkidle0',
  timeout: 60000  // 60 secondes au lieu de 30
})
```

### Graphiques non rendus

1. Vérifiez que la route `/commune/:code/print` est accessible
2. Ouvrez cette URL dans votre navigateur pour déboguer
3. Vérifiez les logs de la console frontend

## 📊 Routes API disponibles

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/pdf/commune/:code/:theme` | Exporter une thématique |
| GET | `/api/pdf/commune/:code?allThemes=true` | Exporter tout |
| POST | `/api/pdf/compare` | Comparatif (futur) |
| GET | `/api/pdf/health` | Statut du service |

## 🎨 Personnalisation

### Modifier la mise en page du PDF

Éditez `frontend/src/views/CommunePrint.vue` :
- Sections affichées
- Styles CSS
- Contenu du header/footer

### Modifier les options PDF

Éditez `backend/controllers/pdfController.js` :
- Format de page (A4, Letter, etc.)
- Marges
- Header/Footer personnalisés

## 🚀 Déploiement en production

### 1. Serveur Linux

Installez Chromium sur le serveur :

```bash
# Debian/Ubuntu
sudo apt-get install -y chromium-browser fonts-liberation libappindicator3-1

# CentOS/RHEL
sudo yum install -y chromium
```

### 2. Docker

Utilisez une image avec Chromium préinstallé :

```dockerfile
FROM node:18-alpine

# Installation de Chromium
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

EXPOSE 5000
CMD ["npm", "start"]
```

### 3. Variables d'environnement production

```env
NODE_ENV=production
FRONTEND_URL=https://votre-domaine.fr
PORT=5000
```

## 📝 Notes importantes

1. **Performance** : Chaque génération de PDF lance une instance Chromium
2. **Sécurité** : En production, ajoutez de l'authentification aux routes PDF
3. **Cache** : Considérez de mettre en cache les PDFs générés
4. **File d'attente** : Pour beaucoup de requêtes, utilisez une file (Bull, BeeQueue)

## 🔗 Fichiers de documentation

- `GUIDE_EXPORT_PDF.md` - Guide détaillé d'utilisation
- `INSTALLATION_PDF.md` - Ce fichier
- Voir aussi la documentation Puppeteer : https://pptr.dev/

---

**Prêt à générer des PDFs ! 🎉**

Si vous rencontrez des problèmes, consultez le guide complet dans `GUIDE_EXPORT_PDF.md`.

