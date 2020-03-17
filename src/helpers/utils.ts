type PickedKey<T, K extends keyof T> = keyof Pick<T, K>;
type OmittedKey<T, K extends keyof T> = keyof Omit<T, K>;

export function isUndefined(value: unknown): value is undefined {
  return typeof value === 'undefined';
}

export function isNull(value: unknown): value is null {
  return value === null;
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function forEach(obj: Record<string, any>, cb: (item: any, key: string) => void) {
  for (const k in obj) {
    if (obj.hasOwnProperty(k)) {
      cb(obj[k], k);
    }
  }
}

export function range(start: number, stop?: number, step?: number) {
  if (isUndefined(stop)) {
    stop = start || 0;
    start = 0;
  }

  step = step || 1;

  const arr: number[] = [];

  if (stop) {
    const flag = step < 0 ? -1 : 1;
    stop *= flag;

    for (; start * flag < stop; start += step) {
      arr.push(start);
    }
  }

  return arr;
}

export function includes<T>(arr: T[], searchItem: T, searchIndex?: number) {
  if (typeof searchIndex === 'number' && arr[searchIndex] !== searchItem) {
    return false;
  }
  for (const item of arr) {
    if (item === searchItem) {
      return true;
    }
  }

  return false;
}

export function pick<T extends object, K extends keyof T>(obj: T, ...propNames: K[]) {
  const resultMap = {} as Pick<T, K>;
  Object.keys(obj).forEach(key => {
    if (includes(propNames, key as K)) {
      resultMap[key as PickedKey<T, K>] = obj[key as PickedKey<T, K>];
    }
  });

  return resultMap;
}

export function omit<T extends object, K extends keyof T>(obj: T, ...propNames: K[]) {
  const resultMap = {} as Omit<T, K>;
  Object.keys(obj).forEach(key => {
    if (!includes(propNames, key as K)) {
      resultMap[key as OmittedKey<T, K>] = obj[key as OmittedKey<T, K>];
    }
  });

  return resultMap;
}

export function pickWithMakeup(
  target: Record<string, any>,
  args: Array<string>
): Record<string, any> {
  let i = 0;
  const { length } = args;

  if (length) {
    for (; i < length; i += 1) {
      if (isUndefined(target[args[i]])) {
        target[args[i]] = {};
      }

      target = target[args[i]];
    }
  }

  return target;
}

export function debounce(fn: Function, delay = 0) {
  let timer: number;

  function debounced(...args: any[]) {
    window.clearTimeout(timer);
    timer = window.setTimeout(function() {
      fn(...args);
    }, delay);
  }

  return debounced;
}

export function merge(target: Record<string, any>, ...args: Record<string, any>[]) {
  target = target || {};

  args.forEach(obj => {
    if (!obj) {
      return;
    }

    forEach(obj, (item, key) => {
      if (Object.prototype.toString.call(item) === '[object Object]') {
        target[key] = merge(target[key], item);
      } else {
        target[key] = item;
      }
    });
  });

  return target;
}

export function throttle(fn: Function, interval = 0) {
  let base: number | null = null;
  let isLeading = true;

  const tick = function(...args) {
    fn(...args);
    base = null;
  };

  let stamp = 0;

  const debounced = debounce(tick, interval);

  function throttled(...args) {
    // eslint-disable-line require-jsdoc

    if (isLeading) {
      tick(...args);
      isLeading = false;

      return;
    }

    stamp = Number(new Date());

    base = base || stamp;

    debounced(args);

    if (stamp - base >= interval) {
      tick(args);
    }
  }

  function reset() {
    // eslint-disable-line require-jsdoc
    isLeading = true;
    base = null;
  }

  throttled.reset = reset;

  return throttled;
}
