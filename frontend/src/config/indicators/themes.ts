import demographieIcon from '@/assets/icons/Demographie blanc.svg'
import demographieIconInactive from '@/assets/icons/Demographie.svg'
import habitatIcon from '@/assets/icons/Habitat blanc.svg'
import habitatIconInactive from '@/assets/icons/Habitat.svg'
import formationIcon from '@/assets/icons/Enseignement blanc.svg'
import formationIconInactive from '@/assets/icons/Enseignement.svg'
import economieIcon from '@/assets/icons/Economie-Emploi blanc.svg'
import economieIconInactive from '@/assets/icons/Economie-Emploi.svg'
import solidariteIcon from '@/assets/icons/Solidarite blanc.svg'
import solidariteIconInactive from '@/assets/icons/Solidarite.svg'
import energieIcon from '@/assets/icons/Energie-Environnement blanc.svg'
import energieIconInactive from '@/assets/icons/Energie-Environnement.svg'
import mobiliteIcon from '@/assets/icons/Mobilites blanc.svg'
import mobiliteIconInactive from '@/assets/icons/Mobilites.svg'
import agricultureIcon from '@/assets/icons/Agriculture blanc.svg'
import agricultureIconInactive from '@/assets/icons/Agriculture.svg'
import equipementsIcon from '@/assets/icons/Equipement-Services blanc.svg'
import equipementsIconInactive from '@/assets/icons/Equipement-Services.svg'
import { observatoireThematicColorsHex, observatoireColors } from '@/config/graphicCharter'

export interface ThemeConfig {
  id: string
  label: string
  icon: string
  /** Icône pour état inactif (teal/gris sur fond blanc). Si absent, utilise icon avec filtre. */
  iconInactive?: string
  color: string
  description: string
  categories: string[]
  /** Si false, la thématique n'a pas encore de données ni de graphiques (affichage "Données à venir"). */
  hasData?: boolean
}

/**
 * Thématiques sans données pour l'instant : afficher un message "Données à venir" au lieu des graphiques/KPIs.
 */
export const THEME_IDS_WITHOUT_DATA: string[] = [
  'energie-environnement',
  'mobilites',
  'equipement-services'
]

/** Indique si une thématique est marquée comme sans données (pas de graphiques). */
export function isThemeWithoutData(themeId: string): boolean {
  return THEME_IDS_WITHOUT_DATA.includes(themeId)
}

/** Thématiques - Couleurs charte Observatoire (graphicCharter) */
export const themes: Record<string, ThemeConfig> = {
  demographie: {
    id: 'demographie',
    label: 'Démographie',
    icon: demographieIcon,
    iconInactive: demographieIconInactive,
    color: observatoireThematicColorsHex.demographie,
    description: 'Population, décomposition de l\'évolution, structure par âge et ménages',
    categories: ['Population', 'Décomposition de l\'évolution', 'Âge', 'Ménages']
  },
  habitat: {
    id: 'habitat',
    label: 'Habitat',
    icon: habitatIcon,
    iconInactive: habitatIconInactive,
    color: observatoireThematicColorsHex.habitat,
    description: 'Parc de logements, tailles, parc locatif social et construction',
    categories: ['Parc de logements', 'Taille', 'Parc locatif social', 'Construction']
  },
  enseignement: {
    id: 'enseignement',
    label: 'Enseignement',
    icon: formationIcon,
    iconInactive: formationIconInactive,
    color: observatoireThematicColorsHex.formation,
    description: 'Scolarité primaire, secondaire, enseignement supérieur et mobilités étudiantes',
    categories: ['École primaire', 'Collège / Lycée', 'Enseignement supérieur', 'Navette études']
  },
  'economie-emploi': {
    id: 'economie-emploi',
    label: 'Économie-emploi',
    icon: economieIcon,
    iconInactive: economieIconInactive,
    color: observatoireThematicColorsHex.economie,
    description: 'Tissu économique, créations d\'entreprises, emploi, chômage et marché du travail',
    categories: ['Tissu économique', 'Créations', 'Construction', 'Population active', 'Chômage', 'Marché du travail', 'Zone d\'emploi']
  },
  solidarite: {
    id: 'solidarite',
    label: 'Solidarité',
    icon: solidariteIcon,
    iconInactive: solidariteIconInactive,
    color: observatoireThematicColorsHex.solidarite,
    description: 'Revenus, minima sociaux et bas revenus',
    categories: ['Revenus', 'Minima sociaux', 'Bas revenus']
  },
  'energie-environnement': {
    id: 'energie-environnement',
    label: 'Énergie-Environnement',
    icon: energieIcon,
    iconInactive: energieIconInactive,
    color: observatoireThematicColorsHex.ressources,
    description: 'Environnement, énergie, émissions de GES, consommations, production, consommation d\'espace, trame verte et bleue, qualité de l\'eau et déchets',
    categories: ['GES', 'Consommations', 'Production', 'Précarité énergétique', 'Consommation d\'espace', 'TVB', 'Qualité de l\'eau', 'Déchets'],
    hasData: false
  },
  mobilites: {
    id: 'mobilites',
    label: 'Mobilités',
    icon: mobiliteIcon,
    iconInactive: mobiliteIconInactive,
    color: observatoireThematicColorsHex.mobilite,
    description: 'Déplacements, navettes, covoiturage et transport collectif',
    categories: ['Déplacements', 'Navettes', 'Covoiturage', 'Transport collectif'],
    hasData: false
  },
  agriculture: {
    id: 'agriculture',
    label: 'Agriculture',
    icon: agricultureIcon,
    iconInactive: agricultureIconInactive,
    color: '#80b187',
    description: 'Exploitations agricoles et surfaces associées',
    categories: ['Exploitations', 'Surfaces']
  },
  'equipement-services': {
    id: 'equipement-services',
    label: 'Equipement et services',
    icon: equipementsIcon,
    iconInactive: equipementsIconInactive,
    color: observatoireColors.linkHover, // #e36411 (orange survol)
    description: 'Services et maillage en équipements de proximité',
    categories: ['Services'],
    hasData: false
  }
}
