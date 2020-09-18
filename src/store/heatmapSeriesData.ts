import { HeatmapSeriesData, StoreModule } from '@t/store/store';
import { extend } from '@src/store/store';
import { HeatmapCategoriesType, HeatmapSeriesDataType } from '@t/options';

function makeHeatmapSeries(
  series: HeatmapSeriesDataType[],
  categories: HeatmapCategoriesType
): HeatmapSeriesData[] {
  return series.reverse().map((rowSeries, y) => {
    return rowSeries.map((colorValue, x) => ({
      colorValue,
      category: {
        x: categories.x[x],
        y: categories.y[y],
      },
      indexes: [x, y],
    }));
  });
}

const heatmapSeriesData: StoreModule = {
  name: 'heatmapSeriesData',
  state: () => ({
    heatmapSeries: [],
  }),
  action: {
    setHeatmapSeriesData({ state }) {
      extend(state.heatmapSeries, makeHeatmapSeries(state.series.heatmap, state.categories));
    },
  },
  observe: {
    updateTreemapSeriesData() {
      this.dispatch('setHeatmapSeriesData');
    },
  },
};

export default heatmapSeriesData;
