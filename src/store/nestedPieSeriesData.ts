import { StoreModule } from '@t/store/store';
import { extend } from '@src/store/store';
import { deepCopy } from '@src/helpers/utils';

const nestedPieSeriesData: StoreModule = {
  name: 'seriesData',
  state: () => ({
    nestedPieSeries: {},
  }),
  action: {
    setNestedPieSeriesData({ state, initStoreState }) {
      const { theme, disabledSeries } = state;
      const { colors } = theme.series;
      const rawSeries = deepCopy(initStoreState.series);
      const newSeriesData = {};
      const colorMap = {};
      let colorIdx = 0;

      rawSeries.pieDonut!.forEach(({ name: alias, data }, seriesIndex) => {
        const originSeriesData = data.map((m) => {
          colorIdx += 1;

          const color =
            m.parent && seriesIndex ? colorMap[m.parent] : colors[(colorIdx - 1) % colors.length];

          if (!seriesIndex) {
            colorMap[m.name] = color;
          }

          return {
            ...m,
            data: m.data,
            color,
          };
        });

        newSeriesData[alias] = {
          data: originSeriesData.filter(({ name, parent }) => {
            return parent ? !disabledSeries.includes(parent) : !disabledSeries.includes(name);
          }),
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
