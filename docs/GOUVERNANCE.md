# Gouvernance

Décisions ouvertes pour le partage aux agences. Rien ici ne transfère le dépôt tout seul : créer l’organisation GitHub et changer de licence sont des actes humains.

## Qui maintient

| Rôle | Aujourd’hui |
|------|-------------|
| Mainteneur | [Audiar](https://www.audiar.org) |
| Instance de référence | Pays de Rennes / Rennes Métropole |
| Forks | Chaque agence sur son territoire (`site.ts` + vues SQL) |

Ce n’est **pas** une plateforme multi-agences. Un fork = une instance.

## Licence : MIT (en vigueur)

Le fichier [LICENSE](../LICENSE) est **MIT**, copyright Audiar 2026. Un changement de licence (ex. EUPL) est une décision juridique, pas un patch de code.

| | MIT (actuel) | EUPL-1.2 (option) |
|--|----------------|-------------------|
| Fork / usage interne | Libre | Libre |
| Redistribution d’un dérivé | Sans copyleft | Copyleft (même licence, compatible UE) |
| Usage typique | Outil à forker, simple | Logiciel public européen |

Passer à l’EUPL exigerait l’accord d’Audiar (et des contributeurs déjà présents). À trancher avec le service juridique si le réseau FNAU le demande.

## Dépôt GitHub sous organisation

Le compte perso n’est pas le bon véhicule FNAU. Checklist mainteneur :

1. Créer une organisation GitHub (Audiar, ou FNAU si mandat)
2. Transférer le dépôt (Settings → Transfer)
3. Mettre à jour les URLs (README, `site.ts` `contactUrl` n’est pas lié au git)
4. Restreindre `main` : PR + CI verte
5. Inviter 1–2 mainteneurs Audiar, pas toute l’équipe en admin

GitLab Audiar peut rester le CI interne ; GitHub Actions couvre les forks publics.

## Comment une agence contribue un thème

Voir [CONTRIBUTING.md](../CONTRIBUTING.md). En résumé : PR sur le **contrat** et le code générique ; les jeux de données et la charte restent dans le fork de l’agence.

## Ce qui reste hors scope

- Auth / multi-tenant
- ETL INSEE national
- Hébergement SaaS FNAU
