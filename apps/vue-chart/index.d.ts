import Vue from 'vue';
import {
  AreaChart as AreaChartCtor,
  BoxPlotChart as BoxPlotChartCtor,
  BubbleChart as BubbleChartCtor,
  BulletChart as BulletChartCtor,
  BarChart as BarChartCtor,
  ColumnLineChart as ColumnLineChartCtor,
  ColumnChart as ColumnChartCtor,
  HeatmapChart as HeatmapChartCtor,
  LineChart as LineChartCtor,
  LineAreaChart as LineAreaChartCtor,
  LineScatterChart as LineScatterChartCtor,
  NestedPieChart as NestedPieChartCtor,
  PieChart as PieChartCtor,
  RadarChart as RadarChartCtor,
  ScatterChart as ScatterChartCtor,
  TreemapChart as TreemapChartCtor,
} from '@toast-ui/chart';

type FunctionKeys<T extends object> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

type AreaChartFnKeys = FunctionKeys<AreaChartCtor>;
type BoxPlotChartFnKeys = FunctionKeys<BoxPlotChartCtor>;
type BubbleChartFnKeys = FunctionKeys<BubbleChartCtor>;
type BulletChartFnKeys = FunctionKeys<BulletChartCtor>;
type BarChartFnKeys = FunctionKeys<BarChartCtor>;
type ColumnLineChartFnKeys = FunctionKeys<ColumnLineChartCtor>;
type ColumnChartFnKeys = FunctionKeys<ColumnChartCtor>;
type HeatmapChartFnKeys = FunctionKeys<HeatmapChartCtor>;
type LineChartFnKeys = FunctionKeys<LineChartCtor>;
type LineAreaChartFnKeys = FunctionKeys<LineAreaChartCtor>;
type LineScatterChartFnKeys = FunctionKeys<LineScatterChartCtor>;
type NestedPieChartFnKeys = FunctionKeys<NestedPieChartCtor>;
type PieChartFnKeys = FunctionKeys<PieChartCtor>;
type RadarChartFnKeys = FunctionKeys<RadarChartCtor>;
type ScatterChartFnKeys = FunctionKeys<ScatterChartCtor>;
type TreemapChartFnKeys = FunctionKeys<TreemapChartCtor>;

export class AreaChart extends Vue {
  invoke<T extends AreaChartFnKeys>(
    fname: T,
    ...args: Parameters<AreaChartCtor[T]>
  ): ReturnType<AreaChartCtor[T]>;
  getRootElement(): HTMLElement;
}

export class BoxPlotChart extends Vue {
  invoke<T extends BoxPlotChartFnKeys>(
    fname: T,
    ...args: Parameters<BoxPlotChartCtor[T]>
  ): ReturnType<BoxPlotChartCtor[T]>;
  getRootElement(): HTMLElement;
}

export class BubbleChart extends Vue {
  invoke<T extends BubbleChartFnKeys>(
    fname: T,
    ...args: Parameters<BubbleChartCtor[T]>
  ): ReturnType<BubbleChartCtor[T]>;
  getRootElement(): HTMLElement;
}

export class BulletChart extends Vue {
  invoke<T extends BulletChartFnKeys>(
    fname: T,
    ...args: Parameters<BulletChartCtor[T]>
  ): ReturnType<BulletChartCtor[T]>;
  getRootElement(): HTMLElement;
}

export class BarChart extends Vue {
  invoke<T extends BarChartFnKeys>(
    fname: T,
    ...args: Parameters<BarChartCtor[T]>
  ): ReturnType<BarChartCtor[T]>;
  getRootElement(): HTMLElement;
}

export class ColumnLineChart extends Vue {
  invoke<T extends ColumnLineChartFnKeys>(
    fname: T,
    ...args: Parameters<ColumnLineChartCtor[T]>
  ): ReturnType<ColumnLineChartCtor[T]>;
  getRootElement(): HTMLElement;
}

export class ColumnChart extends Vue {
  invoke<T extends ColumnChartFnKeys>(
    fname: T,
    ...args: Parameters<ColumnChartCtor[T]>
  ): ReturnType<ColumnChartCtor[T]>;
  getRootElement(): HTMLElement;
}

export class HeatmapChart extends Vue {
  invoke<T extends HeatmapChartFnKeys>(
    fname: T,
    ...args: Parameters<HeatmapChartCtor[T]>
  ): ReturnType<HeatmapChartCtor[T]>;
  getRootElement(): HTMLElement;
}
export class LineChart extends Vue {
  invoke<T extends LineChartFnKeys>(
    fname: T,
    ...args: Parameters<LineChartCtor[T]>
  ): ReturnType<LineChartCtor[T]>;
  getRootElement(): HTMLElement;
}

export class LineAreaChart extends Vue {
  invoke<T extends LineAreaChartFnKeys>(
    fname: T,
    ...args: Parameters<LineAreaChartCtor[T]>
  ): ReturnType<LineAreaChartCtor[T]>;
  getRootElement(): HTMLElement;
}

export class LineScatterChart extends Vue {
  invoke<T extends LineScatterChartFnKeys>(
    fname: T,
    ...args: Parameters<LineScatterChartCtor[T]>
  ): ReturnType<LineScatterChartCtor[T]>;
  getRootElement(): HTMLElement;
}

export class NestedPieChart extends Vue {
  invoke<T extends NestedPieChartFnKeys>(
    fname: T,
    ...args: Parameters<NestedPieChartCtor[T]>
  ): ReturnType<NestedPieChartCtor[T]>;
  getRootElement(): HTMLElement;
}

export class PieChart extends Vue {
  invoke<T extends PieChartFnKeys>(
    fname: T,
    ...args: Parameters<PieChartCtor[T]>
  ): ReturnType<PieChartCtor[T]>;
  getRootElement(): HTMLElement;
}

export class RadarChart extends Vue {
  invoke<T extends RadarChartFnKeys>(
    fname: T,
    ...args: Parameters<RadarChartCtor[T]>
  ): ReturnType<RadarChartCtor[T]>;
  getRootElement(): HTMLElement;
}

export class ScatterChart extends Vue {
  invoke<T extends ScatterChartFnKeys>(
    fname: T,
    ...args: Parameters<ScatterChartCtor[T]>
  ): ReturnType<ScatterChartCtor[T]>;
  getRootElement(): HTMLElement;
}

export class TreemapChart extends Vue {
  invoke<T extends TreemapChartFnKeys>(
    fname: T,
    ...args: Parameters<TreemapChartCtor[T]>
  ): ReturnType<TreemapChartCtor[T]>;
  getRootElement(): HTMLElement;
}
