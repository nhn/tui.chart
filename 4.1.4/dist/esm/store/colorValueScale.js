import { extend } from "./store";
import { calculateCoordinateScale } from "../scale/coordinateScaleCalculator";
import { getLimitSafely } from "./dataRange";
import { isVerticalAlign } from "./layout";
import { TREEMAP_ROOT_ID } from "./treemapSeriesData";
const colorValueScale = {
    name: 'colorValueScale',
    state: () => ({
        treemapZoomId: {
            prev: TREEMAP_ROOT_ID,
            cur: TREEMAP_ROOT_ID,
        },
        colorValueScale: {},
    }),
    action: {
        setColorValueScale({ state }) {
            const { layout, treemapSeries, legend, heatmapSeries } = state;
            if (!legend.useSpectrumLegend) {
                return;
            }
            const series = (treemapSeries !== null && treemapSeries !== void 0 ? treemapSeries : heatmapSeries.flatMap((value) => value));
            const values = series.reduce((acc, { colorValue }) => (colorValue ? [...acc, colorValue] : acc), []);
            const dataRange = getLimitSafely([...new Set(values)]);
            const offsetSize = isVerticalAlign(legend.align) ? layout.plot.width / 2 : layout.plot.height;
            extend(state.colorValueScale, calculateCoordinateScale({
                dataRange,
                offsetSize,
                useSpectrumLegend: true,
                scaleOption: {},
            }));
        },
        setTreemapZoomId({ state }, id) {
            state.treemapZoomId.prev = state.treemapZoomId.cur;
            state.treemapZoomId.cur = id;
        },
        zoomBack({ state }) {
            var _a, _b;
            const { treemapSeries, treemapZoomId } = state;
            const { prev } = treemapZoomId;
            const prevSeries = treemapSeries.find(({ id }) => id === prev);
            state.treemapZoomId.prev = (_b = (_a = prevSeries) === null || _a === void 0 ? void 0 : _a.parentId, (_b !== null && _b !== void 0 ? _b : TREEMAP_ROOT_ID));
            state.treemapZoomId.cur = prev;
        },
    },
    observe: {
        updateColorValueScale() {
            this.dispatch('setColorValueScale');
        },
    },
    computed: {
        isTreemapSeriesZooming: ({ treemapZoomId }) => {
            return treemapZoomId && treemapZoomId.cur !== treemapZoomId.prev;
        },
    },
};
export default colorValueScale;
