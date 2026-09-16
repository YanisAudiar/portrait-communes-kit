# Audit de sécurité — Portrait Communes V2

**Date** : 2026-09-07 · **Périmètre** : `backend/`, `frontend/`, configuration de déploiement (`ecosystem.config.js`, `scripts/deploy.sh`, `.gitlab-ci.yml`), dépendances.

**Contexte** : application publique de données ouvertes, sans authentification ni données personnelles. Les risques dominants sont donc la **disponibilité** (DoS), la **fuite d'information technique** et la **compromission de la liaison base de données**.

---

## Synthèse

| # | Sévérité | Sujet | État |
|---|----------|-------|------|
| 1 | Élevée | `axios@1.11.0` : SSRF, pollution de prototype, DoS (30+ avis) | ✅ Corrigé |
| 2 | Élevée | `express-rate-limit@8.2.1` + `ip-address@10.0.1` : contournement du rate limiting | ✅ Corrigé |
| 3 | Élevée | Certificat TLS PostgreSQL non vérifié (`PGSSL_REJECT_UNAUTHORIZED=false`) | ⏸️ Écarté sur décision |
| 4 | Élevée | Génération PDF Puppeteer : concurrence non bornée, pas d'authentification | ✅ Fermé (routes désactivées) |
| 5 | Faible | Sécurité en *fail-open* sur `NODE_ENV` (CORS + détails d'erreur) | ⬜ Ouvert (latent, voir note) |
| 6 | Moyenne | Cache mémoire non borné, clés dérivées d'entrées utilisateur | ✅ Corrigé |
| 7 | Moyenne | CSP affaiblie (`unsafe-inline`, `unsafe-eval`) et servie uniquement en `<meta>` | ✅ Corrigé |
| 8 | Moyenne | Endpoints publics `/api/pdf/generate` et `/api/pdf/preview` inutilisés et inopérants | ✅ Fermé (routes désactivées) |
| 9 | Faible | Clé API CARTO commitée ; fichiers non suivis mais non ignorés | ✅ Corrigé |
| 10 | Faible | Divulgation d'infrastructure via `/api/geo/health` | ✅ Corrigé |
| 11 | Faible | Logs : pas de rotation, écritures synchrones | ⬜ Ouvert |
| 12 | Faible | Chromium lancé avec `--no-sandbox` | ✅ Sans objet (Puppeteer non chargé) |
| 13 | Faible | Vulnérabilités de la chaîne de développement (non livrées) | ⬜ Ouvert |
| 14 | Faible | `xlsx@0.18.5` : vulnérable en lecture uniquement (usage écriture ici) | ⬜ Accepté |

---

## Corrections appliquées le 2026-09-07

### Dépendances (points 1 et 2)

```
axios              1.11.0 → 1.20.0
express-rate-limit  8.2.1 → 8.7.0
ip-address         10.0.1 → 10.7.0   (résolu par express-rate-limit)
form-data           4.0.4 → 4.0.6    (CRLF, transitif axios)
follow-redirects   1.15.11 → 1.16.0  (fuite d'en-têtes d'authentification)
```

Vérifié : `yarn audit` ne remonte plus aucun avis sur `axios`, `express-rate-limit`, `form-data` ni `follow-redirects`. `express-rate-limit@8.7.0` résout bien `ip-address@10.7.0`, donc le contournement de la limitation par IP est fermé.

**Reliquat sans impact** : une copie `ip-address@10.1.0` subsiste sous `puppeteer > @puppeteer/browsers > proxy-agent > socks-proxy-agent > socks`. Elle n'est atteignable qu'avec un proxy SOCKS configuré, et Puppeteer n'est plus chargé au démarrage (voir ci-dessous). Elle disparaîtra à la prochaine montée de `puppeteer`.

### Routes PDF désactivées (points 4, 8 et 12)

L'export PDF n'est pas exposé dans l'interface : `ENABLE_PDF_EXPORT = false` dans [`frontend/src/config/featureFlags.ts`](../frontend/src/config/featureFlags.ts), et le flag conditionne à la fois `ExportPdfButton.vue` et `ModernHeader.vue`. Les routes `/api/pdf/*` étaient donc de la surface d'attaque publique sans usage réel.

Le router n'est plus monté sauf opt-in explicite `ENABLE_PDF_ROUTES=true` :

- [`backend/utils/featureFlags.ts`](../backend/utils/featureFlags.ts) : nouveau `arePdfRoutesEnabled()`, testable, symétrique du flag frontend.
- [`backend/server.ts`](../backend/server.ts) : montage conditionnel, avec `require` **paresseux** pour que Puppeteer et PDFKit ne soient pas chargés du tout quand le flag est off. Le handler 404 de `/api` ne laisse plus passer `/pdf/*` dans ce cas.
- [`backend/env.example`](../backend/env.example) : variable documentée, avec la condition de réactivation.

Le code du sous-système PDF est conservé intact — seul son exposition réseau est coupée.

Vérifications au runtime :

| Contrôle | Résultat |
|---|---|
| `GET /api/pdf/health` | `404` JSON `Route API non trouvée` |
| `POST /api/pdf/generate` | `404` JSON `Route API non trouvée` |
| `GET /health` | `200` (non régressé) |
| Log de démarrage | `🔒 Routes /api/pdf désactivées (ENABLE_PDF_ROUTES absent ou ≠ true)` |
| Modules `puppeteer` / `pdfkit` dans `require.cache` | `0` |

Effets de bord positifs : le point 12 (`--no-sandbox`) devient sans objet tant que le flag est off, et l'empreinte mémoire au démarrage baisse.

**Avant de réactiver** (`ENABLE_PDF_ROUTES=true`), il faut d'abord borner la concurrence Puppeteer — sinon le risque du point 4 revient tel quel. Le détail des correctifs attendus est en section 4.

### Tests

`backend/__tests__/security.spec.ts` passe de 10 à 14 tests. Les 4 ajouts verrouillent :

- routes PDF fermées si `ENABLE_PDF_ROUTES` est absent ;
- fermées pour toute valeur autre que la chaîne exacte `true` (`'false'`, `'1'`, `'TRUE'`, `''`) ;
- ouvertes seulement sur opt-in explicite ;
- **alignement backend/frontend** : le test lit `frontend/src/config/featureFlags.ts` et échoue si l'UI active l'export PDF alors que le backend reste fermé (ou l'inverse).

`npx tsc --noEmit` : aucune erreur. `yarn test:run` : 33 tests passés sur 3 fichiers.

### Cache borné et clés normalisées (point 6)

- [`backend/services/cache.ts`](../backend/services/cache.ts) : plafond d'entrées (`CACHE_MAX_ENTRIES`,
  défaut 500) avec **éviction LRU**. La lecture réinsère l'entrée pour marquer la récence *sans*
  repousser son expiration ; l'éviction purge d'abord les entrées expirées avant d'en évincer de
  valides, et comptabilise `evictions` dans les statistiques.
- [`backend/services/geoserver.ts`](../backend/services/geoserver.ts) : nouvelle méthode
  `buildCacheKey()` qui ne retient que les options influençant réellement la requête WFS
  (`codeInsee`, `maxFeatures`/`limit`, projection). `territoire`, `epci`, `bbox` et `precision` —
  champs libres que `buildWFSParams` n'utilise pas — n'entrent plus dans la clé, ce qui supprime
  le levier de saturation mémoire.
- [`backend/services/database.ts`](../backend/services/database.ts) : même normalisation pour
  `getIndicateursMenuages`, avec `codesInsee` trié pour que des variantes équivalentes partagent
  une seule entrée.

### CSP servie en en-tête, sans `unsafe-inline` ni `unsafe-eval` (point 7)

- [`backend/server.ts`](../backend/server.ts) : politique complète via helmet, en en-tête. Cela
  corrige deux défauts structurels de la version `<meta>` : `frame-ancestors` y était ignoré par
  les navigateurs, et la politique ne couvrait pas les réponses de l'API.
- `script-src` passe à `'self' https://cdn.matomo.cloud` — plus de `'unsafe-inline'` ni
  `'unsafe-eval'`, ce qui redonne à la CSP son intérêt contre le XSS. Vérifié au préalable :
  aucun `eval(` ni `new Function(` dans le bundle livré (Chart.js et MapLibre n'en ont pas besoin).
- Le bootstrap Matomo, jusque-là inline, est externalisé dans
  [`frontend/public/matomo-init.js`](../frontend/public/matomo-init.js) — script classique, donc
  exécuté avant le bundle applicatif différé, `window._paq` est prêt pour `main.ts`. C'est ce qui
  permet de retirer `'unsafe-inline'` sans hash à maintenir à chaque modification du snippet.
- `blob:` reste autorisé pour `worker-src` (workers MapLibre) mais **pas** pour `script-src` : un
  blob exécutable est un contournement connu de CSP.
- `style-src` conserve `'unsafe-inline'` : Vue injecte ses styles scopés à l'exécution, et sans
  nonce par requête on ne peut pas l'éviter sur des fichiers statiques. C'est le compromis usuel.
- `img-src` et `connect-src` passent de `https:` (tout hôte) aux hôtes réellement utilisés :
  tuiles CARTO, `tile.openstreetmap.org`, `demotiles.maplibre.org`, GeoServer Audiar, Matomo.
  `localhost:5000` est retiré. Vérifié par analyse du bundle : les seules ressources externes
  sont les tuiles CARTO, le reste des domaines trouvés étant des liens `<a>`, non soumis à la CSP.
- Échappatoire de déploiement : `CSP_REPORT_ONLY=true` passe la politique en signalement seul,
  pour une première validation en pré-prod sans rien casser.

### `/api/geo/health` réduit (point 10)

[`backend/routes/geo.ts`](../backend/routes/geo.ts) : la réponse publique se limite à
`{ status, timestamp }`. Le détail (URL GeoServer, namespace, nom de la vue interne
`v_geo_communes_rm_portrait_com`) n'est renvoyé qu'hors production ou avec un `x-debug-token`
valide, en réutilisant le mécanisme déjà en place pour les routes de debug.

### Vérifications

Reproduction exacte du déploiement (`tsc` backend, `vite build` frontend, copie dans
`backend/dist/public`, `node dist/server.js` avec `NODE_ENV=production`) :

| Contrôle | Résultat |
|---|---|
| En-tête CSP sur `/` et `/health` | présent, `script-src 'self' https://cdn.matomo.cloud` |
| `'unsafe-inline'` / `'unsafe-eval'` dans `script-src` | absents |
| `frame-ancestors 'self'` | désormais réellement appliqué (en-tête) |
| Scripts inline dans le `index.html` construit | **0** |
| `GET /matomo-init.js` | `200`, `application/javascript`, 1346 o |
| `GET /assets/index-*.js` | `200`, `application/javascript`, 214 ko |
| `GET /assets/index-*.css` | `200`, `text/css` |
| `GET /api/geo/health` sans token | `{"status":"OK","timestamp":"…"}` seulement |
| `GET /api/geo/health` avec mauvais token | idem, réduit |

`npx tsc --noEmit` : aucune erreur. `yarn test:run` : **42 tests passés** (cache 16, geoserver 12,
sécurité 14), soit 9 ajouts — plafond jamais dépassé, éviction du moins récemment utilisé,
expiration non repoussée par la lecture, purge de l'expiré avant l'éviction du valide, et clé de
cache insensible aux champs libres mais toujours distincte par code INSEE, limite et projection.

**Reste à valider dans un navigateur** : je n'ai pas de navigateur ici, donc la CSP est vérifiée
au niveau de l'en-tête et du contenu servi, pas du rendu. Avant la prod, ouvrir la pré-prod et
vérifier la console : carte MapLibre (tuiles + workers), polices Google, et Matomo après
acceptation des cookies. En cas de doute, déployer une première fois avec `CSP_REPORT_ONLY=true`.

### Point 3 écarté

Le certificat TLS PostgreSQL non vérifié (`PGSSL_REJECT_UNAUTHORIZED=false`) est **écarté sur décision**, l'analyse en section 3 reste valable. Le correctif dépend d'un certificat valide ou de l'épinglage de l'autorité côté hébergeur de la base, hors périmètre applicatif.

---

## Ce qui est déjà solide

À noter avant les correctifs — la remédiation du commit `2aec943` a fermé les vecteurs les plus classiques :

- **Injection SQL** : toutes les requêtes des repositories sont paramétrées (`{ text, values }`), les noms de colonnes viennent d'une table statique (`config/vueColumnConventions.ts`), et `PGSCHEMA` est validé contre `^[a-zA-Z0-9_]+$` avec limite de 63 caractères ([database.ts:18-31](../backend/services/database.ts#L18-L31)).
- **SSRF Puppeteer** : `FRONTEND_URL` provient exclusivement des variables d'environnement, est parsée par `new URL()`, avec contrôle du protocole, refus des identifiants dans l'URL et liste blanche d'hôtes ([urlBuilder.ts:29-56](../backend/utils/pdf/urlBuilder.ts#L29-L56)). Aucune URL cliente acceptée.
- **Injection CQL GeoServer** : le code INSEE est revalidé juste avant interpolation dans `CQL_FILTER` ([geoserver.ts:118-121](../backend/services/geoserver.ts#L118-L121)).
- **XSS** : aucun `v-html`, aucun `innerHTML` dans le code applicatif ; les popups MapLibre sont construites avec `createElement` / `textContent` ([mapPopupDom.js](../frontend/src/utils/mapPopupDom.js)).
- **Route de debug** : double condition (`ENABLE_DEBUG_ROUTES=true` hors production **et** en-tête `x-debug-token` correspondant), désactivée si le token est absent ([geo.ts:12-19](../backend/routes/geo.ts#L12-L19)).
- **Secrets** : `.env` jamais suivi par git, aucun secret dans l'historique.
- **Tests de non-régression** : `backend/__tests__/security.spec.ts` et étape `security` dans la CI GitLab.

---

## 1. `axios@1.11.0` — SSRF, pollution de prototype, DoS (Élevée) — ✅ Corrigé

`yarn audit` remonte plus de 30 avis sur cette version, dont plusieurs classés HIGH :

- SSRF par contournement de `NO_PROXY` (normalisation d'hôte, alias IP, boucle locale `127.0.0.0/8`)
- MITM complet via *gadget* de pollution de prototype dans `config.proxy`
- Vol d'identifiants et détournement de réponse via *gadgets* dans la fusion de configuration
- Fuite de `Proxy-Authorization` sur redirection HTTP vers HTTPS
- ReDoS via injection de nom de cookie, DoS par absence de contrôle de taille de données
- CRLF dans `form-data` (dépendance transitive)

`axios` est utilisé côté serveur pour appeler GeoServer ([geoserver.ts](../backend/services/geoserver.ts)). Les scénarios de pollution de prototype supposent un point d'injection tiers, mais le DoS et les fuites d'en-têtes sur redirection sont directement atteignables.

**Correctif** : `cd backend && yarn upgrade axios@^1.18.0`

---

## 2. Contournement du rate limiting (Élevée) — ✅ Corrigé

Deux vulnérabilités qui se cumulent :

- **`express-rate-limit@8.2.1`** (HIGH) : les adresses IPv6 mappées IPv4 contournent la limitation par client sur un serveur double pile. Corrigé en `>= 8.2.2`.
- **`ip-address@10.0.1`** (HIGH, dépendance de la précédente) : `Address4` décode les octets à zéro initial en décimal alors que les résolveurs les lisent en octal, ce qui permet de franchir la frontière de confiance. Corrigé en `>= 10.3.1`.

C'est critique ici parce que le rate limiting est **le seul** garde-fou devant la génération PDF Puppeteer (point 4) : le contourner rend le DoS trivial.

**Correctif** :

```bash
cd backend && yarn upgrade express-rate-limit@^8.2.2
yarn why ip-address   # doit afficher >= 10.3.1
```

---

## 3. Certificat TLS PostgreSQL non vérifié (Élevée) — ⏸️ Écarté sur décision

`backend/.env` contient `PGSSL_REJECT_UNAUTHORIZED=false`, avec ce commentaire :

> « En déploiement : ajouter aussi dans les fichiers `.env` du serveur (préprod et prod). »

`ecosystem.config.js` propage bien cette variable dans les trois environnements PM2. La conséquence en production :

```ts
ssl: process.env.PGSSLMODE ? { rejectUnauthorized: sslRejectUnauthorized } : false
```

([database.ts:36-48](../backend/services/database.ts#L36-L48))

La connexion vers la base distante est **chiffrée mais non authentifiée** : un attaquant en position d'interception présente n'importe quel certificat, lit et modifie le trafic, et récupère `PGUSER` / `PGPASSWORD`.

**Correctif** : obtenir un certificat valide, ou épingler l'autorité de certification :

```ts
ssl: { ca: fs.readFileSync(process.env.PGSSL_CA_PATH), rejectUnauthorized: true }
```

Et retirer `PGSSL_REJECT_UNAUTHORIZED=false` des fichiers d'environnement serveur. À garder en local uniquement, jamais en pré-prod ni en prod.

---

## 4. Génération PDF Puppeteer : concurrence non bornée (Élevée) — ✅ Fermé par désactivation des routes

`GET /api/pdf/commune/:codeInsee/:themeId` lance **un Chromium complet par requête** ([browser.ts:13-18](../backend/utils/pdf/browser.ts#L13-L18)), sans authentification. Coût unitaire :

- 150 à 300 Mo de RAM
- au moins 10 s (dont `RENDER_DELAY_MS = 4000` et l'attente de `.print-ready`)
- jusqu'à **2 minutes** de timeout pour `?all=true` (`EXTENDED_TIMEOUTS.PAGE_LOAD = 120000`)
- `server.timeout` et `keepAliveTimeout` à 10 minutes

Le seul contrôle est `pdfLimiter` : 20 requêtes / 15 min **par IP**, contournable (point 2) et de toute façon multipliable par le nombre d'IP. Aucune limite de concurrence : rien n'empêche 30 Chromium simultanés. L'application tourne en `instances: 1` sous PM2, donc l'épuisement mémoire emporte aussi l'API de données.

**Correctifs**, par ordre d'efficacité :

1. **Sémaphore global de concurrence** : 1 à 2 navigateurs maximum, file d'attente courte, réponse `503` immédiate au-delà.
2. **Réutiliser une instance de navigateur** (un `browser` singleton, une `page` par requête) au lieu de `puppeteer.launch()` à chaque appel.
3. Ajouter un **limiteur global**, pas seulement par IP, sur `/api/pdf`.
4. Réduire `EXTENDED_TIMEOUTS.PAGE_LOAD` et `server.timeout` au strict nécessaire.

---

## 5. Sécurité en *fail-open* sur `NODE_ENV` (Faible — latent) — ⬜ Ouvert

Trois protections dépendent de `NODE_ENV === 'production'` et **s'ouvrent** si la variable est absente ou différente :

| Mécanisme | Comportement hors production |
|---|---|
| CORS ([corsConfig.ts:44-46](../backend/utils/corsConfig.ts#L44-L46)) | `return true` pour **n'importe quelle** origine, avec `credentials: true` |
| Réponses d'erreur ([common.ts:26-40](../backend/utils/common.ts#L26-L40), [server.ts](../backend/server.ts)) | Renvoie `error.message`, `details` et `err.stack`, donc erreurs SQL, noms de vues et de colonnes, chemins internes |
| `sanitizeClientPayload` ([common.ts:45-53](../backend/utils/common.ts#L45-L53)) | Conserve `_queryErrors` (noms de vues et colonnes en échec) |

Or le bloc `env` par défaut d'`ecosystem.config.js` déclare `NODE_ENV: 'development'`. Un `pm2 start ecosystem.config.js` sans `--env production` désactive donc silencieusement les trois en même temps. `scripts/deploy.sh` passe bien `--env`, mais toute intervention manuelle sur le serveur contourne ce garde-fou.

**Requalifié en sévérité faible (latent).** Vérification faite : `yarn deploy` exécute
`scripts/deploy.sh production` → `pm2 start ecosystem.config.js --env production` → bloc `env_production`
→ `NODE_ENV: 'production'`. `yarn deploy:dev` passe par `env_pre_prod`, qui met aussi
`NODE_ENV: 'production'`. Les deux voies scriptées activent donc bien les trois protections :
il n'y a **pas** d'exposition en production aujourd'hui. Le risque ne se matérialise que sur un
`pm2 start ecosystem.config.js` lancé à la main sans `--env`, qui retomberait sur le bloc `env`
par défaut (`NODE_ENV: 'development'`). C'est un défaut de robustesse, pas une fuite active.

**Correctif** : inverser la logique par défaut.

- CORS : toujours appliquer la liste blanche ; ne relâcher que sur une variable dédiée et explicite (`ALLOW_DEV_CORS=true`), jamais par déduction depuis `NODE_ENV`.
- Erreurs : verbosité silencieuse par défaut, activée par `VERBOSE_ERRORS=true`.

---

## 6. Cache mémoire non borné (Moyenne) — ✅ Corrigé

`CacheService` est une `Map` sans taille maximale ni éviction LRU ([cache.ts](../backend/services/cache.ts)) ; seule l'expiration à 5 minutes libère la mémoire.

Les clés GeoServer intègrent des entrées utilisateur libres :

```ts
const cacheKey = `geoserver_${layerId}_${layer.path}_${JSON.stringify(options)}`
```

([geoserver.ts:132](../backend/services/geoserver.ts#L132))

`options` provient de `validateGeoOptions` : `territoire` et `epci` sont des chaînes libres de 2 à 100 caractères, `bbox` quatre flottants arbitraires. Aggravant : `buildWFSParams` **n'utilise ni `territoire`, ni `epci`, ni `bbox`**. Chaque valeur distincte stocke donc une nouvelle copie du **même** GeoJSON des 43 communes pendant 5 minutes. Même schéma pour `db_indicateurs_menages_${JSON.stringify(options)}` ([database.ts:224](../backend/services/database.ts#L224)).

À raison de 100 requêtes / 15 min / IP, une poignée d'IP suffit à faire croître le tas sans limite.

**Correctif** : plafonner la taille du cache avec éviction LRU, et ne construire la clé qu'à partir des paramètres qui influencent réellement la réponse (`codeInsee`, `maxFeatures`).

---

## 7. CSP affaiblie et mal délivrée (Moyenne) — ✅ Corrigé

Dans [`frontend/index.html:7`](../frontend/index.html#L7) :

- `script-src 'self' 'unsafe-inline' 'unsafe-eval'` : ces deux directives annulent l'essentiel de la protection XSS qu'apporterait la CSP.
- `frame-ancestors 'self'` : **ignoré** dans une CSP délivrée par `<meta>`. La protection anti-clickjacking repose donc uniquement sur le `X-Frame-Options` par défaut de helmet.
- `img-src 'self' data: blob: https:` : autorise n'importe quel hôte HTTPS.
- `connect-src` liste encore `http://localhost:5000` et `http://127.0.0.1:5000` en production.
- Côté serveur, `helmet({ contentSecurityPolicy: false })` ([server.ts:59-62](../backend/server.ts#L59-L62)) : aucune CSP en en-tête, y compris sur les réponses API.

**Correctif** :

1. Servir la CSP en **en-tête** via helmet, avec une politique par environnement, et retirer la balise `<meta>`.
2. Supprimer `unsafe-eval` : ni Chart.js ni MapLibre GL n'en ont besoin en build de production.
3. Remplacer le bootstrap Matomo inline par un fichier externe ou un `nonce`, ce qui permet de retirer `unsafe-inline`.
4. Restreindre `img-src` aux hôtes de tuiles réellement utilisés, et retirer `localhost` de `connect-src` en production.

---

## 8. Endpoints PDF publics inutilisés et inopérants (Moyenne) — ✅ Fermé par désactivation des routes

`POST /api/pdf/generate` et `POST /api/pdf/preview` ([routes/pdf.ts:86-108](../backend/routes/pdf.ts#L86-L108)) sont exposés publiquement, mais :

- **Non utilisés** : `ExportPdfButton.vue` n'appelle que `exportThemeToPDF` / `exportAllThemesToPDF` (routes Puppeteer). Le composable `downloadPdf`, seul consommateur de `/pdf/generate`, n'est référencé par aucun composant.
- **Inopérants** : `express.json({ limit: '100kb' })` est global ([server.ts:68](../backend/server.ts#L68)), alors que le corps attendu contient plusieurs PNG de graphiques en base64 pleine qualité (`chartInstance.toBase64Image('image/png', 1.0)`), largement au-delà de 100 Ko, donc `413`.

Résultat : de la surface d'attaque non testée (rendu PDF non authentifié acceptant 50 graphiques et 100 chiffres clés), et une incitation à « corriger » le problème en relevant la limite de corps **globalement**, ce qui affaiblirait toute l'API.

**Correctif** : supprimer les deux routes. Si le PDF natif doit être conservé, poser un `express.json({ limit: '15mb' })` **au niveau de ces routes uniquement** et plafonner la taille de chaque image décodée.

---

## 9. Clé API CARTO et fichiers non ignorés (Faible) — ✅ Corrigé

La clé CARTO n'est plus dans le source : `VITE_CARTO_API_KEY` au build, fond OSM sinon.
`NOTE-CARTO-API-KEY.md` a été retiré ; `.cursor/` est ignoré. **À faire côté Audiar** :
rotater la clé CARTO (elle a été commitée) et la restreindre aux domaines de production.

---

## 10. Divulgation d'infrastructure via `/api/geo/health` (Faible) — ✅ Corrigé

`GET /api/geo/health` renvoie à tout visiteur `GEOSERVER_URL`, le namespace et le nom de la vue interne (`v_geo_communes_rm_portrait_com`) ([geoserver.ts:236-268](../backend/services/geoserver.ts#L236-L268)). Peu exploitable seul, mais c'est de la reconnaissance offerte. À réduire à `{ status }`, ou à protéger par le token de debug.

*Point positif* : `databaseService.testConnection()`, qui exposerait hôte, base et utilisateur, n'est **pas** routée.

---

## 11. Logs : pas de rotation, écritures synchrones (Faible)

`Logger.writeToFile` fait un `fs.appendFileSync` à chaque entrée, dans `logs/error.log`, `warn.log`, etc., sans plafond ni rotation ([logger.ts:87-100](../backend/services/logger.ts#L87-L100)) — et `enableFile` est forcé à `true` en production. Deux conséquences : saturation possible du disque (disponibilité) et blocage de la boucle d'événements à chaque log.

**Correctif** : activer `pm2-logrotate`, et passer aux écritures asynchrones (ou à `pino`).

---

## 12. Chromium lancé avec `--no-sandbox` (Faible) — ✅ Sans objet tant que les routes PDF sont fermées

`DEFAULT_BROWSER_ARGS` contient `--no-sandbox` et `--disable-setuid-sandbox` ([config.ts:11-16](../backend/utils/pdf/config.ts#L11-L16)). Le risque est faible aujourd'hui — l'URL chargée est contrainte par la liste blanche et la page rendue est votre propre frontend — mais cela retire la dernière couche de confinement si un bug du moteur de rendu devenait atteignable. Préférer une exécution sous utilisateur non privilégié avec le sandbox actif.

---

## 13. Chaîne de développement (Faible, non livré en production)

Non embarqué dans le bundle ni dans le runtime serveur, mais à corriger :

| Paquet | Version | Problème | Cible |
|---|---|---|---|
| `vitest` | 4.0.15 | **CRITIQUE** : lecture et exécution de fichier arbitraire quand l'UI Vitest écoute | `>= 4.1.0` |
| `vite` | 4.5.14 | Contournement de `server.fs.deny`, lecture de fichier arbitraire (serveur de dev) | `>= 5.4.21` |
| `esbuild` | `<= 0.24.2` | N'importe quel site peut interroger le serveur de dev | `>= 0.25.0` |
| `postcss`, `rollup`, `browserslist`, `nanoid` | — | Traversée de chemin, DoS | via montée de `vite` |
| `puppeteer` → `basic-ftp`, `extract-zip` | — | CRITIQUE / HIGH sur les chemins proxy et installation | montée de `puppeteer` |

En attendant : ne jamais exposer le serveur de développement Vite sur une interface réseau (`--host`), et ne pas lancer l'UI Vitest sur une machine partagée.

---

## 14. `xlsx@0.18.5` (Faible)

Deux avis HIGH : pollution de prototype (CVE-2023-30533) et ReDoS, tous deux dans le **chemin de lecture**. L'application n'utilise que l'écriture (`XLSX.utils.json_to_sheet`, `XLSX.writeFile` dans [useDataExport.ts](../frontend/src/composables/useDataExport.ts)), donc ce n'est pas exploitable en l'état. npm ne propose aucun correctif : SheetJS a quitté le registre npm à la 0.18.5.

**Décision** : conserver, en s'interdisant tout appel à `XLSX.read*`. Si de la lecture de fichier devait être ajoutée, migrer d'abord vers la distribution SheetJS officielle (`>= 0.20.2`) ou une bibliothèque d'écriture minimale.

---

## Plan d'action

**Fait le 2026-09-07** — points 1, 2, 4, 8 et 12 (voir « Corrections appliquées » plus haut).

**Écarté sur décision** — point 3 (TLS PostgreSQL).

**Reste à traiter, par ordre de priorité**

1. Rotation des logs (point 11) — `appendFileSync` sans plafond : saturation disque possible, et
   blocage de la boucle d'événements à chaque écriture.
2. Montée de la chaîne de développement (point 13) — `vitest >= 4.1.0` en premier (CRITIQUE, UI
   Vitest), puis `puppeteer` pour solder le reliquat `ip-address@10.1.0`.
3. Vérifier la restriction de domaine de la clé CARTO côté console CARTO (point 9), et ignorer ou
   ranger `NOTE-CARTO-API-KEY.md`, `.cursor/plans/`, `backend/sql/`, toujours non suivis et non
   ignorés.
4. Inverser le *fail-open* sur `NODE_ENV` (point 5) — requalifié en faible : les deux voies de
   déploiement scriptées passent bien `--env`, donc pas d'exposition actuelle. Reste un défaut de
   robustesse à corriger quand l'occasion se présente.

**Prérequis avant toute réactivation du PDF**

`ENABLE_PDF_ROUTES=true` ne doit être posé qu'avec, dans le même changement : sémaphore de concurrence (1 à 2 navigateurs), réutilisation d'une instance de navigateur, limiteur global en plus du limiteur par IP, et `express.json` de portée locale sur `/generate` et `/preview`. Le flag frontend `ENABLE_PDF_EXPORT` doit basculer en même temps — un test le vérifie.

**À conserver**

Les tests de `backend/__tests__/security.spec.ts` (14 tests) couvrent le CORS en production, la troncature des messages d'erreur, les limites du PDF comparatif et la fermeture des routes PDF. Ajouter un test par correctif restant, dans le même fichier, pour verrouiller les non-régressions.
