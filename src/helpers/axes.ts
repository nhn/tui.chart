import { SeriesState } from '@t/store/store';

export function isLabelAxisOnYAxis(series: SeriesState) {
  return !!series.bar;
}

export function hasBoxTypeSeries(series: SeriesState) {
  return series.column || series.bar;
}
