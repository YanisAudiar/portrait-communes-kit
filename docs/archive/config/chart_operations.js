// Chart.js is loaded via script tag in HTML
const Chart = window.Chart;
import dataOperations from './data_operations.js';
import chartOptions from './chart_options.js';
import elementExports from './element_exports.js';

const chartOperations = (function () {

    /*
    chartOperations
    */

    /*
    options format :
    var options = {
        targetBlocChart: '', // string - cible HTML du bloc contenant le graphique
        chart: {
            target: '', // string - cible HTML du canvas contenant le graphique
            downloadButtonTarget: '', // string - cible HTML pour télécharger les données
            printButtonTarget: '', // string - cible HTML pour imprimer le graphique
            type: '', // string - type de graphique
            options: null, // object ou null - objet contenant les options du graphique (voir la documentation Chart.js)
            name: '', // string - alias du graphique
            title: {
                target: '', // string - cible HTML du titre
                text: '', // string - texte du titre
            },
            source: {
                target: '', // string - cible HTML de la source
                text: '', // string - texte de la source
            },
            compare: false, // boolean - activation de la comparaison territoriale
            filter: {
                active: false, // boolean - activation de l'option de filtrage du graphique (liste déroulante)
                col: null, // string ou null - libellé de la colonne du filtre
                alias: null, // string ou null - alias du libellé de la colonne
            },
            customColor: {
                active: false, // boolean - activation de la couleur personnalisée
                type: null, // string ou null - type de label (voir chartOperations.orderColorsDataset())
                objColors: null, // object ou null - object contenant les catégories et couleurs à appliquer (voir chartOperations.orderColorsDataset())
            },
        },
        data: {
            sourceUrl: this.url, // string - URL du flux de données
            customFilters: {}, // object - filtres additionnels à appliquer au lancement du graphique
            index: 7, // integer - index de la donnée à récupérer dans le callback Ajax
            label: ['lib_com'], // array - colonne(s) du ou des label(s)
            groupBy: 'numero_annee', // string - colonne de groupement
            mesure: ['taille_moy_men'], // array - colonne(s) de ou des mesure(s)
            dec: 1, // integer - nombre de décimales de(s) mesure(s)
            backgroundColor: ['#b197fc'], // array - couleurs de fond à appliquer
            borderColor: [], // array - couleurs de contour à appliquer
            width: 0, // integer - épaisseur du contour
        }
    };
    */

    var optionsChecker = function (options) {
        /*
        options : object - les options du graphique
        # retourne true si l'objet est conforme
        */

        const typesChartAvailable = ['bar', 'horizontalBar', 'line', 'pie', 'radar', 'polarArea', 'doughnut', 'bubble', 'treemap'];
        const typesCustomColor = ['chart-label', 'chart-datasets-label']

        var getkeys = function (obj, prefix) {
            var keys = Object.keys(obj);
            prefix = prefix ? prefix + '.' : '';
            return keys.reduce(function (result, key) {
                if (dataOperations.isObject(obj[key]) && key !== 'options' && key !== 'objColors' && key !== 'customFilters') {
                    result = result.concat(getkeys(obj[key], prefix + key));
                } else {
                    result.push(prefix + key);
                }
                return result;
            }, []);
        };

        var optionsKeysCorrectFormat = ["targetBlocChart", "chart.target", "chart.downloadButtonTarget", "chart.printButtonTarget", "chart.type", "chart.options", "chart.name", "chart.title.target", "chart.title.text", "chart.source.target", "chart.source.text", "chart.compare", "chart.filter.active", "chart.filter.col", "chart.filter.alias", "chart.customColor.active", "chart.customColor.type", "chart.customColor.objColors", "data.sourceUrl", "data.customFilters", "data.index", "data.label", "data.groupBy", "data.mesure", "data.dec", "data.backgroundColor", "data.borderColor", "data.width"];
        var optionsKeysToCheck = getkeys(options);

        if (JSON.stringify(optionsKeysCorrectFormat) === JSON.stringify(optionsKeysToCheck)) {
            if (options.targetBlocChart) {
                // targetBlocChart doit être string et ne peut être null
                if (typeof options.targetBlocChart !== 'string') {
                    console.log('options.targetBlocChart doit être au format string');
                    return;
                }
                if (!$(options.targetBlocChart).length) {
                    console.log('options.targetBlocChart n\'existe pas');
                    return;
                }
            }
            if (dataOperations.isEmpty(options.targetBlocChart)) {
                console.log('options.targetBlocChart ne peut être null');
                return;
            }
            // options.chart.target doit être string et ne peut être null
            if (options.chart.target) {
                if (typeof options.chart.target !== 'string') {
                    console.log('options.chart.target doit être au format string');
                    return;
                }
                if (!$(options.chart.target).length) {
                    console.log('options.chart.target n\'existe pas');
                    return;
                }
            }
            if (dataOperations.isEmpty(options.chart.target)) {
                console.log('options.chart.target ne peut être null');
                return;
            }
            // options.chart.type doit être string et ne peut être null
            if (options.chart.type) {
                if (typeof options.chart.type !== 'string') {
                    console.log('options.chart.type doit être au format string');
                    return;
                }
                if (!typesChartAvailable.includes(options.chart.type)) {
                    console.log('Le type de graphique ' + options.chart.type + ' n\'est pas supporté');
                    return;
                }
            }
            if (dataOperations.isEmpty(options.chart.type)) {
                console.log('options.chart.type ne peut être null');
                return;
            }
            return true;
        } else {
            console.log('Le format des options du graphique ' + options.chart.name + ' est incorrect, une ou plusieurs options sont manquantes');
            return false;
        }
    }

    var initChart = function (options) {
        /*
        options : object - options du graphique
        # retourne un graphique instancié
        */
        return new Chart($(options.chart.target).get(0).getContext('2d'), {
            type: options.chart.type,
            data: {
                datasets: [{
                }]
            },
            options: options.chart.options
        })
    }

    var buildChartDatasets = function (chart, data, options) {
        /*
        chart : object - le graphique instancié (pas le DOM)
        data : object - les données
        options : object - options du graphique
        # constructeur de graphiques via Chart.js
        */

        var datasetsToPopulate = {};

        var dataGroupBy = dataOperations.groupBy(data, options.data.groupBy); // on crée un objet groupé 
        var labelData = Object.keys(dataGroupBy);
        if (options.chart.type !== 'bubble' && options.chart.type !== 'treemap') {
            if (typeof options.data.mesure.isArray && typeof options.data.label.isArray) {
                $.each(options.data.mesure, function (m, mesure) {
                    var datasetCateg = [], datasetVal = [];
                    $.each(dataGroupBy, function (i, item) {
                        $.each(item, function (index, val) {
                            datasetCateg[index] = datasetCateg[index] || [];
                            datasetVal[index] = datasetVal[index] || [];
                            if (val[options.data.label[m]] === undefined) { datasetCateg[index].push(options.data.label[m]); }
                            else { datasetCateg[index].push(val[options.data.label[m]]); }
                            datasetVal[index].push(dataOperations.roundDec(val[mesure], options.data.dec));
                            datasetsToPopulate[m] = {
                                type: options.chart.type,
                                label: datasetCateg[index][0],
                                data: datasetVal[index],
                                borderWidth: 0
                            }
                        });
                    });
                });
            }
        }

        else if (options.chart.type === 'bubble' && options.data.mesure.length === 3) {
            var datasetCateg = [], datasetVal = [];
            $.each(dataGroupBy, function (i, item) {
                $.each(item, function (index, val) {
                    datasetCateg[index] = datasetCateg[index] || [];
                    datasetVal[index] = datasetVal[index] || [];
                    if (val[options.data.label] === undefined) { datasetCateg[index].push(options.data.label); }
                    else { datasetCateg[index].push(val[options.data.label]); }
                    $.each(options.data.mesure, function (i, item) {
                        datasetVal[index].push(typeof (item) === 'string' ? dataOperations.roundDec(val[item], options.data.dec) : item);
                    });

                    datasetsToPopulate[index] = {
                        type: options.chart.type,
                        label: datasetCateg[index][0],
                        data: [{ 'x': datasetVal[index][0], 'y': datasetVal[index][1], 'r': datasetVal[index][2] }],
                        borderWidth: 0
                    }
                });
            });
        }

        else if (options.chart.type === 'treemap' && options.chart.customColor.active === true) {
            var getColor = function (categ) {
                var result = {};
                var obj = options.chart.customColor.objColors;
                obj.forEach(obj => result[obj.categ] = obj.backgroundColor);
                return result[categ];
            }
            chart.type = options.chart.type;
            datasetsToPopulate = {
                tree: data,
                key: options.data.mesure[0],
                groups: [options.data.groupBy],
                spacing: -0.5,
                borderWidth: 1,
                fontColor: "black",
                borderColor: "white",
                backgroundColor: function (ctx) {
                    var item = ctx.dataset.data[ctx.dataIndex];
                    switch (item.g) {
                        case item.g:
                            return getColor(item.g);
                    }
                }
            }
            chart.data.datasets.push(datasetsToPopulate);
            chart.options.tooltips = {
                callbacks: {
                    title: function (item, data) {
                        var item = item[0];
                        return data.datasets[item.datasetIndex].data[item.index].g;
                    },
                    label: function (item, data) {
                        var dataset = data.datasets[item.datasetIndex];
                        var dataItem = dataset.data[item.index];
                        var obj = dataItem._data;
                        var allVal = new Array();
                        $.each(dataset.data, function (i, item) {
                            allVal.push(item.v);
                        });
                        var add = (a, b) => a + b;
                        var total = allVal.reduce(add);
                        return dataOperations.roundDec(dataItem.v, 0).toLocaleString() + " (" + dataOperations.roundDec((dataItem.v / total) * 100, 1) + " %)";
                    }
                }
            };
            chart.options.plugins.datalabels = {
                formatter: function (value, context) {
                    return null;
                }
            };
            chart.options.legend = false;
            chart.update();
        }

        if (options.chart.type !== 'treemap') {
            var dataFinal = { labels: labelData, datasets: [] };
            $.each(datasetsToPopulate, function (i, item) {
                dataFinal.datasets.push(datasetsToPopulate[i]);
            });
            if (chart.data.labels.length > 0) {
                // si l'élément chart contient déjà des labels (et donc déjà un ou plusieurs datasets), on ajoute seulement le(s) dataset(s)
                $.each(datasetsToPopulate, function (i, item) {
                    chart.data.datasets.push(datasetsToPopulate[i]);
                });
            }
            else {
                // sinon on affecte l'ensemble de l'objet dataFinal
                chart.data = dataFinal;
            }

            $.each(chart.data.datasets, function (i, item) {
                chart.data.datasets[i].borderWidth = options.data.width;
                if (chart.data.datasets.length > 1) {
                    if (options.data.backgroundColor.length === 0) {
                        chart.data.datasets[i].backgroundColor = "rgba(255, 255, 255, 0)";
                    }
                    else {
                        chart.data.datasets[i].backgroundColor = options.data.backgroundColor[i];

                    }
                    chart.data.datasets[i].borderColor = options.data.borderColor[i];
                }
                else {
                    // s'il n'y a qu'un seul dataset
                    if (options.data.backgroundColor.length === 0) {
                        // si arrayBackgroundColors est vide on affecte une valeur transparente
                        chart.data.datasets[i].backgroundColor = "rgba(255, 255, 255, 0)";
                        chart.data.datasets[i].borderColor = options.data.borderColor;
                    }
                    else if (options.data.backgroundColor.length === 1) {
                        if (chart.config.type === 'bar' || chart.config.type === 'horizontalBar') {
                            // si arrayBackgroundColors contient une couleur, on l'affecte autant de fois qu'il y a de labels dans le dataset
                            var nbLabels = chart.data.labels.length;
                            var repeatArrayBackgroundColors = Array.apply(null, Array(nbLabels)).map(function () { return options.data.backgroundColor[0] });
                            chart.data.datasets[i].backgroundColor = repeatArrayBackgroundColors;
                            var repeatArrayBorderColors = Array.apply(null, Array(nbLabels)).map(function () { return options.data.borderColor[0] });
                            chart.data.datasets[i].borderColor = repeatArrayBorderColors;
                        }
                        else {
                            chart.data.datasets[i].backgroundColor = options.data.backgroundColor;
                            chart.data.datasets[i].borderColor = options.data.borderColor;
                        }
                    }
                    else {
                        // sinon on affecte les listes
                        chart.data.datasets[i].backgroundColor = options.data.backgroundColor;
                        chart.data.datasets[i].borderColor = options.data.borderColor;

                    }
                }
            });
        }
        chart.update();
    }

    var orderColorsDataset = function (labelType, chart, objColors) {
        /*
        labelType : string - 'chart-label' ou 'chart-datasets-label' en fonction de la structure du dataset du graphique
        chart : object - le graphique instancié (pas le DOM)
        objColors : object - objet contenant l'association catégorie/couleur, doit avoir la structure : [{ categ: 'catégorie', backgroundColor: '', borderColor: '' }, { ... }]
        # ordonne et affecte les couleurs d'un dataset en fonction d'une liste
        */

        var itemsArrayIndex = [] // liste définissant l'ordre qu'on souhaite
        if (labelType === 'chart-label') {
            // si les valeurs ordonnées sont au niveau des labels (pas dans les datasets)
            itemsArrayIndex = chart.data.labels;
        }
        if (labelType === 'chart-datasets-label') {
            // si les valeurs ordonnées sont au niveau des labels de chaque dataset
            $.each(chart.data.datasets, function (i, item) {
                itemsArrayIndex.push(chart.data.datasets[i].label);
            })
        }
        var result = []; // liste d'objets accueillant les résultats
        objColors.forEach(function (a) {
            // on tri la liste d'objets objColors en fonction de l'ordre des éléments de la liste itemsArrayIndex, la liste d'objets trié est dans result
            result[itemsArrayIndex.indexOf(a.categ)] = a;
        });
        var arraySortedBackgroundColor = []; // liste des couleurs issue de la liste d'objet triée précédemment (result)
        $.each(result, function (i, item) {
            arraySortedBackgroundColor.push(result[i].backgroundColor);
        });

        var arraySortedBorderColor = [];
        $.each(result, function (i, item) {
            arraySortedBorderColor.push(result[i].borderColor);
        });

        $.each(chart.data.datasets, function (i, item) {
            if (chart.data.datasets.length > 1) {
                chart.data.datasets[i].backgroundColor = arraySortedBackgroundColor[i];
                chart.data.datasets[i].borderColor = arraySortedBorderColor[i];
            }
            else {
                chart.data.datasets[i].backgroundColor = arraySortedBackgroundColor;
                chart.data.datasets[i].borderColor = arraySortedBorderColor;
            }
        });
        chart.update();
    };

    function chartGlobalParams() {
        /*
        # initialise des paramètres globaux des graphiques
        */
        Chart.defaults.global.defaultFontFamily = "'Open Sans', sans-serif !important";
        Chart.defaults.global.animation = false;
        Chart.defaults.global.responsive = true;
        Chart.defaults.global.maintainAspectRatio = false;
    }

    function removeDatasets(chart) {
        /*
        chart : object - graphique instancié
        # supprime un dataset
        */
        if (chart.data.datasets.length > 1) {
            chart.data.datasets.splice(-1, 1);
        } else {
            return null;
        }
        chart.update();
    }

    function removeData(chart) {
        /*
        chart : object - graphique instancié
        # supprime une donnée
        */
        chart.data.labels.pop();
        chart.data.datasets.forEach((dataset) => {
            dataset.data.pop();
        });
        chart.update();
    }

    var filterChartData = function (chart, options) {
        /*
        chart : object - graphique instancié
        options : object - options du graphique
        # ajoute la fonctionnalité de filtre sur le graphique
        */
        $(options.targetBlocChart).append('<div class="chart-filter mb-3"><div class="alias">' + options.chart.filter.alias + '</div><select class="form-control select-filter mt-3" data-live-search="true"><option value="">' + options.chart.filter.alias + '</option></select></div>');
        var uniqueVal = [];
        var colName = String(options.chart.filter.col);
        $.ajax({
            type: "GET",
            url: options.data.sourceUrl,
            dataType: "json",
            mimeType: "application/json",
            success: function (data) {
                uniqueVal = data[options.data.index]
                    .map(p => p[colName])
                    .filter((col, index, arr) => arr.indexOf(col) == index)
                    .sort((a, b) => b - a);

                $.each(uniqueVal, function (i, item) {
                    $(options.targetBlocChart + ' .select-filter').append('<option value="' + item + '">' + item + '</option>');
                });

                $(options.targetBlocChart + ' .select-filter').selectpicker({
                    maxOptions: 10
                });

                $(options.targetBlocChart + ' .select-filter select').on('change', function () {
                    chart.data.labels.length = 0;
                    chart.data.datasets.length = 0;
                    chart.update();
                    var filteredData = dataOperations.multipleFiltersData(data[options.data.index], { [colName]: [$(this).val()] });
                    chartOperations.buildChartDatasets(chart, filteredData, options);
                });
            },
            complete: function () { }
        });
    }

    var compareChart = function (chart, options) {
        /*
        chart : object - le graphique instancié (pas le DOM)
        options : object - options du graphique
        # ajoute la fonctionnalité de comparaison à un graphique déjà instancié
        */
        var chart = chart;
        var target = options.targetBlocChart;
        var chartConfig = options.chart;
        var dataConfig = options.data;

        $(target).append('<button class="classic-button collapsed compare mt-3" type="button" data-toggle="collapse" data-target="#compare-' + chartConfig.name + '" aria-expanded="false" aria-controls="compare-' + chartConfig.name + '"><i class="fas fa-search mr-2"></i>Comparer</button>');
        $(target).append('<div class="collapse form mt-3" id="compare-' + chartConfig.name + '"><div class="form-group index"><select class="form-control select-commune-compar param-choice mb-3" name="territoire" data-live-search="true" required><option value="">Commune</option></select><br><button class="classic-button compare-territoire add mt-3 mr-2" type="submit"><i class="fas fa-plus mr-2"></i>Ajouter</button><button class="classic-button compare-territoire remove mt-3" type="submit"><i class="fas fa-minus mr-2"></i>Supprimer</button><div class="alert alert-danger compare-max mt-3" role="alert" style="display: none;"></div></div></div>');

        // Initialize communes for comparison select
        initializeCommunesForComparison(target);

        var listParameters = [];
        $.each($(target + ' .param-choice'), function (i, item) {
            listParameters.push($(item).attr('name'));
        });

        $(target + ' .compare-territoire.add').on('click', function () {
            var objParameters = listParameters.reduce((o, key) => ({ ...o, [key]: $(target + " [name='" + key + "']").val() }), {});

            $.ajax({
                type: "GET",
                url: dataConfig.sourceUrl.split('?')[0],
                data: objParameters,
                dataType: "json",
                mimeType: "application/json",
                success: function (data) {
                    if (chart.data.datasets.length <= 2) {
                        if (options.chart.filter.active === true) {
                            if (!$(options.targetBlocChart + ' .select-filter select').val()) {
                                chartOperations.buildChartDatasets(chart, data[options.data.index], options);
                            } else {
                                var colName = String(options.chart.filter.col);
                                var filteredData = dataOperations.multipleFiltersData(data[options.data.index], { [colName]: [$(options.targetBlocChart + ' .select-filter select').val()] });
                                chartOperations.buildChartDatasets(chart, filteredData, options);
                            }
                        } else {
                            chartOperations.buildChartDatasets(chart, data[options.data.index], options);
                        }
                    } else {
                        $(target + ' .compare-max').css('display', 'block');
                        $(target + ' .compare-max').empty().append('Maximum 3 comparaisons');
                    }
                },
                complete: function () { }
            });
        });

        $(target + ' .compare-territoire.remove').on('click', function () {
            chartOperations.removeDatasets(chart);
            $(target + ' .compare-max').css('display', 'none');
        });
    }

    function initializeCommunesForComparison(target) {
        /*
        target : string - le sélecteur du bloc parent
        # initialise les communes pour le select de comparaison
        */
        if (typeof window.communesData === 'undefined') {
            // Load communes if not already loaded
            fetch('/api/territoires')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(communes => {
                    window.communesData = communes;
                    populateComparisonSelect(target, communes);
                })
                .catch(error => {
                    console.error('❌ Failed to load communes for comparison:', error);
                });
        } else {
            // Use cached communes data
            populateComparisonSelect(target, window.communesData);
        }
    }

    function populateComparisonSelect(target, communes) {
        /*
        target : string - le sélecteur du bloc parent
        communes : array - liste des communes
        # peuple le select de comparaison avec les communes
        */
        const $select = $(target + ' .select-commune-compar');
        $select.empty();
        $select.append('<option value="">Commune</option>');
        
        communes.forEach(commune => {
            $select.append(`<option value="${commune.code_insee_concat}">${commune.lib_com}</option>`);
        });
        
        // Initialize selectpicker
        $select.selectpicker({
            maxOptions: 10,
            liveSearch: true
        });
        
        console.log('✅ Comparison select populated for', target);
    }

    var chartConstructor = function (data, options) {
        /*
        data : object - les données
        options : object - options du graphique
        # construit le graphique
        */
        if (optionsChecker(options)) {
            var chart = initChart(options);

            if (!$.isEmptyObject(options.data.customFilters)) {
                var dataFiltered = dataOperations.multipleFiltersData(data[options.data.index], options.data.customFilters);
                buildChartDatasets(chart, dataFiltered, options);
            } else {
                buildChartDatasets(chart, data[options.data.index], options);
            }

            if (options.chart.downloadButtonTarget) {
                $(options.targetBlocChart + " " + options.chart.downloadButtonTarget).click(function (event) {
                    elementExports.saveFileXlsx(data[options.data.index]);
                });
            }

            if (options.chart.printButtonTarget) {
                $(options.targetBlocChart + " " + options.chart.printButtonTarget).click(function (event) {
                    elementExports.printDomElement(options.targetBlocChart);
                });
            }

            if (options.chart.title.target) {
                $(options.targetBlocChart + " " + options.chart.title.target).append(options.chart.title.text);
            }

            if (options.chart.source.target) {
                $(options.targetBlocChart + " " + options.chart.source.target).append(options.chart.source.text);
            }

            if (options.chart.filter.active === true) {
                filterChartData(chart, options);
            }

            if (options.chart.compare === true) {
                compareChart(chart, options);
            }

            if (options.chart.customColor.active === true) {
                orderColorsDataset(options.chart.customColor.type, chart, options.chart.customColor.objColors);
            }

            return chart;
        }
    }

    // Simpler functions for backward compatibility
    function createChart(elementId, chartType, chartData, chartOptions) {
        var ctx = document.getElementById(elementId).getContext('2d');
        return new Chart(ctx, {
            type: chartType,
            data: chartData,
            options: chartOptions
        });
    }

    function buildChartData(labels, datasets) {
        return {
            labels: labels,
            datasets: datasets
        };
    }

    function buildDataset(label, data, backgroundColor, borderColor) {
        return {
            label: label,
            data: data,
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            borderWidth: 1
        };
    }

    return {
        optionsChecker: optionsChecker,
        initChart: initChart,
        buildChartDatasets: buildChartDatasets,
        orderColorsDataset: orderColorsDataset,
        chartGlobalParams: chartGlobalParams,
        removeDatasets: removeDatasets,
        removeData: removeData,
        filterChartData: filterChartData,
        compareChart: compareChart,
        chartConstructor: chartConstructor,
        createChart: createChart,
        buildChartData: buildChartData,
        buildDataset: buildDataset,
        initializeCommunesForComparison: initializeCommunesForComparison,
        populateComparisonSelect: populateComparisonSelect
    };
})();

export default chartOperations; 