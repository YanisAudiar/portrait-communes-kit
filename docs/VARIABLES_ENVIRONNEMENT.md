# Variables d'Environnement

## Configuration Requise

Ce document liste les variables d'environnement utilisées dans le projet.

## Variables Disponibles

### `VITE_API_BASE_URL`
- **Description** : URL de base de l'API backend
- **Développement** : `http://localhost:5000/api`
- **Production** : `/api` (URL relative)
- **Fichier** : `frontend/src/services/api.js`

### `VITE_BASE_URL`
- **Description** : Base URL de l'application (utilisé par Vue Router)
- **Défaut** : `/`
- **Fichier** : `frontend/src/router/index.js`

### Variables d'Environnement Vite

Vite expose automatiquement les variables préfixées par `VITE_` :
- `import.meta.env.VITE_API_BASE_URL`
- `import.meta.env.PROD` (boolean)
- `import.meta.env.DEV` (boolean)
- `import.meta.env.BASE_URL` (string)

## Configuration

### Développement
Créer un fichier `.env` à la racine du dossier `frontend/` :

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_BASE_URL=/
```

### Production
Les variables sont généralement définies dans le système de déploiement ou dans un fichier `.env.production`.

## Utilisation dans le Code

```javascript
// Dans services/api.js
const getApiBase = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  
  if (import.meta.env.PROD) {
    return '/api'
  }
  
  return 'http://localhost:5000/api'
}
```

## Notes

- Les variables doivent être préfixées par `VITE_` pour être accessibles dans le code client
- Les variables sont remplacées au moment du build
- Ne jamais commiter les fichiers `.env` contenant des secrets

