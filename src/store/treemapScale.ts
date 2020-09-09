import { extend } from '@src/store/store';
import { StoreModule, ScaleData } from '@t/store/store';
import { calculateCoordinateScale } from '@src/scale/coordinateScaleCalculator';
import { getLimitSafely } from '@src/store/dataRange';
import { TreemapChartSeriesOptions } from '@t/options';

const treemapScale: StoreModule = {
  name: 'treemapScale',
  state: () => ({
    treemapScale: {} as ScaleData,
  }),
  action: {
    setTreemapScale({ state }) {
      const { layout, treemapSeries, options } = state;

      if (!(options.series as TreemapChartSeriesOptions).useColorValue) {
        return;
      }

      const values = treemapSeries.reduce<number[]>(
        (acc, { colorValue }) => (colorValue ? [...acc, colorValue] : acc),
        []
      );

      const dataRange = getLimitSafely([...new Set(values)]);

      extend(
        state.treemapScale,
        calculateCoordinateScale({
          dataRange,
          offsetSize: layout.plot.width,
          scaleOption: {},
        })
      );
    },
  },
  observe: {
    updateTreemapScale() {
      this.dispatch('setTreemapScale');
    },
  },
};

export default treemapScale;
