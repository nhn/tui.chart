import { chartType, createComponent } from './base';

export const {
  areaChart,
  barChart,
  boxPlotChart,
  bubbleChart,
  bulletChart,
  columnChart,
  columnLineChart,
  heatmapChart,
  lineChart,
  lineAreaChart,
  lineScatterChart,
  nestedPieChart,
  pieChart,
  radarChart,
  scatterChart,
  treemapChart,
} = chartType.reduce((obj, chartName) => {
  obj[`${chartName}Chart`] = createComponent(chartName);

  return obj;
}, {});
