export function isUndefined(obj: any) {
  return obj === undefined; // eslint-disable-line no-undefined
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

export function pick(target: Record<string, any>, args: Array<string>): Record<string, any> | null {
  let i = 0;
  const length = args.length;

  if (length) {
    for (; i < length; i += 1) {
      if (typeof target === 'undefined' || target === null) {
        return null;
      }

      target = target[args[i]];
    }
  }

  return target; // eslint-disable-line consistent-return
}

export function pickWithMakeup(
  target: Record<string, any>,
  args: Array<string>
): Record<string, any> {
  let i = 0;
  const length = args.length;

  if (length) {
    for (; i < length; i += 1) {
      if (isUndefined(target[args[i]])) {
        target[args[i]] = {};
      }

      target = target[args[i]];
    }
  }

  return target; // eslint-disable-line consistent-return
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
