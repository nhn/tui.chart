import LineChart, { LineChartProps } from '@src/charts/lineChart';
import PieChart, { PieChartProps } from '@src/charts/pieChart';
import HeatmapChart, { HeatmapChartProps } from '@src/charts/heatmapChart';
import AreaChart, { AreaChartProps } from '@src/charts/areaChart';
import LineScatterChart, { LineScatterChartProps } from '@src/charts/lineScatterChart';
import LineAreaChart, { LineAreaChartProps } from '@src/charts/lineAreaChart';
import BarChart, { BarChartProps } from '@src/charts/barChart';
import ColumnChart, { ColumnChartProps } from '@src/charts/columnChart';
import ColumnLineChart, { ColumnLineChartProps } from '@src/charts/columnLineChart';
import BubbleChart, { BubbleChartProps } from '@src/charts/bubbleChart';
import ScatterChart, { ScatterChartProps } from '@src/charts/scatterChart';
import BulletChart, { BulletChartProps } from '@src/charts/bulletChart';
import NestedPieChart, { NestedPieChartProps } from '@src/charts/nestedPieChart';
import RadarChart, { RadarChartProps } from '@src/charts/radarChart';
import TreemapChart, { TreemapChartProps } from '@src/charts/treemapChart';

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
};
