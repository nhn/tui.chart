import { SeriesRaw } from '@t/store/store';
import DataLabel from '@src/component/dataLabel';

export type RangeDataType = [number, number];
export type BoxSeriesDataType = number | RangeDataType;
type LineSeriesDataType = number[] | Point[] | [number, number][] | [string, number][];
type CoordinateSeriesDataType = Point[] | [number, number][] | [string, number][];
export type CoordinateDataType = Point | [number, number] | [string, number];
export type AreaSeriesDataType = number[] | RangeDataType[];
export type BubbleSeriesDataType = ({ label: string } & BubblePoint)[];
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

export type Rect = Point &
  Size & {
    outsideSize?: number;
  };
export interface AreaSeriesType {
  name: string;
  data: AreaSeriesDataType;
  color: string;
}

export interface AreaSeriesData {
  categories: string[];
  series: Pick<AreaSeriesType, 'name' | 'data'>[];
}

export interface LineSeriesType {
  name: string;
  data: LineSeriesDataType;
  color: string;
}

export interface LineSeriesData {
  categories?: string[];
  series: Pick<LineSeriesType, 'name' | 'data'>[];
}

export interface ScatterSeriesType {
  name: string;
  data: CoordinateSeriesDataType;
  color: string;
}

export interface BubbleSeriesType {
  name: string;
  data: BubbleSeriesDataType;
  color: string;
}

export interface ScatterSeriesData {
  categories?: string[];
  series: Pick<ScatterSeriesType, 'name' | 'data'>[];
}

export interface BubbleSeriesData {
  series: Pick<BubbleSeriesType, 'name' | 'data'>[];
}

interface TitleOptions {
  text?: string;
  offsetX?: number;
  offsetY?: number;
  align?: string;
}

type BaseChartOptions = {
  title?: string | TitleOptions;
} & Size;

export interface Scale {
  min?: number;
  max?: number;
  stepSize?: 'auto' | number;
}

type BaseAxisOptions = {
  tick?: {
    interval?: number;
  };
  label?: {
    interval?: number;
  };
  scale?: Scale;
};

interface LineTypeXAxisOptions extends BaseXAxisOptions {
  pointOnColumn?: boolean;
}

interface BaseXAxisOptions extends BaseAxisOptions {
  // @TODO: 추가 필요
  rotateLabel?: boolean;
}

type PlotLineValue = string | number;

interface BasePlotOptions {
  lines?: { value: PlotLineValue; color: string }[];
  bands?: {
    range: [PlotLineValue, PlotLineValue];
    value: PlotLineValue;
    color: string;
  }[];
}

interface BaseOptions {
  chart?: BaseChartOptions;
  series?: BaseSeriesOptions;
  xAxis?: BaseXAxisOptions;
  yAxis?: BaseAxisOptions;
  plot?: BasePlotOptions;
  legend?: BaseLegendOptions;
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

export interface AreaChartOptions extends BaseOptions {
  series?: LineTypeSeriesOptions;
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
}

export interface ColumnChartOptions extends BaseOptions {
  series?: BoxSeriesOptions;
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

export type DataLabelAnchor = 'center' | 'start' | 'end';
export type DataLabelAlign = 'center' | 'start' | 'end' | 'left' | 'right' | 'top' | 'bottom';
export type DataLabelStyle = {
  font?: string;
  color?: ((data: any) => string) | string;
};

export type DataLabels = {
  visible: boolean;
  anchor?: DataLabelAnchor;
  align?: DataLabelAlign;
  offset?: number;
  rotation?: number;
  formatter?: (value: string | number) => string;
  style?: DataLabelStyle;
  stackTotal?: {
    visible: boolean;
    style?: DataLabelStyle;
  };
};
