import { extend } from '@src/store/store';
import { StoreModule, ScaleData } from '@t/store/store';
import { calculateCoordinateScale } from '@src/scale/coordinateScaleCalculator';
import { getLimitSafely } from '@src/store/dataRange';
import { isVerticalAlign } from '@src/store/layout';
import { TREEMAP_ROOT_ID } from '@src/store/treemapSeriesData';

const treemapScale: StoreModule = {
  name: 'treemapScale',
  state: () => ({
    treemapScale: {} as ScaleData,
    treemapZoomId: {
      prev: TREEMAP_ROOT_ID,
      cur: TREEMAP_ROOT_ID,
    },
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
    setTreemapZoomId({ state }, id) {
      state.treemapZoomId.prev = state.treemapZoomId.cur;
      state.treemapZoomId.cur = id;
    },
    zoomBack({ state }) {
      const { treemapSeries, treemapZoomId } = state;
      const { prev } = treemapZoomId;
      const prevSeries = treemapSeries.find(({ id }) => id === prev);

      state.treemapZoomId.prev = prevSeries?.parentId ?? TREEMAP_ROOT_ID;
      state.treemapZoomId.cur = prev;
    },
  },
  observe: {
    updateTreemapScale() {
      this.dispatch('setTreemapScale');
    },
  },
  computed: {
    isTreemapSeriesZooming: ({ treemapZoomId }) => {
      return treemapZoomId && treemapZoomId.cur !== treemapZoomId.prev;
    },
  },
};

export default treemapScale;
