import chart from './base';
import {
  AreaChartProps,
  BarChartProps,
  BoxPlotChartProps,
  BubbleChartProps,
  BulletChartProps,
  ColumnChartProps,
  ColumnLineChartProps,
  GaugeChartProps,
  HeatmapChartProps,
  LineAreaChartProps,
  LineChartProps,
  LineScatterChartProps,
  NestedPieChartProps,
  PieChartProps,
  RadarChartProps,
  RadialBarChartProps,
  ScatterChartProps,
  TreemapChartProps,
} from '@toast-ui/chart';

const AreaChart = chart<AreaChartProps>('area');
const BarChart = chart<BarChartProps>('bar');
const BoxPlotChart = chart<BoxPlotChartProps>('boxPlot');
const BubbleChart = chart<BubbleChartProps>('bubble');
const BulletChart = chart<BulletChartProps>('bullet');
const ColumnChart = chart<ColumnChartProps>('column');
const ColumnLineChart = chart<ColumnLineChartProps>('columnLine');
const HeatmapChart = chart<HeatmapChartProps>('heatmap');
const LineChart = chart<LineChartProps>('line');
const LineAreaChart = chart<LineAreaChartProps>('lineArea');
const LineScatterChart = chart<LineScatterChartProps>('lineScatter');
const NestedPieChart = chart<NestedPieChartProps>('nestedPie');
const PieChart = chart<PieChartProps>('pie');
const RadarChart = chart<RadarChartProps>('radar');
const ScatterChart = chart<ScatterChartProps>('scatter');
const TreemapChart = chart<TreemapChartProps>('treemap');
const RadialBarChart = chart<RadialBarChartProps>('radialBar');
const GaugeChart = chart<GaugeChartProps>('gauge');

export {
  AreaChart,
  BoxPlotChart,
  BubbleChart,
  BulletChart,
  BarChart,
  ColumnLineChart,
  ColumnChart,
  HeatmapChart,
  LineChart,
  LineAreaChart,
  LineScatterChart,
  NestedPieChart,
  PieChart,
  RadarChart,
  ScatterChart,
  TreemapChart,
  RadialBarChart,
  GaugeChart,
};
