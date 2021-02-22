import { Component } from 'react';
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
  LineChartProps,
  AreaChartProps,
  BarChartProps,
  ColumnChartProps,
  PieChartProps,
  HeatmapChartProps,
  BubbleChartProps,
  ScatterChartProps,
  BulletChartProps,
  RadarChartProps,
  TreemapChartProps,
  NestedPieChartProps,
  LineAreaChartProps,
  LineScatterChartProps,
  ColumnLineChartProps,
  BoxPlotChartProps,
} from '@toast-ui/chart';

type EventNameMapping = {
  onClickLegendLabel: 'clickLegendLabel';
  onClickLegendCheckbox: 'clickLegendCheckbox';
  onSelectSeries: 'selectSeries';
  onUnselectSeries: 'unselectSeries';
  onHoverSeries: 'hoverSeries';
  onUnhoverSeries: 'unhoverSeries';
  onZoom: 'zoom';
  onResetZoom: 'resetZoom';
};

type EventMaps = {
  [K in keyof EventNameMapping]?: EventListener;
};

type ChartProps<T> = Omit<T, 'el'> & EventMaps & { style?: object };

export class LineChart extends Component<ChartProps<LineChartProps>> {
  public getInstance(): LineChartCtor;
  public getRootElement(): HTMLElement;
}

export class AreaChart extends Component<ChartProps<AreaChartProps>> {
  public getInstance(): AreaChartCtor;
  public getRootElement(): HTMLElement;
}

export class BarChart extends Component<ChartProps<BarChartProps>> {
  public getInstance(): BarChartCtor;
  public getRootElement(): HTMLElement;
}

export class ColumnChart extends Component<ChartProps<ColumnChartProps>> {
  public getInstance(): ColumnChartCtor;
  public getRootElement(): HTMLElement;
}

export class PieChart extends Component<ChartProps<PieChartProps>> {
  public getInstance(): PieChartCtor;
  public getRootElement(): HTMLElement;
}

export class HeatmapChart extends Component<ChartProps<HeatmapChartProps>> {
  public getInstance(): HeatmapChartCtor;
  public getRootElement(): HTMLElement;
}

export class BubbleChart extends Component<ChartProps<BubbleChartProps>> {
  public getInstance(): BubbleChartCtor;
  public getRootElement(): HTMLElement;
}

export class ScatterChart extends Component<ChartProps<ScatterChartProps>> {
  public getInstance(): ScatterChartCtor;
  public getRootElement(): HTMLElement;
}

export class BulletChart extends Component<ChartProps<BulletChartProps>> {
  public getInstance(): BulletChartCtor;
  public getRootElement(): HTMLElement;
}

export class RadarChart extends Component<ChartProps<RadarChartProps>> {
  public getInstance(): RadarChartCtor;
  public getRootElement(): HTMLElement;
}

export class TreemapChart extends Component<ChartProps<TreemapChartProps>> {
  public getInstance(): TreemapChartCtor;
  public getRootElement(): HTMLElement;
}

export class NestedPieChart extends Component<ChartProps<NestedPieChartProps>> {
  public getInstance(): NestedPieChartCtor;
  public getRootElement(): HTMLElement;
}

export class LineAreaChart extends Component<ChartProps<LineAreaChartProps>> {
  public getInstance(): LineAreaChartCtor;
  public getRootElement(): HTMLElement;
}

export class LineScatterChart extends Component<ChartProps<LineScatterChartProps>> {
  public getInstance(): LineScatterChartCtor;
  public getRootElement(): HTMLElement;
}

export class ColumnLineChart extends Component<ChartProps<ColumnLineChartProps>> {
  public getInstance(): ColumnLineChartCtor;
  public getRootElement(): HTMLElement;
}

export class BoxPlotChart extends Component<ChartProps<BoxPlotChartProps>> {
  public getInstance(): BoxPlotChartCtor;
  public getRootElement(): HTMLElement;
}
