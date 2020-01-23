import tuiChart from 'tui-chart';

const elPie = document.querySelector('.section[data-section="chart"] .pie');
const data = {
  categories: ['Browser'],
  series: [
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
  ]
};

const pieOptions = {
  chart: {
    width: 700,
    height: 400,
    title: 'Usage share of web browsers',
    format: (value, chartType, areaType, valuetype, legendName) => {
      if (areaType === 'makingSeriesLabel') {
        // formatting at series area
        value = value + '%';
      }

      return value;
    }
  },
  series: {
    startAngle: -90,
    endAngle: 90,
    radiusRange: ['60%', '100%'],
    showLabel: true,
    showLegend: true
  },
  tooltip: {
    suffix: '%'
  },
  legend: {
    align: 'top'
  }
};
const pieChart = tuiChart.pieChart(elPie, data, pieOptions);
pieChart.chartType;
pieChart.className;

pieChart.getCheckedLegend();

pieChart.on('load', () => {
  pieChart.addData('Jan', [2000, 4000, 6000, 8000]);
});
pieChart.resetTooltipAlign();
pieChart.resetTooltipOffset();
pieChart.resetTooltipPosition();
pieChart.resize({
  width: 500,
  height: 400
});
pieChart.setTooltipAlign('right bottom');
pieChart.setTooltipOffset({
  x: 50,
  y: 50
});
pieChart.showSeriesLabel();
pieChart.hideSeriesLabel();
