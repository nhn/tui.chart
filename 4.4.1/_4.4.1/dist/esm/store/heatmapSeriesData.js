import { getDataInRange } from "../helpers/range";
function makeHeatmapSeries(series, categories, viewRange) {
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
const heatmapSeriesData = {
    name: 'heatmapSeriesData',
    state: () => ({
        heatmapSeries: [],
    }),
    action: {
        setHeatmapSeriesData({ state, computed }) {
            state.heatmapSeries = makeHeatmapSeries(state.series, state.categories, computed.viewRange);
        },
    },
    observe: {
        updateTreemapSeriesData() {
            this.dispatch('setHeatmapSeriesData');
        },
    },
};
export default heatmapSeriesData;
