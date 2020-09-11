import {
  BaseChartOptions,
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
  Connector,
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
  DataLabelOptions,
  TreemapSeriesType,
} from '@t/options';
import Store from '@src/store/store';
import { DataLabel } from '@t/components/dataLabels';
import { LegendData } from '@t/components/legend';

type ChartSeriesMap = {
  line: LineSeriesType[];
  scatter: ScatterSeriesType[];
  bar: BoxSeriesType<BoxSeriesDataType>[];
  column: BoxSeriesType<BoxSeriesDataType>[];
  area: AreaSeriesType[];
  bubble: BubbleSeriesType[];
  pie: PieSeriesType[];
  radar: RadarSeriesType[];
  boxPlot: BoxPlotSeriesType[];
  bullet: BulletSeriesType[];
  treemap: TreemapSeriesType[];
};

export type ChartType = keyof ChartSeriesMap;

export type BoxType = 'bar' | 'column';

type RawSeries = Partial<ChartSeriesMap>;

export interface SeriesGroup {
  seriesCount: number;
  seriesGroupCount: number;
}

type Series = {
  [key in ChartType]?: {
    data: ChartSeriesMap[key];
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
  pie: PieChartOptions;
  boxPlot: BoxPlotChartOptions;
  bullet: BulletChartOptions;
  lineScatter: LineScatterChartOptions;
  columnLine: ColumnLineChartOptions;
};

export type Options = ValueOf<ChartOptionsMap>;

export type ChartOptionsUsingYAxis = ValueOf<Omit<ChartOptionsMap, 'pie' | 'radar'>>;

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
  categories?: string[];
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
    | 'legend'
    | 'circleLegend'
    | 'dataLabels'
    | 'treemapScale';
}

export interface SeriesTheme {
  colors: string[];
  startColor: string;
  endColor: string;
}

export type Theme = {
  series: SeriesTheme;
};

export interface Layout {
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

export type LegendIconType = 'rect' | 'circle' | 'spectrum' | 'line';

export interface Legend {
  visible: boolean;
  showCheckbox: boolean;
  align: Align;
  width: number;
  data: Array<Pick<LegendData, 'label' | 'active' | 'checked' | 'iconType'> & { width: number }>;
  useSpectrumLegend: boolean;
}

export interface CircleLegend {
  visible: boolean;
  width: number;
  radius: number;
}

export type CenterYAxisData = {
  x: number;
  xAxisHalfSize: number;
  secondStartX: number;
  yAxisLabelAnchorPoint: number;
  yAxisHeight: number;
} & AxisData;

export type RadialAxisData = {
  labels: string[];
  axisSize: number;
  centerX: number;
  centerY: number;
};

export type DataLabelSeriesType = 'area' | 'line' | 'bar' | 'column' | 'bullet' | 'pie';

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

export interface ChartState<T extends Options> {
  chart: BaseChartOptions;
  layout: Layout;
  scale: Scale;
  disabledSeries: string[];
  series: Series;
  zoomRange?: RangeDataType<number>;
  // 기존의 limitMap
  axes: Axes;
  dataRange: DataRange;
  theme: Theme;
  options: T;
  categories?: string[];
  rawCategories: string[];
  stackSeries: {
    [key in StackSeriesType]?: StackSeriesData<key>;
  };
  treemapSeries: TreemapSeriesData[];
  treemapScale: ScaleData;
  plot: {
    lines: PlotLine[];
    bands: PlotBand[];
  };
  legend: Legend;
  circleLegend: CircleLegend;
  dataLabels: DataLabels;
}

export type DataLabels = {
  [key in DataLabelSeriesType]?: DataLabelData;
};

type DataLabelData = {
  data: DataLabel[];
  options: DataLabelOptions;
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

export interface AxisData {
  labels: string[];
  tickCount: number;
  isLabelAxis: boolean;
  pointOnColumn: boolean;
  tickDistance: number;
  tickInterval: number;
  labelDistance?: number;
  labelInterval: number;
  title?: Required<AxisTitleOption>;
  zeroPosition?: number;
}

export interface ValueEdge {
  max: number;
  min: number;
}

export type Stack = {
  type: StackType;
  connector: boolean | Required<Connector>;
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
