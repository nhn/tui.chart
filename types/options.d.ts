import { Series } from '@t/store/store';

export type RangeDataType = [number, number];
export type BoxSeriesDataType = number | RangeDataType;
type LineSeriesDataType =
  | number[]
  | Point[]
  | [number, number][]
  | [string, number][];
type CoordinateSeriesDataType =
  | Point[]
  | [number, number][]
  | [string, number][];
export type CoordinateDataType = Point | [number, number] | [string, number];
export type AreaSeriesDataType = number[] | RangeDataType[];
export type BubbleSeriesDataType = ({ label: string; r: number } & Point)[];

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
  data: AreaSeriesDataType;
}

export interface AreaSeriesData {
  categories: string[];
  series: AreaSeriesType[];
}

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

export interface BubbleSeriesType {
  name: string;
  data: BubbleSeriesDataType;
}

export interface ScatterSeriesData {
  categories?: string[];
  series: ScatterSeriesType[];
}

export interface BubbleSeriesData {
  series: BubbleSeriesType[];
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
