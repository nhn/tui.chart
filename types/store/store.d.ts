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
} from '@t/options';
import Store from '@src/store/store';
import { AxisType } from '@src/component/axis';

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
    | 'seriesData'
    | 'dataRange'
    | 'stackSeriesData';
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
  plot: Rect;
}

export interface Scale {
  xAxis: ScaleData;
  yAxis: ScaleData;
}

type PlotLine = {
  value: number | string;
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
    lines?: PlotLine[];
  };
}

export type StackData = Array<{ values: number[]; sum: number }>;
export type StackGroupData = Record<string, StackData>;
export type StackDataType = StackData | StackGroupData;

export interface AxisData {
  labels: string[];
  tickCount: number;
  isLabelAxis: boolean;
  pointOnColumn: boolean;
  tickDistance: number;
  tickInterval: number;
  labelInterval: number;
}

export interface ValueEdge {
  max: number;
  min: number;
}

export type Stack = {
  type: StackType;
  connector: boolean | Required<Connector>;
};

export type StackSeriesData<K extends BoxType> = {
  data: ChartSeriesMap[K];
  stackData: StackDataType;
  dataValues: number[];
  stack: Stack;
} & SeriesGroup;

export interface ScaleData {
  limit: ValueEdge;
  stepSize: number;
  stepCount: number;
}

export type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];
