import { Series } from '@t/store/store';

// type LineSeriesDataType = number[] | Array<Array<number | string>> | Point[];
type LineSeriesDataType = number[]; // @TODO: use ⬆️ type (coordinate)

export interface Point {
  x: number;
  y: number;
}

export type SplinePoint = {
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
  categories: string[];
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

interface BaseOptions {
  chart?: BaseChartOptions;
  series?: BaseSeriesOptions;
  xAxis?: {
    pointOnColumn?: boolean;
  };
  yAxis?: {
    // title?: string | TitleConfig;
    // labelMargin?: number;
    // min?: number;
    // max?: number;
    // align?: string;
    // suffix?: string;
    // prefix?: string;
    // chartType?: string;
    // maxWidth?: number;
  };
  // yAxis?: ;
  // tooltip?: ;
  // legend?: ;
  // plot?: ;
  // theme?: ;
  // libType?: ;
  // chartExportMenu?: {
  //   filename?: string;
  //   visible?: boolean;
  // };
  // usageStatistics?: boolean
}

// interface AnimationOptions {
// duration: number;
// }

interface BaseSeriesOptions {
  showLabel?: boolean;
  allowSelect?: boolean;
}

interface LineSeriesOptions extends BaseSeriesOptions {
  showDot?: boolean;
  spline?: boolean;
  // zoomable?: boolean;
  // shifting?: boolean;
  // pointWidth?: number;
  // animation?: boolean | AnimationOptions;
}

export interface LineChartOptions extends BaseOptions {
  series?: LineSeriesOptions;
}

// ⬇️ 차트 내부에서 사용, 정리 필요
export type Options = LineChartOptions;

export interface ChartProps {
  el: Element;
  series: Series;
  categories: string[];
  options: Options;
}
