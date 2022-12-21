import Component from "./component";
import { getCoordinateXValue, getCoordinateYValue } from "../helpers/coordinate";
import { getRGBA } from "../helpers/color";
import { getValueRatio } from "../helpers/calculator";
import { deepCopy, deepMergedCopy, isNumber, isString, pick } from "../helpers/utils";
import { getActiveSeriesMap } from "../helpers/legend";
import { getValueAxisName } from "../helpers/axes";
import { getNearestResponder } from "../helpers/responders";
import { message } from "../message";
import { isAvailableSelectSeries } from "../helpers/validation";
export default class ScatterSeries extends Component {
    constructor() {
        super(...arguments);
        this.models = { series: [] };
        this.activatedResponders = [];
        this.onMouseoutComponent = () => {
            this.eventBus.emit('seriesPointHovered', { models: [], name: this.name });
            this.eventBus.emit('renderHoveredSeries', {
                models: [],
                name: this.name,
            });
            this.eventBus.emit('needDraw');
        };
        this.getModelsForSelectInfo = (info) => {
            const { index, seriesIndex, state } = info;
            if (!isNumber(index) || !isNumber(seriesIndex) || !isAvailableSelectSeries(info, 'scatter')) {
                return;
            }
            const { name } = state.series.scatter.data[seriesIndex];
            return [this.responders.filter(({ name: dataName }) => dataName === name)[index]];
        };
        this.selectSeries = (info) => {
            const models = this.getModelsForSelectInfo(info);
            if (!models) {
                return;
            }
            const closestModel = this.getClosestModel(models);
            if (!models.length) {
                throw new Error(message.SELECT_SERIES_API_INDEX_ERROR);
            }
            this.eventBus.emit('renderSelectedSeries', {
                models: this.getResponderAppliedTheme(closestModel, 'select'),
                name: this.name,
            });
            this.eventBus.emit('needDraw');
        };
        this.showTooltip = (info) => {
            const models = this.getModelsForSelectInfo(info);
            if (!models) {
                return;
            }
            this.eventBus.emit('renderHoveredSeries', { models, name: this.name });
            this.activatedResponders = models;
            this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
            this.eventBus.emit('needDraw');
        };
    }
    initialize() {
        this.type = 'series';
        this.name = 'scatter';
        this.eventBus.on('selectSeries', this.selectSeries);
        this.eventBus.on('showTooltip', this.showTooltip);
        this.eventBus.on('hideTooltip', this.onMouseoutComponent);
    }
    initUpdate(delta) {
        this.drawModels.series.forEach((model, index) => {
            model.size = this.models.series[index].size * delta;
        });
    }
    render(chartState) {
        var _a, _b;
        const { layout, series, scale, legend, options, theme, axes } = chartState;
        if (!series.scatter) {
            throw new Error(message.noDataError(this.name));
        }
        const scatterData = series.scatter.data;
        this.theme = theme.series.scatter;
        this.rect = layout.plot;
        this.activeSeriesMap = getActiveSeriesMap(legend);
        this.selectable = this.getSelectableOption(options);
        const limit = (_b = (_a = axes.xAxis) === null || _a === void 0 ? void 0 : _a.labelRange, (_b !== null && _b !== void 0 ? _b : scale.xAxis.limit)); // labelRange is created only for line scatter charts
        const seriesModel = this.renderScatterPointsModel(scatterData, limit, scale[getValueAxisName(options, this.name, 'yAxis')].limit);
        const tooltipModel = this.makeTooltipModel(scatterData);
        this.models.series = seriesModel;
        if (!this.drawModels) {
            this.drawModels = deepCopy(this.models);
        }
        this.responders = seriesModel.map((m, index) => (Object.assign(Object.assign({}, m), { type: 'circle', detectionSize: 0, radius: this.theme.size / 2, color: m.fillColor, style: [{ strokeStyle: m.borderColor, lineWidth: m.borderWidth }], data: tooltipModel[index] })));
    }
    renderScatterPointsModel(seriesRawData, xAxisLimit, yAxisLimit) {
        return seriesRawData.flatMap(({ data, name, color: seriesColor, iconType }, seriesIndex) => {
            const models = [];
            const active = this.activeSeriesMap[name];
            const color = getRGBA(seriesColor, active ? 1 : 0.3);
            data.forEach((datum, index) => {
                const rawXValue = getCoordinateXValue(datum);
                const xValue = isString(rawXValue) ? Number(new Date(rawXValue)) : Number(rawXValue);
                const yValue = getCoordinateYValue(datum);
                const xValueRatio = getValueRatio(xValue, xAxisLimit);
                const yValueRatio = getValueRatio(yValue, yAxisLimit);
                const x = xValueRatio * this.rect.width;
                const y = (1 - yValueRatio) * this.rect.height;
                models.push(Object.assign({ x,
                    y, type: 'scatterSeries', iconType,
                    seriesIndex,
                    name, borderColor: color, index }, pick(this.theme, 'borderWidth', 'size', 'fillColor')));
            });
            return models;
        });
    }
    makeTooltipModel(circleData) {
        return [...circleData].flatMap(({ data, name, color }) => {
            const tooltipData = [];
            data.forEach((datum) => {
                const value = {
                    x: getCoordinateXValue(datum),
                    y: getCoordinateYValue(datum),
                };
                tooltipData.push({ label: name, color, value });
            });
            return tooltipData;
        });
    }
    getClosestModel(closestResponder) {
        if (!closestResponder.length) {
            return [];
        }
        const model = this.models.series.find(({ index, seriesIndex }) => isNumber(index) &&
            isNumber(seriesIndex) &&
            index === closestResponder[0].index &&
            seriesIndex === closestResponder[0].seriesIndex);
        return model ? [model] : [];
    }
    getResponderAppliedTheme(closestModel, type) {
        const { fillColor, size } = this.theme[type];
        return closestModel.map((m) => deepMergedCopy(m, Object.assign(Object.assign({}, this.theme[type]), { color: fillColor, radius: size / 2 })));
    }
    onMousemove({ responders, mousePosition }) {
        const closestResponder = getNearestResponder(responders, mousePosition, this.rect);
        let closestModel = this.getClosestModel(closestResponder);
        closestModel = this.getResponderAppliedTheme(closestModel, 'hover');
        this.eventBus.emit('renderHoveredSeries', { models: closestModel, name: this.name });
        this.activatedResponders = closestResponder;
        this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
        this.eventBus.emit('needDraw');
    }
    onClick({ responders, mousePosition }) {
        if (this.selectable) {
            const closestResponder = getNearestResponder(responders, mousePosition, this.rect);
            let closestModel = this.getClosestModel(closestResponder);
            closestModel = this.getResponderAppliedTheme(closestModel, 'select');
            this.eventBus.emit('renderSelectedSeries', {
                models: closestModel,
                name: this.name,
            });
            this.eventBus.emit('needDraw');
        }
    }
}
