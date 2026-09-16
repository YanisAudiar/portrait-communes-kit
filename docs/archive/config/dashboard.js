import navigation from './modules/navigation.js';
import dataOperations from './modules/data_operations.js';
import chartOperations from './modules/chart_operations.js';
import chartOptions from './modules/chart_options.js';
import elementExports from './modules/element_exports.js';

console.log('🔄 Dashboard.js loaded');

$(document).ready(function () {
    console.log('📍 DOM loaded, initializing dashboard...');

    // Initialize navigation
    navigation.scrollToTop('#scroll-to-top');
    chartOperations.chartGlobalParams();

    // Configure navigation buttons to scroll to sections
    navigation.goToElement('.theme.demo', '.title.demo');
    navigation.goToElement('.theme.habitat', '.title.habitat');
    navigation.goToElement('.theme.eco', '.title.eco');
    navigation.goToElement('.theme.emploi', '.title.emploi');
    navigation.goToElement('.theme.formation', '.title.formation');
    navigation.goToElement('.theme.solidarite', '.title.solidarite');
    navigation.goToElement('.sous-theme.evol-pop', '.section.evol-pop');
    navigation.goToElement('.sous-theme.solde-naturel', '.section.solde-naturel');
    navigation.goToElement('.sous-theme.age-pop', '.section.age-pop');
    navigation.goToElement('.sous-theme.menages', '.section.menages');
    navigation.goToElement('.sous-theme.parc-log', '.section.parc-log');
    navigation.goToElement('.sous-theme.marche-hab', '.section.marche-hab');

    // Get territoire parameter from URL
    const urlParams = new URLSearchParams(window.location.search);
    const territoireParam = urlParams.get('territoire');
    
    if (territoireParam) {
        console.log('🎯 URL parameter territoire:', territoireParam);
        window.currentTerritoire = territoireParam;
        console.log('✅ Current territoire set to:', window.currentTerritoire);
        
        // Load all data at once
        Promise.all([
            loadCommuneInfo(territoireParam),
            loadDemoData(territoireParam),
            loadHabitatData(territoireParam),
            loadEcoData(territoireParam),
            loadEmploiData(territoireParam),
            loadFormationData(territoireParam),
            loadSolidariteData(territoireParam),
            loadCommunesForComparison(),
            loadCommunesForMainSelect()
        ]).then(() => {
            console.log('✅ All data loaded successfully');
        }).catch(error => {
            console.error('❌ Error loading data:', error);
        });
    } else {
        console.log('❌ No territoire parameter found in URL');
    }

    // Initialize commune change form handler
    initializeCommuneChangeForm();

    // Initialize print functionality
    $(".print").click(function (event) {
        elementExports.printDomElement('.section');
    });

    // Export functionality
    $('.export-btn').click(function(event) {
        var chartName = $(this).data('chart');
        elementExports.saveFileXlsx(window.chartData[chartName]);
    });

    // Share functionality
    $('.share-btn').click(function(event) {
        var url = window.location.href;
        elementExports.shareSocialNetwork(url);
    });

    console.log('✅ Dashboard fully initialized with all charts');
});

function initializeCommuneChangeForm() {
    console.log('🔄 Initializing commune change form...');
    
    // Handle form submission
    $('#territoire-form').on('submit', function(e) {
        e.preventDefault();
        
        const selectedCommune = $('.select-commune.territoire-choice').selectpicker('val');
        console.log('🔍 Selected commune value:', selectedCommune);
        
        if (selectedCommune && selectedCommune !== '') {
            console.log('🎯 Changing to commune:', selectedCommune);
            window.location.href = `/dashboard?territoire=${selectedCommune}`;
        } else {
            console.log('❌ No commune selected');
            alert('Veuillez sélectionner une commune');
        }
    });
    
    // Also handle direct button click
    $('.submit-territoire').on('click', function(e) {
        e.preventDefault();
        
        const selectedCommune = $('.select-commune.territoire-choice').selectpicker('val');
        console.log('🔍 Selected commune value (button click):', selectedCommune);
        
        if (selectedCommune && selectedCommune !== '') {
            console.log('🎯 Changing to commune:', selectedCommune);
            window.location.href = `/dashboard?territoire=${selectedCommune}`;
        } else {
            console.log('❌ No commune selected');
            alert('Veuillez sélectionner une commune');
        }
    });
    
    console.log('✅ Commune change form initialized');
}

// Data loading functions
function loadCommuneInfo(territoire) {
    console.log('🔄 Loading commune info for territoire:', territoire);
    
    return fetch(`/api/territoires/${territoire}`)
        .then(response => {
            console.log('📡 Response status for commune info:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('✅ Commune data loaded:', data);
            updateCommuneInfo(data);
        })
        .catch(error => {
            console.error('❌ Failed to load commune info:', error);
        });
}

function loadDemoData(territoire) {
    console.log('🔄 Loading demo data for territoire:', territoire);
    
    return fetch(`/api/data/demo?territoire=${territoire}`)
        .then(response => {
            console.log('📡 Response status for demo data:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('✅ Demo data loaded:', data);
            updateDemoData(data);
        })
        .catch(error => {
            console.error('❌ Failed to load demo data:', error);
        });
}

function loadHabitatData(territoire) {
    console.log('🔄 Loading habitat data for territoire:', territoire);
    
    return fetch(`/api/data/habitat?territoire=${territoire}`)
        .then(response => response.json())
        .then(data => {
            console.log('✅ Habitat data loaded:', data);
            updateHabitatData(data);
        })
        .catch(error => {
            console.error('❌ Failed to load habitat data:', error);
        });
}

function loadEcoData(territoire) {
    console.log('🔄 Loading eco data for territoire:', territoire);
    
    return fetch(`/api/data/economie?territoire=${territoire}`)
        .then(response => response.json())
        .then(data => {
            console.log('✅ Eco data loaded:', data);
            updateEcoData(data);
        })
        .catch(error => {
            console.error('❌ Failed to load eco data:', error);
        });
}

function loadEmploiData(territoire) {
    console.log('🔄 Loading emploi data for territoire:', territoire);
    
    return fetch(`/api/data/emploi?territoire=${territoire}`)
        .then(response => response.json())
        .then(data => {
            console.log('✅ Emploi data loaded:', data);
            updateEmploiData(data);
        })
        .catch(error => {
            console.error('❌ Failed to load emploi data:', error);
        });
}

function loadFormationData(territoire) {
    console.log('🔄 Loading formation data for territoire:', territoire);
    
    return fetch(`/api/data/formation?territoire=${territoire}`)
        .then(response => response.json())
        .then(data => {
            console.log('✅ Formation data loaded:', data);
            updateFormationData(data);
        })
        .catch(error => {
            console.error('❌ Failed to load formation data:', error);
        });
}

function loadSolidariteData(territoire) {
    console.log('🔄 Loading solidarite data for territoire:', territoire);
    
    return fetch(`/api/data/solidarite?territoire=${territoire}`)
        .then(response => response.json())
        .then(data => {
            console.log('✅ Solidarite data loaded:', data);
            updateSolidariteData(data);
        })
        .catch(error => {
            console.error('❌ Failed to load solidarite data:', error);
        });
}

function loadCommunesForComparison() {
    console.log('🔄 Loading communes data for comparison...');
    
    return fetch('/api/territoires')
        .then(response => {
            console.log('📡 Response status for communes:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(communes => {
            console.log('✅ Communes loaded for comparison:', communes.length, 'communes');
            
            // Cache communes data globally for use in comparison selects
            window.communesData = communes;
            
            console.log('✅ Communes data cached for comparison');
        })
        .catch(error => {
            console.error('❌ Failed to load communes for comparison:', error);
        });
}

function loadCommunesForMainSelect() {
    console.log('🔄 Loading communes for main select...');
    
    return fetch('/api/territoires')
        .then(response => {
            console.log('📡 Response status for main communes:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(communes => {
            console.log('✅ Communes loaded for main select:', communes.length, 'communes');
            
            // Populate main commune select
            const $mainSelect = $('.select-commune.territoire-choice');
            if ($mainSelect.length > 0) {
                console.log('🔍 Main select found:', $mainSelect.length, 'elements');
                
                // Destroy existing selectpicker if it exists
                if ($mainSelect.hasClass('selectpicker')) {
                    $mainSelect.selectpicker('destroy');
                }
                
                $mainSelect.empty();
                $mainSelect.append('<option value="">Commune</option>');
                
                communes.forEach(commune => {
                    $mainSelect.append(`<option value="${commune.code_insee_concat}">${commune.lib_com}</option>`);
                });
                
                // Initialize selectpicker for main select
                $mainSelect.selectpicker({
                    liveSearch: true,
                    size: 10,
                    showSubtext: true,
                    selectedTextFormat: 'count > 3'
                });
                
                // Refresh selectpicker to ensure proper initialization
                $mainSelect.selectpicker('refresh');
                
                console.log('✅ Main commune select populated and initialized');
                console.log('🔍 SelectPicker classes:', $mainSelect.attr('class'));
            } else {
                console.log('❌ Main commune select not found');
            }
        })
        .catch(error => {
            console.error('❌ Failed to load communes for main select:', error);
        });
}

// Data update functions
function updateCommuneInfo(data) {
    if (data && data.lib_com) {
        $('.commune-name').text(`${data.lib_com}`);
        document.title = `Portrait de ${data.lib_com} - Portraits de communes`;
        console.log('✅ Commune name updated:', data.lib_com);
    }
}

function updateDemoData(data) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        console.error('❌ No demo data to update');
        return;
    }

    try {
        console.log('🔍 Demo data structure:', data);
        
        // Update demographic indicators
        var lastYear = dataOperations.getMax(data[0], 'annee');
        var dataFileteredLastYear = dataOperations.multipleFiltersData(data[0], { 'annee': String(lastYear) });
        
        if (dataFileteredLastYear.length > 0) {
            $('.population .cc-value').text(dataOperations.roundDec(dataFileteredLastYear[0].pop, 1).toLocaleString());
            $('.population .cc-info').text('Nombre d\'habitants en ' + lastYear);
            $('.tx-evol-pop .cc-value').text(dataOperations.roundDec(dataFileteredLastYear[0].tx_evol, 1).toLocaleString() + ' %');
            $('.tx-evol-pop .cc-info').text('Taux d\'évolution par an sur la période ' + dataFileteredLastYear[0].borne_temp);
            $('.gain-annuel-pop .cc-value').text(dataOperations.roundDec(dataFileteredLastYear[0].gain_pop_annuel, 0).toLocaleString());
            $('.gain-annuel-pop .cc-info').text('Gain d\'habitants par an sur la période ' + dataFileteredLastYear[0].borne_temp);
        }

        // Create demographic charts exactly like in PHP version
        var optionsChart1 = {
            targetBlocChart: '#bloc-chart-1',
            chart: {
                target: '#chart-1',
                downloadButtonTarget: '.download-data',
                printButtonTarget: '.print-data',
                type: 'bar',
                options: chartOptions.chartClassicBarNoLegend,
                name: 'chart-1',
                title: {
                    target: '.stat-title',
                    text: 'Évolution du nombre d\'habitants',
                },
                source: {
                    target: '.source-data',
                    text: 'Insee',
                },
                compare: true,
                filter: {
                    active: false,
                    col: null,
                    alias: null,
                },
                customColor: {
                    active: false,
                    type: null,
                    objColors: null,
                },
            },
            data: {
                sourceUrl: `/api/data/demo?territoire=${window.currentTerritoire}`,
                customFilters: {},
                index: 0,
                label: ['lib_com'],
                groupBy: 'annee',
                mesure: ['pop'],
                dec: 0,
                backgroundColor: ["rgba(210, 207, 230, 0.3)", "rgba(175, 166, 210, 0.4)", "rgba(145, 133, 190, 0.5)", "rgba(112, 97, 168, 0.6)", "rgba(94, 79, 156, 0.7)"],
                borderColor: [],
                width: 0,
            }
        };

        chartOperations.chartConstructor(data, optionsChart1);

        var optionsChart2 = {
            targetBlocChart: '#bloc-chart-2',
            chart: {
                target: '#chart-2',
                downloadButtonTarget: '.download-data',
                printButtonTarget: '.print-data',
                type: 'bar',
                options: chartOptions.chartClassicBarPercentNoLegend,
                name: 'chart-2',
                title: {
                    target: '.stat-title',
                    text: 'Taux d\'évolution annuel moyen',
                },
                source: {
                    target: '.source-data',
                    text: 'Insee',
                },
                compare: true,
                filter: {
                    active: false,
                    col: null,
                    alias: null,
                },
                customColor: {
                    active: false,
                    type: null,
                    objColors: null,
                },
            },
            data: {
                sourceUrl: `/api/data/demo?territoire=${window.currentTerritoire}`,
                customFilters: {},
                index: 0,
                label: ['lib_com'],
                groupBy: 'annee',
                mesure: ['tx_evol'],
                dec: 1,
                backgroundColor: ["rgba(210, 207, 230, 0.3)", "rgba(175, 166, 210, 0.4)", "rgba(145, 133, 190, 0.5)", "rgba(112, 97, 168, 0.6)", "rgba(94, 79, 156, 0.7)"],
                borderColor: [],
                width: 0,
            }
        };

        chartOperations.chartConstructor(data, optionsChart2);

        // Update population gain indicators
        if (data[2] && data[2].length > 0) {
            $('.gain-population .cc-value').text(dataOperations.roundDec(dataFileteredLastYear[0].gain_pop_annuel, 0).toLocaleString());
            $('.gain-population .cc-info').text('Évolution annuelle moyenne du nombre d\'habitants sur la période ' + dataFileteredLastYear[0].borne_temp);
            $('.gain-solde-naturel .cc-value').text(dataOperations.roundDec(data[2][3].solde_naturel, 0).toLocaleString());
            $('.gain-solde-naturel .cc-info').text('Évolution liée au solde naturel sur cette période');
            $('.gain-solde-migratoire .cc-value').text(dataOperations.roundDec(data[2][3].solde_migratoire_apparent, 0).toLocaleString());
            $('.gain-solde-migratoire .cc-info').text('Évolution liée au solde migratoire sur cette période');
        }

        var optionsChart3 = {
            targetBlocChart: '#bloc-chart-3',
            chart: {
                target: '#chart-3',
                downloadButtonTarget: '.download-data',
                printButtonTarget: '.print-data',
                type: 'line',
                options: chartOptions.chartLine,
                name: 'chart-3',
                title: {
                    target: '.stat-title',
                    text: 'Évolution du nombre de naissances et de décès domiciliés',
                },
                source: {
                    target: '.source-data',
                    text: 'Insee, état civil',
                },
                compare: false,
                filter: {
                    active: false,
                    col: null,
                    alias: null,
                },
                customColor: {
                    active: false,
                    type: null,
                    objColors: null,
                },
            },
            data: {
                sourceUrl: `/api/data/demo?territoire=${window.currentTerritoire}`,
                customFilters: {},
                index: 1,
                label: ['Décès', 'Naissances'],
                groupBy: 'annee',
                mesure: ['nb_deces', 'nb_naissances'],
                dec: 1,
                backgroundColor: [],
                borderColor: ["rgba(112, 97, 168, 0.6)", "rgba(175, 166, 210, 0.4)"],
                width: 2,
            }
        };

        chartOperations.chartConstructor(data, optionsChart3);

        var optionsChart4 = {
            targetBlocChart: '#bloc-chart-4',
            chart: {
                target: '#chart-4',
                downloadButtonTarget: '.download-data',
                printButtonTarget: '.print-data',
                type: 'horizontalBar',
                options: chartOptions.chartStackedSum,
                name: 'chart-4',
                title: {
                    target: '.stat-title',
                    text: 'Évolution démographique annuelle moyenne',
                },
                source: {
                    target: '.source-data',
                    text: 'Insee, état civil',
                },
                compare: false,
                filter: {
                    active: false,
                    col: null,
                    alias: null,
                },
                customColor: {
                    active: false,
                    type: null,
                    objColors: null,
                },
            },
            data: {
                sourceUrl: `/api/data/demo?territoire=${window.currentTerritoire}`,
                customFilters: {},
                index: 2,
                label: ['Solde naturel', 'Solde migratoire apparent'],
                groupBy: 'borne_temporelle',
                mesure: ['solde_naturel', 'solde_migratoire_apparent'],
                dec: 0,
                backgroundColor: ["rgba(112, 97, 168, 0.6)", "rgba(175, 166, 210, 0.4)"],
                borderColor: [],
                width: 0,
            }
        };

        chartOperations.chartConstructor(data, optionsChart4);

        // Update age indicators
        if (data[5] && data[5].length > 0) {
            $('.part-m20ans .cc-value').text(dataOperations.roundDec(data[5][0].pop_part_m20ans, 1).toLocaleString() + ' %');
            $('.part-m20ans .cc-info').text('Part des moins de 20 ans en ' + data[5][0].numero_annee);
            $('.part-p60ans .cc-value').text(dataOperations.roundDec(data[5][0].pop_part_p60ans, 1).toLocaleString() + ' %');
            $('.part-p60ans .cc-info').text('Part des plus de 60 ans en ' + data[5][0].numero_annee);
            $('.indice-jeunesse .cc-value').text(dataOperations.roundDec(data[5][0].ind_jeunesse, 1).toLocaleString());
            $('.indice-jeunesse .cc-info').text('Indice de jeunesse en ' + data[5][0].numero_annee);
        }

        var lastYearPyramAge = dataOperations.getMax(data[3], 'numero_annee');

        var optionsChart5 = {
            targetBlocChart: '#bloc-chart-5',
            chart: {
                target: '#chart-5',
                downloadButtonTarget: '.download-data',
                printButtonTarget: '.print-data',
                type: 'horizontalBar',
                options: chartOptions.chartPyramide,
                name: 'chart-5',
                title: {
                    target: '.stat-title',
                    text: 'Pyramide des âges',
                },
                source: {
                    target: '.source-data',
                    text: 'Insee',
                },
                compare: false,
                filter: {
                    active: true,
                    col: 'numero_annee',
                    alias: 'Année',
                },
                customColor: {
                    active: false,
                    type: null,
                    objColors: null,
                },
            },
            data: {
                sourceUrl: `/api/data/demo?territoire=${window.currentTerritoire}`,
                customFilters: { 'numero_annee': String(lastYearPyramAge) },
                index: 3,
                label: ['Hommes', 'Femmes'],
                groupBy: 'lib_ta21',
                mesure: ['pop_h', 'pop_f'],
                dec: 0,
                backgroundColor: ["rgba(112, 97, 168, 0.6)", "rgba(175, 166, 210, 0.4)"],
                borderColor: [],
                width: 0,
            }
        };

        chartOperations.chartConstructor(data, optionsChart5);

        var optionsChart6 = {
            targetBlocChart: '#bloc-chart-6',
            chart: {
                target: '#chart-6',
                downloadButtonTarget: '.download-data',
                printButtonTarget: '.print-data',
                type: 'bar',
                options: chartOptions.chartClassicBarNoLegend,
                name: 'chart-6',
                title: {
                    target: '.stat-title',
                    text: 'Évolution de l\'indice de jeunesse',
                },
                source: {
                    target: '.source-data',
                    text: 'Insee',
                },
                compare: true,
                filter: {
                    active: false,
                    col: null,
                    alias: null,
                },
                customColor: {
                    active: false,
                    type: null,
                    objColors: null,
                },
            },
            data: {
                sourceUrl: `/api/data/demo?territoire=${window.currentTerritoire}`,
                customFilters: {},
                index: 4,
                label: ['lib_com'],
                groupBy: 'annee',
                mesure: ['indice_jeunesse'],
                dec: 1,
                backgroundColor: ["rgba(210, 207, 230, 0.3)", "rgba(175, 166, 210, 0.4)", "rgba(145, 133, 190, 0.5)", "rgba(112, 97, 168, 0.6)", "rgba(94, 79, 156, 0.7)"],
                borderColor: [],
                width: 0,
            }
        };

        chartOperations.chartConstructor(data, optionsChart6);

        // Update households indicators
        if (data[8] && data[8].length > 0) {
            var lastYearMen = dataOperations.getMax(data[8], 'numero_annee');
            var dataFileteredLastYearMen = dataOperations.multipleFiltersData(data[8], { 'numero_annee': String(lastYearMen) });
            $('.nb-menages .cc-value').text(dataOperations.roundDec(dataFileteredLastYearMen[0].nb_men, 0).toLocaleString());
            $('.nb-menages .cc-info').text('Nombre de ménages en ' + lastYearMen);
            $('.taille-moy-menages .cc-value').text(dataOperations.roundDec(dataFileteredLastYearMen[0].taille_moy_men, 1).toLocaleString());
            $('.taille-moy-menages .cc-info').text('Taille moyenne des ménages en ' + lastYearMen);
            $('.part-personnes-seules .cc-value').text(dataOperations.roundDec(dataFileteredLastYearMen[0].part_personnes_seules_men, 1).toLocaleString() + ' %');
            $('.part-personnes-seules .cc-info').text('Part des personnes seules en ' + lastYearMen);

            var optionsChart7 = {
                targetBlocChart: '#bloc-chart-7',
                chart: {
                    target: '#chart-7',
                    downloadButtonTarget: '.download-data',
                    printButtonTarget: '.print-data',
                    type: 'doughnut',
                    options: chartOptions.chartClassicDoughnut,
                    name: 'chart-7',
                    title: {
                        target: '.stat-title',
                        text: 'Répartition du nombre de ménages par types en ' + lastYearMen,
                    },
                    source: {
                        target: '.source-data',
                        text: 'Insee',
                    },
                    compare: true,
                    filter: {
                        active: false,
                        col: null,
                        alias: null,
                    },
                    customColor: {
                        active: false,
                        type: null,
                        objColors: null,
                    },
                },
                data: {
                    sourceUrl: `/api/data/demo?territoire=${window.currentTerritoire}`,
                    customFilters: {},
                    index: 6,
                    label: ['lib_com'],
                    groupBy: 'lib_type_men',
                    mesure: ['nb_men'],
                    dec: 1,
                    backgroundColor: [ "rgba(94, 79, 156, 0.7)", "rgba(112, 97, 168, 0.6)", "rgba(145, 133, 190, 0.5)", "rgba(175, 166, 210, 0.4)", "rgba(210, 207, 230, 0.3)"],
                    borderColor: [],
                    width: 0,
                }
            };

            chartOperations.chartConstructor(data, optionsChart7);

            var optionsChart8 = {
                targetBlocChart: '#bloc-chart-8',
                chart: {
                    target: '#chart-8',
                    downloadButtonTarget: '.download-data',
                    printButtonTarget: '.print-data',
                    type: 'bar',
                    options: chartOptions.chartClassicBarNoLegend,
                    name: 'chart-8',
                    title: {
                        target: '.stat-title',
                        text: 'Évolution de la taille moyenne des ménages',
                    },
                    source: {
                        target: '.source-data',
                        text: 'Insee',
                    },
                    compare: true,
                    filter: {
                        active: false,
                        col: null,
                        alias: null,
                    },
                    customColor: {
                        active: false,
                        type: null,
                        objColors: null,
                    },
                },
                data: {
                    sourceUrl: `/api/data/demo?territoire=${window.currentTerritoire}`,
                    customFilters: {},
                    index: 7,
                    label: ['lib_com'],
                    groupBy: 'numero_annee',
                    mesure: ['taille_moy_men'],
                    dec: 1,
                    backgroundColor: ["rgba(210, 207, 230, 0.3)", "rgba(175, 166, 210, 0.4)", "rgba(145, 133, 190, 0.5)", "rgba(112, 97, 168, 0.6)", "rgba(94, 79, 156, 0.7)"],
                    borderColor: [],
                    width: 0,
                }
            };

            chartOperations.chartConstructor(data, optionsChart8);
        }
        
        console.log('✅ Demo data updated with all charts');
    } catch (error) {
        console.error('❌ Failed to update demographic data:', error);
    }
}

function updateHabitatData(data) {
    console.log('🔄 Updating habitat data');
    console.log('🔍 Habitat data structure:', data);
    
    if (!data || !Array.isArray(data) || data.length === 0) {
        console.error('❌ No habitat data to update');
        return;
    }

    try {
        var maxYearHabitat = dataOperations.getMax(data[0], 'numero_annee');

        $('.nb-log .cc-value').text(dataOperations.roundDec(data[2][0].nb_logts, 0).toLocaleString());
        $('.nb-log .cc-info').text('Nombre de logements dans le parc en ' + maxYearHabitat);
        $('.tx-prop-occup .cc-value').text(dataOperations.roundDec(data[2][0].part_rp_prop_occup, 1).toLocaleString() + ' %');
        $('.tx-prop-occup .cc-info').text('Part des propriétaires occupants en ' + maxYearHabitat);
        $('.tx-maison-ind .cc-value').text(dataOperations.roundDec(data[2][0].part_maisons_ind, 1).toLocaleString() + ' %');
        $('.tx-maison-ind .cc-info').text('Part des maisons individuelles parmi les résidences principales en ' + maxYearHabitat);

        var optionsChartHab1 = {
            targetBlocChart: '#bloc-chart-habitat-1',
            chart: {
                target: '#chart-habitat-1',
                downloadButtonTarget: '.download-data',
                printButtonTarget: '.print-data',
                type: 'doughnut',
                options: chartOptions.chartClassicDoughnut,
                name: 'chart-habitat-1',
                title: {
                    target: '.stat-title',
                    text: 'Répartition du nombre de logements selon le statut d\'occupation en ' + maxYearHabitat,
                },
                source: {
                    target: '.source-data',
                    text: 'Insee',
                },
                compare: false,
                filter: {
                    active: false,
                    col: null,
                    alias: null,
                },
                customColor: {
                    active: false,
                    type: null,
                    objColors: null,
                },
            },
            data: {
                sourceUrl: `/api/data/habitat?territoire=${window.currentTerritoire}`,
                customFilters: {},
                index: 0,
                label: ['numero_annee'],
                groupBy: 'type_occup',
                mesure: ['nb_rp'],
                dec: 1,
                backgroundColor: ["rgba(209, 92, 22, 0.8)", "rgba(238, 113, 42, 0.7)", "rgba(244, 153, 93, 0.7)", "rgba(248, 182, 138, 0.6)", "rgba(252, 219, 203, 0.6)", "rgba(252, 219, 203, 0.4)"],
                borderColor: [],
                width: 0,
            }
        };

        chartOperations.chartConstructor(data, optionsChartHab1);

        var optionsChartHab2 = {
            targetBlocChart: '#bloc-chart-habitat-2',
            chart: {
                target: '#chart-habitat-2',
                downloadButtonTarget: '.download-data',
                printButtonTarget: '.print-data',
                type: 'bar',
                options: chartOptions.chartClassicBarNoLegend,
                name: 'chart-habitat-2',
                title: {
                    target: '.stat-title',
                    text: 'Évolution du nombre de résidences principales',
                },
                source: {
                    target: '.source-data',
                    text: 'Insee',
                },
                compare: true,
                filter: {
                    active: false,
                    col: null,
                    alias: null,
                },
                customColor: {
                    active: false,
                    type: null,
                    objColors: null,
                },
            },
            data: {
                sourceUrl: `/api/data/habitat?territoire=${window.currentTerritoire}`,
                customFilters: {},
                index: 1,
                label: ['lib_com'],
                groupBy: 'numero_annee',
                mesure: ['nb_logts_rp'],
                dec: 1,
                backgroundColor: ["rgba(248, 182, 138, 0.4)", "rgba(244, 153, 93, 0.5)", "rgba(238, 113, 42, 0.6)", "rgba(209, 92, 22, 0.7)" ],
                borderColor: [],
                width: 0,
            }
        };

        chartOperations.chartConstructor(data, optionsChartHab2);

        // Additional housing indicators
        if (data[6] && data[6].length > 0) {
            $('.nb-log-neuf-commences .cc-value').text(dataOperations.roundDec(data[6][0].nb_logts_commences_moy_4ans, 0).toLocaleString());
            $('.nb-log-neuf-commences .cc-info').text('Nombre de logements neufs commencés en date de prise en compte en ' + maxYearHabitat);
        }
        
        if (data[5] && data[5].length > 0) {
            $('.nb-log-occasion-vendus .cc-value').text(dataOperations.roundDec(data[5][0].nb_logts_vendus_moy_4ans, 0).toLocaleString());
            $('.nb-log-occasion-vendus .cc-info').text('Nombre de logements d\'occasion vendus en moyenne au cours des 4 dernières années en date de prise en compte');
            $('.nb-transactions-m4 .cc-value').text(dataOperations.roundDec(data[5][0].part_collectif_logts_vendus_moy_4ans, 0).toLocaleString()  + ' %');
            $('.nb-transactions-m4 .cc-info').text('Part du collectif dans cette moyenne sur 4 ans en date de prise en compte (avec logements en résidences)');
        }

        var optionsChartHab3 = {
            targetBlocChart: '#bloc-chart-habitat-3',
            chart: {
                target: '#chart-habitat-3',
                downloadButtonTarget: '.download-data',
                printButtonTarget: '.print-data',
                type: 'bar',
                options: chartOptions.chartClassicBarNoLegend,
                name: 'chart-habitat-3',
                title: {
                    target: '.stat-title',
                    text: 'Évolution du nombre de logements neufs commencés',
                },
                source: {
                    target: '.source-data',
                    text: 'Sit@adel2, Audiar',
                },
                compare: true,
                filter: {
                    active: false,
                    col: null,
                    alias: null,
                },
                customColor: {
                    active: false,
                    type: null,
                    objColors: null,
                },
            },
            data: {
                sourceUrl: `/api/data/habitat?territoire=${window.currentTerritoire}`,
                customFilters: {},
                index: 3,
                label: ['lib_com'],
                groupBy: 'annee',
                mesure: ['nb_logts_commences'],
                dec: 1,
                backgroundColor: ["rgba(248, 182, 138, 0.4)", "rgba(244, 153, 93, 0.5)", "rgba(238, 113, 42, 0.6)", "rgba(209, 92, 22, 0.7)" ],
                borderColor: [],
                width: 0,
            }
        };

        chartOperations.chartConstructor(data, optionsChartHab3);

        var optionsChartHab4 = {
            targetBlocChart: '#bloc-chart-habitat-4',
            chart: {
                target: '#chart-habitat-4',
                downloadButtonTarget: '.download-data',
                printButtonTarget: '.print-data',
                type: 'bar',
                options: chartOptions.chartStackedSum,
                name: 'chart-habitat-4',
                title: {
                    target: '.stat-title',
                    text: 'Évolution du nombre de logements d\'occasion vendus par type',
                },
                source: {
                    target: '.source-data',
                    text: 'Demande de valeurs foncières (DVF), traitements Audiar',
                },
                compare: false,
                filter: {
                    active: false,
                    col: null,
                    alias: null,
                },
                customColor: {
                    active: false,
                    type: null,
                    objColors: null,
                },
            },
            data: {
                sourceUrl: `/api/data/habitat?territoire=${window.currentTerritoire}`,
                customFilters: {},
                index: 4,
                label: ['Maisons', 'Appartements'],
                groupBy: 'numero_annee',
                mesure: ['nb_maison_occasions_vendus', 'nb_appart_occasions_vendus'],
                dec: 0,
                backgroundColor: ["rgba(209, 92, 22, 0.6)", "rgba(248, 182, 138, 0.6)"],
                borderColor: [],
                width: 0,
            }
        };

        chartOperations.chartConstructor(data, optionsChartHab4);
        
        console.log('✅ Habitat indicators updated with all charts');
    } catch (error) {
        console.error('❌ Failed to update habitat data:', error);
    }
}

function updateEcoData(data) {
    console.log('🔄 Updating eco data');
    console.log('🔍 Eco data structure:', data);
    
    if (!data || !Array.isArray(data) || data.length === 0) {
        console.error('❌ No eco data to update');
        return;
    }

    try {
        var nbEtablSum = dataOperations.groupBySum(data[0], 'lib_com', 'nb_etabl_cmna');
        var maxYear = dataOperations.getMax(data[1], 'numero_annee');
        var txCreaEtabMaxYear = dataOperations.multipleFiltersData(data[1], { 'numero_annee': String(maxYear) });

        $('.nb-etab .cc-value').text(dataOperations.roundDec(nbEtablSum[0].nb_etabl_cmna, 0).toLocaleString());
        $('.nb-etab .cc-info').text('Nombre de créations d\'établissements en ' + nbEtablSum[0].numero_annee);
        $('.tx-crea-etab .cc-value').text(dataOperations.roundDec(txCreaEtabMaxYear[0].tx_crea_etab, 1).toLocaleString() + ' %');
        $('.tx-crea-etab .cc-info').text('Taux de création d\'établissements en ' + txCreaEtabMaxYear[0].numero_annee);
        
        if (data[2] && data[2].length > 0) {
            $('.surf-loc-aut .cc-value').text(dataOperations.roundDec(data[2][0].surf_loc_aut_m2, 0).toLocaleString() + ' m²');
            $('.surf-loc-aut .cc-info').text('Surface des locaux d\'activité autorisés en ' + maxYear);
        }

        var optionsChartEco1 = {
            targetBlocChart: '#bloc-chart-eco-1',
            chart: {
                target: '#chart-eco-1',
                downloadButtonTarget: '.download-data',
                printButtonTarget: '.print-data',
                type: 'doughnut',
                options: chartOptions.chartClassicDoughnut,
                name: 'chart-eco-1',
                title: {
                    target: '.stat-title',
                    text: 'Répartition du nombre de créations d\'établissements par type d\'activité en ' + maxYear,
                },
                source: {
                    target: '.source-data',
                    text: 'Insee, répertoire des entreprises et des établissements (REE)',
                },
                compare: false,
                filter: {
                    active: false,
                    col: null,
                    alias: null,
                },
                customColor: {
                    active: false,
                    type: null,
                    objColors: null,
                },
            },
            data: {
                sourceUrl: `/api/data/economie?territoire=${window.currentTerritoire}`,
                customFilters: {},
                index: 0,
                label: ['numero_annee'],
                groupBy: 'lib_cat5',
                mesure: ['nb_etabl_cmna'],
                dec: 0,
                backgroundColor: ["rgba(0, 119, 171, 0.8)", "rgba(66, 152, 196, 0.7)", "rgba(114, 173, 210, 0.6)", "rgba(165, 196, 222, 0.5)", "rgba(199, 216, 230, 0.4)"],
                borderColor: [],
                width: 0,
            }
        };

        chartOperations.chartConstructor(data, optionsChartEco1);

        var optionsChartEco2 = {
            targetBlocChart: '#bloc-chart-eco-2',
            chart: {
                target: '#chart-eco-2',
                downloadButtonTarget: '.download-data',
                printButtonTarget: '.print-data',
                type: 'bar',
                options: chartOptions.chartClassicBarNoLegend,
                name: 'chart-eco-2',
                title: {
                    target: '.stat-title',
                    text: 'Évolution du nombre de créations d\'établissements',
                },
                source: {
                    target: '.source-data',
                    text: 'Insee, répertoire des entreprises et des établissements (REE)',
                },
                compare: true,
                filter: {
                    active: false,
                    col: null,
                    alias: null,
                },
                customColor: {
                    active: false,
                    type: null,
                    objColors: null,
                },
            },
            data: {
                sourceUrl: `/api/data/economie?territoire=${window.currentTerritoire}`,
                customFilters: {},
                index: 1,
                label: ['lib_com'],
                groupBy: 'numero_annee',
                mesure: ['nb_crea_etabl'],
                dec: 0,
                backgroundColor: ["rgba(199, 216, 230, 0.4)",  "rgba(170, 202, 221, 0.5)", "rgba(142, 188, 213, 0.5)", "rgba(113, 174, 204, 0.6)", "rgba(85, 160, 196, 0.6)", "rgba(56, 146, 187, 0.7)", "rgba(28, 132, 179, 0.7)", "rgba(0, 119, 171, 0.8)"],
                borderColor: [],
                width: 0,
            }
        };

        chartOperations.chartConstructor(data, optionsChartEco2);
        
        console.log('✅ Eco indicators updated with all charts');
    } catch (error) {
        console.error('❌ Failed to update eco data:', error);
    }
}

function updateEmploiData(data) {
    console.log('🔄 Updating emploi data');
    console.log('🔍 Emploi data structure:', data);
    
    if (!data || !Array.isArray(data) || data.length === 0) {
        console.error('❌ No emploi data to update');
        return;
    }

    try {
        var maxYearEmploi = dataOperations.getMax(data[2], 'numero_annee');

        $('.nb-emplois .cc-value').text(dataOperations.roundDec(data[2][0].nb_emplois, 0).toLocaleString());
        $('.nb-emplois .cc-info').text('Nombre d\'emplois total en ' + maxYearEmploi);
        $('.tx-evol-emploi .cc-value').text(dataOperations.roundDec(data[2][0].evol_emplois, 1).toLocaleString() + ' %');
        $('.tx-evol-emploi .cc-info').text('Taux d\'évolution des emplois sur la période ' + data[2][0].borne_temp);
        
        if (data[1] && data[1].length > 0) {
            var agricultureData = dataOperations.multipleFiltersData(data[1], {'lib_sect_act' : 'Agriculture'});
            if (agricultureData.length > 0) {
                $('.part-emploi-agricole .cc-value').text(dataOperations.roundDec(agricultureData[0].nb_emplois, 0).toLocaleString() + ' %');
                $('.part-emploi-agricole .cc-info').text('Part de l\'emploi agricole en ' + maxYearEmploi);
            }
        }

        var optionsChartEmploi1 = {
            targetBlocChart: '#bloc-chart-emploi-1',
            chart: {
                target: '#chart-emploi-1',
                downloadButtonTarget: '.download-data',
                printButtonTarget: '.print-data',
                type: 'bar',
                options: chartOptions.chartClassicBarNoLegend,
                name: 'chart-emploi-1',
                title: {
                    target: '.stat-title',
                    text: 'Évolution du nombre d\'emplois total',
                },
                source: {
                    target: '.source-data',
                    text: 'Insee, estimations d\'emploi',
                },
                compare: true,
                filter: {
                    active: false,
                    col: null,
                    alias: null,
                },
                customColor: {
                    active: false,
                    type: null,
                    objColors: null,
                },
            },
            data: {
                sourceUrl: `/api/data/emploi?territoire=${window.currentTerritoire}`,
                customFilters: {},
                index: 2,
                label: ['lib_com'],
                groupBy: 'numero_annee',
                mesure: ['nb_emplois'],
                dec: 0,
                backgroundColor: ["rgba(210, 207, 230, 0.3)", "rgba(175, 166, 210, 0.4)", "rgba(145, 133, 190, 0.5)", "rgba(112, 97, 168, 0.6)", "rgba(94, 79, 156, 0.7)"],
                borderColor: [],
                width: 0,
            }
        };

        chartOperations.chartConstructor(data, optionsChartEmploi1);

        var optionsChartEmploi2 = {
            targetBlocChart: '#bloc-chart-emploi-2',
            chart: {
                target: '#chart-emploi-2',
                downloadButtonTarget: '.download-data',
                printButtonTarget: '.print-data',
                type: 'doughnut',
                options: chartOptions.chartClassicDoughnut,
                name: 'chart-emploi-2',
                title: {
                    target: '.stat-title',
                    text: 'Répartition des emplois par catégorie socioprofessionnelle en ' + maxYearEmploi,
                },
                source: {
                    target: '.source-data',
                    text: 'Insee, estimations d\'emploi',
                },
                compare: true,
                filter: {
                    active: false,
                    col: null,
                    alias: null,
                },
                customColor: {
                    active: false,
                    type: null,
                    objColors: null,
                },
            },
            data: {
                sourceUrl: `/api/data/emploi?territoire=${window.currentTerritoire}`,
                customFilters: {},
                index: 0,
                label: ['lib_com'],
                groupBy: 'lib_csp',
                mesure: ['nb_emplois'],
                dec: 0,
                backgroundColor: ["rgba(210, 207, 230, 0.3)", "rgba(175, 166, 210, 0.4)", "rgba(145, 133, 190, 0.5)", "rgba(112, 97, 168, 0.6)", "rgba(94, 79, 156, 0.7)"],
                borderColor: [],
                width: 0,
            }
        };

        chartOperations.chartConstructor(data, optionsChartEmploi2);

        var optionsChartEmploi3 = {
            targetBlocChart: '#bloc-chart-emploi-3',
            chart: {
                target: '#chart-emploi-3',
                downloadButtonTarget: '.download-data',
                printButtonTarget: '.print-data',
                type: 'doughnut',
                options: chartOptions.chartClassicDoughnut,
                name: 'chart-emploi-3',
                title: {
                    target: '.stat-title',
                    text: 'Répartition des emplois par secteur d\'activité en ' + maxYearEmploi,
                },
                source: {
                    target: '.source-data',
                    text: 'Insee, estimations d\'emploi',
                },
                compare: true,
                filter: {
                    active: false,
                    col: null,
                    alias: null,
                },
                customColor: {
                    active: false,
                    type: null,
                    objColors: null,
                },
            },
            data: {
                sourceUrl: `/api/data/emploi?territoire=${window.currentTerritoire}`,
                customFilters: {},
                index: 1,
                label: ['lib_com'],
                groupBy: 'lib_sect_act',
                mesure: ['nb_emplois'],
                dec: 0,
                backgroundColor: ["rgba(210, 207, 230, 0.3)", "rgba(175, 166, 210, 0.4)", "rgba(145, 133, 190, 0.5)", "rgba(112, 97, 168, 0.6)", "rgba(94, 79, 156, 0.7)"],
                borderColor: [],
                width: 0,
            }
        };

        chartOperations.chartConstructor(data, optionsChartEmploi3);

        var optionsChartEmploi4 = {
            targetBlocChart: '#bloc-chart-emploi-4',
            chart: {
                target: '#chart-emploi-4',
                downloadButtonTarget: '.download-data',
                printButtonTarget: '.print-data',
                type: 'doughnut',
                options: chartOptions.chartClassicDoughnut,
                name: 'chart-emploi-4',
                title: {
                    target: '.stat-title',
                    text: 'Répartition des actifs en emploi par lieu de travail en ' + maxYearEmploi,
                },
                source: {
                    target: '.source-data',
                    text: 'Insee, recensement de la population',
                },
                compare: true,
                filter: {
                    active: false,
                    col: null,
                    alias: null,
                },
                customColor: {
                    active: false,
                    type: null,
                    objColors: null,
                },
            },
            data: {
                sourceUrl: `/api/data/emploi?territoire=${window.currentTerritoire}`,
                customFilters: {},
                index: 3,
                label: ['lib_com'],
                groupBy: 'lib_loc_emploi',
                mesure: ['nb_actifs_occup'],
                dec: 0,
                backgroundColor: ["rgba(210, 207, 230, 0.3)", "rgba(175, 166, 210, 0.4)", "rgba(145, 133, 190, 0.5)", "rgba(112, 97, 168, 0.6)", "rgba(94, 79, 156, 0.7)"],
                borderColor: [],
                width: 0,
            }
        };

        chartOperations.chartConstructor(data, optionsChartEmploi4);
        
        console.log('✅ Emploi indicators updated with all charts');
    } catch (error) {
        console.error('❌ Failed to update emploi data:', error);
    }
}

function updateFormationData(data) {
    console.log('🔄 Updating formation data');
    
    if (!data || !Array.isArray(data) || data.length === 0) {
        console.error('❌ No formation data to update');
        return;
    }

    try {
        // Update primary education indicators
        if (!data[2] || !data[2][0]) {
            console.error('❌ Primary education data missing');
        } else {
            $('.nb-eleves-premier-degre .cc-value').text(dataOperations.roundDec(data[2][0].nb_eleves, 0).toLocaleString());
            $('.nb-eleves-premier-degre .cc-info').text('Nombre d\'élèves du premier degré en ' + data[2][0].numero_annee);
            $('.evol-nb-eleves .cc-value').text(dataOperations.roundDec(data[2][0].evol_eleves_4ans, 1).toLocaleString() + ' %');
            $('.evol-nb-eleves .cc-info').text('Taux d\'évolution du nombre d\'élèves sur la période ' + data[2][0].borne_temp);
        }
        
        // Update secondary education indicators
        if (data[3] && data[3].length > 0) {
            $('.nb-eleves-second-degre .cc-value').text(dataOperations.roundDec(data[3][0].nb_eleves_second, 0).toLocaleString());
            $('.nb-eleves-second-degre .cc-info').text('Nombre d\'élèves du second degré en ' + data[3][0].numero_annee);
        } else {
            console.warn('⚠️ Secondary education data missing');
        }

        // Chart 1 - Primary education
        if (!data[0] || data[0].length === 0) {
            console.error('❌ Cannot create chart-formation-1: no primary education data');
        } else {
            const chart1Element = document.getElementById('chart-formation-1');
            if (!chart1Element) {
                console.error('❌ Canvas element #chart-formation-1 not found');
            } else {
                var optionsChartFormation1 = {
                    targetBlocChart: '#bloc-chart-formation-1',
                    chart: {
                        target: '#chart-formation-1',
                        downloadButtonTarget: '.download-data',
                        printButtonTarget: '.print-data',
                        type: 'line',
                        options: chartOptions.chartLine,
                        name: 'chart-formation-1',
                        title: {
                            target: '.stat-title',
                            text: 'Évolution du nombre d\'élèves du premier degré',
                        },
                        source: {
                            target: '.source-data',
                            text: 'Académie de Rennes',
                        },
                        compare: false,
                        filter: {
                            active: false,
                            col: null,
                            alias: null,
                        },
                        customColor: {
                            active: false,
                            type: null,
                            objColors: null,
                        },
                    },
                    data: {
                        sourceUrl: `/api/data/formation?territoire=${window.currentTerritoire}`,
                        customFilters: {},
                        index: 0,
                        label: ['Pré-élémentaire', 'Élémentaire'],
                        groupBy: 'numero_annee',
                        mesure: ['nb_eleves_pre_elementaire', 'nb_eleves_elementaire'],
                        dec: 1,
                        backgroundColor: [],
                        borderColor: ['#fc97a5', '#C16271'],
                        width: 2,
                    }
                };

                try {
                    chartOperations.chartConstructor(data, optionsChartFormation1);
                } catch (chartError) {
                    console.error('❌ Error creating chart-formation-1:', chartError);
                }
            }
        }

        // Chart 2 - Secondary education
        if (!data[1] || data[1].length === 0) {
            console.warn('⚠️ No secondary education data - this might be normal for this territory');
            
            // Show informative message instead of chart
            const chart2Container = document.getElementById('bloc-chart-formation-2');
            if (chart2Container) {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'no-data-message';
                messageDiv.style.cssText = 'text-align: center; color: #666; padding: 20px; font-style: italic;';
                messageDiv.textContent = 'Aucune donnée disponible pour l\'enseignement secondaire sur ce territoire';
                
                const canvas = chart2Container.querySelector('#chart-formation-2');
                if (canvas) {
                    canvas.style.display = 'none';
                }
                
                if (!chart2Container.querySelector('.no-data-message')) {
                    chart2Container.appendChild(messageDiv);
                }
            }
        } else {
            const chart2Element = document.getElementById('chart-formation-2');
            if (!chart2Element) {
                console.error('❌ Canvas element #chart-formation-2 not found');
            } else {
                var optionsChartFormation2 = {
                    targetBlocChart: '#bloc-chart-formation-2',
                    chart: {
                        target: '#chart-formation-2',
                        downloadButtonTarget: '.download-data',
                        printButtonTarget: '.print-data',
                        type: 'line',
                        options: chartOptions.chartLine,
                        name: 'chart-formation-2',
                        title: {
                            target: '.stat-title',
                            text: 'Évolution du nombre d\'élèves du second degré',
                        },
                        source: {
                            target: '.source-data',
                            text: 'Académie de Rennes',
                        },
                        compare: false,
                        filter: {
                            active: false,
                            col: null,
                            alias: null,
                        },
                        customColor: {
                            active: false,
                            type: null,
                            objColors: null,
                        },
                    },
                    data: {
                        sourceUrl: `/api/data/formation?territoire=${window.currentTerritoire}`,
                        customFilters: {},
                        index: 1,
                        label: ['Collège', 'Lycée'],
                        groupBy: 'numero_annee',
                        mesure: ['nb_eleves_college', 'nb_eleves_lycee'],
                        dec: 1,
                        backgroundColor: [],
                        borderColor: ['#fc97a5', '#C16271'],
                        width: 2,
                    }
                };

                try {
                    chartOperations.chartConstructor(data, optionsChartFormation2);
                } catch (chartError) {
                    console.error('❌ Error creating chart-formation-2:', chartError);
                }
            }
        }
        
        console.log('✅ Formation indicators updated with all charts');
    } catch (error) {
        console.error('❌ Failed to update formation data:', error);
    }
}

function updateSolidariteData(data) {
    console.log('🔄 Updating solidarite data');
    console.log('🔍 Solidarite data structure:', data);
    
    if (!data || !Array.isArray(data) || data.length === 0) {
        console.error('❌ No solidarite data to update');
        return;
    }

    try {
        var maxYearRevenu = dataOperations.getMax(data[0], 'numero_annee');

        $('.revenu-dispo-median-uc .cc-value').text(dataOperations.multipleFiltersData(data[1], { 'indicateurs': 'Médiane du niveau de vie' })[0]['val'] ? dataOperations.roundDec(dataOperations.multipleFiltersData(data[1], { 'indicateurs': 'Médiane du niveau de vie' })[0]['val'], 1).toLocaleString() + ' €' : 'Non connu');
        $('.revenu-dispo-median-uc .cc-info').text('Revenu disponible médian par UC en ' + data[1][0].numero_annee);
        $('.part-men-fisc-impose .cc-value').text(dataOperations.multipleFiltersData(data[1], { 'indicateurs': 'Part des ménages fiscaux imposés' })[0]['val'] ? dataOperations.roundDec(dataOperations.multipleFiltersData(data[1], { 'indicateurs': 'Part des ménages fiscaux imposés' })[0]['val'], 1).toLocaleString() + ' %' : 'Non connu');
        $('.part-men-fisc-impose .cc-info').text('Part des ménages fiscaux imposés en ' + data[1][0].numero_annee);
        $('.tx-pauvrete-60 .cc-value').text(dataOperations.multipleFiltersData(data[1], { 'indicateurs': 'Taux de pauvreté (seuil 60 %)' })[0]['val'] ? dataOperations.roundDec(dataOperations.multipleFiltersData(data[1], { 'indicateurs': 'Taux de pauvreté (seuil 60 %)' })[0]['val'], 1).toLocaleString() + ' %' : 'Non connu');
        $('.tx-pauvrete-60 .cc-info').text('Taux de pauvreté au seuil de 60% en ' + data[1][0].numero_annee);

        var optionsChartSolidarite1 = {
            targetBlocChart: '#bloc-chart-solidarite-1',
            chart: {
                target: '#chart-solidarite-1',
                downloadButtonTarget: '.download-data',
                printButtonTarget: '.print-data',
                type: 'horizontalBar',
                options: chartOptions.chartClassicBarNoLegend,
                name: 'chart-solidarite-1',
                title: {
                    target: '.stat-title',
                    text: 'Revenus disponibles par UC en ' + maxYearRevenu,
                },
                source: {
                    target: '.source-data',
                    text: 'Insee, FiLoSoFi',
                },
                compare: false,
                filter: {
                    active: false,
                    col: null,
                    alias: null,
                },
                customColor: {
                    active: false,
                    type: null,
                    objColors: null,
                },
            },
            data: {
                sourceUrl: `/api/data/solidarite?territoire=${window.currentTerritoire}`,
                customFilters: { 'indicateurs': ['Médiane du niveau de vie', 'Niveau de vie décile 1', 'Niveau de vie décile 9'] },
                index: 0,
                label: ['numero_annee'],
                groupBy: 'indicateurs',
                mesure: ['val'],
                dec: 0,
                backgroundColor: ["rgba(58, 68, 103, 0.5)", "rgba(58, 68, 103, 0.3)", "rgba(58, 68, 103, 0.1)"],
                borderColor: [],
                width: 0,
            }
        };

        chartOperations.chartConstructor(data, optionsChartSolidarite1);

        var optionsChartSolidarite2 = {
            targetBlocChart: '#bloc-chart-solidarite-2',
            chart: {
                target: '#chart-solidarite-2',
                downloadButtonTarget: '.download-data',
                printButtonTarget: '.print-data',
                type: 'horizontalBar',
                options: chartOptions.chartClassicBarPercentNoLegend,
                name: 'chart-solidarite-2',
                title: {
                    target: '.stat-title',
                    text: 'Origine des revenus disponibles par UC en ' + maxYearRevenu,
                },
                source: {
                    target: '.source-data',
                    text: 'Insee, FiLoSoFi',
                },
                compare: false,
                filter: {
                    active: false,
                    col: null,
                    alias: null,
                },
                customColor: {
                    active: false,
                    type: null,
                    objColors: null,
                },
            },
            data: {
                sourceUrl: `/api/data/solidarite?territoire=${window.currentTerritoire}`,
                customFilters: { 'indicateurs': ["Part des revenus d'activités", 'Part des pensions, retraites et rentes', 'Part des revenus du patrimoine et autres', 'Part des prestations sociales', 'Part des impôts'] },
                index: 0,
                label: ['numero_annee'],
                groupBy: 'indicateurs',
                mesure: ['val'],
                dec: 0,
                backgroundColor: ["rgba(58, 68, 103, 0.5)", "rgba(58, 68, 103, 0.4)", "rgba(58, 68, 103, 0.3)", "rgba(58, 68, 103, 0.2)", "rgba(58, 68, 103, 0.1)"],
                borderColor: [],
                width: 0,
            }
        };

        chartOperations.chartConstructor(data, optionsChartSolidarite2);
        
        console.log('✅ Solidarite indicators updated with all charts');
    } catch (error) {
        console.error('❌ Failed to update solidarite data:', error);
    }
} 