import { DataInput } from '@t/options';
import { Options } from '@t/store/store';

export function createResponsiveChart<Data extends DataInput, Option extends Options>(
  ChartConstructor: new (...args) => object,
  data: Data,
  options: Option,
  size?: { width: string; hieght: string }
) {
  const el = document.createElement('div');

  setTimeout(() => {
    el.style.width = size?.width ?? '90vw';
    el.style.height = size?.width ?? '90vh';

    return new ChartConstructor({
      el,
      data,
      options,
    });
  });

  return el;
}

// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
// for IE
export function padStart(str: string, targetLength: number, padString: string) {
  if (!String.prototype.padStart) {
    targetLength = targetLength >> 0; // truncate if number, or convert non-number to 0;
    padString = String(typeof padString !== 'undefined' ? padString : ' ');

    if (str.length >= targetLength) {
      return str;
    }
    targetLength = targetLength - str.length;
    if (targetLength > padString.length) {
      padString += padString.repeat(targetLength / padString.length);
    }

    return padString.slice(0, targetLength) + str;
  }

  return str.toString().padStart(targetLength, padString);
}
