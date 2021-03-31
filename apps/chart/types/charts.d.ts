import {
  AreaChartOptions,
  AreaSeriesData,
  BarChartOptions,
  BaseOptions,
  BoxPlotChartOptions,
  BoxPlotSeriesData,
  BoxSeriesData,
  BubbleSeriesData,
  BulletChartOptions,
  BulletSeriesData,
  ColumnChartOptions,
  ColumnLineChartOptions,
  ColumnLineData,
  GaugeChartOptions,
  GaugeSeriesData,
  HeatmapChartOptions,
  HeatmapSeriesData,
  LineAreaChartOptions,
  LineAreaData,
  LineChartOptions,
  LineScatterChartOptions,
  LineScatterData,
  LineSeriesData,
  NestedPieChartOptions,
  NestedPieSeriesData,
  PieChartOptions,
  PieSeriesData,
  RadarChartOptions,
  RadarSeriesData,
  RadialBarChartOptions,
  RadialBarSeriesData,
  ScatterChartOptions,
  ScatterSeriesData,
  TreemapChartOptions,
  TreemapSeriesData,
} from './options';

export type AddSeriesDataInfo = { chartType?: string; category?: string };
export type SelectSeriesInfo = {
  seriesIndex?: number;
  index?: number;
  name?: string;
  chartType?: 'line' | 'area' | 'column' | 'scatter';
};

export interface AreaChartProps {
  el: HTMLElement;
  options: AreaChartOptions;
  data: AreaSeriesData;
}

export interface BarChartProps {
  el: HTMLElement;
  options: BarChartOptions;
  data: BoxSeriesData;
}

export interface BoxPlotChartProps {
  el: HTMLElement;
  options: BoxPlotChartOptions;
  data: BoxPlotSeriesData;
}

export interface BubbleChartProps {
  el: HTMLElement;
  options: BaseOptions;
  data: BubbleSeriesData;
}

export interface BulletChartProps {
  el: HTMLElement;
  options: BulletChartOptions;
  data: BulletSeriesData;
}

export interface ColumnChartProps {
  el: HTMLElement;
  options: ColumnChartOptions;
  data: BoxSeriesData;
}

export interface ColumnLineChartProps {
  el: HTMLElement;
  options: ColumnLineChartOptions;
  data: ColumnLineData;
}

export interface HeatmapChartProps {
  el: HTMLElement;
  options: HeatmapChartOptions;
  data: HeatmapSeriesData;
}

export interface LineAreaChartProps {
  el: HTMLElement;
  options: LineAreaChartOptions;
  data: LineAreaData;
}

export interface LineChartProps {
  el: HTMLElement;
  options: LineChartOptions;
  data: LineSeriesData;
}

export interface LineScatterChartProps {
  el: HTMLElement;
  options: LineScatterChartOptions;
  data: LineScatterData;
}

export interface NestedPieChartProps {
  el: HTMLElement;
  options: NestedPieChartOptions;
  data: NestedPieSeriesData;
}

export interface PieChartProps {
  el: HTMLElement;
  options: PieChartOptions;
  data: PieSeriesData;
}

export interface RadarChartProps {
  el: HTMLElement;
  options: RadarChartOptions;
  data: RadarSeriesData;
}

export interface RadialBarChartProps {
  el: HTMLElement;
  options: RadialBarChartOptions;
  data: RadialBarSeriesData;
}

export interface ScatterChartProps {
  el: HTMLElement;
  options: ScatterChartOptions;
  data: ScatterSeriesData;
}

export interface TreemapChartProps {
  el: HTMLElement;
  options: TreemapChartOptions;
  data: TreemapSeriesData;
}
export interface GaugeChartProps {
  el: HTMLElement;
  options: GaugeChartOptions;
  data: GaugeSeriesData;
}
