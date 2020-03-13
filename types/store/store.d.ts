import Store from '@src/store/store';

export interface StoreOptions {
  state?: Partial<ChartState> | StateFunc;
  watch?: Record<string, WatchFunc>;
  computed?: Record<string, ComputedFunc>;
  action?: Record<string, ActionFunc> & ThisType<Store>;
  observe?: Record<string, ObserveFunc> & ThisType<Store>;
}

export interface StoreModule extends StoreOptions {
  name: 'plot' | 'axes' | 'scale' | 'layout';
}

export interface Rect {
  width: number;
  height: number;
  x: number;
  y: number;
}

export type Theme = {
  series: {
    colors: string[];
  };
};

export interface ChartState {
  chart: {
    width: number;
    height: number;
  };
  layout: {
    [key: string]: Rect;
  };
  scale: {
    [key: string]: ScaleData;
  };
  disabledSeries: string[];
  series: {
    [key: string]: SeriesData;
  };
  // 기존의 limitMap
  dataRange: {
    [key: string]: ValueEdge;
  };
  axes: {
    [key: string]: AxisData;
  };
  theme: Theme;
  // [key: string]: any;
}

export interface AxisData {
  labels: string[];
  tickCount: number;
  validTickCount: number;
  isLabelAxis: boolean;
  relativePositions: number[];
}

export interface ValueEdge {
  max: number;
  min: number;
}

export interface SeriesData {
  seriesCount: number;
  seriesGroupCount: number;
  data: Series[];
}

export interface SeriesGroup {
  seriesCount: number;
  seriesGroupCount: number;
}

export interface ScaleData {
  limit: ValueEdge;
  step: number;
  stepCount: number;
}

export interface Series {
  name: string;
  data: number[];
}

type StateFunc = () => Partial<ChartState>;
type ActionFunc = (store: Store, ...args: any[]) => void;
type ComputedFunc = (state: ChartState, computed: Record<string, any>) => any;
export type ObserveFunc = (state: ChartState, computed: Record<string, any>) => void;
type WatchFunc = (value: any) => void;
