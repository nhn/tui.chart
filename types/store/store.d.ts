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
  StackInfo
} from '@t/options';
import Store from '@src/store/store';
import { StackDataType } from '@src/component/boxSeries';

type ChartSeriesMap = {
  line: LineSeriesType[];
  scatter: ScatterSeriesType[];
  bar: BoxSeriesType<BoxSeriesDataType>[];
  column: BoxSeriesType<BoxSeriesDataType>[];
};

export type ChartType = keyof ChartSeriesMap;

type Series = Partial<ChartSeriesMap>;

type ValueOf<T> = T[keyof T];

type ChartOptionsMap = {
  line: LineChartOptions;
  bar: BarChartOptions;
  column: ColumnChartOptions;
};

export type Options = ValueOf<ChartOptionsMap>;

export interface StoreOptions {
  state?: Partial<ChartState<Options>> | StateFunc;
  watch?: Record<string, WatchFunc>;
  computed?: Record<string, ComputedFunc>;
  action?: Record<string, ActionFunc> & ThisType<Store<Options>>;
  observe?: Record<string, ObserveFunc> & ThisType<Store<Options>>;
  initialize?: InitializeFunc;
}

export interface StoreModule extends StoreOptions {
  name: 'plot' | 'axes' | 'scale' | 'layout' | 'seriesData' | 'dataRange' | 'initialize';
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
    [key: string]: AxisData;
  };
  theme: Theme;
  options: T;
  categories?: string[];
}

export interface Stack {
  stack?: StackInfo;
}

export interface AxisData {
  labels: string[];
  tickCount: number;
  validTickCount: number;
  isLabelAxis: boolean;
  relativePositions: number[];
  isCategoryType: boolean;
}

export interface ValueEdge {
  max: number;
  min: number;
}

export type SeriesData<K extends ChartType> = {
  data: ChartSeriesMap[K];
} & SeriesGroup &
  StackSeries;

type StackSeries = Stack & {
  stackData?: StackDataType;
};

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
