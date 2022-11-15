import { Categories, RawSeries, Options, StoreModule } from './store/store';
import { TooltipData, TooltipModel } from './components/tooltip';
import { ScatterSeriesIconType } from './components/series';
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
  RadialBarChartThemeOptions,
  GaugeChartThemeOptions,
} from './theme';

export type RangeDataType<T> = [T, T];
export type BoxSeriesDataType = number | RangeDataType<number> | null;
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
export type GaugeSeriesDataType = string | number;

export type LineTypeEventDetectType = 'near' | 'nearest' | 'grouped' | 'point';
export type BoxTypeEventDetectType = 'grouped' | 'point';
export type CircleTypeEventDetectType = 'grouped' | 'point';

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
  visible?: boolean;
}

export type AreaSeriesInput = Pick<AreaSeriesType, 'name' | 'data' | 'visible'>;

export interface AreaSeriesData {
  categories: string[];
  series: AreaSeriesInput[];
}

export interface LineSeriesType {
  name: string;
  data: LineSeriesDataType[];
  rawData: LineSeriesDataType[];
  color: string;
  visible?: boolean;
}

export type LineSeriesInput = Pick<LineSeriesType, 'name' | 'data' | 'visible'>;

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
  visible?: boolean;
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
  visible?: boolean;
}

export type ScatterSeriesInput = Pick<ScatterSeriesType, 'name' | 'data' | 'visible'>;

export interface ScatterSeriesData {
  categories?: string[];
  series: ScatterSeriesInput[];
}

export type BubbleSeriesInput = Pick<BubbleSeriesType, 'name' | 'data' | 'visible'>;

export interface BubbleSeriesData {
  series: BubbleSeriesInput[];
}

export type PieSeriesType = {
  name: string;
  data: number | null;
  parentName?: string;
  rootParentName?: string;
  color?: string;
  visible?: boolean;
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

type AxisLabelInfo = {
  axisName: 'xAxis' | 'yAxis' | 'secondaryYAxis';
  labels: string[];
  index: number;
};
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

type DataLabelData = GaugeSeriesDataType[];

type TooltipFormatter = (value: SeriesDataType, tooltipDataInfo?: TooltipData) => string;
type ValueFormatter = (value: SeriesDataType, dataLabelData?: DataLabelData) => string;
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

interface LangOptions {
  noData?: string;
}

export interface BaseOptions {
  chart?: BaseChartOptions;
  lang?: LangOptions;
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
  visible?: boolean;
  width?: number;
}

interface NormalLegendOptions extends BaseLegendOptions {
  showCheckbox?: boolean;
  item?: {
    width?: number;
    overflow?: 'ellipsis';
  };
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
  rangeSelectable?: boolean;
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
  legend?: NormalLegendOptions;
  theme?: AreaChartThemeOptions;
}

export interface LineChartOptions extends BaseOptions {
  series?: LineTypeSeriesOptions;
  xAxis?: LineTypeXAxisOptions;
  yAxis?: BothSidesYAxisOptions;
  plot?: LineTypePlotOptions;
  legend?: NormalLegendOptions;
  theme?: LineChartThemeOptions;
}

type LineScatterChartSeriesOptions = {
  line?: Pick<LineTypeSeriesOptions, 'spline' | 'showDot'>;
  dataLabels?: DataLabelOptions;
  legend?: NormalLegendOptions;
} & BaseSeriesOptions;

export interface LineScatterChartOptions extends BaseOptions {
  series?: LineScatterChartSeriesOptions;
  yAxis?: BothSidesYAxisOptions;
  plot?: LineTypePlotOptions;
  legend?: NormalLegendOptions;
  theme?: LineScatterChartThemeOptions;
}

export interface LineAreaChartOptions extends BaseOptions {
  series?: LineAreaChartSeriesOptions;
  plot?: LineTypePlotOptions;
  yAxis?: BothSidesYAxisOptions;
  legend?: NormalLegendOptions;
  theme?: LineAreaChartThemeOptions;
}

type LineAreaChartSeriesOptions = {
  line?: Pick<LineTypeSeriesOptions, 'spline' | 'showDot' | 'dataLabels'> & BaseSeriesOptions;
  area?: Pick<AreaSeriesOptions, 'stack' | 'spline' | 'showDot' | 'dataLabels'> & BaseSeriesOptions;
  zoomable?: boolean;
  rangeSelectable?: boolean;
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
  legend?: NormalLegendOptions;
  theme?: ScatterChartThemeOptions;
}

export interface BubbleChartOptions extends BaseOptions {
  series?: BaseSeriesOptions;
  xAxis?: BaseXAxisOptions;
  yAxis?: BaseAxisOptions;
  circleLegend?: CircleLegendOptions;
  plot?: PlotOptions;
  legend?: NormalLegendOptions;
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
  legend?: NormalLegendOptions;
  theme?: BoxChartThemeOptions;
}

export type ColumnChartBoxSeriesOptions = BoxSeriesOptions & {
  shift?: boolean;
  rangeSelectable?: boolean;
};

export interface ColumnChartOptions extends BaseOptions {
  series?: ColumnChartBoxSeriesOptions;
  yAxis?: BothSidesYAxisOptions;
  plot?: PlotOptions;
  legend?: NormalLegendOptions;
  theme?: BoxChartThemeOptions;
}

export type BoxPlotSeriesType = {
  name: string;
  data: number[][] | null;
  outliers?: number[][] | null;
  color?: string;
  visible?: boolean;
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
  legend?: NormalLegendOptions;
  theme?: PieChartThemeOptions;
}

export type RadarSeriesType = {
  name: string;
  data: Array<number | null>;
  color?: string;
  visible?: boolean;
};

export type RadarSeriesInput = Pick<RadarSeriesType, 'name' | 'data' | 'visible'>;

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
  verticalAxis?: RadialValueAxisOptions;
  circularAxis?: BaseRadialAxisOptions;
  legend?: NormalLegendOptions;
  theme?: RadarChartThemeOptions;
}

export type BoxSeriesInput<T extends BoxSeriesDataType> = Pick<
  BoxSeriesType<T>,
  'data' | 'name' | 'stackGroup' | 'visible'
>;

export interface BoxSeriesType<T extends BoxSeriesDataType> {
  name: string;
  data: T[];
  rawData: T[];
  color: string | string[];
  stackGroup?: string;
  visible?: boolean;
  colorByCategories?: boolean;
}

export interface BoxSeriesData {
  categories: string[];
  series: BoxSeriesInput<BoxSeriesDataType>[];
  colorByCategories?: boolean;
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
  | BubbleSeriesDataType
  | GaugeSeriesDataType;

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
  visible?: boolean;
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
  rangeSelectable?: boolean;
} & BaseSeriesOptions;

export interface ColumnLineChartOptions extends BaseOptions {
  series?: ColumnLineChartSeriesOptions;
  plot?: LineTypePlotOptions;
  yAxis?: BothSidesYAxisOptions;
  legend?: NormalLegendOptions;
  theme?: ColumnLineChartThemeOptions;
}

export type ColumnLineData = {
  categories: string[];
  series: {
    column: Pick<BoxSeriesType<BoxSeriesDataType>, 'name' | 'data' | 'visible'>[];
    line: Pick<LineSeriesType, 'name' | 'data' | 'visible'>[];
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
  legend?: NormalLegendOptions;
  theme?: NestedPieChartThemeOptions;
}

export interface RadialBarSeriesType {
  name: string;
  data: (number | null)[];
  color?: string;
  visible?: boolean;
}

export interface RadialBarSeriesData {
  categories: string[];
  series: RadialBarSeriesType[];
}

interface BaseRadialAxisOptions {
  tick?: {
    interval?: number;
  };
  label?: {
    interval?: number;
    formatter?: AxisFormatter;
    margin?: number;
  };
}

interface RadialValueAxisOptions extends BaseRadialAxisOptions {
  scale?: Scale;
}

export interface RadialBarChartOptions extends BaseOptions {
  verticalAxis?: BaseRadialAxisOptions;
  circularAxis?: RadialValueAxisOptions;
  series?: RadialBarSeriesOptions;
  legend?: NormalLegendOptions;
  theme?: RadialBarChartThemeOptions;
}

interface RadialBarSeriesOptions extends BaseSeriesOptions {
  radiusRange?: {
    inner?: number | string;
    outer?: number | string;
  };
  clockwise?: boolean;
  angleRange?: {
    start: number;
    end: number;
  };
  eventDetectType?: CircleTypeEventDetectType;
  dataLabels?: DataLabelOptions;
}

export type GaugeSeriesType = {
  name: string;
  data: GaugeSeriesDataType[];
  color?: string;
};

export interface GaugeSeriesData {
  categories?: string[];
  series: Omit<GaugeSeriesType, 'color'>[];
}

type GaugePlotBand = {
  color: string;
  range: number[] | string[];
  id?: string;
};
export interface GaugeChartOptions extends BaseOptions {
  circularAxis?: GaugeAxisOptions;
  series?: GaugeSeriesOptions;
  plot?: BaseSizeOptions & {
    bands?: GaugePlotBand[];
  };
  theme?: GaugeChartThemeOptions;
}

type GaugeSolidOptions = {
  clockHand: boolean;
};

interface GaugeAxisOptions extends BaseRadialAxisOptions {
  scale?: Scale;
  title?: AxisTitle;
}
export interface GaugeSeriesOptions extends BaseSeriesOptions {
  solid?: boolean | Partial<GaugeSolidOptions>;
  clockwise?: boolean;
  angleRange?: {
    start: number;
    end: number;
  };
  dataLabels?: Omit<DataLabelOptions, 'anchor'>;
}

type GaugeSeriesInput = Omit<GaugeSeriesType, 'color'>;

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
  | NestedPieSeriesType
  | RadialBarSeriesType
  | GaugeSeriesType;

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
  | NestedPieSeriesData
  | RadialBarSeriesData
  | GaugeSeriesData;

type UsingRadialAxesChartTypeTheme =
  | Required<RadarChartThemeOptions>
  | Required<RadialBarChartThemeOptions>;
