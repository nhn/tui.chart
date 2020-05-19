import scale from '@src/store/scale';
import layout from '@src/store/layout';
import dataRange from '@src/store/dataRange';

import Store from '@src/store/store';
import { BarChartOptions } from '@t/options';
import stackSeriesData from '@src/store/stackSeriesData';
import seriesData from '@src/store/seriesData';

const data = [
  { name: 'han', data: [1, 2, 3] },
  { name: 'cho', data: [4, 5, 6] }
];

describe('Scale Store', () => {
  it('should properly calculated according to the data', () => {
    const store: Store<BarChartOptions> = new Store({
      chart: { height: 100, width: 500 },
      series: { bar: data }
    });

    store.setModule(dataRange);
    store.setModule(layout);
    store.setModule(scale);

    expect(store.state.scale).toEqual({
      xAxis: { limit: { max: 7, min: 0 }, step: 1, stepCount: 6 }
    });
  });

  it('When using percent stack, the scale is calculated as a percent value', () => {
    const store: Store<BarChartOptions> = new Store({
      chart: { height: 100, width: 500 },
      options: { series: { stack: { type: 'percent' } } },
      series: { bar: data }
    });

    store.setModule(dataRange);
    store.setModule(layout);
    store.setModule(seriesData);
    store.setModule(stackSeriesData);
    store.setModule(scale);

    expect(store.state.scale).toEqual({
      xAxis: { limit: { max: 100, min: 0 }, step: 25, stepCount: 5 }
    });
  });
});
