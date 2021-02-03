import { Categories, RawSeries, Options, StoreModule } from '@t/store/store';
import { TooltipData, TooltipModel } from '@t/components/tooltip';
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
  BoxPlotCharThemeOptions,
  BulletCharThemeOptions,
  ColumnLineChartThemeOptions,
} from '@t/theme';
import { AxisType } from '@src/component/axis';
export type RangeDataType<T> = [T, T];
export type BoxSeriesDataType = number | RangeDataType<number>;
type LineSeriesDataType = number | Point | [number, number] | [string, number] | null;
type HeatmapSeriesDataType = (number | null)[];
export type HeatmapCategoriesType = { x: string[]; y: string[] };
export type AreaSeriesDataType = number | RangeDataType<number> | null;
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
  data?: number | null;
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
  data: (CoordinateDataType | null)[];
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
  data: (BubbleSeriesDataType | null)[];
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
  data: number | null;
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

type ChartSizeInput = number | 'auto';

type ChartSize = {
  width?: ChartSizeInput;
  height?: ChartSizeInput;
};

export type BaseChartOptions = {
  title?: string | TitleOption;
  animation?: AnimationOptions;
} & ChartSize;

export interface Scale {
  min?: number;
  max?: number;
  stepSize?: 'auto' | number;
}

type AxisLabelInfo = { axisName: AxisType; labels: string[]; index: number };
type AxisFormatter = (value: string, axisLabelInfo: AxisLabelInfo) => string;
export type AxisTitleOption = Omit<TitleOption, 'align'>;
type AxisTitle = string | AxisTitleOption;

type BaseAxisOptions = {
  tick?: {
    interval?: number;
  };
  label?: {
    interval?: number;
    formatter?: AxisFormatter;
    margin?: number;
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
  date?: DateOption;
  label?: {
    interval?: number;
    formatter?: AxisFormatter;
    margin?: number;
    rotatable?: boolean;
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
  id?: string;
};

export type PlotBand = {
  range: PlotRangeType | PlotRangeType[];
  color: string;
  opacity?: number;
  mergeOverlappingRanges?: boolean;
  id?: string;
};

type PlotOptions = BaseSizeOptions & {
  visible?: boolean;
};

export type LineTypePlotOptions = PlotOptions & {
  lines?: PlotLine[];
  bands?: PlotBand[];
};

interface ExportMenuOptions {
  filename?: string;
  visible?: boolean;
}

type TooltipFormatter = (value: SeriesDataType, tooltipDataInfo?: TooltipData) => string;
type ValueFormatter = (value: SeriesDataType) => string;
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
  formatter?: TooltipFormatter;
  transition?: string | boolean;
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
  usageStatistics?: boolean;
}

type ResponsiveRule = {
  condition: ({ width, height }: Size) => boolean;
  options: Options;
};

type ResponsiveOptions = {
  animation?: AnimationOptions;
  rules?: ResponsiveRule[];
};

interface BaseLegendOptions {
  align?: Align;
  showCheckbox?: boolean;
  visible?: boolean;
  width?: number;
}

interface CircleLegendOptions {
  visible?: boolean;
}

interface BaseSeriesOptions {
  selectable?: boolean;
}

interface BoxPlotSeriesOptions extends BaseSeriesOptions {
  eventDetectType?: BoxTypeEventDetectType;
}

export interface HeatmapChartOptions extends BaseOptions {
  yAxis?: BaseAxisOptions & { date?: DateOption };
  theme?: HeatmapChartThemeOptions;
  series?: BaseSeriesOptions & { shift?: boolean; dataLabels?: Omit<DataLabelOptions, 'anchor'> };
}

export interface BoxPlotChartOptions extends BaseOptions {
  series?: BoxPlotSeriesOptions;
  yAxis?: BaseAxisOptions;
  plot?: PlotOptions;
  theme?: BoxPlotCharThemeOptions;
}

interface LineTypeSeriesOptions extends BaseSeriesOptions {
  showDot?: boolean;
  spline?: boolean;
  zoomable?: boolean;
  eventDetectType?: LineTypeEventDetectType;
  shift?: boolean;
  dataLabels?: Omit<DataLabelOptions, 'anchor'>;
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
  dataLabels?: DataLabelOptions;
} & BaseSeriesOptions;

export interface LineScatterChartOptions extends BaseOptions {
  series?: LineScatterChartSeriesOptions;
  yAxis?: BothSidesYAxisOptions;
  plot?: LineTypePlotOptions;
  theme?: LineScatterChartThemeOptions;
}

export interface LineAreaChartOptions extends BaseOptions {
  series?: LineAreaChartSeriesOptions;
  plot?: LineTypePlotOptions;
  yAxis?: BothSidesYAxisOptions;
  theme?: LineAreaChartThemeOptions;
}

type LineAreaChartSeriesOptions = {
  line?: Pick<LineTypeSeriesOptions, 'spline' | 'showDot' | 'dataLabels'> & BaseSeriesOptions;
  area?: Pick<AreaSeriesOptions, 'stack' | 'spline' | 'showDot' | 'dataLabels'> & BaseSeriesOptions;
  zoomable?: boolean;
  showDot?: boolean;
  spline?: boolean;
  shift?: boolean;
  dataLabels?: DataLabelOptions;
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
  diverging?: boolean;
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
  theme?: BoxChartThemeOptions;
}

export type BoxPlotSeriesType = {
  name: string;
  data: number[][] | null;
  outliers?: number[][] | null;
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
  data: Array<number | null>;
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
  el: HTMLElement;
  series: RawSeries;
  categories?: Categories;
  modules?: StoreModule[];
  options: T;
}

export type SeriesDataType =
  | BoxSeriesDataType
  | AreaSeriesDataType
  | LineSeriesDataType
  | CoordinateDataType
  | BubbleSeriesDataType;

export type DataLabelAnchor = 'center' | 'start' | 'end' | 'auto' | 'outer';

export type StackTotalDataLabel = {
  visible?: boolean;
  formatter?: ValueFormatter;
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
  formatter?: ValueFormatter;
};

export interface BoxDataLabels extends DataLabelOptions {
  stackTotal?: StackTotalDataLabel;
}
export interface PieDataLabels extends DataLabelOptions {
  pieSeriesName?: DataLabelPieSeriesName;
}

export interface TreemapDataLabels extends Omit<DataLabelOptions, 'anchor'> {
  useTreemapLeaf?: boolean;
}

export interface BulletChartOptions extends BaseOptions {
  yAxis?: BaseAxisOptions;
  series?: BulletSeriesOptions;
  plot?: PlotOptions;
  theme?: BulletCharThemeOptions;
}

export type BulletSeriesType = {
  name: string;
  data: number | null;
  markers?: number[];
  ranges?: Array<RangeDataType<number> | null>;
  color?: string;
};

export type BulletSeriesData = {
  series: BulletSeriesType[];
};

export interface BulletSeriesOptions extends BaseSeriesOptions {
  vertical?: boolean;
  dataLabels?: DataLabelOptions;
  eventDetectType?: BoxTypeEventDetectType;
}

type ColumnLineChartSeriesOptions = {
  column?: Pick<BoxSeriesOptions, 'stack' | 'dataLabels' | 'selectable'>;
  line?: Pick<LineTypeSeriesOptions, 'spline' | 'showDot' | 'dataLabels' | 'selectable'>;
  shift?: boolean;
  dataLabels?: DataLabelOptions;
  eventDetectType?: BoxTypeEventDetectType;
} & BaseSeriesOptions;

export interface ColumnLineChartOptions extends BaseOptions {
  series?: ColumnLineChartSeriesOptions;
  plot?: LineTypePlotOptions;
  yAxis?: BothSidesYAxisOptions;
  theme?: ColumnLineChartThemeOptions;
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

export type NestedPieSeriesOptions = Record<string, PieSeriesOptions> &
  BaseSeriesOptions & { dataLabels?: PieDataLabels };

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
