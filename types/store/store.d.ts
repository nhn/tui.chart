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
  StackInfo,
  AreaSeriesType,
  AreaChartOptions
} from '@t/options';
import Store from '@src/store/store';
import { AxisType } from '@src/component/axis';

type ChartSeriesMap = {
  line: LineSeriesType[];
  scatter: ScatterSeriesType[];
  bar: BoxSeriesType<BoxSeriesDataType>[];
  column: BoxSeriesType<BoxSeriesDataType>[];
  area: AreaSeriesType[];
};

export type ChartType = keyof ChartSeriesMap;

export type BoxType = 'bar' | 'column';

type Series = Partial<ChartSeriesMap>;

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

export interface StoreOptions {
  state?: Partial<ChartState<Options>> | StateFunc;
  watch?: Record<string, WatchFunc>;
  computed?: Record<string, ComputedFunc>;
  action?: Record<string, ActionFunc> & ThisType<Store<Options>>;
  observe?: Record<string, ObserveFunc> & ThisType<Store<Options>>;
  initialize?: InitializeFunc;
}

export interface StoreModule extends StoreOptions {
  name: 'plot' | 'axes' | 'scale' | 'layout' | 'seriesData' | 'dataRange' | 'stackSeriesData';
}

export interface SeriesTheme {
  colors: string[];
}

export type Theme = {
  series: SeriesTheme;
};

type SeriesState = {
  [key in ChartType]?: SeriesData<key>; // @TODO: Series 와 통합 필요. 중복되는 느낌
};

export interface ChartState<T extends Options> {
  chart: BaseChartOptions;
  layout: {
    [key: string]: Rect;
  };
  scale: {
    [key: string]: ScaleData;
  };
  disabledSeries: string[];
  series: SeriesState;
  // 기존의 limitMap
  dataRange: {
    [key: string]: ValueEdge;
  };
  axes: {
    [key in AxisType]?: AxisData;
  };
  theme: Theme;
  options: T;
  categories?: string[];
  stackSeries: {
    [key in BoxType]?: StackSeriesData<key>;
  };
}

export interface Stack {
  stack?: StackInfo;
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

export type SeriesData<K extends ChartType> = {
  data: ChartSeriesMap[K];
} & SeriesGroup;

export type StackSeriesData<K extends BoxType> = {
  data: ChartSeriesMap[K];
  stackData: StackDataType;
  dataValues: number[];
} & Required<Stack> &
  SeriesGroup;

export interface SeriesGroup {
  seriesCount: number;
  seriesGroupCount: number;
}

export interface ScaleData {
  limit: ValueEdge;
  step: number;
  stepCount: number;
}

type StateFunc = () => Partial<ChartState<Options>>;
type ActionFunc = (store: Store<Options>, ...args: any[]) => void;
type ComputedFunc = (state: ChartState<Options>, computed: Record<string, any>) => any;
export type ObserveFunc = (state: ChartState<Options>, computed: Record<string, any>) => void;
type WatchFunc = (value: any) => void;
type InitializeFunc = (state: ChartState<Options>, options: Options) => void;

export type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];
