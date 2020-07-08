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
  PlotLineValue,
} from '@t/options';
import Store from '@src/store/store';
import { AxisType } from '@src/component/axis';
import { DataLabel } from '@t/components/dataLabels';

type ChartSeriesMap = {
  line: LineSeriesType[];
  scatter: ScatterSeriesType[];
  bar: BoxSeriesType<BoxSeriesDataType>[];
  column: BoxSeriesType<BoxSeriesDataType>[];
  area: AreaSeriesType[];
  bubble: BubbleSeriesType[];
};

export type ChartType = keyof ChartSeriesMap;

export type BoxType = 'bar' | 'column';

type SeriesRaw = Partial<ChartSeriesMap>;

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

type ChartOptionsMap = {
  line: LineChartOptions;
  bar: BarChartOptions;
  column: ColumnChartOptions;
  area: AreaChartOptions;
  bubble: BubbleChartOptions;
};

export type Options = ValueOf<ChartOptionsMap>;

type ElementType<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<infer ElementType>
  ? ElementType
  : never;

export type SeriesTypes = ElementType<ValueOf<ChartSeriesMap>>;

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
  series: SeriesRaw;
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
    | 'legend'
    | 'circleLegend'
    | 'dataLabels';
}

export interface SeriesTheme {
  colors: string[];
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
}

export interface Scale {
  xAxis: ScaleData;
  yAxis: ScaleData;
}

type PlotLine = {
  value: PlotLineValue;
  color: string;
  vertical: boolean;
};

type PlotBand = {
  range: [PlotLineValue, PlotLineValue];
  color: string;
  vertical: boolean;
};

export type Axes = Partial<Record<AxisType, AxisData>>;

export type DataRange = {
  [key in keyof ChartSeriesMap]: {
    xAxis: ValueEdge;
    yAxis: ValueEdge;
  };
};

export type StackSeries = {
  [key in BoxType]?: StackSeriesData<key>;
};

export type LegendIconType = 'rect' | 'circle' | 'spectrum' | 'line';

export interface Legend {
  visible: boolean;
  iconType: LegendIconType;
  showCheckbox: boolean;
  align: Align;
  width: number;
  data: {
    label: string;
    active: boolean;
    checked: boolean;
    width: number;
  }[];
}

export interface CircleLegend {
  visible: boolean;
  width: number;
  radius: number;
}

export interface ChartState<T extends Options> {
  chart: BaseChartOptions;
  layout: Layout;
  scale: Scale;
  disabledSeries: string[];
  series: Series;
  seriesRaw: SeriesRaw;
  // 기존의 limitMap
  axes: Axes;
  dataRange: DataRange;
  theme: Theme;
  options: T;
  categories?: string[];
  stackSeries: {
    [key in BoxType]?: StackSeriesData<key>;
  };
  plot: {
    lines: PlotLine[];
    bands: PlotBand[];
  };
  legend: Legend;
  circleLegend: CircleLegend;
  dataLabels: {
    visible: boolean;
    data: DataLabel[];
  };
}

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
  labelInterval: number;
  title?: Required<AxisTitleOption>;
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

export type StackSeriesData<K extends BoxType> = {
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
