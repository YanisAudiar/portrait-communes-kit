# Dossier Images

## Emplacement du logo Audiar

Le logo Audiar est placé dans ce dossier avec le nom :
- **`logo-Audiar.svg`** (avec A majuscule)

## Structure actuelle

```
frontend/src/assets/images/
├── logo-Audiar.svg ✅ (logo présent)
└── README.md (ce fichier)
```

## Utilisation dans les composants

Le logo est utilisé directement avec :
```vue
<img src="@/assets/images/logo-Audiar.svg" alt="Audiar" />
```

Le logo est utilisé dans :
- Header (AppHeader.vue)
- Footer (Dashboard.vue)
- Footer (MentionsLegales.vue)

