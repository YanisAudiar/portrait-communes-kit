# Contribuer

Portrait Communes est un outil d’agences d’urbanisme. Audiar maintient l’instance de référence (Pays de Rennes). Une autre agence **fork** et adapte `site.ts` + ses vues SQL — elle n’a pas besoin d’une PR pour déployer son territoire.

Les PR vers ce dépôt concernent le **code générique** (UI, API, contrat de données, Docker), pas les données Rennes.

## Démarrage

```bash
yarn install:all
docker compose up --build   # démo 3 communes fictives, http://localhost:8080
```

Guide : [`docs/INSTALL_AGENCE.md`](docs/INSTALL_AGENCE.md). Contrat SQL : [`docs/CONTRAT_DONNEES.md`](docs/CONTRAT_DONNEES.md). Gouvernance : [`docs/GOUVERNANCE.md`](docs/GOUVERNANCE.md).

## Branches et commits

- Branche depuis `main` : `feature/…`, `fix/…`, `docs/…`
- Préfixes : `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`
- Une PR = un sujet. Décrire l’impact (UI, API, vues SQL, Docker)

## Qualité

- `yarn` uniquement (pas npm)
- Composants Vue : `<script setup lang="ts">`, scoped, < 200 lignes
- Front : `cd frontend && yarn test:kit` doit rester vert (CI GitHub). `yarn test:run` contient encore des tests historiques qui échouent.
- Back : `cd backend && yarn test:run` puis `yarn build` (doit rester vert)

## Ajouter un thème ou un indicateur

1. Config front : `frontend/src/config/indicators/<theme>.ts`
2. Repository back : `backend/repositories/` + colonnes dans `backend/config/vueColumnConventions.ts`
3. KPI : `frontend/src/composables/kpis/`
4. Mettre à jour [`docs/CONTRAT_DONNEES.md`](docs/CONTRAT_DONNEES.md)
5. Si besoin, étendre `backend/sql/sample/` pour que Docker reste démonstratif

Ne pas coller des URLs, SIRET ou logos d’une agence dans le code générique : tout passe par `frontend/src/config/site.ts` (ou `site.sample.ts` pour la démo).

## Secrets

Pas de `.env`, clés API, mots de passe Postgres dans git. Voir [`SECURITY.md`](SECURITY.md).
