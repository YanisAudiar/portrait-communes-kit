export const externalTooltipHandler = (context: any) => {
  // Tooltip Element
  const { chart, tooltip } = context;
  const tooltipEl = getOrCreateTooltip(chart);

  // Cacher si pas de tooltip
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = '0';
    return;
  }

  // Contenu (Si body existe)
  if (tooltip.body) {
    const titleLines = tooltip.title || [];
    const bodyLines = tooltip.body.map((b: any) => b.lines);

    const tableHead = document.createElement('thead');
    titleLines.forEach((title: string) => {
      const tr = document.createElement('tr');
      const th = document.createElement('th');
      th.className = 'text-left text-xs font-semibold text-gray-400 uppercase pb-2'; // Tailwind classes
      th.innerText = title;
      tr.appendChild(th);
      tableHead.appendChild(tr);
    });

    const tableBody = document.createElement('tbody');
    bodyLines.forEach((body: string[], i: number) => {
      const colors = tooltip.labelColors[i];
      const tr = document.createElement('tr');

      const td = document.createElement('td');
      td.className = 'text-sm font-bold text-gray-800 flex items-center gap-2'; // Flex pour aligner la pastille

      // Pastille de couleur : createElement pour éviter innerHTML (protection XSS)
      const span = document.createElement('span');
      span.className = 'w-3 h-3 rounded-full inline-block';
      span.style.backgroundColor = colors?.backgroundColor || '#999';
      td.appendChild(span);

      // Valeur : textContent pour échapper le HTML (protection XSS)
      const textNode = document.createTextNode(' ' + (Array.isArray(body) ? body.join(' ') : String(body)));
      td.appendChild(textNode);

      tr.appendChild(td);
      tableBody.appendChild(tr);
    });

    const tableRoot = tooltipEl.querySelector('table');
    // Nettoyage et injection
    if (tableRoot) {
      while (tableRoot.firstChild) { tableRoot.firstChild.remove(); }
      tableRoot.appendChild(tableHead);
      tableRoot.appendChild(tableBody);
    }
  }

  const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

  // Style dynamique
  tooltipEl.style.opacity = '1';
  tooltipEl.style.left = positionX + tooltip.caretX + 'px';
  tooltipEl.style.top = positionY + tooltip.caretY + 'px';
  tooltipEl.style.padding = '12px';
}

const getOrCreateTooltip = (chart: any) => {
  let tooltipEl = chart.canvas.parentNode.querySelector('div.chartjs-tooltip');

  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'chartjs-tooltip bg-white shadow-xl rounded-lg border border-gray-100 absolute pointer-events-none transition-all duration-300 z-50 transform -translate-x-1/2 -translate-y-full mt-[-10px]';
    
    const table = document.createElement('table');
    table.style.margin = '0px';
    tooltipEl.appendChild(table);
    chart.canvas.parentNode.appendChild(tooltipEl);
  }
  return tooltipEl;
};
