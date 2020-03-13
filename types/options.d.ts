interface Position {
  x: number;
  y: number;
}

type LineSeriesDataType = number[] | Array<Array<number | string>> | Position[];

export interface LineSeries {
  name: string;
  data: LineSeriesDataType;
}

export interface LineSeriesData {
  categories?: string[];
  series: LineSeries[];
}

export interface LineChart {
  container: Element;
  data: LineSeriesData;
  options: LineChartOptions;
}

interface TitleOptions {
  text?: string;
  offsetX?: number;
  offsetY?: number;
  align?: string;
}

interface BaseChartOptions {
  width?: number;
  height?: number;
  title?: string | TitleOptions;
  // format?:
}

interface BaseOptions {
  chart?: BaseChartOptions;
  series?: BaseSeriesOptions;
  xAxis?: {
    // pointOnColumn: boolean;
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

interface AnimationOptions {
  // duration: number;
}

interface BaseSeriesOptions {
  // showLabel?: boolean;
  // allowSelect?: boolean;
}

interface LineSeriesOptions extends BaseSeriesOptions {
  showDot?: boolean;
  // spline?: boolean;
  // zoomable?: boolean;
  // shifting?: boolean;
  // pointWidth?: number;
  // animation?: boolean | AnimationOptions;
}

export interface LineChartOptions extends BaseOptions {
  series?: LineSeriesOptions;
}

// ⬇️ 차트 내부에서 사용, 정리 필요
