import { HeatmapSeriesData, Series, StoreModule } from '@t/store/store';
import { HeatmapCategoriesType, RangeDataType } from '@t/options';
import { getDataInRange } from '@src/helpers/range';

function makeHeatmapSeries(
  series: Series,
  categories: HeatmapCategoriesType,
  viewRange?: RangeDataType<number>
): HeatmapSeriesData[] {
  if (!series.heatmap) {
    return [];
  }

  return series.heatmap.data.map((rowSeries, y) => {
    const { yCategory, data } = rowSeries;

    return getDataInRange(data, viewRange).map((colorValue, x) => ({
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
    setHeatmapSeriesData({ state, computed }) {
      state.heatmapSeries = makeHeatmapSeries(
        state.series,
        state.categories as HeatmapCategoriesType,
        computed.viewRange
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
