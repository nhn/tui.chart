import { Options, ChartOptions as ChartInputOptions, Align } from '@t/options';
import { ScaleData } from '@toast-ui/chart/types/store/store';
import { ValueEdge } from '@toast-ui/shared';
import { GeoPermissibleObjects } from 'd3-geo';

type StateFunc = (initStoreState: InitStoreState) => Partial<ChartState<Options>>;
type ActionFunc = (store: Store<Options>, ...args: any[]) => void;
type ComputedFunc = (state: ChartState<Options>, computed: Record<string, any>) => any;
export type ObserveFunc = (state: ChartState<Options>, computed: Record<string, any>) => void;
type WatchFunc = (value: any) => void;

export type ActionParams = {
  state: ChartState;
  initStoreState: InitStoreState;
};

export interface ScaleData {
  limit: ValueEdge;
  stepSize: number;
  stepCount: number;
}

export interface Point {
  x: number;
  y: number;
}
export interface Size {
  width: number;
  height: number;
}
export type Rect = Point & Size;
export interface Layout {
  chart: Rect;
  legend: Rect;
  title: Rect;
  zoomButton: Rect;
  map: Rect;
}

type Data = {
  code: string;
  data: number;
};

export interface ChartProps {
  el: HTMLElement;
  series?: Series;
  data: Data[];
  options: Options;
}

export interface StoreModule extends StoreOptions {
  name: 'root' | 'theme' | 'series' | 'layout' | 'legend' | 'scale';
}

export type ChartOptions = Pick<ChartInputOptions, 'title' | 'type'> & Size;
export interface Legend {
  align: Align;
  visible: boolean;
  width: number;
  height: number;
}

interface GeoFeature extends GeoPermissibleObjects {
  id?: string;
  properties?: {
    name?: string;
    id?: string;
  };
}

export type SeriesData = {
  feature?: GeoFeature;
  data?: number;
  color?: string;
  centroid?: [number, number];
};

export type Series = Array<SeriesData>;

interface Theme {
  startColor: string;
  endColor: string;
  lineWidth: number;
  colors: string[];
}

interface InitStoreState {
  options: Options;
  data: Data[];
}

export interface ChartState {
  chart: ChartOptions;
  layout: Layout;
  options: Options;
  legend: Legend;
  theme: Theme;
  scale: ScaleData;
  series: Series;
}

export interface StoreOptions {
  state?: Partial<ChartState<Options>> | StateFunc;
  watch?: Record<string, WatchFunc>;
  computed?: Record<string, ComputedFunc>;
  action?: Record<string, ActionFunc> & ThisType<Store<Options>>;
  observe?: Record<string, ObserveFunc> & ThisType<Store<Options>>;
}

export type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

declare class Store {
  state: ChartState;

  initStoreState: InitStoreState;

  computed: Record<string, any>;

  actions: Record<string, ActionFunc>;

  setRootState(state: Partial<ChartState<T>>): void;

  setComputed(namePath: string, fn: ComputedFunc, holder: any): void;

  setWatch(namePath: string, fn: WatchFunc): Function | null;

  setAction(name: string, fn: ActionFunc): void;

  dispatch(name: string, payload?: any, isInvisible?: boolean): void;

  observe(fn: ObserveFunc): Function;

  observable(target: Record<string, any>): Record<string, any>;

  notifyByPath(namePath: string): void;

  notify<T extends Record<string, any>, K extends keyof T>(target: T, key: K): void;

  setModule(name: string | StoreModule, param?: StoreOptions | StoreModule): void;

  setValue(target: Record<string, any>, key: string, source: Record<string, any>): void;
}
