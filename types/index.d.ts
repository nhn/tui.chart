import {
  AreaSeriesDataType,
  BoxSeriesDataType,
  BubbleSeriesDataType,
  CoordinateDataType,
  HeatmapSeriesDataType,
  LineChartOptions,
  LineSeriesData,
  LineSeriesDataType,
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

declare namespace tui {
  export class Chart {
    public static lineChart(props: LineChartProps): LineChart;

    public static areaChart(props: AreaChartProps): AreaChart;

    public static barChart(props: BarChartProps): BarChart;

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

  public setOptions(options: Options): void;

  public on(eventName: CustomEventType, handler: EventListener): void;
}

export class LineChart extends BaseChart {
  constructor(props: LineChartProps);

  public addData(data: LineSeriesDataType[], category?: string): void;
}

export class AreaChart extends BaseChart {
  constructor(props: AreaChartProps);

  public addData(data: AreaSeriesDataType[], category: string): void;
}

export class BarChart extends BaseChart {
  constructor(props: BarChartProps);

  public addData(data: BoxSeriesDataType[], category: string): void;
}

export class ColumnChart extends BaseChart {
  constructor(props: ColumnChartProps);

  public addData(data: BoxSeriesDataType[], category: string): void;
}

export class PieChart extends BaseChart {
  constructor(props: PieChartProps);
}

export class HeatmapChart extends BaseChart {
  constructor(props: HeatmapChartProps);

  public addData(data: HeatmapSeriesDataType, category: string): void;
}

export class BubbleChart extends BaseChart {
  constructor(props: BubbleChartProps);

  public addData(data: BubbleSeriesDataType[]): void;
}

export class ScatterChart extends BaseChart {
  constructor(props: ScatterChartProps);

  public addData(data: CoordinateDataType[]): void;
}

export class BulletChart extends BaseChart {
  constructor(props: BulletChartProps);
}

export class RadarChart extends BaseChart {
  constructor(props: RadarChartProps);

  public addData(data: number[], category: string): void;
}

export class TreemapChart extends BaseChart {
  constructor(props: TreemapChartProps);
}

export class NestedPieChart extends BaseChart {
  constructor(props: NestedPieChartProps);
}

export class LineAreaChart extends BaseChart {
  constructor(props: LineAreaChartProps);

  public addData(
    data: LineSeriesDataType[] | AreaSeriesDataType[],
    category: string,
    chartType: 'line' | 'area'
  ): void;
}

export class LineScatterChart extends BaseChart {
  constructor(props: LineScatterChartProps);

  public addData(data: CoordinateDataType[], chartType: 'line' | 'scatter'): void;
}

export class ColumnLineChart extends BaseChart {
  constructor(props: ColumnLineChartProps);

  public addData(
    data: BoxSeriesDataType[] | LineSeriesDataType[],
    category: string,
    chartType: 'line' | 'column'
  ): void;
}

export { LineChartOptions, LineSeriesData };

export default tui.Chart;
