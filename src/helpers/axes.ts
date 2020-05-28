import { Options, SeriesState } from '@t/store/store';
import { LineTypeXAxisOptions } from '@t/options';

export function isLabelAxisOnYAxis(series: SeriesState) {
  return !!series.bar;
}

export function hasBoxTypeSeries(series: SeriesState) {
  return series.column || series.bar;
}

export function isPointOnColumn(series: SeriesState, options: Options) {
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
    labelAxisName: labelAxisOnYAxis ? 'yAxis' : 'xAxis'
  };
}

export function getSizeKey(labelAxisOnYAxis: boolean) {
  return {
    valueSizeKey: labelAxisOnYAxis ? 'width' : 'height',
    labelSizeKey: labelAxisOnYAxis ? 'height' : 'width'
  };
}
