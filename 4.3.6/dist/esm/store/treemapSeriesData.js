import { isNull, isUndefined, last } from "../helpers/utils";
const TREEMAP_ID_PREFIX = '__TOAST_UI_TREEMAP';
export const TREEMAP_ROOT_ID = `${TREEMAP_ID_PREFIX}_ROOT`;
function makeTreeModel(series, indexes, depth, parentId) {
    var _a;
    const idx = last(indexes);
    const id = parentId ? `${parentId}_${idx}` : `${TREEMAP_ID_PREFIX}_${idx}`;
    const { colorValue } = series;
    const models = [
        {
            label: series.label,
            hasChild: !!series.children,
            id,
            indexes,
            parentId: parentId ? parentId : TREEMAP_ROOT_ID,
            depth,
            data: (_a = series.data, (_a !== null && _a !== void 0 ? _a : 0)),
            colorValue,
        },
    ];
    if (series.children) {
        series.children.forEach((child, childIdx) => {
            if (!isNull(child.data)) {
                models.push(...makeTreeModel(child, [...indexes, childIdx], depth + 1, id));
            }
        });
    }
    return models;
}
function setParentSeriesData(treemapSeries) {
    treemapSeries.forEach(({ parentId, data }) => {
        if (parentId !== TREEMAP_ROOT_ID) {
            treemapSeries.find(({ id }) => id === parentId).data += data;
        }
    });
}
function setParentColorValue(treemapSeries) {
    treemapSeries.forEach((datum) => {
        const { id, colorValue } = datum;
        if (isUndefined(colorValue)) {
            const series = treemapSeries.filter(({ parentId }) => parentId === id);
            const totalColorValue = series.reduce((acc, cur) => {
                return acc + (isUndefined(cur.colorValue) ? 0 : cur.colorValue);
            }, 0);
            datum.colorValue = totalColorValue / series.length;
        }
    });
}
function setRatio(treemapSeries) {
    const rootTotal = treemapSeries
        .filter(({ parentId }) => parentId === TREEMAP_ROOT_ID)
        .reduce((acc, { data }) => acc + data, 0);
    treemapSeries.forEach((series) => {
        const total = series.parentId === TREEMAP_ROOT_ID
            ? rootTotal
            : treemapSeries.find(({ id }) => id === series.parentId).data;
        series.ratio = series.data / total;
    });
}
function makeTreemapSeries(series, options) {
    var _a;
    if (!series.treemap) {
        return [];
    }
    const treemapSeries = series.treemap.data
        .filter((datum) => !isNull(datum.data))
        .map((datum, idx) => makeTreeModel(datum, [idx], 0))
        .flatMap((s) => s)
        .sort((a, b) => b.depth - a.depth);
    setParentSeriesData(treemapSeries);
    setRatio(treemapSeries);
    if ((_a = options.series) === null || _a === void 0 ? void 0 : _a.useColorValue) {
        setParentColorValue(treemapSeries);
    }
    return treemapSeries;
}
const treemapSeriesData = {
    name: 'treemapSeriesData',
    state: () => ({
        treemapSeries: [],
    }),
    action: {
        setTreemapSeriesData({ state }) {
            state.treemapSeries = makeTreemapSeries(state.series, state.options);
        },
    },
    observe: {
        updateTreemapSeriesData() {
            this.dispatch('setTreemapSeriesData');
        },
    },
};
export default treemapSeriesData;
