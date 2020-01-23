import tuiChart from 'tui-chart';

const theme1 = {
  series: {
    colors: [
      '#83b14e',
      '#458a3f',
      '#295ba0',
      '#2a4175',
      '#289399',
      '#289399',
      '#617178',
      '#8a9a9a',
      '#516f7d',
      '#dddddd'
    ]
  }
};

tuiChart.registerTheme('theme1', theme1);

const pluginRaphael = {
  bar: () => {} // Render class
};

tuiChart.registerPlugin('raphael', pluginRaphael, callback => {
  console.log('callback');
});

const elArea = document.querySelector('.section[data-section="chart"] .area');
const data = {
  categories: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  series: [
    {
      name: 'Budget',
      data: [5000, 3000, 5000, 7000, 6000, 4000, 1000]
    },
    {
      name: 'Income',
      data: [8000, 4000, 7000, 2000, 6000, 3000, 5000]
    },
    {
      name: 'Expenses',
      data: [4000, 4000, 6000, 3000, 4000, 5000, 7000]
    },
    {
      name: 'Debt',
      data: [3000, 4000, 3000, 1000, 2000, 4000, 3000]
    }
  ]
};
const areaOptions = {
  chart: {
    width: 1160,
    height: 540,
    title: {
      text: 'Monthly Revenue',
      align: 'center'
    },
    format: '1,000'
  },
  yAxis: {
    title: 'Amount',
    labelMargin: 0,
    min: 1000,
    max: 24000
  },
  xAxis: {
    title: 'Month'
  },
  series: {
    showDot: false,
    showLabel: false,
    allowSelect: true,
    spline: true,
    zoomable: false,
    shifting: true,
    areaOpacity: 0.5,
    stackType: 'normal'
  },
  tooltip: {
    suffix: 'won',
    grouped: true
  },
  legend: {
    align: 'bottom',
    showCheckbox: true,
    visible: true,
    maxWidth: 80
  },
  plot: {
    showLine: true,
    lines: [
      {
        value: 'Jul',
        color: '#ff5a46'
      },
      {
        value: 'Aug',
        color: '#00a9ff'
      }
    ],
    bands: [
      {
        range: [['Jun', 'Aug']],
        color: '#ffb840',
        opacity: 0.15
      },
      {
        range: [
          ['Sep', 'Nov'],
          ['Oct', 'Dec']
        ],
        color: '#19bc9c',
        opacity: 0.15,
        mergeOverlappingRanges: false
      }
    ]
  },
  theme: 'theme1',
  chartExportMenu: {
    filename: `areachart-${new Date().toISOString()}`
  },
  usageStatistics: false
};

const areaChart = tuiChart.areaChart(elArea, data, areaOptions);
areaChart.chartType;
areaChart.className;
areaChart.getCheckedLegend();

areaChart.addPlotBand({
  range: [['Aug', 'Sep']],
  color: '#48a0ff',
  opacity: 0.15
});
areaChart.addPlotLine({
  value: 'Sep',
  color: '#ff4462'
});

areaChart.on('load', () => {
  areaChart.addData('Jan', [2000, 4000, 6000, 8000]);
});
areaChart.removePlotBand();
areaChart.removePlotLine();
areaChart.resetTooltipAlign();
areaChart.resetTooltipOffset();
areaChart.resetTooltipPosition();
areaChart.resize({
  width: 500,
  height: 400
});
areaChart.setTooltipAlign('right bottom');
areaChart.setTooltipOffset({
  x: 50,
  y: 50
});
areaChart.showSeriesLabel();
areaChart.hideSeriesLabel();
