import { ChartSizeInput } from '@t/options';

type PickedKey<T, K extends keyof T> = keyof Pick<T, K>;
type OmittedKey<T, K extends keyof T> = keyof Omit<T, K>;

export function isExist(value: unknown): boolean {
  return !isUndefined(value) && !isNull(value);
}

export function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

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

export function isInteger(value: unknown): value is number {
  return isNumber(value) && isFinite(value) && Math.floor(value) === value;
}

export function isObject(obj: unknown): obj is object {
  return typeof obj === 'object' && obj !== null;
}

export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

export function forEach<T extends object, K extends Extract<keyof T, string>, V extends T[K]>(
  obj: T,
  cb: (item: V, key: K) => void
) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cb(obj[key as K] as V, key as K);
    }
  }
}

export function forEachArray<T>(
  arr: Array<T> | ArrayLike<T>,
  iteratee: (value: T, index: number, targetArr: Array<T> | ArrayLike<T>) => boolean | void,
  context: object | null = null
) {
  for (let index = 0, len = arr.length; index < len; index += 1) {
    if (iteratee.call(context, arr[index], index, arr) === false) {
      break;
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

export function toArray<T>(arrayLike: ArrayLike<T>) {
  let arr: Array<T> = [];
  try {
    arr = Array.prototype.slice.call(arrayLike);
  } catch (e) {
    forEachArray(arrayLike, function (value) {
      arr.push(value);
    });
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
  Object.keys(obj).forEach((key) => {
    if (includes(propNames, key as K)) {
      resultMap[key as PickedKey<T, K>] = obj[key as PickedKey<T, K>];
    }
  });

  return resultMap;
}

export function omit<T extends object, K extends keyof T>(obj: T, ...propNames: K[]) {
  const resultMap = {} as Omit<T, K>;
  Object.keys(obj).forEach((key) => {
    if (!includes(propNames, key as K)) {
      resultMap[key as OmittedKey<T, K>] = obj[key as OmittedKey<T, K>];
    }
  });

  return resultMap;
}

export function pickProperty(target: Record<string, any>, keys: string[]) {
  const { length } = keys;

  if (length) {
    for (let i = 0; i < length; i += 1) {
      if (isUndefined(target) || isNull(target)) {
        return null;
      }
      target = target[keys[i]];
    }
  }

  return target;
}

export function pickPropertyWithMakeup(target: Record<string, any>, args: string[]) {
  const { length } = args;

  if (length) {
    for (let i = 0; i < length; i += 1) {
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
    timer = window.setTimeout(() => {
      fn(...args);
    }, delay);
  }

  return debounced;
}

export function merge(target: Record<string, any>, ...args: Record<string, any>[]) {
  target = target || {};

  args.forEach((obj) => {
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

  const tick = function (...args) {
    fn(...args);
    base = null;
  };

  let stamp = 0;

  const debounced = debounce(tick, interval);

  function throttled(...args) {
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

export function deepMergedCopy<T1 extends Record<string, any>, T2 extends Record<string, any>>(
  targetObj: T1,
  obj: T2
) {
  const resultObj = { ...targetObj } as T1 & T2;

  Object.keys(obj).forEach((prop: keyof T2) => {
    if (isObject(resultObj[prop])) {
      if (Array.isArray(obj[prop])) {
        resultObj[prop as keyof T1 & T2] = deepCopyArray(obj[prop]);
      } else if (resultObj.hasOwnProperty(prop)) {
        resultObj[prop] = deepMergedCopy(resultObj[prop], obj[prop]);
      } else {
        resultObj[prop as keyof T1 & T2] = deepCopy(obj[prop]);
      }
    } else {
      resultObj[prop as keyof T1 & T2] = obj[prop];
    }
  });

  return resultObj;
}

export function deepCopyArray<T extends Array<any>>(items: T): T {
  return items.map((item: T[number]) => {
    if (isObject(item)) {
      return Array.isArray(item) ? deepCopyArray(item) : deepCopy(item);
    }

    return item;
  }) as T;
}

export function deepCopy<T extends Record<string, any>>(obj: T) {
  const resultObj = {} as T;
  const keys: Array<keyof T> = Object.keys(obj);

  if (!keys.length) {
    return obj;
  }

  keys.forEach((prop) => {
    if (isObject(obj[prop])) {
      resultObj[prop] = Array.isArray(obj[prop]) ? deepCopyArray(obj[prop]) : deepCopy(obj[prop]);
    } else {
      resultObj[prop] = obj[prop];
    }
  });

  return resultObj as T;
}

export function sortCategories(x: number | string, y: number | string) {
  return isInteger(x) ? Number(x) - Number(y) : new Date(x).getTime() - new Date(y).getTime();
}

export function sortNumber(x: number, y: number) {
  return x - y;
}

export function first<T>(items: T[]): T | undefined {
  // eslint-disable-next-line no-undefined
  return items.length ? items[0] : undefined;
}

export function last<T>(items: T[]): T | undefined {
  // eslint-disable-next-line no-undefined
  return items.length ? items[items.length - 1] : undefined;
}

export function hasNegative(values: (number | string)[] = []) {
  return values.some((value) => Number(value) < 0);
}

export function sum(items: number[]): number {
  return items.reduce((a, b) => a + b, 0);
}

export function hasPositiveOnly(values: (number | string)[]) {
  return values.every((value) => Number(value) >= 0);
}

export function hasNegativeOnly(values: (number | string)[]) {
  return values.every((value) => Number(value) <= 0);
}

export function getFirstValidValue(values: any) {
  return values?.find((value) => value !== null);
}

export function getPercentageValue(text: string): number {
  return Number(text.substr(0, text.length - 1));
}

export function calculateSizeWithPercentString(size: number, value: string | number): number {
  return isNumber(value) ? value : Number(((size * getPercentageValue(value)) / 100).toFixed(2));
}

export function getInitialSize(size?: ChartSizeInput) {
  return isNumber(size) ? size : 0;
}

export function isAutoValue(value?: ChartSizeInput) {
  return value === 'auto';
}
