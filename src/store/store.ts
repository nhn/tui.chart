import {
  observable,
  observe,
  notify,
  notifyByPath,
  computed,
  watch,
  setValue,
  extend,
  invisibleWork,
  isObservable
} from '../../src/store/reactive';

import { isUndefined, forEach, pickWithMakeup } from '@src/helpers/utils';

export interface StoreOption {
  state?: Partial<ChartState> | StateFunc;
  watch?: Record<string, WatchFunc>;
  computed?: Record<string, ComputedFunc>;
  action?: Record<string, ActionFunc> & ThisType<Store>;
  observe?: Record<string, ObserveFunc> & ThisType<Store>;
}

export interface StoreModule extends StoreOption {
  name: string;
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

  [key: string]: any;
}

export interface AxisData {
  labels: string[];
  tickCount: number;
  validTickCount: number;
  isLabelAxis: boolean;
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

export default class Store {
  state: ChartState = {
    chart: { width: 0, height: 0 },
    layout: {},
    scale: {},
    disabledSeries: [],
    series: {},
    dataRange: {},
    axes: {},
    theme: {
      series: {
        colors: [
          '#83b14e',
          '#458a3f',
          '#295ba0',
          '#2a4175',
          '#289399',
          '#289399',
          '#617178',
          '#8a9a9a',
          '#516f7d',
          '#dddddd'
        ]
      }
    },
    d: Date.now()
  };

  computed: Record<string, any> = {};

  actions: Record<string, ActionFunc> = {};

  constructor(options?: StoreOption) {
    this.setRootState(this.state);

    if (options) {
      this.setModule(
        'root',
        Object.assign(
          {
            action: {
              setChartSize({ state }, size: { width: number; height: number }) {
                state.chart.width = size.width;
                state.chart.height = size.height;
              },
              initChartSize({ state }, containerEl: HTMLElement) {
                if (state.chart.width === 0 || state.chart.height === 0) {
                  if (containerEl.parentNode) {
                    this.dispatch('setChartSize', {
                      width: containerEl.offsetWidth,
                      height: containerEl.offsetHeight
                    });
                  } else {
                    setTimeout(() => {
                      this.dispatch('setChartSize', {
                        width: containerEl.offsetWidth,
                        height: containerEl.offsetHeight
                      });
                    }, 0);
                  }
                }
              }
            }
          } as StoreOption,
          options
        )
      );
    }
  }

  setRootState(state: Partial<ChartState>) {
    observable(state);
  }

  setComputed(namePath: string, fn: ComputedFunc, holder: any = this.computed) {
    const splited = namePath.split('.');
    const key = splited.splice(splited.length - 1, 1)[0];
    const target = pickWithMakeup(holder, splited);

    computed(target, key, fn.bind(null, this.state, this.computed));
  }

  setWatch(namePath: string, fn: WatchFunc) {
    return watch(this, namePath, fn);
  }

  setAction(name: string, fn: ActionFunc) {
    this.actions[name] = fn;
  }

  dispatch(name: string, payload?: any, isInvisible?: boolean) {
    // observe.setlayout 안에서 setLayout 액션이 실행되니까 여기서 state.layout getter가 실행되고
    // state.layout의 옵져버로 observe.setLayout이 등록된다. 여기서 무한루프
    // 즉 observe하고 안에서 특정 대상을 쓸때
    // this.extend(state.layout, layouts); 이런식으로 하게되면 layout의 getter실행되어
    // layout을 업데이트하려고 만든 observe를 옵저버로 등록해서 무한루프

    if (isInvisible) {
      invisibleWork(() => {
        // console.log('dispatch', name, ...args);
        this.actions[name].call(this, this, payload);
        // console.log('dispatch end', name);
      });
    } else {
      this.actions[name].call(this, this, payload);
    }
  }

  observe(fn: ObserveFunc): Function {
    return observe(fn.bind(this, this.state, this.computed));
  }

  observable(target: Record<string, any>): Record<string, any> {
    return observable(target);
  }

  notifyByPath(namePath: string): void {
    notifyByPath(this, namePath);
  }

  notify<T extends Record<string, any>, K extends keyof T>(target: T, key: K) {
    notify(target, key);
  }

  setModule(name: string | StoreModule, options?: StoreOption | StoreModule) {
    if (!options) {
      options = name as StoreModule;
      name = (options as StoreModule).name;
    }

    if (options.state) {
      const moduleState = typeof options.state === 'function' ? options.state() : options.state;
      this.extend(this.state, moduleState);

      //      this.extend(this.state, moduleState);
    }

    if (options.computed) {
      forEach(options.computed, (item, key) => {
        this.setComputed(key, item);
      });
    }

    if (options.watch) {
      forEach(options.watch, (item, key) => {
        this.setWatch(key, item);
      });
    }

    if (options.action) {
      forEach(options.action, (item, key) => {
        this.setAction(key, item);
      });
    }

    if (options.observe) {
      forEach(options.observe, (item, key) => {
        this.observe(item);
        // console.log(key, ' observer collect start', this.state.__ob__.d);
        // this.observe((...args) => {
        //   console.log('observe invoked', key);
        //   item.call(this, ...args);
        //   console.log('observe invoke end', key);
        // });
        // console.log(key, ' observer collect end', this.state.__ob__.d);
      });
    }
  }

  setValue(target: Record<string, any>, key: string, source: Record<string, any>) {
    this.extend(target, {
      [key]: source
    });
  }

  extend(target: Record<string, any>, source: Record<string, any>) {
    const newItems: Record<string, any> = {};

    for (const k in source) {
      if (!source.hasOwnProperty(k)) {
        continue;
      }

      if (!isUndefined(target[k])) {
        if (typeof source[k] === 'object' && !Array.isArray(source[k])) {
          this.extend(target[k], source[k]);
        } else {
          target[k] = source[k];
        }
      } else {
        newItems[k] = source[k];
      }
    }

    if (Object.keys(newItems).length) {
      extend(target, newItems);
    }
  }
}
