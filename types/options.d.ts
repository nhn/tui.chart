import { Categories, RawSeries, Options } from '@t/store/store';
import { TooltipModel } from '@t/components/tooltip';
import { ScatterSeriesIconType } from '@t/components/series';
import {
  AreaChartThemeOptions,
  BaseThemeOptions,
  BubbleChartThemeOptions,
  HeatmapChartThemeOptions,
  LineAreaChartThemeOptions,
  LineChartThemeOptions,
  LineScatterChartThemeOptions,
  NestedPieChartThemeOptions,
  PieChartThemeOptions,
  ScatterChartThemeOptions,
  TooltipTheme,
  TreemapChartThemeOptions,
  RadarChartThemeOptions,
  BoxChartThemeOptions,
} from '@t/theme';
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

export type AreaSeriesInput = Pick<AreaSeriesType, 'name' | 'data'>;

export interface AreaSeriesData {
  categories: string[];
  series: AreaSeriesInput[];
}

export interface LineSeriesType {
  name: string;
  data: LineSeriesDataType[];
  rawData: LineSeriesDataType[];
  color: string;
}

export type LineSeriesInput = Pick<LineSeriesType, 'name' | 'data'>;

export interface LineSeriesData {
  categories?: string[];
  series: LineSeriesInput[];
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
  iconType: ScatterSeriesIconType;
}

export interface LineScatterData {
  series: {
    line: LineSeriesInput[];
    scatter: ScatterSeriesInput[];
  };
}

export interface LineAreaData {
  categories: string[];
  series: {
    line: LineSeriesInput[];
    area: AreaSeriesInput[];
  };
}

export interface BubbleSeriesType {
  name: string;
  data: BubbleSeriesDataType[];
  color: string;
}

export type ScatterSeriesInput = Pick<ScatterSeriesType, 'name' | 'data'>;

export interface ScatterSeriesData {
  categories?: string[];
  series: ScatterSeriesInput[];
}

export type BubbleSeriesInput = Pick<BubbleSeriesType, 'name' | 'data'>;

export interface BubbleSeriesData {
  series: BubbleSeriesInput[];
}

export type PieSeriesType = {
  name: string;
  data: number;
  parentName?: string;
  rootParentName?: string;
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

type BaseSizeOptions = Partial<Size>;

type AnimationOptions = boolean | { duration: number };

export type BaseChartOptions = {
  title?: string | TitleOption;
  animation?: AnimationOptions;
} & BaseSizeOptions;

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
} & BaseSizeOptions;

interface LineTypeXAxisOptions extends BaseXAxisOptions {
  pointOnColumn?: boolean;
}

type YAxisOptions = BaseAxisOptions & {
  chartType?: string;
};

type BothSidesYAxisOptions = YAxisOptions | YAxisOptions[];

type DateOption = boolean | { format: string };

interface BaseXAxisOptions extends BaseAxisOptions {
  rotateLabel?: boolean;
  date?: DateOption;
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
  defaultTemplate: DefaultTooltipTemplate,
  theme: Required<TooltipTheme>
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
  theme?: BaseThemeOptions;
  responsive?: ResponsiveOptions;
}

export type ResponsiveObjectType = {
  animation?: AnimationOptions;
  rules?: ResponsiveRule[];
};

type ResponsiveRule = {
  condition: ({ width, height }: Size) => boolean;
  options: Options;
};

type ResponsiveOptions = boolean | ResponsiveObjectType;

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

export interface HeatmapChartOptions extends BaseOptions {
  yAxis?: BaseAxisOptions & { date: DateOption };
  theme?: HeatmapChartThemeOptions;
  series?: BaseSeriesOptions & { shift?: boolean };
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
  eventDetectType?: LineTypeEventDetectType;
  shift?: boolean;
}

interface AreaSeriesOptions extends LineTypeSeriesOptions {
  stack?: StackOptionType;
}

export interface AreaChartOptions extends BaseOptions {
  series?: AreaSeriesOptions;
  xAxis?: LineTypeXAxisOptions;
  yAxis?: BothSidesYAxisOptions;
  plot?: LineTypePlotOptions;
  theme?: AreaChartThemeOptions;
}

export interface LineChartOptions extends BaseOptions {
  series?: LineTypeSeriesOptions;
  xAxis?: LineTypeXAxisOptions;
  yAxis?: BothSidesYAxisOptions;
  plot?: LineTypePlotOptions;
  theme?: LineChartThemeOptions;
}

type LineScatterChartSeriesOptions = {
  line?: Pick<LineTypeSeriesOptions, 'spline' | 'showDot'>;
} & BaseSeriesOptions;

export interface LineScatterChartOptions extends BaseOptions {
  series?: LineScatterChartSeriesOptions;
  yAxis?: BothSidesYAxisOptions;
  plot?: PlotOptions;
  theme?: LineScatterChartThemeOptions;
}

export interface LineAreaChartOptions extends BaseOptions {
  series?: LineAreaChartSeriesOptions;
  plot?: LineTypePlotOptions;
  yAxis?: BothSidesYAxisOptions;
  theme?: LineAreaChartThemeOptions;
}

type LineAreaChartSeriesOptions = {
  line?: Pick<LineTypeSeriesOptions, 'spline' | 'showDot'> & BaseSeriesOptions;
  area?: Pick<AreaSeriesOptions, 'stack' | 'spline' | 'showDot'> & BaseSeriesOptions;
  zoomable?: boolean;
  showDot?: boolean;
  lineWidth?: number;
  spline?: boolean;
  shift?: boolean;
} & BaseSeriesOptions;

export interface ScatterChartOptions extends BaseOptions {
  series?: BaseSeriesOptions;
  xAxis?: BaseXAxisOptions;
  yAxis?: BaseAxisOptions;
  plot?: PlotOptions;
  theme?: ScatterChartThemeOptions;
}

export interface BubbleChartOptions extends BaseOptions {
  series?: BaseSeriesOptions;
  xAxis?: BaseXAxisOptions;
  yAxis?: BaseAxisOptions;
  circleLegend?: CircleLegendOptions;
  plot?: PlotOptions;
  theme?: BubbleChartThemeOptions;
}

export interface TreemapChartSeriesOptions extends BaseSeriesOptions {
  useColorValue?: boolean;
  zoomable?: boolean;
  dataLabels?: TreemapDataLabels;
}

export interface TreemapChartOptions extends BaseOptions {
  series?: TreemapChartSeriesOptions;
  theme?: TreemapChartThemeOptions;
}

export type StackType = 'normal' | 'percent';

interface StackInfo {
  type: StackType;
  connector?: boolean;
}

type StackOptionType = boolean | StackInfo;
export interface BoxSeriesOptions extends BaseSeriesOptions {
  barWidth?: number;
  diverging?: boolean;
  colorByPoint?: boolean;
  stack?: StackOptionType;
  eventDetectType?: BoxTypeEventDetectType;
  dataLabels?: BoxDataLabels;
}

export interface BarChartOptions extends BaseOptions {
  series?: BoxSeriesOptions;
  yAxis?: BarTypeYAxisOptions;
  plot?: PlotOptions;
  theme?: BoxChartThemeOptions;
}

export interface ColumnChartOptions extends BaseOptions {
  series?: BoxSeriesOptions & { shift?: boolean };
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
  dataLabels?: PieDataLabels;
}

export interface PieChartOptions extends BaseOptions {
  series?: PieSeriesOptions;
  theme?: PieChartThemeOptions;
}

export type RadarSeriesType = {
  name: string;
  data: number[];
  color?: string;
};

export type RadarSeriesInput = Pick<RadarSeriesType, 'name' | 'data'>;

export type RadarSeriesData = {
  categories: string[];
  series: RadarSeriesInput[];
};

interface RadarSeriesOptions extends BaseSeriesOptions {
  showDot?: boolean;
  showArea?: boolean;
}

export type RadarPlotType = 'spiderweb' | 'circle';

export interface RadarChartOptions extends BaseOptions {
  series?: RadarSeriesOptions;
  plot?: BaseSizeOptions & { type?: RadarPlotType };
  yAxis?: BaseAxisOptions;
  theme?: RadarChartThemeOptions;
}

export type BoxSeriesInput<T extends BoxSeriesDataType> = Pick<
  BoxSeriesType<T>,
  'data' | 'name' | 'stackGroup'
>;

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

export type DataLabelAnchor = 'center' | 'start' | 'end' | 'auto' | 'outer';

export type SubDataLabel = {
  visible?: boolean;
};

export type DataLabelPieSeriesName = {
  visible: boolean;
  anchor?: 'center' | 'outer';
};

export type DataLabelOptions = {
  visible?: boolean;
  anchor?: DataLabelAnchor;
  offsetX?: number;
  offsetY?: number;
  formatter?: Formatter;
};

export interface BoxDataLabels extends DataLabelOptions {
  stackTotal?: SubDataLabel;
}
export interface PieDataLabels extends DataLabelOptions {
  pieSeriesName?: DataLabelPieSeriesName;
}

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
  line?: Pick<LineTypeSeriesOptions, 'spline' | 'showDot'>;
  shift?: boolean;
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

export type NestedPieSeriesType = {
  name: string;
  data: PieSeriesType[];
};

export type NestedPieSeriesData = {
  categories?: string[];
  series: NestedPieSeriesType[];
};

export type NestedPieSeriesOptions = Record<string, PieSeriesOptions & BaseSeriesOptions> &
  BaseSeriesOptions;

export interface NestedPieChartOptions extends BaseOptions {
  series?: NestedPieSeriesOptions;
  theme?: NestedPieChartThemeOptions;
}

export type SeriesDataInput =
  | LineSeriesInput
  | AreaSeriesInput
  | ScatterSeriesInput
  | BubbleSeriesInput
  | TreemapSeriesType
  | RadarSeriesInput
  | PieSeriesType
  | HeatmapSeriesDataType
  | BulletSeriesType
  | BoxPlotSeriesType
  | BoxSeriesInput<BoxSeriesDataType>
  | NestedPieSeriesType;

export type DataInput =
  | LineSeriesData
  | AreaSeriesData
  | BoxSeriesData
  | BoxPlotSeriesData
  | ScatterSeriesData
  | BubbleSeriesData
  | BulletSeriesData
  | HeatmapSeriesData
  | PieSeriesData
  | RadarSeriesData
  | TreemapSeriesData
  | LineAreaData
  | LineScatterData
  | ColumnLineData
  | NestedPieSeriesData;
