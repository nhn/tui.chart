import { SeriesState } from '@t/store/store';

export function getAxisName(series: SeriesState) {
  const labelAxisOnYAxis = isLabelAxisOnYAxis(series);

  return {
    valueAxisName: labelAxisOnYAxis ? 'xAxis' : 'yAxis',
    labelAxisName: labelAxisOnYAxis ? 'yAxis' : 'xAxis'
  };
}

export function isLabelAxisOnYAxis(series: SeriesState) {
  return !!series.bar;
}

export function hasBoxTypeSeries(series: SeriesState) {
  return series.column || series.bar;
}
