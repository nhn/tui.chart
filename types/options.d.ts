import { Series } from '@t/store/store';

export type BoxRangeDataType = [number, number];
export type BoxSeriesDataType = number | BoxRangeDataType;

type LineSeriesDataType = number[] | Point[] | [number, number][] | [string, number][];
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

interface BaseOptions {
  chart?: BaseChartOptions;
  series?: BaseSeriesOptions;
  xAxis?: BaseAxisOptions;
  yAxis?: BaseAxisOptions;
}

interface BaseSeriesOptions {
  showLabel?: boolean;
  allowSelect?: boolean;
}

interface LineXaxisOptions extends BaseAxisOptions {
  pointOnColumn?: boolean;
}

interface LineSeriesOptions extends BaseSeriesOptions {
  showDot?: boolean;
  spline?: boolean;
}

export interface LineChartOptions extends BaseOptions {
  series?: LineSeriesOptions;
  xAxis?: LineXaxisOptions;
}

type StackType = 'normal' | 'percent';
type ConnectorLineType = 'dashed' | 'dotted' | 'solid' | 'double';

interface ConnectorInfo {
  type: ConnectorLineType;
  color?: string; // default: rgba(51, 85, 139, 0.7)
  width?: number; // default: 2
}

interface StackInfo {
  type: StackType;
  connector?: boolean | ConnectorInfo;
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
