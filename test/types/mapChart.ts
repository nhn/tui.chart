import tuiChart from 'tui-chart';

tuiChart.registerMap('newMap', [
  {
    code: 'KR',
    name: 'South Korea',
    path: 'M835.13,346.53L837.55,350.71...',
    labelCoordinate: {
      x: 0.6,
      y: 0.7
    }
  }
]);

const elMap = document.querySelector('.section[data-section="chart"] .map');

const data = {
  series: [
    {
      code: 'KR',
      data: 100,
      labelCoordinate: {
        x: 0.6,
        y: 0.7
      }
    },
    {
      code: 'JP',
      data: 50
    }
  ]
};

const mapOptions = {
  chart: {
    width: 900,
    height: 700,
    title: 'Population density of World (per ㎢)',
    format: '0.00'
  },
  map: 'world',
  legend: {
    align: 'bottom'
  },
  theme: 'theme4'
};

const mapChart = tuiChart.mapChart(elMap, data, mapOptions);
mapChart.chartType;
mapChart.className;

mapChart.on('load', () => {
  mapChart.addData('Jan', [2000, 4000, 6000, 8000]);
});
mapChart.resetTooltipAlign();
mapChart.resetTooltipOffset();
mapChart.resetTooltipPosition();
mapChart.resize({
  width: 500,
  height: 400
});
mapChart.setTooltipAlign('right bottom');
mapChart.setTooltipOffset({
  x: 50,
  y: 50
});
