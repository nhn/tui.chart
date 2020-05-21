import { SeriesState } from '@t/store/store';

export function isLabelAxisOnYAxis(series: SeriesState) {
  return !!series.bar;
}

export function isBoxTypeChart(series: SeriesState) {
  return series.column || series.bar;
}
