import { HeatmapSeriesData, Series, StoreModule } from '@t/store/store';
import { extend } from '@src/store/store';
import { HeatmapCategoriesType } from '@t/options';

function makeHeatmapSeries(series: Series, categories: HeatmapCategoriesType): HeatmapSeriesData[] {
  if (!series.heatmap) {
    return [];
  }

  return series.heatmap.data.map((rowSeries, y) => {
    const { data, yCategory } = rowSeries;

    return data.map((colorValue, x) => ({
      colorValue,
      category: {
        x: categories.x[x],
        y: yCategory,
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
      extend(
        state.heatmapSeries,
        makeHeatmapSeries(state.series, state.categories as HeatmapCategoriesType)
      );
    },
  },
  observe: {
    updateTreemapSeriesData() {
      this.dispatch('setHeatmapSeriesData');
    },
  },
};

export default heatmapSeriesData;
