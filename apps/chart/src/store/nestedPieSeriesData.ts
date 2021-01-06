import { StoreModule, RawSeries } from '@t/store/store';
import { NestedPieSeriesType } from '@t/options';

function findRootName(rawSeries: RawSeries, seriesIndex: number, parentName: string) {
  const item = (rawSeries.pie as NestedPieSeriesType[])?.[seriesIndex].data.find(
    ({ name }) => name === parentName
  );

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
      const rawSeries = initStoreState.series;
      const newSeriesData = {};
      const colorMap = {};

      rawSeries.pie!.forEach(({ name: alias, data }, seriesIndex) => {
        const { colors } = theme.series.pie![alias];
        const colorList: string[] = [];
        const originSeriesData = data.map((m, index) => {
          const { parentName, name: dataName } = m;
          const color = parentName && seriesIndex ? colorMap[parentName] : colors?.[index];
          colorList.push(color);

          colorMap[dataName] = color;

          const rootParentName: string =
            parentName && seriesIndex
              ? findRootName(rawSeries, seriesIndex - 1, parentName)
              : dataName;

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
          colors: colorList,
        };
      });

      state.nestedPieSeries = newSeriesData;
      this.dispatch('updateNestedPieChartLegend');
    },
  },
  observe: {
    updateNestedPieSeriesData() {
      this.dispatch('setNestedPieSeriesData');
    },
  },
};

export default nestedPieSeriesData;
