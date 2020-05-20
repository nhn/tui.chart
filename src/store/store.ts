import {
  observable,
  observe,
  notify,
  notifyByPath,
  computed,
  watch,
  extend as reactiveExtend,
  invisibleWork
} from '@src/store/reactive';
import {
  ChartState,
  ActionFunc,
  StoreOptions,
  ComputedFunc,
  WatchFunc,
  StoreModule,
  ObserveFunc,
  Series,
  Options
} from '@t/store/store';

import {
  isUndefined,
  forEach,
  pickPropertyWithMakeup,
  deepMergedCopy,
  sortSeries,
  sortCategories,
  deepCopy
} from '@src/helpers/utils';
import { BaseChartOptions, Size } from '@t/options';

interface InitStoreState<T> {
  categories?: string[];
  chart?: BaseChartOptions;
  series: Series;
  options?: T;
}

function makeCategories(series: Series) {
  const categories: Set<string> = new Set();

  Object.keys(series).forEach(key => {
    series[key].forEach(({ data }) => {
      data.forEach(datum => {
        categories.add(Array.isArray(datum) ? String(datum[0]) : String(datum.x));
      });
    });
  });

  return Array.from(categories).sort(sortCategories);
}

function getSortedSeries(series: Series) {
  const result: Series = {};

  Object.keys(series).forEach(key => {
    result[key] = series[key].map(({ name, data }) => ({
      name,
      data: data.sort(sortSeries)
    }));
  });

  return result;
}

function initData(series: Series, categories?: string[]) {
  return {
    series: series.line ? getSortedSeries(series) : series, // TODO: 초기 데이터의 정렬 유무를 옵션으로 받아 처리
    categories: categories ? categories : makeCategories(series)
  };
}

export default class Store<T extends Options> {
  state: ChartState<T> = {
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
          '#00a9ff',
          '#ffb840',
          '#ff5a46',
          '#00bd9f',
          '#785fff',
          '#f28b8c',
          '#989486',
          '#516f7d',
          '#29dbe3',
          '#dddddd'
        ]
      }
    },
    options: {} as T,
    categories: [],
    stackSeries: {}
  };

  computed: Record<string, any> = {};

  actions: Record<string, ActionFunc> = {};

  options = {} as T;

  constructor(initStoreState: InitStoreState<T>) {
    const storeState = deepCopy(initStoreState);
    const { chart, options } = storeState;
    const { series, categories } = initData(storeState.series, storeState.categories);

    this.options = options as T;

    this.setRootState(this.state);
    this.setModule(
      'root',
      deepMergedCopy(
        {
          action: {
            setChartSize({ state }, size: Size) {
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
        } as StoreOptions,
        { state: { series, categories, chart, options } }
      )
    );
  }

  setRootState(state: Partial<ChartState<T>>) {
    observable(state);
  }

  setComputed(namePath: string, fn: ComputedFunc, holder: any = this.computed) {
    const splited = namePath.split('.');
    const key = splited.splice(splited.length - 1, 1)[0];
    const target = pickPropertyWithMakeup(holder, splited);

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
    // extend(state.layout, layouts); 이런식으로 하게되면 layout의 getter실행되어
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

  setModule(name: string | StoreModule, param?: StoreOptions | StoreModule) {
    if (!param) {
      param = name as StoreModule;
      name = (param as StoreModule).name;
    }

    if (param.initialize) {
      param.initialize(this.state, this.options);
    }

    if (param.state) {
      const moduleState = typeof param.state === 'function' ? param.state() : param.state;
      extend(this.state, moduleState);

      //      this.extend(this.state, moduleState);
    }

    if (param.computed) {
      forEach(param.computed, (item, key) => {
        this.setComputed(key, item);
      });
    }

    if (param.watch) {
      forEach(param.watch, (item, key) => {
        this.setWatch(key, item);
      });
    }

    if (param.action) {
      forEach(param.action, (item, key) => {
        this.setAction(key, item);
      });
    }

    if (param.observe) {
      forEach(param.observe, (item, key) => {
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
    extend(target, {
      [key]: source
    });
  }
}

export function extend(target: Record<string, any>, source: Record<string, any>) {
  const newItems: Record<string, any> = {};

  for (const k in source) {
    if (!source.hasOwnProperty(k)) {
      continue;
    }

    if (!isUndefined(target[k])) {
      if (typeof source[k] === 'object' && !Array.isArray(source[k])) {
        extend(target[k], source[k]);
      } else {
        target[k] = source[k];
      }
    } else {
      newItems[k] = source[k];
    }
  }

  if (Object.keys(newItems).length) {
    reactiveExtend(target, newItems);
  }
}
