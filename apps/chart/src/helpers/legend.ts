import { Legend } from '@t/store/store';

export function getActiveSeriesMap(legend: Legend) {
  return legend.data.reduce((acc, { active, label }) => ({ ...acc, [label]: active }), {});
}
