# Portrait Communes

Application web pour **lire un territoire commune par commune** : carte, fiche, indicateurs et graphiques.

Elle s’adresse aux **agences d’urbanisme** (et observatoires qui travaillent comme elles). L’idée n’est pas un portail national, ni un export figé : chaque agence installe **sa** instance sur **son** territoire d’études, avec **ses** données.

Instance de référence : Pays de Rennes, maintenue par [Audiar](https://www.audiar.org). Licence [MIT](LICENSE).

## Dépôts

Portrait Communes n’est **pas** un dépôt unique. Trois dépôts, trois rôles :

| Dépôt | Rôle | Public |
|-------|------|--------|
| **[portrait-communes-kit](https://github.com/YanisAudiar/portrait-communes-kit)** | **Celui-ci.** Kit pour les agences : Docker, `site.ts`, contrat SQL. À forker pour un autre territoire. | Oui |
| [portrait-commune](https://github.com/YanisAudiar/portrait-commune) | Instance Audiar **en production** (serveur Perceval). Ne pas s’en servir comme base d’un fork agence. | Selon le compte |
| GitLab interne (`portrait-commune-v2`) | Développement et CI Audiar. Pas le dépôt à cloner pour une autre agence. | Non |

Un fork = une instance. Les PR vers le kit concernent le **code générique**, pas les données Rennes.

## Pourquoi cet outil

Les portraits de communes servent aux élus, aux services et aux partenaires : « que sait-on de cette commune, sur la population, l’habitat, l’emploi, l’école, l’agriculture ? »

Sans outil partagé, chaque agence reconstruit la même chose (PDF, tableur, carte à part). Portrait Communes factorise la **couche applicative** — navigation, carte, graphiques, fiches — et laisse à l’agence ce qui est vraiment local : le périmètre, la marque, et les vues statistiques.

Ce n’est **pas** :

- un dump des données Rennes à republier ailleurs
- une plateforme multi-agences (un fork = une instance)
- un entrepôt INSEE : l’app lit des **vues** déjà préparées, pas les tables brutes

## Ce que voit l’utilisateur

1. Une **carte** des communes du territoire (MapLibre).
2. Une **fiche** par commune, avec des **KPI** et des **graphiques** (Chart.js).
3. Six thèmes : démographie, économie, habitat, solidarité, formation, agriculture.

L’export PDF existe dans le code, pas dans l’interface pour l’instant.

## Comment c’est assemblé

Trois couches, volontairement séparées :

| Couche | Rôle | Où |
|--------|------|-----|
| Application | UI, API, graphiques | ce dépôt |
| Territoire et marque | nom, codes INSEE, mentions, logo | [`frontend/src/config/site.ts`](frontend/src/config/site.ts) |
| Données | vues PostgreSQL + géométries | [contrat SQL](docs/CONTRAT_DONNEES.md) + WFS **ou** GeoJSON |

Sans WFS ni GeoJSON, la carte **échoue** (erreur API). Sans vues SQL, fiches et graphiques restent vides. Une vue absente ne fait pas planter l’API.

## Démo en une commande

Aucun compte Audiar, aucun GeoServer. Trois communes fictives (Nordville, Sudville, Estville). Les chiffres sont inventés.

```bash
docker compose up --build
```

Ouvrir [http://localhost:8080](http://localhost:8080). Compose charge le SQL d’exemple, un GeoJSON local et `VITE_USE_SAMPLE_TERRITORY=true` — **ne pas modifier `site.ts`**.

Guide pas à pas : [`docs/INSTALL_AGENCE.md`](docs/INSTALL_AGENCE.md).

## Documentation

| Sujet | Fichier |
|-------|---------|
| Première installation | [`docs/INSTALL_AGENCE.md`](docs/INSTALL_AGENCE.md) |
| Contrat des vues SQL | [`docs/CONTRAT_DONNEES.md`](docs/CONTRAT_DONNEES.md) |
| Territoire et marque | [`frontend/src/config/site.ts`](frontend/src/config/site.ts) |
| Contribuer | [CONTRIBUTING.md](CONTRIBUTING.md) |

## Adapter à votre territoire

1. Éditer [`site.ts`](frontend/src/config/site.ts) : nom, codes INSEE, centre carte, mentions. Liste `communeCodes` vide = la couche geo est déjà filtrée.
2. Remplacer `frontend/src/assets/images/logo-Audiar.svg` (et `frontend/src/assets/icons/audiar-logo.svg`).
3. Recréer les vues selon le [contrat](docs/CONTRAT_DONNEES.md).
4. Pointer `GEOSERVER_URL` **ou** `COMMUNES_GEOJSON_PATH` (les `code_insee_concat` doivent matcher `site.ts`).
5. Rebuild front **sans** `VITE_USE_SAMPLE_TERRITORY`.

Minimum pour une carte « avec données » : la vue `v_demo_indicateurs_menages_par_com` + un WFS ou GeoJSON.

## Développement local

Prérequis : Node.js 22, PostgreSQL, **yarn** (pas npm). Docker n’a pas besoin de Node.

```bash
yarn install:all
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env
yarn dev
```

Frontend : souvent `http://localhost:5173`. API : port `PORT` du `.env` (ex. 5000).

| Objectif | Front | Back |
|----------|-------|------|
| Jeu d’essai | `VITE_USE_SAMPLE_TERRITORY=true` — ne pas éditer `site.ts` | SQL [`backend/sql/sample/`](backend/sql/sample/README.md) + `COMMUNES_GEOJSON_PATH` |
| Territoire réel | flag vide, éditer `site.ts` | vos vues + `GEOSERVER_URL` **ou** `COMMUNES_GEOJSON_PATH` |

Tuiles CARTO et Matomo sont optionnels (`frontend/env.example`). Absents : fond OpenStreetMap, pas de suivi.

Production : `yarn build`, puis PM2 (`ecosystem.config.js`). Copier la SPA dans `backend/dist/public` (voir `scripts/deploy.sh`). Variables : `backend/.env`, ou un `deployment-env.json` local (non versionné, modèle `deployment-env.example.json`).

## Stack

| Couche | Technologies |
|--------|----------------|
| Frontend | Vue 3, TypeScript, Vite, Pinia, MapLibre GL, Chart.js |
| Backend | Node.js 22, Express, TypeScript, PostgreSQL |

```
backend/    API, repositories, sql/sample, GeoJSON d’exemple
frontend/   SPA Vue 3
docs/       install, contrat, gouvernance
```

## Contribution

Les PR concernent le **code générique** (UI, API, contrat, Docker), pas les données d’un territoire. Voir [CONTRIBUTING.md](CONTRIBUTING.md), [gouvernance](docs/GOUVERNANCE.md) et [SECURITY.md](SECURITY.md).

CI GitHub : tests backend + sous-ensemble « kit » frontend. La suite frontend complète n’est pas encore un critère de merge (tests historiques à rattraper).

## Licence

MIT — voir [LICENSE](LICENSE). Un passage éventuel à l’EUPL est une décision juridique, pas un changement de code.

Développé par [Audiar](https://www.audiar.org), agence d’urbanisme de Rennes Métropole.
