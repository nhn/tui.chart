import tuiChart from 'tui-chart';

// ColumnLineComboChart
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
console.group('ColumnLineChart');
console.log(columnNLineChart);
console.log('chartType: ', columnNLineChart.chartType);
console.log('chartTypes: ', columnNLineChart.chartTypes);
console.log('className : ', columnNLineChart.className);
console.log('yAxisOptions : ', columnNLineChart.yAxisOptions);
console.log('getCheckedLegend : ', columnNLineChart.getCheckedLegend());
console.groupEnd();

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
  height: 400
});
columnNLineChart.setTooltipAlign('right bottom');
columnNLineChart.setTooltipOffset({
  x: 50,
  y: 50
});
columnNLineChart.showSeriesLabel();
columnNLineChart.hideSeriesLabel();

// LineAreaComboChart
const elLineAreaCombo = document.querySelector('.section[data-section="chart"] .lineAreaCombo');

const lineAreaRowData = {
  categories: [
    '2014.01',
    '2014.02',
    '2014.03',
    '2014.04',
    '2014.05',
    '2014.06',
    '2014.07',
    '2014.08',
    '2014.09',
    '2014.10',
    '2014.11',
    '2014.12',
    '2015.01',
    '2015.02',
    '2015.03',
    '2015.04',
    '2015.05',
    '2015.06',
    '2015.07',
    '2015.08',
    '2015.09',
    '2015.10',
    '2015.11',
    '2015.12'
  ],
  series: {
    area: [
      {
        name: 'Effective Load',
        data: [
          150,
          130,
          100,
          125,
          128,
          110,
          134,
          162,
          120,
          90,
          98,
          143,
          142,
          124,
          113,
          129,
          118,
          120,
          145,
          172,
          110,
          70,
          68,
          103
        ]
      }
    ],
    line: [
      {
        name: 'Power Usage',
        data: [
          72,
          80,
          110,
          107,
          126,
          134,
          148,
          152,
          130,
          120,
          114,
          127,
          90,
          72,
          130,
          117,
          129,
          137,
          134,
          160,
          121,
          110,
          114,
          117
        ]
      }
    ]
  }
};
const lineAreaComboOptions = {
  chart: {
    width: 1160,
    height: 540,
    title: 'Energy Usage'
  },
  yAxis: {
    title: 'Energy (kWh)',
    min: 0,
    pointOnColumn: true
  },
  xAxis: {
    title: 'Month',
    tickInterval: 'auto'
  },
  series: {
    zoomable: true
  },
  tooltip: {
    suffix: 'kWh'
  },
  theme: 'theme5'
};

tuiChart.registerTheme('theme5', {
  series: {
    area: {
      colors: ['#ffb840']
    },
    line: {
      colors: ['#785fff']
    }
  }
});

const lineAreaComboChart = tuiChart.comboChart(
  elLineAreaCombo,
  lineAreaRowData,
  lineAreaComboOptions
);
console.group('LineAreaComboChart');
console.log(lineAreaComboChart);
console.log('chartType: ', lineAreaComboChart.chartType);
console.log('chartTypes: ', lineAreaComboChart.chartTypes);
console.log('className : ', lineAreaComboChart.className);
console.log('getCheckedLegend : ', lineAreaComboChart.getCheckedLegend());
console.groupEnd();

// LineScatterComboChart
const elLineScatterCombo = document.querySelector(
  '.section[data-section="chart"] .lineScatterCombo'
);

const theme6 = {
  series: {
    scatter: {
      colors: ['#ffb840']
    },
    line: {
      colors: ['#785fff']
    }
  }
};

tuiChart.registerTheme('theme6', theme6);

const lineScatterData = {
  series: {
    scatter: [
      {
        name: 'Efficiency',
        data: [
          { x: 10, y: 20 },
          { x: 14, y: 30 },
          { x: 18, y: 10 },
          { x: 20, y: 30 },
          { x: 24, y: 15 },
          { x: 25, y: 25 },
          { x: 26, y: 5 },
          { x: 30, y: 35 },
          { x: 34, y: 15 },
          { x: 36, y: 35 },
          { x: 37, y: 40 },
          { x: 38, y: 20 },
          { x: 40, y: 30 },
          { x: 42, y: 50 },
          { x: 46, y: 40 },
          { x: 47, y: 50 },
          { x: 48, y: 60 },
          { x: 50, y: 55 },
          { x: 54, y: 50 },
          { x: 58, y: 62 },
          { x: 58, y: 47 },
          { x: 62, y: 66 },
          { x: 66, y: 42 },
          { x: 65, y: 52 },
          { x: 70, y: 54 },
          { x: 74, y: 32 },
          { x: 78, y: 48 },
          { x: 82, y: 54 },
          { x: 86, y: 40 },
          { x: 90, y: 30 }
        ]
      }
    ],
    line: [
      {
        name: 'Expenses',
        data: [
          { x: 0, y: 10 },
          { x: 30, y: 11 },
          { x: 60, y: 50 },
          { x: 70, y: 99 }
        ]
      }
    ]
  }
};

const lineScatterOptions = {
  chart: {
    width: 1160,
    height: 540,
    title: 'Efficiency vs Expenses'
  },
  yAxis: {
    title: 'Percentage (%)'
  },
  xAxis: {
    title: 'Temperature (C)'
  },
  series: {
    line: {
      spline: true
    }
  }
};

(lineScatterOptions as any).theme = 'theme6';

const lineScatterChart = tuiChart.comboChart(
  elLineScatterCombo,
  lineScatterData,
  lineScatterOptions
);
console.group('LineScatterComboChart');
console.log(lineScatterChart);
console.log('chartType: ', lineScatterChart.chartType);
console.log('chartTypes: ', lineScatterChart.chartTypes);
console.log('className : ', lineScatterChart.className);
console.log('getCheckedLegend : ', lineScatterChart.getCheckedLegend());
console.groupEnd();

// PieDonutComboChart
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
        data: 3.1
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
      },
      {
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
        data: 3.1
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
    visible: true
  },
  tooltip: {
    suffix: '%'
  },
  theme: 'theme3'
};

const pieNDonutChart = tuiChart.comboChart(elPieDonutCombo, data2, pieNDonutOptions);
console.group('PieDonutComboChart');
console.log(pieNDonutChart);
console.log('chartType: ', pieNDonutChart.chartType);
console.log('chartTypes: ', pieNDonutChart.chartTypes);
console.log('className : ', pieNDonutChart.className);
console.log('getCheckedLegend : ', pieNDonutChart.getCheckedLegend());
console.groupEnd();
