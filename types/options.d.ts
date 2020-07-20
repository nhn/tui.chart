import { SeriesRaw } from '@t/store/store';

export type RangeDataType = [number, number];
export type BoxSeriesDataType = number | RangeDataType;
type LineSeriesDataType = number | Point | [number, number] | [string, number];
export type CoordinateDataType = Point | [number, number] | [string, number];
export type AreaSeriesDataType = number | RangeDataType;
export type BubbleSeriesDataType = { label: string } & BubblePoint;
export type PieSeriesDataType = number;
export type BubblePoint = Point & { r: number };
export type Align = 'top' | 'bottom' | 'right' | 'left';

export interface Point {
  x: number;
  y: number;
}

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
  categories?: [string];
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
  // @TODO: 추가 필요
  rotateLabel?: boolean;
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
}

interface AreaTypeSeriesOptions extends BaseSeriesOptions {
  showDot?: boolean;
  spline?: boolean;
  stack?: StackOptionType;
}

export interface AreaChartOptions extends BaseOptions {
  series?: AreaTypeSeriesOptions;
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
  radiusRange?: [string, string];
}

export interface PieChartOptions extends BaseOptions {
  series?: PieSeriesOptions;
}

export interface BoxSeriesType<T extends BoxSeriesDataType> {
  name: string;
  data: T[];
  color: string;
  stackGroup?: string;
}

export interface BoxSeriesData {
  categories: string[];
  series: BoxSeriesType<BoxSeriesDataType>[];
}

export interface ChartProps<T> {
  el: Element;
  series: SeriesRaw;
  categories?: string[];
  options: T;
}

export type SeriesDataType =
  | BoxSeriesDataType
  | AreaSeriesDataType
  | LineSeriesDataType
  | CoordinateDataType
  | BubbleSeriesDataType
  | PieSeriesDataType;

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
