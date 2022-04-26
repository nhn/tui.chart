import {
  AreaSeriesDataType,
  BoxSeriesDataType,
  BubbleSeriesDataType,
  CoordinateDataType,
  HeatmapSeriesDataType,
  LineChartOptions,
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
  BaseOptions,
  AreaSeriesData,
  BoxSeriesData,
  BoxPlotChartOptions,
  BoxPlotSeriesData,
  BubbleSeriesData,
  BulletSeriesData,
  ColumnLineData,
  LineAreaData,
  LineScatterData,
  PieSeriesData,
  NestedPieSeriesData,
  RadarSeriesData,
  ScatterSeriesData,
  BoxPlotSeriesType,
  LineSeriesData,
  BoxSeriesInput,
  LineSeriesInput,
  AreaSeriesInput,
  PieSeriesType,
  BubbleSeriesInput,
  ScatterSeriesInput,
  BulletSeriesType,
  RadarSeriesInput,
  TreemapSeriesType,
  NestedPieSeriesType,
  AxisLabelInfo,
  RadialBarSeriesType,
  RadialBarSeriesData,
  RadialBarChartOptions,
  GaugeSeriesDataType,
  GaugeSeriesData,
  GaugeChartOptions,
} from './options';
import { CheckedLegendType } from './components/legend';
import { Options, HeatmapSeriesData, TreemapSeriesData } from './store/store';
import { CustomEventType, EventListener } from './eventEmitter';
import { AddSeriesDataInfo, SelectSeriesInfo } from './charts';
import { TooltipData as TooltipDataInfo } from './components/tooltip';
import {
  AreaChartProps,
  LineChartProps,
  BoxPlotChartProps,
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
  RadialBarChartProps,
  GaugeChartProps,
} from './charts';

declare namespace toastui {
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

    public static radialBarChart(props: RadialBarChartProps): RadialBarChart;

    public static gaugeChart(props: GaugeChartProps): GaugeChart;
  }
}

declare class BaseChart {
  public getCheckedLegend(): CheckedLegendType;

  public on(eventName: CustomEventType, handler: EventListener): void;

  public destroy(): void;

  public resize(size: Partial<Size>): void;

  public getOptions(): Options;

  public setTooltipOffset(point: Partial<Point>): void;

  public selectSeries(seriesInfo: SelectSeriesInfo): void;

  public unselectSeries(): void;
}

export class LineChart extends BaseChart {
  constructor(props: LineChartProps);

  public addData(data: LineSeriesDataType[], category?: string): void;

  public addSeries(data: LineSeriesInput, dataInfo?: AddSeriesDataInfo): void;

  public setData(data: LineSeriesData): void;

  public addPlotLine(data: PlotLine): void;

  public removePlotLine(id: string): void;

  public addPlotBand(data: PlotBand): void;

  public removePlotBand(id: string): void;

  public hideSeriesDataLabel(): void;

  public showSeriesDataLabel(): void;

  public setOptions(options: LineChartOptions): void;

  public updateOptions(options: LineChartOptions): void;

  public showTooltip(seriesInfo: SelectSeriesInfo): void;

  public hideTooltip(): void;
}

export class AreaChart extends BaseChart {
  constructor(props: AreaChartProps);

  public addData(data: AreaSeriesDataType[], category: string): void;

  public addSeries(data: AreaSeriesInput, dataInfo?: AddSeriesDataInfo): void;

  public setData(data: AreaSeriesData): void;

  public addPlotLine(data: PlotLine): void;

  public removePlotLine(id: string): void;

  public addPlotBand(data: PlotBand): void;

  public removePlotBand(id: string): void;

  public hideSeriesDataLabel(): void;

  public showSeriesDataLabel(): void;

  public setOptions(options: AreaChartOptions): void;

  public updateOptions(options: AreaChartOptions): void;

  public showTooltip(seriesInfo: SelectSeriesInfo): void;

  public hideTooltip(): void;
}

export class BarChart extends BaseChart {
  constructor(props: BarChartProps);

  public addData(data: BoxSeriesDataType[], category: string): void;

  public addSeries(data: BoxSeriesInput<BoxSeriesDataType>, dataInfo?: AddSeriesDataInfo): void;

  public setData(data: BoxSeriesData): void;

  public hideSeriesDataLabel(): void;

  public showSeriesDataLabel(): void;

  public setOptions(options: BarChartOptions): void;

  public updateOptions(options: BarChartOptions): void;

  public showTooltip(seriesInfo: SelectSeriesInfo): void;

  public hideTooltip(): void;
}

export class BoxPlotChart extends BaseChart {
  constructor(props: BoxPlotChartProps);

  public addData(data: number[][], category: string): void;

  public addSeries(data: BoxPlotSeriesType, dataInfo?: AddSeriesDataInfo): void;

  public setData(data: BoxPlotSeriesData): void;

  public setOptions(options: BoxPlotChartOptions): void;

  public updateOptions(options: BoxPlotChartOptions): void;

  public showTooltip(seriesInfo: SelectSeriesInfo): void;

  public hideTooltip(): void;

  public addOutlier(): void;
}

export class ColumnChart extends BaseChart {
  constructor(props: ColumnChartProps);

  public addData(data: BoxSeriesDataType[], category: string): void;

  public addSeries(data: BoxSeriesInput<BoxSeriesDataType>, dataInfo?: AddSeriesDataInfo): void;

  public setData(data: BoxSeriesData): void;

  public hideSeriesDataLabel(): void;

  public showSeriesDataLabel(): void;

  public setOptions(options: ColumnChartOptions): void;

  public updateOptions(options: ColumnChartOptions): void;

  public showTooltip(seriesInfo: SelectSeriesInfo): void;

  public hideTooltip(): void;
}

export class PieChart extends BaseChart {
  constructor(props: PieChartProps);

  public addSeries(data: PieSeriesType, dataInfo?: AddSeriesDataInfo): void;

  public setData(data: PieSeriesData): void;

  public hideSeriesDataLabel(): void;

  public showSeriesDataLabel(): void;

  public setOptions(options: PieChartOptions): void;

  public updateOptions(options: PieChartOptions): void;

  public showTooltip(seriesInfo: SelectSeriesInfo): void;

  public hideTooltip(): void;
}

export class HeatmapChart extends BaseChart {
  constructor(props: HeatmapChartProps);

  public addData(data: HeatmapSeriesDataType, category: string): void;

  public addSeries(data: HeatmapSeriesDataType, dataInfo: AddSeriesDataInfo): void;

  public setData(data: HeatmapSeriesData): void;

  public hideSeriesDataLabel(): void;

  public showSeriesDataLabel(): void;

  public setOptions(options: HeatmapChartOptions): void;

  public updateOptions(options: HeatmapChartOptions): void;

  public showTooltip(seriesInfo: SelectSeriesInfo): void;

  public hideTooltip(): void;
}

export class BubbleChart extends BaseChart {
  constructor(props: BubbleChartProps);

  public addData(data: BubbleSeriesDataType[]): void;

  public addSeries(data: BubbleSeriesInput, dataInfo?: AddSeriesDataInfo): void;

  public setData(data: BubbleSeriesData): void;

  public setOptions(options: BubbleChartOptions): void;

  public updateOptions(options: BubbleChartOptions): void;

  public showTooltip(seriesInfo: SelectSeriesInfo): void;

  public hideTooltip(): void;
}

export class ScatterChart extends BaseChart {
  constructor(props: ScatterChartProps);

  public addData(data: CoordinateDataType[]): void;

  public addSeries(data: ScatterSeriesInput, dataInfo?: AddSeriesDataInfo): void;

  public setData(data: ScatterSeriesData): void;

  public setOptions(options: ScatterChartOptions): void;

  public updateOptions(options: ScatterChartOptions): void;

  public showTooltip(seriesInfo: SelectSeriesInfo): void;

  public hideTooltip(): void;
}

export class BulletChart extends BaseChart {
  constructor(props: BulletChartProps);

  public addSeries(data: BulletSeriesType, dataInfo?: AddSeriesDataInfo): void;

  public setData(data: BulletSeriesData): void;

  public hideSeriesDataLabel(): void;

  public showSeriesDataLabel(): void;

  public setOptions(options: BulletChartOptions): void;

  public updateOptions(options: BulletChartOptions): void;

  public showTooltip(seriesInfo: SelectSeriesInfo): void;

  public hideTooltip(): void;
}

export class RadarChart extends BaseChart {
  constructor(props: RadarChartProps);

  public addData(data: number[], category: string): void;

  public addSeries(data: RadarSeriesInput, dataInfo?: AddSeriesDataInfo): void;

  public setData(data: RadarSeriesData): void;

  public setOptions(options: RadarChartOptions): void;

  public updateOptions(options: RadarChartOptions): void;

  public showTooltip(seriesInfo: SelectSeriesInfo): void;

  public hideTooltip(): void;
}

export class TreemapChart extends BaseChart {
  constructor(props: TreemapChartProps);

  public addSeries(data: TreemapSeriesType, dataInfo?: AddSeriesDataInfo): void;

  public setData(data: TreemapSeriesData): void;

  public hideSeriesDataLabel(): void;

  public showSeriesDataLabel(): void;

  public setOptions(options: TreemapChartOptions): void;

  public updateOptions(options: TreemapChartOptions): void;

  public showTooltip(seriesInfo: SelectSeriesInfo): void;

  public hideTooltip(): void;
}

export class NestedPieChart extends BaseChart {
  constructor(props: NestedPieChartProps);

  public addSeries(data: NestedPieSeriesType, dataInfo?: AddSeriesDataInfo): void;

  public setData(data: NestedPieSeriesData): void;

  public hideSeriesDataLabel(): void;

  public showSeriesDataLabel(): void;

  public setOptions(options: NestedPieChartOptions): void;

  public updateOptions(options: NestedPieChartOptions): void;

  public showTooltip(seriesInfo: SelectSeriesInfo): void;

  public hideTooltip(): void;
}

export class LineAreaChart extends BaseChart {
  constructor(props: LineAreaChartProps);

  public addData(
    data: LineSeriesDataType[] | AreaSeriesDataType[],
    category: string,
    chartType: 'line' | 'area'
  ): void;

  public addSeries(
    data: LineSeriesInput | AreaSeriesInput,
    addSeriesDataInfo: AddSeriesDataInfo
  ): void;

  public setData(data: LineAreaData): void;

  public addPlotLine(data: PlotLine): void;

  public removePlotLine(id: string): void;

  public addPlotBand(data: PlotBand): void;

  public removePlotBand(id: string): void;

  public hideSeriesDataLabel(): void;

  public showSeriesDataLabel(): void;

  public setOptions(options: LineAreaChartOptions): void;

  public updateOptions(options: LineAreaChartOptions): void;

  public showTooltip(seriesInfo: SelectSeriesInfo): void;

  public hideTooltip(): void;
}

export class LineScatterChart extends BaseChart {
  constructor(props: LineScatterChartProps);

  public addData(data: CoordinateDataType[], chartType: 'line' | 'scatter'): void;

  public setData(data: LineScatterData): void;

  public addSeries(data: ScatterSeriesInput, addSeriesDataInfo: AddSeriesDataInfo): void;

  public setOptions(options: LineScatterChartOptions): void;

  public updateOptions(options: LineScatterChartOptions): void;

  public showTooltip(seriesInfo: SelectSeriesInfo): void;

  public hideTooltip(): void;
}

export class ColumnLineChart extends BaseChart {
  constructor(props: ColumnLineChartProps);

  public addData(
    data: BoxSeriesDataType[] | LineSeriesDataType[],
    category: string,
    chartType: 'line' | 'column'
  ): void;

  public addSeries(data, dataInfo: AddSeriesDataInfo): void;

  public setData(data: ColumnLineData): void;

  public addPlotLine(data: PlotLine): void;

  public removePlotLine(id: string): void;

  public addPlotBand(data: PlotBand): void;

  public removePlotBand(id: string): void;

  public hideSeriesDataLabel(): void;

  public showSeriesDataLabel(): void;

  public setOptions(options: ColumnLineChartOptions): void;

  public updateOptions(options: ColumnLineChartOptions): void;

  public showTooltip(seriesInfo: SelectSeriesInfo): void;

  public hideTooltip(): void;
}

export class RadialBarChart extends BaseChart {
  constructor(props: RadialBarChartProps);

  public addSeries(data: RadialBarSeriesType): void;

  public setData(data: RadialBarSeriesData): void;

  public hideSeriesDataLabel(): void;

  public showSeriesDataLabel(): void;

  public setOptions(options: RadialBarChartOptions): void;

  public updateOptions(options: RadialBarChartOptions): void;

  public showTooltip(seriesInfo: SelectSeriesInfo): void;

  public hideTooltip(): void;
}

export class GaugeChart extends BaseChart {
  constructor(props: GaugeChartProps);

  public addData(data: GaugeSeriesDataType[], category?: string);

  public setData(data: GaugeSeriesData): void;

  public hideSeriesDataLabel(): void;

  public showSeriesDataLabel(): void;

  public setOptions(options: GaugeChartOptions): void;

  public updateOptions(options: GaugeChartOptions): void;

  public showTooltip(seriesInfo: SelectSeriesInfo): void;

  public hideTooltip(): void;
}

export {
  BaseOptions,
  AreaChartOptions,
  AreaSeriesData,
  BarChartOptions,
  BoxSeriesData,
  BoxPlotChartOptions,
  BoxPlotSeriesData,
  BubbleSeriesData,
  BulletChartOptions,
  BulletSeriesData,
  ColumnChartOptions,
  ColumnLineChartOptions,
  ColumnLineData,
  HeatmapChartOptions,
  HeatmapSeriesData,
  LineChartOptions,
  LineSeriesData,
  LineAreaChartOptions,
  LineAreaData,
  LineScatterChartOptions,
  LineScatterData,
  PieChartOptions,
  PieSeriesData,
  NestedPieChartOptions,
  NestedPieSeriesData,
  RadarChartOptions,
  RadarSeriesData,
  ScatterChartOptions,
  ScatterSeriesData,
  TreemapChartOptions,
  TreemapSeriesData,
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
  CustomEventType,
  EventListener,
  TooltipDataInfo,
  AxisLabelInfo,
  RadialBarChartProps,
  RadialBarChartOptions,
  RadialBarSeriesData,
  GaugeChartProps,
  GaugeChartOptions,
  GaugeSeriesData,
  BubbleChartOptions,
};

export default toastui.Chart;
