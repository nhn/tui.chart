import {
  observable,
  observe,
  notify,
  notifyByPath,
  computed,
  watch,
  extend as reactiveExtend,
  invisibleWork,
} from '@src/store/reactive';
import {
  ChartState,
  InitStoreState,
  ActionFunc,
  StoreOptions,
  ComputedFunc,
  WatchFunc,
  StoreModule,
  ObserveFunc,
  Options,
} from '@t/store/store';

import { isUndefined, forEach, pickPropertyWithMakeup, deepCopy } from '@src/helpers/utils';

export default class Store<T extends Options> {
  state!: ChartState<T>;

  initStoreState!: InitStoreState<T>;

  computed: Record<string, any> = {};

  actions: Record<string, ActionFunc> = {};

  constructor(initStoreState: InitStoreState<T>) {
    this.initStoreState = deepCopy(initStoreState);

    this.setRootState({});
  }

  setRootState(state: Partial<ChartState<T>>) {
    observable(state);
    this.state = state as ChartState<T>;
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

    if (param.state) {
      const moduleState =
        typeof param.state === 'function' ? param.state(this.initStoreState) : param.state;
      extend(this.state, moduleState);
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
      forEach(param.observe, (item) => {
        this.observe(item);
      });
    }
  }

  setValue(target: Record<string, any>, key: string, source: Record<string, any>) {
    extend(target, {
      [key]: source,
    });
  }
}

export function extend<T extends Record<string, any>>(target: T, source: Partial<T>) {
  const newItems: Record<string, any> = {};

  for (const k in source) {
    if (!source.hasOwnProperty(k)) {
      continue;
    }

    if (!isUndefined(target[k])) {
      if (typeof source[k] === 'object' && !Array.isArray(source[k])) {
        extend(target[k], source[k]!);
      } else {
        target[k] = source[k]!;
      }
    } else {
      newItems[k] = source[k];
    }
  }

  if (Object.keys(newItems).length) {
    reactiveExtend(target, newItems);
  }
}
