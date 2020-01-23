import tuiChart from 'tui-chart';

const elLine = document.querySelector('.section[data-section="chart"] .line');
const data = {
  series: [
    {
      name: 'SiteA',
      data: [
        ['08/22/2016 10:00:00', 202],
        ['08/22/2016 10:05:00', 212],
        ['08/22/2016 10:10:00', 222],
        ['08/22/2016 10:15:00', 351],
        ['08/22/2016 10:20:00', 412],
        ['08/22/2016 10:25:00', 420],
        ['08/22/2016 10:30:00', 300],
        ['08/22/2016 10:35:00', 213],
        ['08/22/2016 10:40:00', 230],
        ['08/22/2016 10:45:00', 220],
        ['08/22/2016 10:50:00', 234],
        ['08/22/2016 10:55:00', 210],
        ['08/22/2016 11:00:00', 220]
      ]
    },
    {
      name: 'SiteB',
      data: [
        ['08/22/2016 10:00:00', 312],
        ['08/22/2016 10:10:00', 320],
        ['08/22/2016 10:20:00', 295],
        ['08/22/2016 10:30:00', 300],
        ['08/22/2016 10:40:00', 320],
        ['08/22/2016 10:50:00', 30],
        ['08/22/2016 11:00:00', 20]
      ]
    }
  ]
};
const lineOptions = {
  chart: {
    width: 1160,
    height: 540,
    title: 'Concurrent users'
  },
  xAxis: {
    title: 'minutes',
    type: 'datetime',
    dateFormat: 'hh:mm'
  },
  yAxis: {
    title: 'users',
    pointOnColumn: true
  },
  series: {
    showDot: false
  },
  plot: {
    bands: [
      {
        range: ['08/22/2016 10:40:00', '08/22/2016 11:00:00'],
        color: 'gray',
        opacity: 0.2
      }
    ],
    lines: [
      {
        value: '08/22/2016 10:10:00',
        color: '#fa2828'
      }
    ]
  }
};

const lineChart = tuiChart.lineChart(elLine, data, lineOptions);
lineChart.chartType;
lineChart.className;
lineChart.getCheckedLegend();

lineChart.addPlotBand({
  range: [['Aug', 'Sep']],
  color: '#48a0ff',
  opacity: 0.15
});
lineChart.addPlotLine({
  value: 'Sep',
  color: '#ff4462'
});

lineChart.on('load', () => {
  lineChart.addData('Jan', [2000, 4000, 6000, 8000]);
});
lineChart.removePlotBand();
lineChart.removePlotLine();
lineChart.resetTooltipAlign();
lineChart.resetTooltipOffset();
lineChart.resetTooltipPosition();
lineChart.resize({
  width: 500,
  height: 400
});
lineChart.setTooltipAlign('right bottom');
lineChart.setTooltipOffset({
  x: 50,
  y: 50
});
lineChart.showSeriesLabel();
lineChart.hideSeriesLabel();
