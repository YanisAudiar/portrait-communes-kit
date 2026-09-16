"use strict";

var chartOptions = (function () {

    var chartClassicBar = {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    callback: function (value, index) {
                        return value.toLocaleString();
                    }
                },
                gridLines: {
                    display: false
                }
            }],
            xAxes: [{
                ticks: {
                    beginAtZero: true,
                    callback: function (value, index) {
                        return value.toLocaleString();
                    },
                },
                gridLines: {
                    display: false
                }
            }]
        },
        tooltips: {
            callbacks: {
                label: function (tooltipItem, data) {
                    var label = data.datasets[tooltipItem.datasetIndex].label;
                    var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                    return label + ' : ' + value.toLocaleString();
                }
            }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                formatter: function (value, context) {
                    return value.toLocaleString();
                },
                anchor: 'middle',
                align: 'middle',
                display: 'auto',
                font: {
                    size: '10'
                }
            }
        }
    }

    var chartClassicBarNoLegend = {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    callback: function (value, index) {
                        return value.toLocaleString();
                    }
                },
                gridLines: {
                    display: false
                }
            }],
            xAxes: [{
                ticks: {
                    beginAtZero: true,
                    callback: function (value, index) {
                        return value.toLocaleString();
                    },
                },
                gridLines: {
                    display: false
                }
            }]
        },
        tooltips: {
            callbacks: {
                label: function (tooltipItem, data) {
                    var label = data.datasets[tooltipItem.datasetIndex].label;
                    var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                    return label + ' : ' + value.toLocaleString();
                }
            }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                formatter: function (value, context) {
                    return value.toLocaleString();
                },
                anchor: 'middle',
                align: 'middle',
                display: 'auto',
                font: {
                    size: '10'
                }
            }
        },
        legend: {
            display: false
        }
    }

    var chartClassicBarPercent = {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    callback: function (value, index) {
                        return value.toLocaleString();
                    }
                },
                gridLines: {
                    display: false
                }
            }],
            xAxes: [{
                ticks: {
                    beginAtZero: true,
                    callback: function (value, index) {
                        return value.toLocaleString();
                    },
                },
                gridLines: {
                    display: false
                }
            }]
        },
        tooltips: {
            callbacks: {
                label: function (tooltipItem, data) {
                    var label = data.datasets[tooltipItem.datasetIndex].label;
                    var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                    return label + ' : ' + value.toLocaleString() + ' %';
                }
            }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                formatter: function (value, context) {
                    return value.toLocaleString() + ' %';
                },
                anchor: 'middle',
                align: 'middle',
                display: 'auto',
                font: {
                    size: '10'
                }
            }
        }
    }

    var chartClassicBarPercentNoLegend = {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    callback: function (value, index) {
                        return value.toLocaleString();
                    }
                },
                gridLines: {
                    display: false
                }
            }],
            xAxes: [{
                ticks: {
                    beginAtZero: true,
                    callback: function (value, index) {
                        return value.toLocaleString();
                    },
                },
                gridLines: {
                    display: false
                }
            }]
        },
        tooltips: {
            callbacks: {
                label: function (tooltipItem, data) {
                    var label = data.datasets[tooltipItem.datasetIndex].label;
                    var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                    return label + ' : ' + value.toLocaleString() + ' %';
                }
            }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                formatter: function (value, context) {
                    return value.toLocaleString() + ' %';
                },
                anchor: 'middle',
                align: 'middle',
                display: 'auto',
                font: {
                    size: '10'
                }
            }
        },
        legend: {
            display: false
        }
    }

    var chartLine = {
        legend: {
            labels: {
                usePointStyle: true
            }
        },
        scales: {
            xAxes: [{
                stacked: true,
                ticks: {
                    callback: function (value) {
                        return value.toLocaleString();
                    }
                },
                gridLines: {
                    display: false
                }
            }],
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    callback: function (value, index, values) {
                        return value.toLocaleString();
                    }
                },
                gridLines: {
                    display: false
                }
            }]
        },
        beginAtZero: true,
        tooltips: {
            callbacks: {
                label: function (tooltipItem, data) {
                    var label = data.datasets[tooltipItem.datasetIndex].label;
                    var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                    return label + ' : ' + value.toLocaleString();
                }
            }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                formatter: function (value, context) {
                    return value.toLocaleString();
                },
                anchor: 'middle',
                align: 'top',
                display: 'auto',
                font: {
                    size: '10'
                }
            }
        }
    }

    var chartStackedSum = {
        scales: {
            xAxes: [{
                stacked: true,
                ticks: {
                    callback: function (value) {
                        return value.toLocaleString(); // truncate
                    },
                },
                gridLines: {
                    display: false
                }
            }],
            yAxes: [{
                stacked: true,
                ticks: {
                    beginAtZero: true,
                },
                gridLines: {
                    drawBorder: true,
                    display: false
                }
            }]
        },
        beginAtZero: true,
        tooltips: {
            mode: 'label',
            callbacks: {
                afterTitle: function () {
                    window.total = 0;
                },
                label: function (tooltipItem, data) {
                    var label = data.datasets[tooltipItem.datasetIndex].label;
                    var valor = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                    window.total += valor;
                    return label + " : " + valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                },
                footer: function () {
                    return "Somme : " + window.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                }
            }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                formatter: function (value, context) {
                    return value.toLocaleString();
                },
                anchor: 'middle',
                align: 'middle',
                display: 'auto',
                font: {
                    size: '10'
                }
            }
        }
    }

    var chartPyramide = {
        scales: {
            xAxes: [{
                stacked: true,
                ticks: {
                    callback: function (value) {
                        return Math.abs(value).toLocaleString();
                    },
                },
                gridLines: {
                    display: false
                }
            }],
            yAxes: [{
                stacked: true,
                ticks: {
                    beginAtZero: true,
                },
                gridLines: {
                    drawBorder: true,
                    display: false
                }
            }]
        },
        beginAtZero: true,
        tooltips: {
            mode: 'label',
            callbacks: {
                label: function (tooltipItem, data) {
                    var label = data.datasets[tooltipItem.datasetIndex].label;
                    var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                    return label + ' : ' + Math.abs(value).toLocaleString();
                }
            }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                display: false
            }
        }
    }

    var chartHorizontal = {
        scales: {
            xAxes: [{
                ticks: {
                    callback: function (value) {
                        return value.toLocaleString(); // truncate
                    },
                    stepSize: 20000
                },
                gridLines: {
                    display: false
                }
            }],
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                },
                gridLines: {
                    drawBorder: true,
                    display: false
                }
            }]
        },
        beginAtZero: true,
        tooltips: {
            mode: 'label',
            callbacks: {
                label: function (tooltipItem, data) {
                    var label = data.datasets[tooltipItem.datasetIndex].label;
                    var value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                    return label + ' : ' + value.toLocaleString();
                }
            }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                formatter: function (value, context) {
                    return value.toLocaleString();
                },
                anchor: 'end',
                align: 'middle',
                display: 'auto',
                font: {
                    size: '10'
                }
            }
        }
    }

    var chartClassicDoughnut = {
        tooltips: {
            callbacks: {
                label: function (tooltipItem, data) {
                    var dataset = data.datasets[tooltipItem.datasetIndex];
                    var meta = dataset._meta[Object.keys(dataset._meta)[0]];
                    var total = meta.total;
                    var currentValue = dataset.data[tooltipItem.index];
                    var percentage = ((currentValue / total * 100)).toFixed(1);
                    return Number(currentValue).toLocaleString() + ' (' + percentage + ' %)';
                },
                title: function (tooltipItem, data) {
                    return data.labels[tooltipItem[0].index];
                }
            }
        },
        responsive: true,
        animation: false,
        maintainAspectRatio: false,
        plugins: {
            datalabels: {
                formatter: function (value, context) {
                    return value.toLocaleString();
                },
                anchor: 'middle',
                align: 'middle',
                display: 'auto',
                font: {
                    size: '10'
                }
            }
        }
    }

    return {
        chartClassicBar: chartClassicBar,
        chartClassicBarNoLegend: chartClassicBarNoLegend,
        chartClassicBarPercent: chartClassicBarPercent,
        chartClassicBarPercentNoLegend: chartClassicBarPercentNoLegend,
        chartLine: chartLine,
        chartStackedSum: chartStackedSum,
        chartPyramide: chartPyramide,
        chartHorizontal: chartHorizontal,
        chartClassicDoughnut: chartClassicDoughnut
    };

})();

export default chartOptions; 