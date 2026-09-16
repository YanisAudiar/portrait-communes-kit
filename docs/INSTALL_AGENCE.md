# Première installation (agence)

Guide pour faire tourner Portrait Communes **sans** l’infra Audiar : Docker + jeu d’essai, puis adaptation à votre territoire.

## Démo en 5 minutes

Prérequis : Docker et Docker Compose v2, ports **8080** (app) et **5432** (Postgres) libres.

```bash
docker compose up --build
```

Ouvrir [http://localhost:8080](http://localhost:8080). Trois communes fictives : Nordville, Sudville, Estville. Les chiffres sont inventés.

Arrêt : `docker compose down`. Les données Postgres restent dans le volume `postgres_data` ; `docker compose down -v` les efface.

## Ce que Compose lance

| Service | Rôle |
|---------|------|
| `postgres` | Base + schéma `portrait_sample` (SQL dans `backend/sql/sample/`) |
| `backend` | API Express, GeoJSON local (pas de GeoServer) |
| `frontend` | Nginx, SPA Vue, `VITE_USE_SAMPLE_TERRITORY=true` |

Mot de passe Postgres par défaut : `changeme`. À changer avant toute exposition réseau (`docker-compose.override.yml`).

## Brancher votre territoire

`site.sample.ts` n’est **pas** à copier : c’est le territoire fictif chargé uniquement si `VITE_USE_SAMPLE_TERRITORY=true`.

1. Éditer `frontend/src/config/site.ts` (défaut = instance Audiar, aire rennaise) : nom, codes INSEE, centre carte, mentions.
2. Remplacer `frontend/src/assets/images/logo-Audiar.svg`.
3. Recréer les vues SQL selon [`docs/CONTRAT_DONNEES.md`](CONTRAT_DONNEES.md), schéma `PGSCHEMA`.
4. Fournir un WFS (`GEOSERVER_URL`) **ou** un GeoJSON (`COMMUNES_GEOJSON_PATH`) dont les `code_insee_concat` correspondent à `site.ts`.
5. Rebuild front **sans** `VITE_USE_SAMPLE_TERRITORY` (variable absente ou ≠ `true`).

Détail des variables : `backend/env.example`, `frontend/env.example`.

## Développement sans Docker

Jeu d’essai (équivalent Compose, **sans éditer `site.ts`**) :

```bash
yarn install:all
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env
```

Dans `backend/.env` : `PGSCHEMA=portrait_sample`, `COMMUNES_GEOJSON_PATH=./data/sample-communes.geojson` (commenter `GEOSERVER_URL`).  
Dans `frontend/.env` : décommenter `VITE_USE_SAMPLE_TERRITORY=true`.  
Charger `backend/sql/sample/01_schema.sql` puis `02_seed.sql`, puis `yarn dev`.

Territoire réel : laisser `VITE_USE_SAMPLE_TERRITORY` vide, éditer `site.ts`, pointer Postgres + WFS ou GeoJSON.

Frontend : [http://localhost:5173](http://localhost:5173). Backend : `http://127.0.0.1:5000/api`.

## Production (PM2)

Préférer Docker si possible. Sinon : `yarn build`, copier `frontend/dist` vers `backend/dist/public`, puis `pm2 start ecosystem.config.js --env production` (script : `scripts/deploy.sh`).

Les secrets restent dans `backend/.env`. Un fichier `deployment-env.json` (non versionné) peut pointer vers d’autres `.env` ; modèle : `deployment-env.example.json`.
