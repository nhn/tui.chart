import { StoreModule } from '@t/store/store';
import { extend } from '@src/store/store';
import { deepCopy } from '@src/helpers/utils';
import { PieDonutChartOptions } from '@t/options';

const nestedPieSeriesData: StoreModule = {
  name: 'seriesData',
  state: () => ({
    nestedPieSeries: {},
  }),
  action: {
    setNestedPieSeriesData({ state, initStoreState }) {
      const { theme, disabledSeries, options } = state;
      const { colors } = theme.series;
      const rawSeries = deepCopy(initStoreState.series);
      const grouped = (options as PieDonutChartOptions)?.series?.grouped ?? false;
      const newSeriesData = {};
      let colorIdx = 0;

      rawSeries.pieDonut!.forEach(({ alias, data }) => {
        const originSeriesData = data.map((m, dataIndex) => {
          colorIdx += 1;

          return {
            ...m,
            data: m.data,
            color: colors[(grouped ? dataIndex : colorIdx - 1) % colors.length],
          };
        });

        newSeriesData[alias] = {
          data: originSeriesData.filter(({ name }) => !disabledSeries.includes(name)),
        };
      });

      extend(state.nestedPieSeries, newSeriesData);
    },
  },
  observe: {
    updateNestedPieSeriesData() {
      this.dispatch('setNestedPieSeriesData');
    },
  },
};

export default nestedPieSeriesData;
