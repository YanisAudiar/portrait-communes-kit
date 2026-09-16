Configuration Details
🎨 Theme Colors
Extracted from 
src/client/css/main.css
.

Theme	Color (RGBA)	Border Color (RGBA)
demo	rgba(93, 79, 156, 1)	rgba(93, 79, 156, 0.5)
habitat	rgba(209, 92, 22, 1)	rgba(209, 92, 22, 0.5)
eco	rgba(0, 119, 171, 1)	rgba(0, 119, 171, 0.5)
emploi	rgba(211, 83, 153, 1)	rgba(211, 83, 153, 0.5)
formation	rgba(205, 16, 91, 1)	rgba(205, 16, 91, 0.5)
solidarite	rgba(58, 68, 103, 1)	rgba(58, 68, 103, 0.5)
fiscalite	rgba(194, 124, 112, 1)	rgba(194, 124, 112, 0.5)
mobilite	rgba(143, 35, 94, 1)	rgba(143, 35, 94, 0.5)
tourisme	rgba(0, 130, 198, 1)	rgba(0, 130, 198, 0.5)
ressources	rgba(0, 142, 123, 1)	rgba(0, 142, 123, 0.51)
📊 Chart.js Configurations
Extracted from 
src/client/js/modules/chart_options.js
.

The following configuration objects are exported by chartOptions:

chartClassicBar
Standard bar chart with tooltips and data labels.

Scales: beginAtZero: true, hidden gridLines.
Plugins: datalabels enabled (font size 10).
chartClassicBarNoLegend
Same as chartClassicBar but with legend: { display: false }.

chartClassicBarPercent
Bar chart formatted for percentages.

Format: Adds % to values in ticks, tooltips, and data labels.
chartClassicBarPercentNoLegend
Percentage bar chart without legend.

chartLine
Line chart configuration.

Features: usePointStyle: true for legend.
Scales: stacked: true for xAxes.
chartStackedSum
Stacked bar chart with a sum in the tooltip footer.

Tooltips: Calculates and displays total in footer.
Format: Thousands separator (space).
chartPyramide
Population pyramid style chart.

Format: Uses Math.abs() for values to handle negative/positive split visually (though input might be negative for one side).
Plugins: datalabels disabled.
chartHorizontal
Horizontal bar chart.

Scales: stepSize: 20000 on xAxes.
Plugins: datalabels aligned at the end.
chartClassicDoughnut
Doughnut chart.

Tooltips: Shows value and calculated percentage.
Plugins: datalabels enabled.