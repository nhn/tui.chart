import tuiChart from 'tui-chart';

const elHeatmap = document.querySelector('.section[data-section="chart"] .heatmap');

const data = {
  categories: {
    x: [10, 20, 30, 40, 50],
    y: [1, 2, 3, 4, 5, 6]
  },
  series: [
    [10, 20, 30, 40, 50],
    [1, 4, 6, 7, 8],
    [20, 4, 5, 70, 8],
    [100, 40, 30, 80, 30],
    [20, 10, 60, 90, 20],
    [50, 40, 30, 20, 10]
  ]
};

const heatmapOptions = {
  chart: {
    title: 'Heatmap Chart'
  },
  yAxis: {
    title: 'Y Axis'
  },
  xAxis: {
    title: 'X Axis'
  }
};

const heatmapChart = tuiChart.heatmapChart(elHeatmap, data, heatmapOptions);
heatmapChart.chartType;
heatmapChart.className;

heatmapChart.on('load', () => {
  heatmapChart.addData('Jan', [2000, 4000, 6000, 8000]);
});
heatmapChart.resetTooltipAlign();
heatmapChart.resetTooltipOffset();
heatmapChart.resetTooltipPosition();
heatmapChart.resize({
  width: 500,
  height: 400
});
heatmapChart.setTooltipAlign('right bottom');
heatmapChart.setTooltipOffset({
  x: 50,
  y: 50
});
