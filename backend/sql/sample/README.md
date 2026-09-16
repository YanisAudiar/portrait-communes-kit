# Jeu d’essai Portrait Communes

Trois communes fictives (codes **99101**, **99102**, **99103**) pour faire tourner l’app **sans** les vues Baro/Portrait Audiar ni GeoServer.

Les chiffres sont inventés. Ne pas publier comme statistiques réelles.

## 1. PostgreSQL

```bash
createdb portrait_communes   # si besoin
psql -d portrait_communes -f backend/sql/sample/01_schema.sql
psql -d portrait_communes -f backend/sql/sample/02_seed.sql
```

Dans `backend/.env` :

```env
PGSCHEMA=portrait_sample
COMMUNES_GEOJSON_PATH=./data/sample-communes.geojson
# GEOSERVER_URL peut rester vide
```

## 2. Front — territoire d’exemple

**Ne pas modifier `site.ts`.** Le modèle fictif est déjà dans `site.sample.ts`.

Dans `frontend/.env` :

```env
VITE_USE_SAMPLE_TERRITORY=true
```

Docker Compose pose déjà cette variable. En prod Audiar, la laisser vide (défaut = Rennes Métropole).

Nordville (99101) a des données sur tous les thèmes. Sudville et Estville n’ont que les ménages (carte + fiche partielle).

## 3. Contrat

Colonnes et noms de vues : [`docs/CONTRAT_DONNEES.md`](../../../docs/CONTRAT_DONNEES.md).
