/**
 * Construction DOM sûre pour les popups MapLibre.
 * Évite setHTML / onclick inline (risque XSS si données GeoJSON altérées).
 */

/**
 * Crée le contenu DOM de la popup de clic sur une commune.
 * @param {string} communeName
 * @param {string} codeInsee
 * @param {(codeInsee: string) => void} onNavigate
 * @returns {HTMLElement}
 */
export function createClickPopupElement(communeName, codeInsee, onNavigate) {
  const root = document.createElement('div')
  root.className = 'commune-popup-audiar'

  const header = document.createElement('div')
  header.className = 'popup-header'

  const title = document.createElement('h3')
  title.className = 'popup-title'
  title.textContent = communeName

  const code = document.createElement('span')
  code.className = 'popup-code'
  code.textContent = codeInsee

  header.appendChild(title)
  header.appendChild(code)

  const content = document.createElement('div')
  content.className = 'popup-content'

  const description = document.createElement('p')
  description.className = 'popup-description'
  description.textContent = 'Cliquez pour voir les détails de la commune'
  content.appendChild(description)

  const actions = document.createElement('div')
  actions.className = 'popup-actions'

  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'popup-btn-detail'
  button.textContent = '📊 Voir les détails'
  button.addEventListener('click', () => onNavigate(codeInsee))

  actions.appendChild(button)

  root.appendChild(header)
  root.appendChild(content)
  root.appendChild(actions)

  return root
}

/**
 * Crée le contenu DOM de la popup de survol.
 * @param {string} communeName
 * @returns {HTMLElement}
 */
export function createHoverPopupElement(communeName) {
  const root = document.createElement('div')
  root.className = 'hover-popup-content'

  const strong = document.createElement('strong')
  strong.textContent = communeName
  root.appendChild(strong)

  return root
}
