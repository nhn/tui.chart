import { pickProperty } from '@src/helpers/utils';

type ObservableInfo = {
  target: Record<string, any>;
  key: string;
  value: any;
  obs: Function[];
};

type Observer = {
  (): any;
  deps: Function[][];
};

let currentCollectorObserver: Observer | Function | null = null;
let observerIdIndex = 0;
let currentRunningObserverId: number | null = null;
const observerCallCue: Observer[] = [];
let doingInvisibleWork = false;

export function observe(fn: Function): Function {
  const observeId = observerIdIndex;

  observerIdIndex += 1;

  const observer: Observer = () => {
    if (currentRunningObserverId === observeId) {
      return;
    }

    if (doingInvisibleWork || currentRunningObserverId !== null) {
      if (observerCallCue.includes(observer)) {
        observerCallCue.splice(observerCallCue.indexOf(observer), 1);
      }
      observerCallCue.push(observer);
    } else if (currentRunningObserverId === null) {
      currentRunningObserverId = observeId;
      fn();
      currentRunningObserverId = null;

      digestObserverCallCue();
    }
  };

  observer.deps = [];

  currentCollectorObserver = observer;
  currentCollectorObserver();
  currentCollectorObserver = null;

  return () => {
    observer.deps.forEach(dep => {
      const index = dep.findIndex(ob => ob === observer);
      dep.splice(index, 1);
    });

    observer.deps = [];
  };
}

function digestObserverCallCue() {
  if (observerCallCue.length) {
    const nextObserver = observerCallCue.shift();
    if (nextObserver) {
      nextObserver();
    }
  }
}

export function isObservable<T extends Record<string, any>>(target: T): boolean {
  return typeof target === 'object' && target.__ob__;
}

export function observable(
  target: Record<string, any>,
  source: Record<string, any> = target
): Record<string, any> {
  if (isObservable(source)) {
    throw new Error(`Source object is observable already`);
  }

  if (!isObservable(target)) {
    Object.defineProperty(target, '__ob__', {
      enumerable: false
    });
  }

  for (const key in source) {
    if (!source.hasOwnProperty(key)) {
      continue;
    }

    const obs: Array<Function> = [];
    let value = source[key];

    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    const preGetter = descriptor && descriptor.get;
    const preSetter = descriptor && descriptor.set;

    /* eslint-disable no-loop-func */
    Object.defineProperty(target, key, {
      configurable: true,
      enumerable: true,
      get: function() {
        if (currentCollectorObserver === observableInfo) {
          return { target, key, value, obs };
        }

        if (
          !doingInvisibleWork &&
          currentCollectorObserver &&
          !obs.includes(currentCollectorObserver)
        ) {
          // console.log('collect observer', key);
          obs.push(currentCollectorObserver);
          (currentCollectorObserver as Observer).deps.push(obs);
        }

        return value;
      },
      set: function(v) {
        const prevValue = value;

        if (preSetter) {
          preSetter.call(target, v);
          value = preGetter ? preGetter.call(target) : target[key];
        } else {
          value = v;
        }

        if (prevValue !== value) {
          // console.log('run observe', key, obs);
          invokeObs(obs);
        }
      }
    });

    if (typeof target[key] === 'object' && !Array.isArray(target[key])) {
      observable(target[key]);
    }

    /* eslint-enable no-loop-func */
  }

  return target;
}

export function setValue(
  target: Record<string, any>,
  key: string,
  source: any
): Record<string, any> {
  return observable(target, {
    [key]: source
  });
}

export function extend(
  target: Record<string, any>,
  source: Record<string, any>
): Record<string, any> {
  if (isObservable(source)) {
    throw new Error(`Source object is observable already`);
  }

  return observable(target, source);
}

export function notify<T extends Record<string, any>, K extends keyof T>(target: T, key: K) {
  const obInfo = observableInfo(target, key);

  if (obInfo) {
    invokeObs(obInfo.obs);
  }
}

export function invisibleWork(fn: Function) {
  doingInvisibleWork = true;
  fn();
  doingInvisibleWork = false;
  digestObserverCallCue();
}

export function notifyByPath<T extends Record<string, any>>(holder: T, namePath: string) {
  const splited = namePath.split('.');
  const key = splited.splice(splited.length - 1, 1)[0];
  const target = pickProperty(holder, splited);

  if (target) {
    notify(target, key);
  }
}

function invokeObs(obs: Array<Function>) {
  obs.forEach(ob => ob());
}

function observableInfo<T extends Record<string, any>, K extends keyof T>(
  target: T,
  key: K
): ObservableInfo | null {
  currentCollectorObserver = observableInfo;
  const obInfo = target[key];
  currentCollectorObserver = null;

  if (
    typeof obInfo === 'object' &&
    obInfo.hasOwnProperty('target') &&
    obInfo.hasOwnProperty('obs')
  ) {
    return obInfo;
  }

  return null;
}

export function computed(target: Record<string, any>, key: string, fn: Function) {
  let cachedValue: any;

  const computedBox = {};

  Object.defineProperty(computedBox, key, {
    configurable: true,
    enumerable: true,
    get: () => cachedValue
  });

  extend(target, computedBox);

  observe(() => {
    const prevValue = cachedValue;
    cachedValue = fn();

    if (prevValue !== cachedValue) {
      target[key] = cachedValue;
    }
  });
}

export function watch(holder: Record<string, any>, path: string, fn: Function): Function | null {
  const splited = path.split('.');
  const key = splited.splice(splited.length - 1, 1)[0];
  const target = pickProperty(holder, splited);

  if (!target) {
    return null;
  }

  const obInfo = observableInfo(target, key);

  if (!obInfo) {
    return null;
  }

  const watcher = () => {
    fn(target[key]);
  };

  obInfo.obs.push(watcher);

  return () => {
    const index = obInfo.obs.findIndex(ob => ob === watcher);
    if (index > -1) {
      obInfo.obs.splice(index, 1);
    }
  };
}
