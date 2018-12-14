import tuiChart from 'tui-chart';

const elColumnLineCombo = document.querySelector('.section[data-section="chart"] .columnLineCombo');
const data = {
    categories: ['Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct'],
    series: {
        column: [
            {
                name: 'Seoul',
                data: [11.3, 17.0, 21.0, 24.4, 25.2, 20.4, 13.9]
            },
            {
                name: 'NewYork',
                data: [9.9, 16.0, 21.2, 24.2, 23.2, 19.4, 13.3]
            },
            {
                name: 'Sydney',
                data: [18.3, 15.2, 12.8, 11.8, 13.0, 15.2, 17.6]
            },
            {
                name: 'Moskva',
                data: [4.4, 12.2, 16.3, 18.5, 16.7, 10.9, 4.2]
            }
        ],
        line: [
            {
                name: 'Average',
                data: [11, 15.1, 17.8, 19.7, 19.5, 16.5, 12.3]
            }
        ]
    }
};

const columnAndLineOptions = {
    chart: {
        width: 1160,
        height: 540,
        title: '24-hr Average Temperature'
    },
    yAxis: [
        {
            title: 'Temperature (Celsius)',
            chartType: 'column',
            labelMargin: 15
        },
        {
            title: 'Average',
            chartType: 'line',
            labelMargin: 15
        }
    ],
    xAxis: {
        title: 'Month'
    },
    series: {
        line: {
            showDot: true
        }
    },
    tooltip: {
        grouped: true,
        suffix: '°C'
    }
};


const columnNLineChart = tuiChart.comboChart(elColumnLineCombo, data, columnAndLineOptions);

columnNLineChart.chartType;
columnNLineChart.className;
columnNLineChart.addPlotBand({
    range: [['Aug', 'Sep']],
    color: '#48a0ff',
    opacity: 0.15
});
columnNLineChart.addPlotLine({
    value: 'Sep',
    color: '#ff4462'
});
columnNLineChart.getCheckedLegend();

columnNLineChart.on('load', () => {
    columnNLineChart.addData('Jan', [2000, 4000, 6000, 8000]);
});
columnNLineChart.removePlotBand();
columnNLineChart.removePlotLine();
columnNLineChart.resetTooltipAlign();
columnNLineChart.resetTooltipOffset();
columnNLineChart.resetTooltipPosition();
columnNLineChart.resize({
    width: 500,
    height: 400,
});
columnNLineChart.setTooltipAlign('right bottom');
columnNLineChart.setTooltipOffset({
    x: 50,
    y: 50
});
columnNLineChart.showSeriesLabel();
columnNLineChart.hideSeriesLabel();

const elPieDonutCombo = document.querySelector('.section[data-section="chart"] .pieDonutCombo');

const data2 = {
    categories: ['Browser'],
    seriesAlias: {
        pie1: 'pie',
        pie2: 'pie'
    },
    series: {
        pie1: [
            {
                name: 'Chrome',
                data: 46.02
            },
            {
                name: 'IE',
                data: 20.47
            },
            {
                name: 'Firefox',
                data: 17.71
            },
            {
                name: 'Safari',
                data: 5.45
            },
            {
                name: 'Opera',
                data: 3.10
            },
            {
                name: 'Etc',
                data: 7.25
            }
        ],
        pie2: [
            {
                name: 'Chrome 1',
                data: 26.02
            },
            {
                name: 'Chrome 2',
                data: 20
            },
            {
                name: 'IE 1',
                data: 5.47
            },
            {
                name: 'IE1 2',
                data: 7
            }, {
                name: 'IE 3',
                data: 8
            },
            {
                name: 'Firefox 1',
                data: 7.71
            },
            {
                name: 'Firefox 2',
                data: 10
            },
            {
                name: 'Safari 1',
                data: 5.45
            },
            {
                name: 'Opera 1',
                data: 3.10
            },
            {
                name: 'Etc 1',
                data: 7.25
            }
        ]
    }
};
const pieNDonutOptions = {
    chart: {
        width: 700,
        height: 700,
        title: 'Usage share of web browsers'
    },
    series: {
        pie1: {
            radiusRange: ['57%'],
            labelAlign: 'center',
            showLegend: true
        },
        pie2: {
            radiusRange: ['70%', '100%'],
            labelAlign: 'outer',
            showLegend: true
        }
    },
    legend: {
        visible: false
    },
    tooltip: {
        suffix: '%'
    },
    theme: 'theme3'
};

const pieNDonutChart = tuiChart.comboChart(elPieDonutCombo, data2, pieNDonutOptions);
