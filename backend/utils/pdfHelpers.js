/**
 * Utilitaires pour la préparation et le nettoyage des pages avant génération PDF
 * Ces fonctions sont exécutées dans le contexte du navigateur Puppeteer
 */

/**
 * Supprime les éléments liés au darkmode qui ne doivent pas apparaître dans le PDF
 * @param {Page} page - Instance Puppeteer Page
 */
const removeDarkmodeElements = async (page) => {
  await page.evaluate(() => {
    const darkmodeButton = document.querySelector('.darkmode-toggle')
    if (darkmodeButton) {
      darkmodeButton.remove()
    }

    const darkmodeBackground = document.querySelector('.darkmode-background')
    if (darkmodeBackground) {
      darkmodeBackground.remove()
    }

    const darkmodeLayer = document.querySelector('.darkmode-layer')
    if (darkmodeLayer) {
      darkmodeLayer.remove()
    }
  })
}

/**
 * Supprime les blocs de chiffres clés qui ne sont pas nécessaires dans le PDF
 * @param {Page} page - Instance Puppeteer Page
 */
const removeKeyNumberBlocks = async (page) => {
  await page.evaluate(() => {
    const firstKeyNumber = document.querySelector('.bloc-ind')
    if (firstKeyNumber) {
      const parent = firstKeyNumber.closest('.row-dashboard')
      if (parent) {
        parent.remove()
      }
    }
  })
}

/**
 * Supprime les blocs vides marqués avec la classe 'no-data'
 * @param {Page} page - Instance Puppeteer Page
 */
const removeEmptyBlocks = async (page) => {
  await page.evaluate(() => {
    const emptyBlocks = document.querySelectorAll('.no-data')
    emptyBlocks.forEach((block) => {
      const parent = block.closest('[class^="col-"]')
      if (parent) {
        parent.remove()
      }
    })
  })
}

/**
 * Supprime les colonnes vides qui n'ont aucun enfant
 * @param {Page} page - Instance Puppeteer Page
 */
const removeEmptyCols = async (page) => {
  await page.evaluate(() => {
    const cols = document.querySelectorAll('[class^="col-"]')
    cols.forEach((col) => {
      if (col.childElementCount === 0) {
        col.remove()
      }
    })
  })
}

/**
 * Supprime les lignes vides qui n'ont aucun enfant
 * @param {Page} page - Instance Puppeteer Page
 */
const removeEmptyRows = async (page) => {
  await page.evaluate(() => {
    const rows = document.querySelectorAll('.row-dashboard')
    rows.forEach((row) => {
      if (row.childElementCount === 0) {
        row.remove()
      }
    })
  })
}

/**
 * Supprime tous les éléments vides de la page (blocs, colonnes, lignes)
 * @param {Page} page - Instance Puppeteer Page
 */
const removeEmptyElements = async (page) => {
  await removeEmptyBlocks(page)
  await removeEmptyCols(page)
  await removeEmptyRows(page)
}

/**
 * Supprime les footers des graphiques (icônes d'aide et sources)
 * Ces éléments sont généralement redondants dans un PDF
 * @param {Page} page - Instance Puppeteer Page
 */
const removeChartFooters = async (page) => {
  await page.evaluate(() => {
    // Supprimer les icônes d'aide/sources
    const infoIcons = document.querySelectorAll('.help-sources')
    infoIcons.forEach((icon) => {
      icon.remove()
    })

    // Supprimer les footers de graphiques
    const chartFooters = document.querySelectorAll('.footer-chart')
    chartFooters.forEach((footer) => {
      footer.remove()
    })
  })
}

/**
 * Personnalise le style du titre de catégorie pour le PDF
 * Applique un fond coloré avec texte blanc pour meilleure lisibilité
 * @param {Page} page - Instance Puppeteer Page
 */
const customizeStyle = async (page) => {
  await page.evaluate(() => {
    const categoryTitle = document.querySelector('.category-title')
    if (categoryTitle) {
      const color = categoryTitle.style.color || window.getComputedStyle(categoryTitle).color
      if (color) {
        categoryTitle.style.backgroundColor = color
        categoryTitle.style.color = 'white'
      }
    }
  })
}

/**
 * Supprime les éléments de navigation et d'interface qui ne doivent pas apparaître dans le PDF
 * @param {Page} page - Instance Puppeteer Page
 */
const removeNavigationElements = async (page) => {
  await page.evaluate(() => {
    // Supprimer les boutons de navigation
    const navButtons = document.querySelectorAll('button, .btn, .button')
    navButtons.forEach((btn) => {
      // Garder seulement les boutons nécessaires (si besoin)
      const isPrintButton = btn.classList.contains('print-button') || 
                           btn.classList.contains('export-pdf')
      if (!isPrintButton) {
        btn.remove()
      }
    })

    // Supprimer les menus déroulants
    const dropdowns = document.querySelectorAll('.dropdown-menu, .menu-dropdown')
    dropdowns.forEach((dropdown) => {
      dropdown.remove()
    })
  })
}

/**
 * Applique tous les nettoyages nécessaires pour préparer la page au PDF
 * Cette fonction centralise toutes les opérations de nettoyage
 * @param {Page} page - Instance Puppeteer Page
 */
const preparePageForPdf = async (page) => {
  // Supprimer les éléments d'interface utilisateur non nécessaires
  await removeDarkmodeElements(page)
  await removeNavigationElements(page)
  
  // Supprimer les blocs de données non pertinents
  await removeKeyNumberBlocks(page)
  await removeEmptyElements(page)
  
  // Supprimer les éléments redondants
  await removeChartFooters(page)
  
  // Appliquer les styles personnalisés
  await customizeStyle(page)
}

module.exports = {
  removeDarkmodeElements,
  removeKeyNumberBlocks,
  removeEmptyBlocks,
  removeEmptyCols,
  removeEmptyRows,
  removeEmptyElements,
  removeChartFooters,
  customizeStyle,
  removeNavigationElements,
  preparePageForPdf
}

