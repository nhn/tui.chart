import { RawSeries } from '@t/store/store';
export type RangeDataType = [number, number];
export type BoxSeriesDataType = number | RangeDataType;
type LineSeriesDataType = number | Point | [number, number] | [string, number];
export type AreaSeriesDataType = number | RangeDataType;
export type Align = 'top' | 'bottom' | 'right' | 'left';
export interface Point {
  x: number;
  y: number;
}

export type CoordinateDataType = ObjectDatetimePoint | ArrayDatetimePoint;
export type ArrayDatetimePoint = [string, number] | [Date, number] | [number, number];
export type ObjectDatetimePoint = Point | { x: Date; y: number } | { x: string; y: number };
export type BubblePoint = ObjectDatetimePoint & { r: number };
export type BubbleSeriesDataType = { label: string } & BubblePoint;

export type BezierPoint = {
  controlPoint?: {
    next: Point;
    prev: Point;
  };
} & Point;

export interface Size {
  width: number;
  height: number;
}

export type Rect = Point & Size;

export interface AreaSeriesType {
  name: string;
  rawData: AreaSeriesDataType[];
  data: AreaSeriesDataType[];
  color: string;
}

export interface AreaSeriesData {
  categories: string[];
  series: Pick<AreaSeriesType, 'name' | 'data'>[];
}

export interface LineSeriesType {
  name: string;
  data: LineSeriesDataType[];
  rawData: LineSeriesDataType[];
  color: string;
}

export interface LineSeriesData {
  categories?: string[];
  series: Pick<LineSeriesType, 'name' | 'data'>[];
}

export interface ScatterSeriesType {
  name: string;
  data: CoordinateDataType[];
  color: string;
}

export interface BubbleSeriesType {
  name: string;
  data: BubbleSeriesDataType[];
  color: string;
}

export interface ScatterSeriesData {
  categories?: string[];
  series: Pick<ScatterSeriesType, 'name' | 'data'>[];
}

export interface BubbleSeriesData {
  series: Pick<BubbleSeriesType, 'name' | 'data'>[];
}

export type PieSeriesType = {
  name: string;
  data: number;
  color?: string;
};

export type PieSeriesData = {
  categories?: string[];
  series: PieSeriesType[];
};

interface TitleOption {
  text: string;
  offsetX?: number;
  offsetY?: number;
  align?: 'left' | 'right' | 'center';
}

export type BaseChartOptions = {
  title?: string | TitleOption;
} & Size;

export interface Scale {
  min?: number;
  max?: number;
  stepSize?: 'auto' | number;
}

export type AxisTitleOption = Omit<TitleOption, 'align'>;
type AxisTitle = string | AxisTitleOption;

type BaseAxisOptions = {
  tick?: {
    interval?: number;
  };
  label?: {
    interval?: number;
  };
  scale?: Scale;
  title?: AxisTitle;
  width?: number;
};

interface LineTypeXAxisOptions extends BaseXAxisOptions {
  pointOnColumn?: boolean;
}

interface BaseXAxisOptions extends BaseAxisOptions {
  rotateLabel?: boolean;
  date?:
    | boolean
    | {
        format: string;
      };
}

interface BarTypeYAxisOptions extends BaseAxisOptions {
  align?: 'center';
}

export type PlotLineValue = string | number;

interface BasePlotOptions {
  lines?: { value: PlotLineValue; color: string }[];
  bands?: {
    range: [PlotLineValue, PlotLineValue];
    color: string;
  }[];
}

interface ExportMenuOptions {
  filename?: string;
  visible?: boolean;
}

interface BaseOptions {
  chart?: BaseChartOptions;
  series?: BaseSeriesOptions;
  xAxis?: BaseXAxisOptions;
  yAxis?: BaseAxisOptions;
  plot?: BasePlotOptions;
  legend?: BaseLegendOptions;
  exportMenu?: ExportMenuOptions;
}

interface BaseLegendOptions {
  align?: Align;
  showCheckbox?: boolean;
  visible?: boolean;
  maxWidth?: number;
  width?: number;
}

interface CircleLegendOptions {
  visible?: boolean;
}

interface BaseSeriesOptions {
  allowSelect?: boolean;
  dataLabels?: DataLabels;
}

interface LineTypeSeriesOptions extends BaseSeriesOptions {
  showDot?: boolean;
  spline?: boolean;
  zoomable?: boolean;
}

interface AreaSeriesOptions extends LineTypeSeriesOptions {
  stack?: StackOptionType;
}

export interface AreaChartOptions extends BaseOptions {
  series?: AreaSeriesOptions;
  xAxis?: LineTypeXAxisOptions;
}

export interface LineChartOptions extends BaseOptions {
  series?: LineTypeSeriesOptions;
  xAxis?: LineTypeXAxisOptions;
}

export interface ScatterChartOptions extends BaseOptions {
  series?: BaseSeriesOptions;
  xAxis?: BaseXAxisOptions;
}

export interface BubbleChartOptions extends BaseOptions {
  series?: BaseSeriesOptions;
  xAxis?: BaseXAxisOptions;
  circleLegend?: CircleLegendOptions;
}

type ConnectorLineType = 'dashed' | 'solid';

interface Connector {
  type: ConnectorLineType;
  color?: string;
  width?: number;
}

export type StackType = 'normal' | 'percent';

interface StackInfo {
  type: StackType;
  connector?: boolean | Connector;
}

type StackOptionType = boolean | StackInfo;
interface BoxSeriesOptions extends BaseSeriesOptions {
  barWidth?: number;
  diverging?: boolean;
  colorByPoint?: boolean;
  stack?: StackOptionType;
}

export interface BarChartOptions extends BaseOptions {
  series?: BoxSeriesOptions;
  yAxis?: BarTypeYAxisOptions;
}

export interface ColumnChartOptions extends BaseOptions {
  series?: BoxSeriesOptions;
}

interface PieSeriesOptions extends BaseSeriesOptions {
  radiusRange?: [number, number];
  startAngle?: number;
  endAngle?: number;
}

export interface PieChartOptions extends BaseOptions {
  series?: PieSeriesOptions;
}

export interface BoxSeriesType<T extends BoxSeriesDataType> {
  name: string;
  data: T[];
  rawData: T[];
  color: string;
  stackGroup?: string;
}

export interface BoxSeriesData {
  categories: string[];
  series: BoxSeriesType<BoxSeriesDataType>[];
}

export interface ChartProps<T> {
  el: Element;
  series: RawSeries;
  categories?: string[];
  options: T;
}

export type SeriesDataType =
  | BoxSeriesDataType
  | AreaSeriesDataType
  | LineSeriesDataType
  | CoordinateDataType
  | BubbleSeriesDataType;

export type DataLabelAnchor = 'center' | 'start' | 'end' | 'auto';
export type DataLabelStyle = {
  font?: string;
  color?: string;
  textStrokeColor?: string;
};
export type DataLabelStackTotal = {
  visible?: boolean;
  style?: DataLabelStyle;
};

export type DataLabelPieSeriesName = {
  visible: boolean;
  anchor?: 'center' | 'outer';
  style?: DataLabelStyle;
};

export type DataLabels = {
  visible?: boolean;
  anchor?: DataLabelAnchor;
  offsetX?: number;
  offsetY?: number;
  formatter?: (value: SeriesDataType) => string;
  style?: DataLabelStyle;
  stackTotal?: DataLabelStackTotal;
  pieSeriesName?: DataLabelPieSeriesName;
};
