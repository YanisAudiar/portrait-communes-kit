# Gestion des cookies et consentement Matomo

## Objectif

Documenter la gestion des cookies sur BaroTerritoire et fournir une **procédure reproductible** pour déployer le même mécanisme sur d'autres observatoires basés sur la même architecture (Express + Pug + Parcel + config par domaine).

Le principe retenu : **opt-in explicite** avant tout tracking Matomo, via l'API native de consentement Matomo (`requireConsent`), sans dépendance externe (pas de Tarteaucitron, pas de CMP tiers).

### Contexte Audiar — tracking déjà en place

Sur les BaroTerritoires en production, **le tracking Matomo est déjà actif** : chaque domaine possède un `matomoSiteId` dans `config/config-main-territories-prod.json` (sites 18 à 30). Avant l'ajout du consentement, Matomo trackait immédiatement via `trackPageView` dans `matomo.pug`.

**La mise en place du consentement ne nécessite donc pas de reconfigurer Matomo.** Il s'agit d'ajouter la couche opt-in par-dessus l'existant :

| Avant (tracking sans consentement) | Après (commit `b2aede9`) |
|------------------------------------|--------------------------|
| `trackPageView` au chargement | `requireConsent` bloque le tracking |
| Cookies `_pk_*` dès la 1re visite | Cookies `_pk_*` uniquement après « Accepter » |
| Pas de bannière | Bannière + lien « Gérer mes cookies » |

Les `matomoSiteId` existants restent inchangés. Seul le partial `matomo.pug` change de comportement.

---

## Vue d'ensemble : les cookies en jeu

| Cookie | Type | Déposé quand ? | Consentement requis ? |
|--------|------|----------------|------------------------|
| `connect.sid` | Session Express (auth, referer) | Dès la 1re visite si session créée | **Non** — strictement nécessaire |
| `mtm_consent` | Matomo — mémorise l'acceptation | Après clic « Accepter » | Oui (conséquence du consentement) |
| `mtm_consent_removed` | Matomo — mémorise le refus | Après clic « Refuser » | Non (preuve du choix, pas de tracking) |
| `_pk_id.*` | Matomo — identifiant visiteur pseudonymisé | Après acceptation | Oui |
| `_pk_ses.*` | Matomo — session de visite | Après acceptation | Oui |
| `baroterritoire_matomo_choice` | localStorage — mémorise acceptation ou refus | Après clic « Accepter » ou « Refuser » | Non (preuve du choix, pas de tracking) |

Les cookies Matomo **ne sont jamais déposés** tant que l'utilisateur n'a pas cliqué sur « Accepter ». Le choix est aussi mémorisé en **localStorage** (6 mois) pour garantir la persistance du refus, y compris en local et lorsque Matomo ne pose pas `mtm_consent_removed` au premier refus.

---

## Architecture du consentement

```
Chargement page
      │
      ▼
┌─────────────────────────────────────┐
│  matomo.pug (dans <head>)           │
│  • requireConsent → bloque tracking │
│  • setCookieDomain = hôte courant   │
│    (sauf localhost)                 │
│  • charge matomo.js                 │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│  cookie-consent.pug (dans <body>)   │
│  • bannière #consent-popup          │
│  • affichée si aucun choix enregistré │
│    (cookies Matomo ni localStorage)   │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│  CookieConsent.js (index.js)        │
│  • Accepter → rememberConsentGiven  │
│  • Refuser  → forgetConsentGiven    │
│  • Gérer    → efface localStorage   │
│    + révoque + réaffiche            │
└─────────────────────────────────────┘
```

### Flux utilisateur

1. **Première visite** — bannière visible, aucune requête de tracking Matomo, aucun cookie `_pk_*`.
2. **Accepter** — Matomo enregistre le consentement (`mtm_consent`), envoie `trackPageView`, dépose les cookies d'audience.
3. **Refuser** — choix enregistré en localStorage + `forgetConsentGiven`, bannière masquée, aucun tracking.
4. **Visites suivantes** — si choix en localStorage ou cookies Matomo, bannière masquée.
5. **Gérer mes cookies** (footer) — efface localStorage, révoque Matomo, réaffiche la bannière.

---

## Fichiers concernés (référence BaroTerritoire)

| Fichier | Rôle |
|---------|------|
| `src/client/views/partials/matomo.pug` | Script Matomo avec `requireConsent` |
| `src/client/views/partials/cookie-consent.pug` | HTML de la bannière |
| `src/client/js/modules/CookieConsent.js` | Logique acceptation / refus / révocation |
| `src/client/js/index.js` | Appel `initCookieConsent()` au chargement |
| `src/client/css/modules/_components.css` | Styles `#consent-popup` |
| `src/client/views/partials/footer.pug` | Lien « Gérer mes cookies » + include bannière |
| `src/client/views/mentions.pug` | Section légale cookies |
| `config/config-main-territories-{env}.json` | `matomoSiteId` par domaine (**déjà renseigné en prod**) |

### Pages sans footer (include manuel requis)

Les pages qui incluent Matomo mais **pas** le footer doivent aussi inclure la bannière :

- `src/client/views/login.pug`
- `src/client/views/error.pug`
- `src/client/views/api.pug`
- `src/client/views/pdf.pug`

Les pages avec footer (`index.pug`, `dashboard.pug`, `mentions.pug`, `news.pug`, `read-pdf.pug`) héritent de la bannière via `footer.pug`.

---

## Procédure reproductible

Deux cas selon la situation de l'observatoire :

---

### Cas A — Observatoire existant avec Matomo déjà configuré *(cas le plus fréquent)*

**Situation** : le `matomoSiteId` est déjà présent dans la config, le tracking fonctionne. On ajoute uniquement le consentement RGPD.

**À faire** (dans l'ordre) :

1. **Cherry-pick ou copier** les fichiers du commit `b2aede9` (voir liste ci-dessous).
2. **Modifier `matomo.pug`** : remplacer `trackPageView` par `requireConsent`.
3. **Vérifier les includes Pug** : bannière présente sur toutes les pages Matomo.
4. **Mettre à jour les mentions légales** (section cookies).
5. **`yarn build` + redémarrage PM2**.

**À ne pas faire** : modifier les `matomoSiteId`, recréer les sites Matomo, toucher à la config territoire.

> **Impact statistiques** : après déploiement, les visiteurs devront accepter à nouveau la bannière pour être comptés. Les cookies `_pk_*` déjà présents chez les visiteurs récurrents ne suffisent pas — Matomo exige le cookie `mtm_consent`. Un léger creux d'audience mesurée est normal les premiers jours.

#### Fichiers à déployer (cas A)

| Fichier | Action |
|---------|--------|
| `src/client/js/modules/CookieConsent.js` | Créer |
| `src/client/views/partials/cookie-consent.pug` | Créer |
| `src/client/views/partials/matomo.pug` | Modifier (`requireConsent`) |
| `src/client/js/index.js` | Ajouter `initCookieConsent()` |
| `src/client/css/modules/_components.css` | Ajouter styles `#consent-popup` |
| `src/client/views/partials/footer.pug` | Lien + include bannière |
| `src/client/views/mentions.pug` | Section cookies |
| `src/client/views/login.pug`, `error.pug`, `api.pug`, `pdf.pug` | Include bannière |

Commande rapide depuis un clone BaroTerritoire à jour :

```bash
git cherry-pick b2aede9
yarn build
pm2 restart baroterritoire
```

Pour un **autre dépôt observatoire** (même structure, branche distincte) : copier les mêmes fichiers ou cherry-pick si l'historique git est partagé.

---

### Cas B — Nouvel observatoire sans Matomo

**Situation** : premier déploiement, pas encore de `matomoSiteId`.

#### Prérequis

- Application de type BaroTerritoire (Express, Pug, Parcel, config par domaine).
- Compte Matomo hébergé (URL de **votre** instance, via variable d’environnement).

#### Étape B1 — Créer le site Matomo et configurer l'ID

1. Créer un site dans **votre** instance Matomo.
2. Ajouter `matomoSiteId` dans `config/config-main-territories-{env}.json` :

```json
{
    "observatoire.example.org": {
        "name": "Nom de l'observatoire",
        "matomoSiteId": 31,
        "scot": { ... }
    }
}
```

> Sans `matomoSiteId`, ni Matomo ni la bannière ne s'activent (condition `if mainTerritory && mainTerritory.matomoSiteId`).

3. Redémarrer le serveur (config chargée au démarrage).

#### Étape B2 — Déployer la couche consentement

Suivre intégralement le **cas A** (même fichiers). Ne jamais déployer Matomo avec `trackPageView` direct : toujours `requireConsent` dès le premier déploiement.

---

### Détail des étapes communes (cas A et B)

#### Étape 1 — Copier les fichiers cœur

Depuis BaroTerritoire (commit `b2aede9`) :

1. `src/client/js/modules/CookieConsent.js`
2. `src/client/views/partials/cookie-consent.pug`
3. `src/client/views/partials/matomo.pug` (vérifier l'URL Matomo et le CDN)
4. Les styles `#consent-popup` dans `_components.css`

#### Étape 2 — Brancher le JavaScript

Dans le point d'entrée client (`src/client/js/index.js`) :

```javascript
import { initCookieConsent } from './modules/CookieConsent.js';

// Dans le callback DOM ready, au plus tôt après le chargement :
initCookieConsent();
```

**Recommandation** : désactiver les cookies non essentiels des librairies tierces. Sur BaroTerritoire, le dark mode utilise `saveInCookies: false` (localStorage à la place).

#### Étape 3 — Inclure les partials Pug

**Dans le `<head>`** de chaque template de page (ou via un layout commun) :

```pug
include partials/matomo.pug
```

**Dans le `<body>`**, avant `script(src="dist/index.js")` :

- Via le footer (recommandé) :

```pug
// footer.pug — fin de fichier
include cookie-consent.pug
```

- Ou directement sur les pages sans footer :

```pug
include partials/cookie-consent.pug
script(src="dist/index.js")
```

**Lien de révocation** dans le footer :

```pug
if mainTerritory && mainTerritory.matomoSiteId
  li
    a.text-muted#manage-cookies(href='#') Gérer mes cookies
```

#### Étape 4 — Mettre à jour les mentions légales

Adapter la section « Cookies – suivi d'audience » (`mentions.pug`) :

- Nom de l'outil (Matomo).
- Hébergeur (votre instance Matomo, pas une URL tierce d’une autre agence).
- Liste des cookies (`mtm_consent`, `_pk_id.*`, `_pk_ses.*`) et durées.
- Mention du cookie de session (`connect.sid`) comme strictement nécessaire.
- Lien vers la bannière et « Gérer mes cookies ».

#### Étape 5 — Build et déploiement

```bash
yarn build          # recompile le bundle incluant CookieConsent.js
pm2 restart <app>   # redémarre le serveur (templates Pug + config)
```

---

## Contenu de référence des fichiers clés

### matomo.pug

```pug
if mainTerritory && mainTerritory.matomoSiteId
  script.
    var _paq = window._paq = window._paq || [];
    _paq.push(['requireConsent']);
    _paq.push(['enableLinkTracking']);
    (function() {
      var u="https://matomo.example.org/";
      _paq.push(['setTrackerUrl', u+'matomo.php']);
      _paq.push(['setSiteId', '!{mainTerritory.matomoSiteId}']);
      var host = window.location.hostname;
      if (host !== 'localhost' && host !== '127.0.0.1') {
        _paq.push(['setCookieDomain', host]);
      }
      var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
      g.async=true; g.src='https://cdn.matomo.cloud/matomo.example.org/matomo.js'; s.parentNode.insertBefore(g,s);
    })();
```

Points importants :

- **`requireConsent`** doit être appelé **avant** le chargement de `matomo.js`.
- **`setCookieDomain`** : utiliser `window.location.hostname` en prod (jamais un domaine wildcard d'un autre observatoire). Ne pas appeler sur `localhost`.
- **Ne pas** appeler `trackPageView` ici — uniquement après acceptation (dans `CookieConsent.js`).

### CookieConsent.js — API Matomo + localStorage

| Action utilisateur | Effet |
|--------------------|-------|
| Accepter | `localStorage` → `accepted` + `rememberConsentGiven` (6 mois) + `trackPageView` |
| Refuser | `localStorage` → `refused` + `forgetConsentGiven` |
| Gérer mes cookies | efface `localStorage` + `forgetConsentGiven` + réaffiche la bannière |

Clé localStorage : `baroterritoire_matomo_choice` (`{ choice, expiresAt }`, TTL 6 mois).

Détection d'un choix : `localStorage` **ou** cookies `mtm_consent` / `mtm_consent_removed`. Le localStorage compense le cas où Matomo ne pose pas `mtm_consent_removed` au premier refus (comportement documenté avec `requireConsent`).

---

## Checklist de mise en place

### Cas A — Matomo déjà actif (BaroTerritoires Audiar en prod)

- [ ] `matomoSiteId` déjà présent en config → **rien à modifier**
- [ ] `matomo.pug` : `requireConsent` à la place de `trackPageView`
- [ ] `cookie-consent.pug` + `CookieConsent.js` déployés
- [ ] `initCookieConsent()` appelé dans `index.js`
- [ ] Styles `#consent-popup` en place
- [ ] Lien « Gérer mes cookies » dans le footer
- [ ] Section cookies des mentions légales à jour
- [ ] Includes bannière sur login / error / api / pdf
- [ ] `yarn build` + redémarrage serveur
- [ ] Tests manuels (navigation privée)

### Cas B — Nouvel observatoire

- [ ] Site Matomo créé, `matomoSiteId` ajouté dans la config
- [ ] Tous les points du cas A

---

## Tests de validation

### Test 1 — Opt-in (navigation privée)

1. Ouvrir l'observatoire en navigation privée.
2. Vérifier que la bannière s'affiche en bas de page.
3. Ouvrir DevTools → Application → Cookies.
4. **Avant acceptation** : aucun `_pk_id`, aucun `_pk_ses`, aucun `mtm_consent`.
5. Cliquer « Accepter ».
6. **Après acceptation** : `mtm_consent` et cookies `_pk_*` présents.
7. Vérifier dans Matomo que la visite apparaît (délai ~5 min).

### Test 2 — Refus

1. Navigation privée → cliquer « Refuser ».
2. Cookie `mtm_consent_removed` **ou** clé `baroterritoire_matomo_choice` avec `"choice":"refused"`, aucun `_pk_*`.
3. Naviguer vers une autre page → **bannière masquée** (refus mémorisé).
4. Cliquer « Gérer mes cookies » → bannière réaffichée, clé localStorage supprimée.

### Test 3 — Révocation

1. Après acceptation, cliquer « Gérer mes cookies » dans le footer.
2. Bannière réaffichée, cookie `mtm_consent` supprimé.
3. Cookies `_pk_*` ne doivent plus être renouvelés.

### Test 4 — Pages sans footer

Vérifier login, error, api, pdf : bannière fonctionnelle, boutons opérationnels.

### Test 5 — Observatoire sans Matomo

Retirer ou ne pas définir `matomoSiteId` → ni script Matomo, ni bannière, ni lien footer.

---

## Adaptation à d'autres stacks proches

Si l'observatoire partage la structure BaroTerritoire mais diffère légèrement :

| Variante | Adaptation |
|----------|------------|
| URL Matomo différente | Modifier `setTrackerUrl` et `g.src` dans `matomo.pug` |
| Config territoire sans `mainTerritory` | Remplacer la condition par votre objet config (ex. `appConfig.matomoSiteId`) |
| Point d'entrée JS différent de `index.js` | Appeler `initCookieConsent()` dans le bundle chargé sur toutes les pages |
| Pas de page `/mentions` | Adapter le lien « En savoir plus » dans `cookie-consent.pug` |
| Layout Pug centralisé | Inclure `matomo.pug` et `cookie-consent.pug` une seule fois dans le layout |

---

## Cookie de session (côté serveur)

Le cookie `connect.sid` est géré par Express Session dans `src/server/app.js` :

```javascript
app.use(session({
    secret: process.env.SESSION,
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: 'lax',
        httpOnly: true,
        secure: isProduction,
        maxAge: 24 * 60 * 60 * 1000
    }
}));
```

Ce cookie **ne relève pas du consentement analytics** : il est nécessaire à l'authentification et au contrôle d'accès par referer. Le mentionner dans les mentions légales suffit.

---

## Dépannage

| Symptôme | Cause probable | Solution |
|----------|----------------|----------|
| Bannière ne s'affiche jamais | `matomoSiteId` absent ou `_paq` non défini | Vérifier config + `matomo.pug` dans le `<head>` |
| Bannière visible mais boutons inactifs | `initCookieConsent()` non appelé ou `#consent-popup` absent | Vérifier `index.js` et include Pug |
| Tracking sans consentement | `trackPageView` appelé avant acceptation | Retirer `trackPageView` de `matomo.pug` |
| Matomo tracke malgré refus | `requireConsent` manquant | Ajouter `_paq.push(['requireConsent'])` en premier |
| Bannière absente sur login/error | Include `cookie-consent.pug` manquant | Ajouter l'include sur ces pages |
| Bannière réapparaît après refus | `setCookieDomain` incorrect ou pas de localStorage | `setCookieDomain` = hôte courant ; vérifier `baroterritoire_matomo_choice` |
| Cookies Matomo absents en local | Domaine cookie ≠ hôte actuel | Ne pas fixer un domaine prod en dur ; laisser localhost sans `setCookieDomain` |

---

## Alternative non retenue : `requireCookieConsent`

Matomo propose aussi `requireCookieConsent` : les requêtes de tracking partent sans cookies, les cookies ne sont déposés qu'après consentement cookie.

BaroTerritoire utilise **`requireConsent`** (blocage total du tracking) car c'est l'approche la plus conforme à la recommandation CNIL en opt-in strict.

---

## Références

- [Matomo — Tracking & Cookie Consent](https://developer.matomo.org/guides/tracking-consent)
- [Matomo — GDPR compliance FAQ](https://matomo.org/faq/new-to-piwik/how-do-i-make-matomo-gdpr-compliant/)
- Commit de référence BaroTerritoire : `b2aede9`

---

*Document rédigé en mai 2026 — Audiar*
