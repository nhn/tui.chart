import {
  LineChartOptions,
  LineSeriesType,
  Rect,
  BoxSeriesType,
  BarChartOptions,
  ColumnChartOptions,
  BoxSeriesDataType,
  ScatterSeriesType,
  AreaSeriesType,
  AreaChartOptions,
  StackType,
  BubbleSeriesType,
  BubbleChartOptions,
  Align,
  AxisTitleOption,
  PieSeriesType,
  RangeDataType,
  RadarSeriesType,
  RadarChartOptions,
  BoxPlotSeriesType,
  BulletSeriesType,
  BulletChartOptions,
  LineScatterChartOptions,
  ColumnLineChartOptions,
  PlotLine,
  PlotBand,
  BoxPlotChartOptions,
  PieChartOptions,
  TreemapSeriesType,
  HeatmapSeriesType,
  HeatmapCategoriesType,
  HeatmapChartOptions,
  NestedPieChartOptions,
  TitleOption,
  Size,
  AnimationOptions,
  NestedPieSeriesType,
  LineAreaChartOptions,
  ScatterChartOptions,
} from '@t/options';
import Store from '@src/store/store';
import { LegendData } from '@t/components/legend';
import { ScatterSeriesIconType } from '@t/components/series';
import { Theme } from '@t/theme';

type ChartSeriesMap = {
  line: LineSeriesType[];
  scatter: ScatterSeriesType[];
  bar: BoxSeriesType<BoxSeriesDataType>[];
  column: BoxSeriesType<BoxSeriesDataType>[];
  area: AreaSeriesType[];
  bubble: BubbleSeriesType[];
  pie: PieSeriesType[] | NestedPieSeriesType[];
  radar: RadarSeriesType[];
  boxPlot: BoxPlotSeriesType[];
  bullet: BulletSeriesType[];
  treemap: TreemapSeriesType[];
  heatmap: HeatmapSeriesType[];
};

export type ChartType = keyof ChartSeriesMap;

export type BoxType = 'bar' | 'column';

type RawSeries = Partial<ChartSeriesMap>;

type SeriesGroup = {
  seriesCount: number;
  seriesGroupCount: number;
};

type Series = {
  [key in ChartType]?: {
    data: ChartSeriesMap[key];
    colors?: string[];
  } & SeriesGroup;
};

type ValueOf<T> = T[keyof T];

export type ChartOptionsMap = {
  line: LineChartOptions;
  bar: BarChartOptions;
  column: ColumnChartOptions;
  area: AreaChartOptions;
  bubble: BubbleChartOptions;
  radar: RadarChartOptions;
  pie: PieChartOptions | NestedPieChartOptions;
  boxPlot: BoxPlotChartOptions;
  bullet: BulletChartOptions;
  scatter: ScatterChartOptions;
  lineScatter: LineScatterChartOptions;
  lineArea: LineAreaChartOptions;
  columnLine: ColumnLineChartOptions;
  heatmap: HeatmapChartOptions;
};

export type Options = ValueOf<ChartOptionsMap>;

export type OptionsWithDataLabels = ValueOf<
  Omit<ChartOptionsMap, 'scatter' | 'bubble' | 'boxPlot' | 'lineScatter' | 'radar'>
>;

export type ChartOptionsUsingYAxis = ValueOf<
  Omit<ChartOptionsMap, 'pie' | 'radar' | 'heatmap' | 'treemap'>
>;

type StateFunc = (initStoreState: InitStoreState) => Partial<ChartState<Options>>;
type ActionFunc = (store: Store<Options>, ...args: any[]) => void;
type ComputedFunc = (state: ChartState<Options>, computed: Record<string, any>) => any;
export type ObserveFunc = (state: ChartState<Options>, computed: Record<string, any>) => void;
type WatchFunc = (value: any) => void;

export interface StoreOptions {
  state?: Partial<ChartState<Options>> | StateFunc;
  watch?: Record<string, WatchFunc>;
  computed?: Record<string, ComputedFunc>;
  action?: Record<string, ActionFunc> & ThisType<Store<Options>>;
  observe?: Record<string, ObserveFunc> & ThisType<Store<Options>>;
}

interface InitStoreState<T extends Options = Options> {
  categories?: Categories;
  series: RawSeries;
  options: T;
}

export interface StoreModule extends StoreOptions {
  name:
    | 'root'
    | 'plot'
    | 'axes'
    | 'scale'
    | 'layout'
    | 'category'
    | 'seriesData'
    | 'dataRange'
    | 'stackSeriesData'
    | 'treemapSeriesData'
    | 'heatmapSeriesData'
    | 'legend'
    | 'circleLegend'
    | 'colorValueScale'
    | 'options'
    | 'theme';
}

export interface Layout {
  chart: Rect;
  xAxis: Rect;
  yAxis: Rect;
  xAxisTitle: Rect;
  yAxisTitle: Rect;
  plot: Rect;
  legend: Rect;
  circleLegend: Rect;
  title: Rect;
  exportMenu: Rect;
  resetButton: Rect;
  secondaryYAxisTitle: Rect;
  secondaryYAxis: Rect;
}

export interface Scale {
  xAxis: ScaleData;
  yAxis: ScaleData;
  secondaryYAxis?: ScaleData;
}

type ViewAxisLabel = { offsetPos: number; text: string };

type RotationLabelData = {
  needRotateLabel?: boolean;
  radian?: number;
  rotationHeight?: number;
};

export type Axes = {
  xAxis: AxisData;
  yAxis: AxisData;
  centerYAxis?: CenterYAxisData;
  radialAxis?: RadialAxisData;
  secondaryYAxis?: AxisData;
};

export type DataRange = {
  xAxis?: ValueEdge;
  yAxis?: ValueEdge;
  secondaryYAxis?: ValueEdge;
};

export type StackSeries = {
  [key in BoxType]?: StackSeriesData<key>;
};

export type LegendIconType = 'spectrum' | 'line' | ScatterSeriesIconType;

export type LegendDataList = Array<
  Pick<LegendData, 'label' | 'active' | 'checked' | 'iconType' | 'color' | 'chartType'> & {
    width: number;
  }
>;

export interface Legend {
  visible: boolean;
  showCheckbox: boolean;
  align: Align;
  width: number;
  data: LegendDataList;
  useSpectrumLegend: boolean;
  useScatterChartIcon: boolean;
}

export interface CircleLegend {
  visible: boolean;
  width: number;
  radius: number;
}

export interface CenterYAxisData extends ValueAxisData {
  x: number;
  xAxisHalfSize: number;
  secondStartX: number;
  yAxisLabelAnchorPoint: number;
  yAxisHeight: number;
}

export type RadialAxisData = {
  labels: string[];
  axisSize: number;
  centerX: number;
  centerY: number;
  labelInterval: number;
  maxLabelWidth: number;
  maxLabelHeight: number;
};

export interface TreemapSeriesData {
  id: string;
  parentId: string;
  hasChild: boolean;
  label: string;
  indexes: number[];
  depth: number;
  data: number;
  ratio: number;
  color: string;
  opacity?: number;
  colorValue?: number;
}

export type Categories = string[] | HeatmapCategoriesType;

export type ChartOptions = {
  title?: string | TitleOption;
  animation?: AnimationOptions;
} & Size;

export interface ChartState<T extends Options> {
  chart: ChartOptions;
  layout: Layout;
  scale: Scale;
  disabledSeries: string[];
  series: Series;
  zoomRange?: RangeDataType<number>;
  shiftRange?: RangeDataType<number>;
  // 기존의 limitMap
  axes: Axes;
  dataRange: DataRange;
  theme: Theme;
  options: T;
  categories?: Categories;
  rawCategories: Categories;
  stackSeries: {
    [key in StackSeriesType]?: StackSeriesData<key>;
  };
  colorValueScale: ScaleData;
  plot: {
    visible: boolean;
    lines: PlotLine[];
    bands: PlotBand[];
  };
  legend: Legend;
  circleLegend: CircleLegend;
  treemapSeries: TreemapSeriesData[];
  treemapZoomId: TreemapZoomId;
  heatmapSeries: HeatmapSeriesData[];
  nestedPieSeries: Record<string, NestedPieSeriesDataType>;
  originalOptions: T;
  container: Size;
  usingContainerSize: {
    width: boolean;
    height: boolean;
  };
}

export type TreemapZoomId = {
  cur: string;
  prev: string;
};

export type HeatmapSeriesData = {
  category: {
    x: string;
    y: string;
  };
  colorValue: number | null;
  indexes: [number, number];
}[];

type NestedPieSeriesDataType = {
  data: PieSeriesType[];
};

export type StackTotal = {
  positive: number;
  negative: number;
};

export interface StackData {
  values: number[];
  sum: number;
  total: StackTotal;
}

export type StackDataValues = StackData[];
export type StackGroupData = Record<string, StackDataValues>;
export type StackDataType = StackDataValues | StackGroupData;

export type AxisData = LabelAxisData | ValueAxisData;

export type InitAxisData = {
  tickInterval: number;
  labelInterval: number;
  title?: Required<AxisTitleOption>;
};

type BaseAxisData = InitAxisData & {
  labels: string[];
  tickCount: number;
  isLabelAxis: boolean;
  pointOnColumn: boolean;
  tickDistance: number;
  maxLabelWidth: number;
  maxLabelHeight: number;
  viewLabels: ViewAxisLabel[];
  offsetY?: number;
  maxHeight?: number;
} & RotationLabelData;

export type LabelAxisData = BaseAxisData & {
  labelDistance: number;
};

export type ValueAxisData = BaseAxisData & {
  zeroPosition?: number;
};

export interface ValueEdge {
  max: number;
  min: number;
}

export type Stack = {
  type: StackType;
  connector: boolean;
};

export type PercentScaleType =
  | 'percentStack'
  | 'minusPercentStack'
  | 'dualPercentStack'
  | 'divergingPercentStack';

type StackSeriesType = BoxType | 'area';

export type StackSeriesData<K extends StackSeriesType> = {
  data: ChartSeriesMap[K];
  stackData: StackDataType;
  dataRangeValues: number[];
  stack: Stack;
  scaleType: PercentScaleType;
} & SeriesGroup;

export interface ScaleData {
  limit: ValueEdge;
  stepSize: number;
  stepCount: number;
}

export type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

type UsingContainerSize = { width: boolean; height: boolean };
