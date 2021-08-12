import Component from "./component";
import { squarify } from "../helpers/squarifier";
import { getRGBA, hexToRGB } from "../helpers/color";
import { getDeepestNode } from "../helpers/responders";
import { getDataLabelsOptions } from "../helpers/dataLabels";
import { deepMergedCopy, first, isNumber, last } from "../helpers/utils";
import { getColorRatio, getSpectrumColor, makeDistances } from "../helpers/colorSpectrum";
import { boxDefault } from "../helpers/theme";
import { message } from "../message";
export default class TreemapSeries extends Component {
    constructor() {
        super(...arguments);
        this.models = { series: [], layer: [] };
        this.activatedResponders = [];
        this.onMouseoutComponent = () => {
            this.emitMouseEvent([]);
        };
        this.selectSeries = ({ seriesIndex }) => {
            if (!isNumber(seriesIndex)) {
                return;
            }
            const model = this.responders.find(({ indexes }) => last(indexes) === seriesIndex);
            if (!model) {
                throw new Error(message.SELECT_SERIES_API_INDEX_ERROR);
            }
            const models = this.getRespondersWithTheme([model], 'select');
            this.eventBus.emit('renderSelectedSeries', { models, name: this.name });
            this.eventBus.emit('needDraw');
        };
        this.showTooltip = ({ seriesIndex }) => {
            if (!isNumber(seriesIndex)) {
                return;
            }
            const model = this.responders.find(({ indexes }) => last(indexes) === seriesIndex);
            if (model) {
                this.emitMouseEvent([model]);
            }
        };
    }
    initialize() {
        this.type = 'series';
        this.name = 'treemap';
        this.eventBus.on('selectSeries', this.selectSeries);
        this.eventBus.on('showTooltip', this.showTooltip);
        this.eventBus.on('hideTooltip', this.onMouseoutComponent);
    }
    getAllChildSeries(series, parentId) {
        const allChildSeries = [];
        series.forEach((data) => {
            if (data.parentId === parentId) {
                allChildSeries.push(data);
                if (data.hasChild) {
                    const res = this.getAllChildSeries(series, data.id);
                    allChildSeries.push(...res);
                }
            }
        });
        return allChildSeries;
    }
    render(chartState) {
        var _a, _b, _c, _d, _e;
        const { layout, treemapSeries, colorValueScale, options, theme, treemapZoomId } = chartState;
        if (!treemapSeries) {
            throw new Error(message.noDataError(this.name));
        }
        const currentTreemapZoomId = treemapZoomId.cur;
        const series = this.getAllChildSeries(treemapSeries, currentTreemapZoomId);
        this.theme = theme.series.treemap;
        this.rect = layout.plot;
        this.selectable = this.getSelectableOption(options);
        this.models = this.renderTreemapSeries(series, options, colorValueScale, currentTreemapZoomId);
        this.zoomable = (_b = (_a = options.series) === null || _a === void 0 ? void 0 : _a.zoomable, (_b !== null && _b !== void 0 ? _b : false));
        if (getDataLabelsOptions(options, this.name).visible) {
            const useTreemapLeaf = (_e = (_d = (_c = options.series) === null || _c === void 0 ? void 0 : _c.dataLabels) === null || _d === void 0 ? void 0 : _d.useTreemapLeaf, (_e !== null && _e !== void 0 ? _e : false));
            const dataLabelModel = this.makeDataLabel(useTreemapLeaf, currentTreemapZoomId);
            this.renderDataLabels(dataLabelModel);
        }
        this.responders = this.makeTreemapSeriesResponder(currentTreemapZoomId);
    }
    makeTreemapSeriesResponder(treemapCurrentDepthParentId) {
        const tooltipData = this.makeTooltipData();
        let { series } = this.models;
        if (this.zoomable) {
            series = series.filter(({ parentId }) => parentId === treemapCurrentDepthParentId);
        }
        return series.map((m, idx) => (Object.assign(Object.assign({}, m), { data: tooltipData[idx], thickness: boxDefault.HOVER_THICKNESS, style: ['shadow'] })));
    }
    makeTooltipData() {
        return this.models.series.map(({ label, data, color }) => ({
            label: label,
            color,
            value: data,
        }));
    }
    makeBoundMap(series, parentId, layout, boundMap = {}) {
        const seriesItems = series.filter((item) => item.parentId === parentId);
        boundMap = Object.assign(Object.assign({}, boundMap), squarify(Object.assign({}, layout), seriesItems));
        seriesItems.forEach((seriesItem) => {
            boundMap = this.makeBoundMap(series, seriesItem.id, boundMap[seriesItem.id], boundMap);
        });
        return boundMap;
    }
    makeDataLabel(useTreemapLeaf, treemapCurrentDepthParentId) {
        const series = useTreemapLeaf
            ? this.models.series.filter(({ hasChild }) => !hasChild)
            : this.models.series.filter(({ parentId }) => parentId === treemapCurrentDepthParentId);
        const dataLabelTheme = this.theme.dataLabels;
        return series.map((m) => (Object.assign(Object.assign({}, m), { type: 'treemapSeriesName', value: m.label, direction: 'left', plot: { x: 0, y: 0, size: 0 }, theme: Object.assign(Object.assign({}, dataLabelTheme), { color: dataLabelTheme.useSeriesColor ? m.color : dataLabelTheme.color }) })));
    }
    getColor(treemapSeries, colors) {
        const { indexes } = treemapSeries;
        const colorIdx = first(indexes);
        return colors[colorIdx];
    }
    getOpacity(treemapSeries) {
        const { indexes, depth } = treemapSeries;
        const idx = last(indexes);
        return indexes.length === 1 ? 0 : Number((0.1 * depth + 0.05 * idx).toFixed(2));
    }
    renderTreemapSeries(seriesData, options, colorValueScale, treemapCurrentDepthParentId) {
        var _a, _b, _c;
        let layer = [];
        const boundMap = this.makeBoundMap(seriesData, treemapCurrentDepthParentId, Object.assign(Object.assign({}, this.rect), { x: 0, y: 0 }));
        const { colors, startColor, endColor, borderWidth, borderColor } = this.theme;
        let startRGB, distances;
        const useColorValue = (_b = (_a = options.series) === null || _a === void 0 ? void 0 : _a.useColorValue, (_b !== null && _b !== void 0 ? _b : false));
        if (useColorValue && startColor && endColor) {
            startRGB = hexToRGB(startColor);
            distances = makeDistances(startRGB, hexToRGB(endColor));
        }
        const series = Object.keys(boundMap).map((id) => {
            const treemapSeries = seriesData.find((item) => item.id === id);
            let colorRatio;
            if (useColorValue) {
                colorRatio = getColorRatio(colorValueScale.limit, treemapSeries.colorValue);
            }
            return Object.assign(Object.assign(Object.assign({}, treemapSeries), boundMap[id]), { type: 'rect', colorRatio, color: useColorValue
                    ? getSpectrumColor(colorRatio, distances, startRGB)
                    : this.getColor(treemapSeries, colors), opacity: useColorValue ? 0 : this.getOpacity(treemapSeries), thickness: borderWidth, borderColor: borderColor });
        });
        if (!((_c = options.series) === null || _c === void 0 ? void 0 : _c.useColorValue)) {
            layer = series.map((m) => (Object.assign(Object.assign({}, m), { color: getRGBA('#000000', m.opacity) })));
        }
        return { series, layer };
    }
    getRespondersWithTheme(responders, type) {
        return responders.map((responder) => deepMergedCopy(responder, Object.assign(Object.assign({}, this.theme[type]), { style: ['shadow'] })));
    }
    onClick({ responders }) {
        if (responders.length) {
            if (this.zoomable) {
                const { id, hasChild } = responders[0];
                if (hasChild) {
                    this.emitMouseEvent([]);
                    this.store.dispatch('setTreemapZoomId', id);
                    this.eventBus.emit('resetSelectedSeries');
                }
                else if (this.selectable) {
                    this.eventBus.emit('renderSelectedSeries', {
                        models: this.getRespondersWithTheme(responders, 'select'),
                        name: this.name,
                    });
                }
            }
            else if (this.selectable) {
                const deepestNode = getDeepestNode(responders);
                this.eventBus.emit('renderSelectedSeries', {
                    models: this.getRespondersWithTheme(deepestNode, 'select'),
                    name: this.name,
                });
            }
        }
    }
    onMousemove({ responders }) {
        const deepestNode = getDeepestNode(responders);
        this.activatedResponders = deepestNode;
        this.emitMouseEvent(deepestNode);
    }
    emitMouseEvent(responders) {
        this.eventBus.emit('renderHoveredSeries', {
            models: this.getRespondersWithTheme(responders, 'hover'),
            name: this.name,
        });
        this.eventBus.emit('seriesPointHovered', {
            models: responders,
            name: this.name,
        });
        this.eventBus.emit('renderSpectrumTooltip', responders);
        this.eventBus.emit('needDraw');
    }
}
