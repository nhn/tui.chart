import { SeriesState } from '@t/store/store';

export function isLabelAxisOnYAxis(series: SeriesState) {
  return !!series.bar;
}
