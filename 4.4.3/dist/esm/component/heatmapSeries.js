import Component from "./component";
import { hexToRGB } from "../helpers/color";
import { getDataLabelsOptions } from "../helpers/dataLabels";
import { getColorRatio, getSpectrumColor, makeDistances } from "../helpers/colorSpectrum";
import { deepMergedCopy, isNull, isNumber } from "../helpers/utils";
import { boxDefault } from "../helpers/theme";
import { message } from "../message";
export default class HeatmapSeries extends Component {
    constructor() {
        super(...arguments);
        this.activatedResponders = [];
        this.onMouseoutComponent = () => {
            this.emitMouseEvent([]);
        };
        this.selectSeries = ({ index, seriesIndex, state, }) => {
            var _a;
            if (!isNumber(index) || !isNumber(seriesIndex)) {
                return;
            }
            const dataSize = (_a = state.series.heatmap) === null || _a === void 0 ? void 0 : _a[0].data.length;
            const responderIndex = seriesIndex * dataSize + index;
            const model = this.responders[responderIndex];
            if (!model) {
                throw new Error(message.SELECT_SERIES_API_INDEX_ERROR);
            }
            this.eventBus.emit('renderSelectedSeries', {
                models: this.getRespondersWithTheme([model], 'select'),
                name: this.name,
            });
            this.eventBus.emit('needDraw');
        };
        this.showTooltip = ({ index, seriesIndex, state }) => {
            var _a;
            if (!isNumber(index) || !isNumber(seriesIndex)) {
                return;
            }
            const dataSize = (_a = state.series.heatmap) === null || _a === void 0 ? void 0 : _a[0].data.length;
            const responderIndex = seriesIndex * dataSize + index;
            const model = this.responders[responderIndex];
            if (model) {
                this.emitMouseEvent([model]);
            }
        };
    }
    initialize() {
        this.type = 'series';
        this.name = 'heatmap';
        this.eventBus.on('selectSeries', this.selectSeries);
        this.eventBus.on('showTooltip', this.showTooltip);
        this.eventBus.on('hideTooltip', this.onMouseoutComponent);
    }
    render(chartState) {
        const { layout, heatmapSeries, axes, theme, colorValueScale, options } = chartState;
        if (!heatmapSeries) {
            throw new Error(message.noDataError(this.name));
        }
        this.theme = theme.series.heatmap;
        this.selectable = this.getSelectableOption(options);
        this.rect = layout.plot;
        const cellSize = {
            height: axes.yAxis.tickDistance,
            width: axes.xAxis.tickDistance,
        };
        this.models = {
            series: this.renderHeatmapSeries(heatmapSeries, cellSize, colorValueScale),
        };
        if (getDataLabelsOptions(options, this.name).visible) {
            this.renderDataLabels(this.makeDataLabels());
        }
        this.responders = this.makeHeatmapSeriesResponder();
    }
    makeDataLabels() {
        const dataLabelTheme = this.theme.dataLabels;
        return this.models.series.reduce((acc, m) => {
            return isNull(m.colorValue)
                ? acc
                : [
                    ...acc,
                    Object.assign(Object.assign({}, m), { type: 'treemapSeriesName', value: m.colorValue, direction: 'left', plot: { x: 0, y: 0, size: 0 }, theme: Object.assign(Object.assign({}, dataLabelTheme), { color: dataLabelTheme.useSeriesColor ? m.color : dataLabelTheme.color }) }),
                ];
        }, []);
    }
    makeHeatmapSeriesResponder() {
        return this.models.series.reduce((acc, model) => {
            return isNull(model.colorValue)
                ? acc
                : [
                    ...acc,
                    Object.assign(Object.assign({}, model), { data: Object.assign(Object.assign({}, model), { label: model.name, value: model.colorValue, templateType: 'heatmap' }), thickness: boxDefault.HOVER_THICKNESS, style: ['shadow'] }),
                ];
        }, []);
    }
    renderHeatmapSeries(seriesData, cellSize, colorValueScale) {
        const { startColor, endColor, borderColor, borderWidth } = this.theme;
        const startRGB = hexToRGB(startColor);
        const distances = makeDistances(startRGB, hexToRGB(endColor));
        const { height, width } = cellSize;
        return seriesData.flatMap((data) => {
            return data.flatMap((datum) => {
                const { indexes, colorValue, category } = datum;
                const name = `${category.x}, ${category.y}`;
                const [xIndex, yIndex] = indexes;
                const colorRatio = getColorRatio(colorValueScale.limit, colorValue);
                const color = isNull(colorValue)
                    ? 'rgba(0, 0, 0, 0)'
                    : getSpectrumColor(colorRatio, distances, startRGB);
                const thickness = borderWidth;
                return {
                    type: 'rect',
                    name,
                    width: width - thickness * 2,
                    height: height - thickness * 2,
                    x: width * xIndex + thickness,
                    y: height * yIndex + thickness,
                    colorValue,
                    colorRatio,
                    color,
                    thickness,
                    borderColor,
                };
            });
        });
    }
    getRespondersWithTheme(responders, type) {
        return responders.map((responder) => deepMergedCopy(responder, Object.assign(Object.assign({}, this.theme[type]), { style: ['shadow'] })));
    }
    onClick({ responders }) {
        if (this.selectable) {
            this.eventBus.emit('renderSelectedSeries', {
                models: this.getRespondersWithTheme(responders, 'select'),
                name: this.name,
            });
            this.eventBus.emit('needDraw');
        }
    }
    onMousemove({ responders }) {
        this.activatedResponders = responders;
        this.emitMouseEvent(responders);
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
