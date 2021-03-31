import LineChart from '@src/charts/lineChart';
import PieChart from '@src/charts/pieChart';
import HeatmapChart from '@src/charts/heatmapChart';
import AreaChart from '@src/charts/areaChart';
import LineScatterChart from '@src/charts/lineScatterChart';
import LineAreaChart from '@src/charts/lineAreaChart';
import BarChart from '@src/charts/barChart';
import ColumnChart from '@src/charts/columnChart';
import ColumnLineChart from '@src/charts/columnLineChart';
import BubbleChart from '@src/charts/bubbleChart';
import ScatterChart from '@src/charts/scatterChart';
import BulletChart from '@src/charts/bulletChart';
import NestedPieChart from '@src/charts/nestedPieChart';
import RadarChart from '@src/charts/radarChart';
import TreemapChart from '@src/charts/treemapChart';
import BoxPlotChart from '@src/charts/boxPlotChart';
import RadialBarChart from '@src/charts/radialBarChart';
import GaugeChart from '@src/charts/gaugeChart';

import {
  LineChartProps,
  PieChartProps,
  HeatmapChartProps,
  AreaChartProps,
  LineScatterChartProps,
  LineAreaChartProps,
  BulletChartProps,
  NestedPieChartProps,
  RadarChartProps,
  RadialBarChartProps,
  BarChartProps,
  BoxPlotChartProps,
  ColumnLineChartProps,
  BubbleChartProps,
  TreemapChartProps,
  ScatterChartProps,
  ColumnChartProps,
  GaugeChartProps,
} from '@t/charts';

export default class Chart {
  public static lineChart = (props: LineChartProps) => {
    return new LineChart(props);
  };

  public static areaChart = (props: AreaChartProps) => {
    return new AreaChart(props);
  };

  public static barChart = (props: BarChartProps) => {
    return new BarChart(props);
  };

  public static boxPlotChart = (props: BoxPlotChartProps) => {
    return new BoxPlotChart(props);
  };

  public static columnChart = (props: ColumnChartProps) => {
    return new ColumnChart(props);
  };

  public static pieChart = (props: PieChartProps) => {
    return new PieChart(props);
  };

  public static heatmapChart = (props: HeatmapChartProps) => {
    return new HeatmapChart(props);
  };

  public static bubbleChart = (props: BubbleChartProps) => {
    return new BubbleChart(props);
  };

  public static scatterChart = (props: ScatterChartProps) => {
    return new ScatterChart(props);
  };

  public static bulletChart = (props: BulletChartProps) => {
    return new BulletChart(props);
  };

  public static radarChart = (props: RadarChartProps) => {
    return new RadarChart(props);
  };

  public static treemapChart = (props: TreemapChartProps) => {
    return new TreemapChart(props);
  };

  public static nestedPieChart = (props: NestedPieChartProps) => {
    return new NestedPieChart(props);
  };

  public static lineAreaChart = (props: LineAreaChartProps) => {
    return new LineAreaChart(props);
  };

  public static lineScatterChart = (props: LineScatterChartProps) => {
    return new LineScatterChart(props);
  };

  public static columnLineChart = (props: ColumnLineChartProps) => {
    return new ColumnLineChart(props);
  };

  public static radialBarChart = (props: RadialBarChartProps) => {
    return new RadialBarChart(props);
  };

  public static gaugeChart = (props: GaugeChartProps) => {
    return new GaugeChart(props);
  };
}

export {
  LineChart,
  AreaChart,
  BarChart,
  ColumnChart,
  PieChart,
  HeatmapChart,
  BubbleChart,
  ScatterChart,
  BulletChart,
  RadarChart,
  TreemapChart,
  NestedPieChart,
  LineAreaChart,
  LineScatterChart,
  ColumnLineChart,
  BoxPlotChart,
  RadialBarChart,
  GaugeChart,
};
