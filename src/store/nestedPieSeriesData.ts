import { StoreModule, RawSeries } from '@t/store/store';
import { extend } from '@src/store/store';

function findRootName(rawSeries: RawSeries, seriesIndex: number, parentName: string) {
  const item = rawSeries.nestedPie?.[seriesIndex].data.find(({ name }) => name === parentName);

  return item?.parentName ? findRootName(rawSeries, seriesIndex - 1, item.parentName) : parentName;
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
      const rawSeries = initStoreState.series;
      const newSeriesData = {};
      const colorMap = {};
      let colorIdx = 0;

      rawSeries.pie!.forEach(({ name: alias, data }, seriesIndex) => {
        const originSeriesData = data.map((m) => {
          const { parentName, name: dataName } = m;
          const color = parentName && seriesIndex ? colorMap[parentName] : colors[colorIdx];

          colorMap[dataName] = color;

          const rootParentName: string =
            parentName && seriesIndex
              ? findRootName(rawSeries, seriesIndex - 1, parentName)
              : dataName;

          colorIdx += 1;

          return {
            ...m,
            data: m.data,
            rootParentName,
            color,
          };
        });

        newSeriesData[alias] = {
          data: originSeriesData.filter(({ rootParentName }) => {
            return !disabledSeries.includes(rootParentName);
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
