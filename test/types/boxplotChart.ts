import tuiChart from 'tui-chart';

const elBoxPlot = document.querySelector('.section[data-section="chart"] .boxPlot');
const data = {
  categories: ['Budget', 'Income', 'Expenses', 'Debt'],
  series: [
    {
      name: '2015',
      data: [
        [1000, 2500, 3714, 5500, 7000],
        [1000, 2750, 4571, 5250, 8000],
        [3000, 4000, 4714, 6000, 7000],
        [1000, 2250, 3142, 4750, 6000]
      ],
      outliers: [
        [0, 14000],
        [2, 10000],
        [3, 9600]
      ]
    },
    {
      name: '2016',
      data: [
        [2000, 4500, 6714, 11500, 13000],
        [3000, 5750, 7571, 8250, 9000],
        [5000, 8000, 8714, 9000, 10000],
        [7000, 9250, 10142, 11750, 12000]
      ],
      outliers: [[1, 14000]]
    }
  ]
};
const boxPlotOptions = {
  chart: {
    width: 900,
    height: 540,
    title: 'Monthly Revenue',
    format: '1,000'
  },
  yAxis: {
    title: 'Amount',
    min: 0,
    max: 15000
  },
  xAxis: {
    title: 'Month'
  },
  legend: {
    align: 'bottom'
  },
  series: {
    showDot: true,
    showArea: true,
    animation: {
      duration: 100
    }
  },
  plot: {
    type: 'circle'
  }
};

const boxPlotChart = tuiChart.boxplotChart(elBoxPlot, data, boxPlotOptions);
boxPlotChart.chartType;
boxPlotChart.className;
boxPlotChart.getCheckedLegend();

boxPlotChart.on('load', () => {
  boxPlotChart.addData('Jan', [2000, 4000, 6000, 8000]);
});
boxPlotChart.resetTooltipAlign();
boxPlotChart.resetTooltipOffset();
boxPlotChart.resetTooltipPosition();
boxPlotChart.resize({
  width: 500,
  height: 400
});
boxPlotChart.setTooltipAlign('right bottom');
boxPlotChart.setTooltipOffset({
  x: 50,
  y: 50
});
boxPlotChart.showSeriesLabel();
boxPlotChart.hideSeriesLabel();
