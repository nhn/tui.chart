import { Options, Series } from '@t/store/store';
import { LineTypeXAxisOptions } from '@t/options';
import { first, last } from './utils';

export function isLabelAxisOnYAxis(series: Series) {
  return !!series.bar;
}

export function hasBoxTypeSeries(series: Series) {
  return series.column || series.bar;
}

export function isPointOnColumn(series: Series, options: Options) {
  if (hasBoxTypeSeries(series)) {
    return true;
  }

  if (series.line || series.area) {
    return Boolean((options.xAxis as LineTypeXAxisOptions)?.pointOnColumn);
  }

  return false;
}

export function getAxisName(labelAxisOnYAxis: boolean) {
  return {
    valueAxisName: labelAxisOnYAxis ? 'xAxis' : 'yAxis',
    labelAxisName: labelAxisOnYAxis ? 'yAxis' : 'xAxis',
  };
}

export function getSizeKey(labelAxisOnYAxis: boolean) {
  return {
    valueSizeKey: labelAxisOnYAxis ? 'width' : 'height',
    labelSizeKey: labelAxisOnYAxis ? 'height' : 'width',
  };
}

export function getLimitOnAxis(labels: string[], diverging: boolean) {
  const values = labels.map((label) => Number(label));

  return {
    min: diverging ? Math.min(...values) : first(values)!,
    max: diverging ? Math.max(...values) : last(values)!,
  };
}
