# Sécurité

L’application est publique (données ouvertes, pas d’authentification). Les risques principaux sont la disponibilité, la fuite d’information technique et l’exposition de secrets de déploiement.

## Signaler une faille

**Ne pas** ouvrir une issue GitHub publique pour une vulnérabilité exploitable.

Envoyer un message à [communication@audiar.org](mailto:communication@audiar.org) avec :

- description et impact
- version / commit
- étapes de reproduction **sans** payload d’attaque prêt à l’emploi

Réponse visée sous 10 jours ouvrés.

## Secrets

- Copier `backend/env.example` et `frontend/env.example` : ne jamais committer `.env`
- Pas de clé CARTO, URL GeoServer interne, mot de passe Postgres dans le dépôt
- Audit : [`docs/AUDIT_SECURITE.md`](docs/AUDIT_SECURITE.md)

## Surface actuelle

- Routes `/api/pdf/*` désactivées sauf `ENABLE_PDF_ROUTES=true`
- GeoServer : pas d’URL par défaut ; sinon `COMMUNES_GEOJSON_PATH`
- Matomo : opt-in, uniquement si `VITE_MATOMO_URL` + `VITE_MATOMO_SITE_ID`
