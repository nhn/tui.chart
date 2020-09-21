import { Categories, RawSeries } from '@t/store/store';
import { TooltipModel } from '@t/components/tooltip';
export type RangeDataType<T> = [T, T];
export type BoxSeriesDataType = number | RangeDataType<number>;
type LineSeriesDataType = number | Point | [number, number] | [string, number];
type HeatmapSeriesDataType = number[];
export type HeatmapCategoriesType = { x: string[]; y: string[] };
export type AreaSeriesDataType = number | RangeDataType<number>;
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

export type LineTypeEventDetectType = 'near' | 'nearest' | 'grouped' | 'point';
export type BoxTypeEventDetectType = 'grouped' | 'point';

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

export interface HeatmapSeriesType {
  data: HeatmapSeriesDataType;
  yCategory: string;
}

export interface TreemapSeriesType {
  label: string;
  data?: number;
  colorValue?: number;
  children?: TreemapSeriesType[];
}

export interface TreemapSeriesData {
  series: TreemapSeriesType[];
}

export interface HeatmapSeriesData {
  categories: HeatmapCategoriesType;
  series: HeatmapSeriesDataType[];
}

export interface ScatterSeriesType {
  name: string;
  data: CoordinateDataType[];
  color: string;
}

export interface LineScatterData {
  series: {
    line: Pick<LineSeriesType, 'name' | 'data'>[];
    scatter: Pick<ScatterSeriesType, 'name' | 'data'>[];
  };
}

export interface LineAreaData {
  categories: string[];
  series: {
    line: Pick<LineSeriesType, 'name' | 'data'>[];
    area: Pick<AreaSeriesType, 'name' | 'data'>[];
  };
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
  animation?: boolean | { duration: number };
} & Size;

export interface Scale {
  min?: number;
  max?: number;
  stepSize?: 'auto' | number;
}

type BaseSizeOptions = Partial<Size>;

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
} & BaseSizeOptions;

interface LineTypeXAxisOptions extends BaseXAxisOptions {
  pointOnColumn?: boolean;
}

type YAxisOptions = BaseAxisOptions & {
  chartType?: string;
};

type BothSidesYAxisOptions = YAxisOptions | YAxisOptions[];

interface BaseXAxisOptions extends BaseAxisOptions {
  rotateLabel?: boolean;
  date?:
    | boolean
    | {
        format: string;
      };
}

type BarTypeYAxisOption = BaseAxisOptions & {
  align?: 'center';
  categories?: string[];
};
type BarTypeYAxisOptions = BarTypeYAxisOption | BarTypeYAxisOption[];

export type PlotXPointType = number | string;

export type PlotRangeType = RangeDataType<PlotXPointType>;

export type PlotLine = {
  value: PlotXPointType;
  color: string;
  opacity?: number;
  vertical?: boolean;
};

export type PlotBand = {
  range: PlotRangeType | PlotRangeType[];
  color: string;
  opacity?: number;
  mergeOverlappingRanges?: boolean;
};

type PlotOptions = BaseSizeOptions & {
  showLine?: boolean;
};

export type LineTypePlotOptions = PlotOptions & {
  lines?: PlotLine[];
  bands?: PlotBand[];
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

export interface BaseOptions {
  chart?: BaseChartOptions;
  series?: BaseSeriesOptions;
  xAxis?: BaseXAxisOptions;
  legend?: BaseLegendOptions;
  exportMenu?: ExportMenuOptions;
  tooltip?: BaseTooltipOptions;
  plot?: BaseSizeOptions;
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
  dataLabels?: DataLabelOptions;
}

interface BoxPlotSeriesOptions extends BaseSeriesOptions {
  eventDetectType?: BoxTypeEventDetectType;
}

export interface BoxPlotChartOptions extends BaseOptions {
  series?: BoxPlotSeriesOptions;
  yAxis?: BaseAxisOptions;
  plot?: PlotOptions;
}

interface LineTypeSeriesOptions extends BaseSeriesOptions {
  showDot?: boolean;
  spline?: boolean;
  zoomable?: boolean;
  lineWidth?: number;
  eventDetectType?: LineTypeEventDetectType;
}

interface AreaSeriesOptions extends LineTypeSeriesOptions {
  stack?: StackOptionType;
}

export interface AreaChartOptions extends BaseOptions {
  series?: AreaSeriesOptions;
  xAxis?: LineTypeXAxisOptions;
  yAxis?: BothSidesYAxisOptions;
  plot?: LineTypePlotOptions;
}

export interface LineChartOptions extends BaseOptions {
  series?: LineTypeSeriesOptions;
  xAxis?: LineTypeXAxisOptions;
  yAxis?: BothSidesYAxisOptions;
  plot?: LineTypePlotOptions;
}

type LineScatterChartSeriesOptions = {
  line?: Pick<LineTypeSeriesOptions, 'lineWidth' | 'spline' | 'showDot'>;
} & BaseSeriesOptions;

export interface LineScatterChartOptions extends BaseOptions {
  series?: LineScatterChartSeriesOptions;
  yAxis?: BothSidesYAxisOptions;
  plot?: PlotOptions;
}

export interface LineAreaChartOptions extends BaseOptions {
  series?: LineAreaChartSeriesOptions;
  plot?: LineTypePlotOptions;
  yAxis?: BothSidesYAxisOptions;
}

type LineAreaChartSeriesOptions = {
  line?: Pick<LineTypeSeriesOptions, 'lineWidth' | 'spline' | 'showDot'> & BaseSeriesOptions;
  area?: Pick<AreaSeriesOptions, 'lineWidth' | 'stack' | 'spline' | 'showDot'> & BaseSeriesOptions;
  zoomable?: boolean;
  showDot?: boolean;
  lineWidth?: number;
  spline?: boolean;
} & BaseSeriesOptions;

export interface ScatterChartOptions extends BaseOptions {
  series?: BaseSeriesOptions;
  xAxis?: BaseXAxisOptions;
  yAxis?: BaseAxisOptions;
  plot?: PlotOptions;
}

export interface BubbleChartOptions extends BaseOptions {
  series?: BaseSeriesOptions;
  xAxis?: BaseXAxisOptions;
  yAxis?: BaseAxisOptions;
  circleLegend?: CircleLegendOptions;
  plot?: PlotOptions;
}

export interface TreemapChartSeriesOptions extends BaseSeriesOptions {
  useColorValue?: boolean;
  zoomable?: boolean;
  dataLabels?: TreemapDataLabels;
}

export interface TreemapChartOptions extends BaseOptions {
  series?: TreemapChartSeriesOptions;
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
export interface BoxSeriesOptions extends BaseSeriesOptions {
  barWidth?: number;
  diverging?: boolean;
  colorByPoint?: boolean;
  stack?: StackOptionType;
  eventDetectType?: BoxTypeEventDetectType;
}

export interface BarChartOptions extends BaseOptions {
  series?: BoxSeriesOptions;
  yAxis?: BarTypeYAxisOptions;
  plot?: PlotOptions;
}

export interface ColumnChartOptions extends BaseOptions {
  series?: BoxSeriesOptions;
  yAxis?: BothSidesYAxisOptions;
  plot?: PlotOptions;
}

export type BoxPlotSeriesType = {
  name: string;
  data: number[][];
  outliers?: number[][];
  color?: string;
};

export type BoxPlotSeriesData = {
  categories: string[];
  series: BoxPlotSeriesType[];
};

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
  categories: string[];
  series: Pick<RadarSeriesType, 'name' | 'data'>[];
};

interface RadarSeriesOptions extends BaseSeriesOptions {
  showDot?: boolean;
  showArea?: boolean;
}

export type RadarPlotType = 'spiderweb' | 'circle';

export interface RadarChartOptions extends BaseOptions {
  series?: RadarSeriesOptions;
  plot?: BaseSizeOptions & { type?: RadarPlotType };
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
  categories?: Categories;
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
export type SubDataLabel = {
  visible?: boolean;
  style?: DataLabelStyle;
};

export type DataLabelPieSeriesName = {
  visible: boolean;
  anchor?: 'center' | 'outer';
  style?: DataLabelStyle;
};

export type DataLabelOptions = {
  visible?: boolean;
  anchor?: DataLabelAnchor;
  offsetX?: number;
  offsetY?: number;
  formatter?: Formatter;
  style?: DataLabelStyle;
  // @TODO: 각각 차트에 맞게 분리해서 해야하지 않나
  stackTotal?: SubDataLabel;
  pieSeriesName?: DataLabelPieSeriesName;
};

export interface TreemapDataLabels extends DataLabelOptions {
  useTreemapLeaf?: boolean;
}

export interface BulletChartOptions extends BaseOptions {
  yAxis?: BaseAxisOptions;
  series?: BulletSeriesOptions;
  plot?: PlotOptions;
}

export type BulletSeriesType = {
  name: string;
  data: number;
  markers: number[];
  ranges: RangeDataType<number>[];
  color?: string;
};

export type BulletSeriesData = {
  series: BulletSeriesType[];
};

export interface BulletSeriesOptions extends BaseSeriesOptions {
  vertical?: boolean;
}

type ColumnLineChartSeriesOptions = {
  column?: Pick<BoxSeriesOptions, 'barWidth' | 'stack'>;
  line?: Pick<LineTypeSeriesOptions, 'lineWidth' | 'spline' | 'showDot'>;
} & BaseSeriesOptions;

export interface ColumnLineChartOptions extends BaseOptions {
  series?: ColumnLineChartSeriesOptions;
  plot?: LineTypePlotOptions;
  yAxis?: BothSidesYAxisOptions;
}

export type ColumnLineData = {
  categories: string[];
  series: {
    column: Pick<BoxSeriesType<BoxSeriesDataType>, 'name' | 'data'>[];
    line: Pick<LineSeriesType, 'name' | 'data'>[];
  };
};
