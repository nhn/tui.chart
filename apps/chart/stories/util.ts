import { DataInput } from '@t/options';
import { Options } from '@t/store/store';

export function createResponsiveChart<Data extends DataInput, Option extends Options>(
  ChartConstructor: new (...args) => object,
  data: Data,
  options: Option,
  size?: { width: string; height: string }
) {
  const el = document.createElement('div');

  setTimeout(() => {
    el.style.width = size?.width ?? '90vw';
    el.style.height = size?.height ?? '90vh';

    return new ChartConstructor({
      el,
      data,
      options,
    });
  });

  return el;
}
