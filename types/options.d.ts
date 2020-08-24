import { RawSeries } from '@t/store/store';
import { TooltipModel } from '@t/components/tooltip';
export type RangeDataType = [number, number];
export type BoxSeriesDataType = number | RangeDataType;
type LineSeriesDataType = number | Point | [number, number] | [string, number];
export type AreaSeriesDataType = number | RangeDataType;
export type Align = 'top' | 'bottom' | 'right' | 'left';
export interface Point {
  x: number;
  y: number;
}

export type CoordinateDataType = [number, number] | Point | DatetimePoint;
type ObjectTypeDatetimePoint = { x: Date; y: number } | { x: string; y: number };
type TupleTypeDatetimePoint = [string, number] | [Date, number];
export type DatetimePoint = ObjectTypeDatetimePoint | TupleTypeDatetimePoint;
export type BubblePoint = (Point | ObjectTypeDatetimePoint) & { r: number };
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

type BasePlotOptions = {
  showLine?: boolean;
};

export type AreaLinePlotOptions = BasePlotOptions & {
  lines?: { value: PlotLineValue; color: string }[];
  bands?: {
    range: [PlotLineValue, PlotLineValue];
    color: string;
  }[];
};

interface ExportMenuOptions {
  filename?: string;
  visible?: boolean;
}

type Formatter = (value: SeriesDataType) => string;
export type DefaultTooltipTemplate = { header: string; body: string };

export type TooltipTemplateFunc = (
  model: TooltipModel,
  defaultTemplate: DefaultTooltipTemplate
) => string;

interface BaseTooltipOptions {
  template?: TooltipTemplateFunc;
  offsetX?: number;
  offsetY?: number;
  formatter?: Formatter;
}

interface BaseOptions {
  chart?: BaseChartOptions;
  series?: BaseSeriesOptions;
  xAxis?: BaseXAxisOptions;
  yAxis?: BaseAxisOptions;
  legend?: BaseLegendOptions;
  exportMenu?: ExportMenuOptions;
  tooltip?: BaseTooltipOptions;
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
  selectable?: boolean;
  dataLabels?: DataLabels;
  animation?: boolean | { duration: number };
}

interface LineTypeSeriesOptions extends BaseSeriesOptions {
  showDot?: boolean;
  spline?: boolean;
  zoomable?: boolean;
  lineWidth?: number;
}

interface AreaSeriesOptions extends LineTypeSeriesOptions {
  stack?: StackOptionType;
}

export interface AreaChartOptions extends BaseOptions {
  series?: AreaSeriesOptions;
  xAxis?: LineTypeXAxisOptions;
  plot?: AreaLinePlotOptions;
}

export interface LineChartOptions extends BaseOptions {
  series?: LineTypeSeriesOptions;
  xAxis?: LineTypeXAxisOptions;
  plot?: AreaLinePlotOptions;
}

export interface ScatterChartOptions extends BaseOptions {
  series?: BaseSeriesOptions;
  xAxis?: BaseXAxisOptions;
  plot?: BasePlotOptions;
}

export interface BubbleChartOptions extends BaseOptions {
  series?: BaseSeriesOptions;
  xAxis?: BaseXAxisOptions;
  circleLegend?: CircleLegendOptions;
  plot?: BasePlotOptions;
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
  plot?: BasePlotOptions;
}

export interface ColumnChartOptions extends BaseOptions {
  series?: BoxSeriesOptions;
  plot?: BasePlotOptions;
}

interface PieSeriesOptions extends BaseSeriesOptions {
  radiusRange?: {
    inner?: number | string;
    outer?: number | string;
  };
  angleRange?: {
    start?: number;
    end?: number;
  };
  clockwise?: boolean;
}

export interface PieChartOptions extends BaseOptions {
  series?: PieSeriesOptions;
}

export type RadarSeriesType = {
  name: string;
  data: number[];
  color?: string;
};

export type RadarSeriesData = {
  categories?: string[];
  series: Pick<RadarSeriesType, 'name' | 'data'>[];
};

interface RadarSeriesOptions extends BaseSeriesOptions {
  showDot?: boolean;
  showArea?: boolean;
}

export type RadarPlotType = 'spiderweb' | 'circle';

export interface RadarChartOptions extends BaseOptions {
  series?: RadarSeriesOptions;
  plot?: {
    type: RadarPlotType;
  };
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
  formatter?: Formatter;
  style?: DataLabelStyle;
  stackTotal?: DataLabelStackTotal;
  pieSeriesName?: DataLabelPieSeriesName;
};
