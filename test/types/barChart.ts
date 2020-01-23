import tuiChart from 'tui-chart';

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

const barOptions = {
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
    showLabel: true,
    allowSelect: true,
    stackType: 'normal',
    barWidth: 20,
    diverging: false,
    colorByPoint: false,
    animation: false
  },
  tooltip: {
    suffix: 'won',
    align: 'left',
    grouped: true
  },
  legend: {
    align: 'right',
    showCheckbox: true,
    visible: true,
    maxWidth: 80
  },
  plot: {
    showLine: true
  },
  chartExportMenu: {
    filename: `barchart-${new Date().toISOString()}`
  },
  theme: 'theme1'
};

const elBar = document.querySelector('.section[data-section="chart"] .bar');
const barChart = tuiChart.barChart(elBar, data, barOptions);

barChart.chartType;
barChart.className;
barChart.getCheckedLegend();

barChart.on('load', () => {
  barChart.addData('Jan', [2000, 4000, 6000, 8000]);
});
barChart.resetTooltipAlign();
barChart.resetTooltipOffset();
barChart.resetTooltipPosition();
barChart.resize({
  width: 500,
  height: 400
});
barChart.setTooltipAlign('right bottom');
barChart.setTooltipOffset({
  x: 50,
  y: 50
});
barChart.showSeriesLabel();
barChart.hideSeriesLabel();
