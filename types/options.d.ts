import { Series } from '@t/store/store';

export type BoxRangeDataType = [number, number];
export type BoxSeriesDataType = number | BoxRangeDataType;
type LineSeriesDataType = number[] | Point[] | [number, number][] | [string, number][];
type CoordinateSeriesDataType = Point[] | [number, number][] | [string, number][];
export type CoordinateDataType = Point | [number, number] | [string, number];

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

export interface LineSeriesType {
  name: string;
  data: LineSeriesDataType;
}

export interface LineSeriesData {
  categories?: string[];
  series: LineSeriesType[];
}

export interface ScatterSeriesType {
  name: string;
  data: CoordinateSeriesDataType;
}

export interface ScatterSeriesData {
  categories?: string[];
  series: ScatterSeriesType[];
}

interface TitleOptions {
  text?: string;
  offsetX?: number;
  offsetY?: number;
  align?: string;
}

type BaseChartOptions = {
  title?: string | TitleOptions;
  // format?:
} & Size;

type BaseAxisOptions = {
  title?: string | TitleOptions;
};

interface BaseXAxisOptions extends BaseAxisOptions {
  pointOnColumn?: boolean;
}

interface BaseOptions {
  chart?: BaseChartOptions;
  series?: BaseSeriesOptions;
  xAxis?: BaseXAxisOptions;
  yAxis?: BaseAxisOptions;
}

interface BaseSeriesOptions {
  showLabel?: boolean;
  allowSelect?: boolean;
}

interface LineTypeSeriesOptions extends BaseSeriesOptions {
  showDot?: boolean;
  spline?: boolean;
}

export interface AreaChartOptions extends BaseOptions {
  series?: LineTypeSeriesOptions;
  xAxis?: BaseXAxisOptions;
}

export interface LineChartOptions extends BaseOptions {
  series?: LineTypeSeriesOptions;
  xAxis?: BaseXAxisOptions;
}

export interface ScatterChartOptions extends BaseOptions {
  series?: BaseSeriesOptions;
  xAxis?: BaseXAxisOptions;
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
  stackGroup?: string;
}

export interface BoxSeriesData {
  categories: string[];
  series: BoxSeriesType<BoxSeriesDataType>[];
}

export interface ChartProps<T> {
  el: Element;
  series: Series;
  categories?: string[];
  options: T;
}
