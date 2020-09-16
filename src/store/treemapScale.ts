import { extend } from '@src/store/store';
import { StoreModule, ScaleData } from '@t/store/store';
import { calculateCoordinateScale } from '@src/scale/coordinateScaleCalculator';
import { getLimitSafely } from '@src/store/dataRange';
import { isVerticalAlign } from '@src/store/layout';

const treemapScale: StoreModule = {
  name: 'treemapScale',
  state: () => ({
    treemapScale: {} as ScaleData,
  }),
  action: {
    setTreemapScale({ state }) {
      const { layout, treemapSeries, legend } = state;

      if (!legend.useSpectrumLegend) {
        return;
      }

      const values = treemapSeries.reduce<number[]>(
        (acc, { colorValue }) => (colorValue ? [...acc, colorValue] : acc),
        []
      );

      const dataRange = getLimitSafely([...new Set(values)]);
      const offsetSize = isVerticalAlign(legend.align) ? layout.plot.width / 2 : layout.plot.height;

      extend(
        state.treemapScale,
        calculateCoordinateScale({
          dataRange,
          offsetSize,
          useSpectrumLegend: true,
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
