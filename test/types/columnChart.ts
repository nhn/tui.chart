import tuiChart from 'tui-chart';
const data = {
  categories: [
    'June, 2015',
    'July, 2015',
    'August, 2015',
    'September, 2015',
    'October, 2015',
    'November, 2015',
    'December, 2015'
  ],
  series: [
    {
      name: 'Budget',
      data: [5000, 3000, 5000, 7000, 6000, 4000, 1000]
    },
    {
      name: 'Income',
      data: [8000, 1000, 7000, 2000, 6000, 3000, 5000]
    },
    {
      name: 'Expenses',
      data: [4000, 4000, 6000, 3000, 4000, 5000, 7000]
    },
    {
      name: 'Debt',
      data: [6000, 3000, 3000, 1000, 2000, 4000, 3000]
    }
  ]
};
const options = {
  chart: {
    width: 1160,
    height: 650,
    title: 'Monthly Revenue',
    format: '1,000'
  },
  yAxis: {
    title: 'Amount',
    min: 0,
    max: 9000
  },
  xAxis: {
    title: 'Month'
  },
  legend: {
    align: 'top'
  }
};
const elColumn = document.querySelector('.section[data-section="chart"] .column');
const columnChart = tuiChart.columnChart(elColumn, data, options);

columnChart.chartType;
columnChart.className;
columnChart.getCheckedLegend();

columnChart.on('load', () => {
  columnChart.addData('Jan', [2000, 4000, 6000, 8000]);
});
columnChart.resetTooltipAlign();
columnChart.resetTooltipOffset();
columnChart.resetTooltipPosition();
columnChart.resize({
  width: 500,
  height: 400
});
columnChart.setTooltipAlign('right bottom');
columnChart.setTooltipOffset({
  x: 50,
  y: 50
});
columnChart.showSeriesLabel();
columnChart.hideSeriesLabel();
