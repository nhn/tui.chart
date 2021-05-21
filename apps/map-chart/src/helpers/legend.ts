import { Align, Options } from '@t/options';

export function isVerticalAlign(align: Align) {
  return align === 'bottom' || align === 'top';
}

export function getLegendAlign(options: Options) {
  return options.legend?.align ?? 'bottom';
}
