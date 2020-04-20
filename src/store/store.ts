import {
  observable,
  observe,
  notify,
  notifyByPath,
  computed,
  watch,
  extend,
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
  sortCategories
} from '@src/helpers/utils';
import { BaseChartOptions, Size } from '@t/options';
import seriesData from './seriesData';

interface InitStoreState<T> {
  categories?: string[];
  chart?: BaseChartOptions;
  series: Series;
  options?: T;
}

function makeCategories(series: Series) {
  const categories: Set<string | number> = new Set();

  Object.keys(series).forEach(key => {
    series[key].forEach(({ data }) => {
      data.forEach(datum => {
        categories.add(Array.isArray(datum) ? datum[0] : datum.x);
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
    d: Date.now()
  };

  computed: Record<string, any> = {};

  actions: Record<string, ActionFunc> = {};

  constructor(initStoreState: InitStoreState<T>) {
    const { chart, options } = initStoreState;
    const { series, categories } = initData(initStoreState.series, initStoreState.categories);

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
        { state: { series, categories, options, chart } }
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

  setModule(name: string | StoreModule, options?: StoreOptions | StoreModule) {
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
