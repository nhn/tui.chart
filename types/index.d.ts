import {
  AreaSeriesDataType,
  BoxSeriesDataType,
  BubbleSeriesDataType,
  CoordinateDataType,
  HeatmapSeriesDataType,
  LineChartOptions,
  LineSeriesData,
  LineSeriesDataType,
  Size,
  PlotBand,
  PlotLine,
  Point,
  AreaChartOptions,
  BarChartOptions,
  ColumnChartOptions,
  PieChartOptions,
  HeatmapChartOptions,
  BubbleChartOptions,
  ScatterChartOptions,
  BulletChartOptions,
  RadarChartOptions,
  TreemapChartOptions,
  NestedPieChartOptions,
  LineAreaChartOptions,
  LineScatterChartOptions,
  ColumnLineChartOptions,
  BoxPlotSeriesType,
  BoxPlotSeriesData,
  BoxPlotChartOptions,
} from '@t/options';
import { LineChartProps } from '@src/charts/lineChart';
import { AreaChartProps } from '@src/charts/areaChart';
import { BarChartProps } from '@src/charts/barChart';
import { ColumnChartProps } from '@src/charts/columnChart';
import { PieChartProps } from '@src/charts/pieChart';
import { HeatmapChartProps } from '@src/charts/heatmapChart';
import { BubbleChartProps } from '@src/charts/bubbleChart';
import { ScatterChartProps } from '@src/charts/scatterChart';
import { BulletChartProps } from '@src/charts/bulletChart';
import { RadarChartProps } from '@src/charts/radarChart';
import { TreemapChartProps } from '@src/charts/treemapChart';
import { NestedPieChartProps } from '@src/charts/nestedPieChart';
import { LineAreaChartProps } from '@src/charts/lineAreaChart';
import { LineScatterChartProps } from '@src/charts/lineScatterChart';
import { ColumnLineChartProps } from '@src/charts/columnLineChart';
import { CheckedLegendType } from '@t/components/legend';
import { Options } from '@t/store/store';
import { CustomEventType, EventListener } from '@src/eventEmitter';
import { BoxPlotChartProps } from '@src/charts/boxPlotChart';
import { AddSeriesDataInfo } from '@src/charts/chart';

declare namespace tui {
  export class Chart {
    public static lineChart(props: LineChartProps): LineChart;

    public static areaChart(props: AreaChartProps): AreaChart;

    public static barChart(props: BarChartProps): BarChart;

    public static boxPlotChart(props: BoxPlotChartProps): BoxPlotChart;

    public static columnChart(props: ColumnChartProps): ColumnChart;

    public static pieChart(props: PieChartProps): PieChart;

    public static heatmapChart(props: HeatmapChartProps): HeatmapChart;

    public static bubbleChart(props: BubbleChartProps): BubbleChart;

    public static scatterChart(props: ScatterChartProps): ScatterChart;

    public static bulletChart(props: BulletChartProps): BulletChart;

    public static radarChart(props: RadarChartProps): RadarChart;

    public static treemapChart(props: TreemapChartProps): TreemapChart;

    public static nestedPieChart(props: NestedPieChartProps): NestedPieChart;

    public static lineAreaChart(props: LineAreaChartProps): LineAreaChart;

    public static lineScatterChart(props: LineScatterChartProps): LineScatterChart;

    public static columnLineChart(props: ColumnLineChartProps): ColumnLineChart;
  }
}

declare class BaseChart {
  public getCheckedLegend(): CheckedLegendType;

  public on(eventName: CustomEventType, handler: EventListener): void;

  public destroy(): void;

  public resize(size: Partial<Size>): void;

  public getOptions(): Options;

  public setTooltipOffset(point: Partial<Point>): void;
}

export class LineChart extends BaseChart {
  constructor(props: LineChartProps);

  public addData(data: LineSeriesDataType[], category?: string): void;

  public addPlotLine(data: PlotLine): void;

  public removePlotLine(id: string): void;

  public addPlotBand(data: PlotBand): void;

  public removePlotBand(id: string): void;

  public hideSeriesLabel(): void;

  public showSeriesLabel(): void;

  public setOptions(options: LineChartOptions): void;

  public updateOptions(options: LineChartOptions): void;
}

export class AreaChart extends BaseChart {
  constructor(props: AreaChartProps);

  public addData(data: AreaSeriesDataType[], category: string): void;

  public addPlotLine(data: PlotLine): void;

  public removePlotLine(id: string): void;

  public addPlotBand(data: PlotBand): void;

  public removePlotBand(id: string): void;

  public hideSeriesLabel(): void;

  public showSeriesLabel(): void;

  public setOptions(options: AreaChartOptions): void;

  public updateOptions(options: AreaChartOptions): void;
}

export class BarChart extends BaseChart {
  constructor(props: BarChartProps);

  public addData(data: BoxSeriesDataType[], category: string): void;

  public hideSeriesLabel(): void;

  public showSeriesLabel(): void;

  public setOptions(options: BarChartOptions): void;

  public updateOptions(options: BarChartOptions): void;
}

export class BoxPlotChart extends BaseChart {
  constructor(props: BoxPlotChartProps);

  public addData(data: number[][], category: string): void;

  public addSeries(data: BoxPlotSeriesType, dataInfo?: AddSeriesDataInfo): void;

  public setData(data: BoxPlotSeriesData): void;

  public setOptions(options: BoxPlotChartOptions): void;

  public updateOptions(options: BoxPlotChartOptions): void;
}

export class ColumnChart extends BaseChart {
  constructor(props: ColumnChartProps);

  public addData(data: BoxSeriesDataType[], category: string): void;

  public hideSeriesLabel(): void;

  public showSeriesLabel(): void;

  public setOptions(options: ColumnChartOptions): void;

  public updateOptions(options: ColumnChartOptions): void;
}

export class PieChart extends BaseChart {
  constructor(props: PieChartProps);

  public hideSeriesLabel(): void;

  public showSeriesLabel(): void;

  public setOptions(options: PieChartOptions): void;

  public updateOptions(options: PieChartOptions): void;
}

export class HeatmapChart extends BaseChart {
  constructor(props: HeatmapChartProps);

  public addData(data: HeatmapSeriesDataType, category: string): void;

  public hideSeriesLabel(): void;

  public showSeriesLabel(): void;

  public setOptions(options: HeatmapChartOptions): void;

  public updateOptions(options: HeatmapChartOptions): void;
}

export class BubbleChart extends BaseChart {
  constructor(props: BubbleChartProps);

  public addData(data: BubbleSeriesDataType[]): void;

  public setOptions(options: BubbleChartOptions): void;

  public updateOptions(options: BubbleChartOptions): void;
}

export class ScatterChart extends BaseChart {
  constructor(props: ScatterChartProps);

  public addData(data: CoordinateDataType[]): void;

  public setOptions(options: ScatterChartOptions): void;

  public updateOptions(options: ScatterChartOptions): void;
}

export class BulletChart extends BaseChart {
  constructor(props: BulletChartProps);

  public hideSeriesLabel(): void;

  public showSeriesLabel(): void;

  public setOptions(options: BulletChartOptions): void;

  public updateOptions(options: BulletChartOptions): void;
}

export class RadarChart extends BaseChart {
  constructor(props: RadarChartProps);

  public addData(data: number[], category: string): void;

  public setOptions(options: RadarChartOptions): void;

  public updateOptions(options: RadarChartOptions): void;
}

export class TreemapChart extends BaseChart {
  constructor(props: TreemapChartProps);

  public hideSeriesLabel(): void;

  public showSeriesLabel(): void;

  public setOptions(options: TreemapChartOptions): void;

  public updateOptions(options: TreemapChartOptions): void;
}

export class NestedPieChart extends BaseChart {
  constructor(props: NestedPieChartProps);

  public hideSeriesLabel(): void;

  public showSeriesLabel(): void;

  public setOptions(options: NestedPieChartOptions): void;

  public updateOptions(options: NestedPieChartOptions): void;
}

export class LineAreaChart extends BaseChart {
  constructor(props: LineAreaChartProps);

  public addData(
    data: LineSeriesDataType[] | AreaSeriesDataType[],
    category: string,
    chartType: 'line' | 'area'
  ): void;

  public addPlotLine(data: PlotLine): void;

  public removePlotLine(id: string): void;

  public addPlotBand(data: PlotBand): void;

  public removePlotBand(id: string): void;

  public hideSeriesLabel(): void;

  public showSeriesLabel(): void;

  public setOptions(options: LineAreaChartOptions): void;

  public updateOptions(options: LineAreaChartOptions): void;
}

export class LineScatterChart extends BaseChart {
  constructor(props: LineScatterChartProps);

  public addData(data: CoordinateDataType[], chartType: 'line' | 'scatter'): void;

  public setOptions(options: LineScatterChartOptions): void;

  public updateOptions(options: LineScatterChartOptions): void;
}

export class ColumnLineChart extends BaseChart {
  constructor(props: ColumnLineChartProps);

  public addData(
    data: BoxSeriesDataType[] | LineSeriesDataType[],
    category: string,
    chartType: 'line' | 'column'
  ): void;

  public addPlotLine(data: PlotLine): void;

  public removePlotLine(id: string): void;

  public addPlotBand(data: PlotBand): void;

  public removePlotBand(id: string): void;

  public hideSeriesLabel(): void;

  public showSeriesLabel(): void;

  public setOptions(options: ColumnLineChartOptions): void;

  public updateOptions(options: ColumnLineChartOptions): void;
}

export { LineChartOptions, LineSeriesData };

export default tui.Chart;
