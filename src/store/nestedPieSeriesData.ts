import { StoreModule } from '@t/store/store';
import { extend } from '@src/store/store';
import { deepCopy } from '@src/helpers/utils';

function findRootName(rawSeries, seriesIndex, parent) {
  const item = rawSeries.pieDonut?.[seriesIndex].data.find(({ name }) => name === parent);

  return item.parent ? findRootName(rawSeries, seriesIndex - 1, item.parent) : item.name;
}

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

          colorMap[m.name] = color;

          const rootParent: string =
            m.parent && seriesIndex ? findRootName(rawSeries, seriesIndex - 1, m.parent) : m.name;

          return {
            ...m,
            data: m.data,
            rootParent,
            color,
          };
        });

        newSeriesData[alias] = {
          data: originSeriesData.filter(({ rootParent }) => {
            return !disabledSeries.includes(rootParent);
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
