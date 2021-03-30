import { getCoordinateXValue, getCoordinateYValue } from "../helpers/coordinate";
import { getRGBA } from "../helpers/color";
import { getValueRatio } from "../helpers/calculator";
import { deepCopy, deepMergedCopy, isNull, isNumber, isString } from "../helpers/utils";
import { getActiveSeriesMap } from "../helpers/legend";
import { getNearestResponder } from "../helpers/responders";
import Component from "./component";
import { message } from "../message";
const MINIMUM_RADIUS = 0.5;
const MINIMUM_DETECTING_AREA_RADIUS = 1;
export function getMaxRadius(bubbleData) {
    return bubbleData.reduce((acc, cur) => {
        const NonNullData = cur.data.filter((datum) => !isNull(datum));
        return Math.max(acc, ...NonNullData.map(({ r }) => r));
    }, 0);
}
export default class BubbleSeries extends Component {
    constructor() {
        super(...arguments);
        this.models = { series: [] };
        this.activatedResponders = [];
        this.maxRadius = -1;
        this.maxValue = -1;
        this.onMouseoutComponent = () => {
            this.eventBus.emit('seriesPointHovered', { models: [], name: this.name });
            this.eventBus.emit('renderHoveredSeries', {
                models: [],
                name: this.name,
            });
            this.eventBus.emit('needDraw');
        };
        this.selectSeries = ({ index, seriesIndex, state }) => {
            if (!isNumber(index) || !isNumber(seriesIndex)) {
                return;
            }
            const { name } = state.series.bubble.data[index];
            const model = this.responders.filter(({ name: dataName }) => dataName === name)[seriesIndex];
            if (!model) {
                throw new Error(message.SELECT_SERIES_API_INDEX_ERROR);
            }
            const models = this.getResponderAppliedTheme([model], 'select');
            this.eventBus.emit('renderSelectedSeries', { models, name: this.name });
            this.eventBus.emit('needDraw');
        };
        this.showTooltip = (info) => {
            const { index, seriesIndex, state } = info;
            if (!isNumber(index) || !isNumber(seriesIndex)) {
                return;
            }
            const { name } = state.series.bubble.data[seriesIndex];
            const models = [this.responders.filter(({ name: dataName }) => dataName === name)[index]];
            if (!models.length) {
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
        this.name = 'bubble';
        this.eventBus.on('selectSeries', this.selectSeries);
        this.eventBus.on('showTooltip', this.showTooltip);
        this.eventBus.on('hideTooltip', this.onMouseoutComponent);
    }
    initUpdate(delta) {
        this.drawModels.series.forEach((model, index) => {
            model.radius = this.models.series[index].radius * delta;
        });
    }
    render(chartState) {
        const { layout, series, scale, axes, circleLegend, legend, options, theme } = chartState;
        const { plot } = layout;
        if (!series.bubble) {
            throw new Error(message.noDataError(this.name));
        }
        const { xAxis, yAxis } = axes;
        const bubbleData = series.bubble.data;
        this.theme = theme.series.bubble;
        this.rect = plot;
        this.activeSeriesMap = getActiveSeriesMap(legend);
        this.selectable = this.getSelectableOption(options);
        const xAxisTickSize = this.rect.width / xAxis.tickCount;
        const yAxisTickSize = this.rect.height / yAxis.tickCount;
        this.maxRadius = circleLegend.radius
            ? circleLegend.radius
            : Math.min(xAxisTickSize, yAxisTickSize);
        this.maxValue = getMaxRadius(bubbleData);
        const seriesModel = this.renderBubblePointsModel(bubbleData, scale);
        const tooltipModel = this.makeTooltipModel(bubbleData);
        this.models.series = seriesModel;
        if (!this.drawModels) {
            this.drawModels = deepCopy(this.models);
        }
        this.responders = seriesModel.map((m, index) => (Object.assign(Object.assign({}, m), { type: 'circle', detectionSize: 0, radius: m.radius + MINIMUM_DETECTING_AREA_RADIUS, color: getRGBA(m.color, 0.85), data: tooltipModel[index], index })));
    }
    renderBubblePointsModel(seriesRawData, scale) {
        const xAxisLimit = scale.xAxis.limit;
        const yAxisLimit = scale.yAxis.limit;
        const { borderWidth, borderColor } = this.theme;
        return seriesRawData.flatMap(({ data, name, color: seriesColor }, seriesIndex) => {
            const circleModels = [];
            const active = this.activeSeriesMap[name];
            const color = getRGBA(seriesColor, active ? 0.8 : 0.1);
            const nonNullData = data.filter((datum) => !isNull(datum));
            nonNullData.forEach((datum) => {
                const rawXValue = getCoordinateXValue(datum);
                const xValue = isString(rawXValue) ? Number(new Date(rawXValue)) : Number(rawXValue);
                const yValue = getCoordinateYValue(datum);
                const xValueRatio = getValueRatio(xValue, xAxisLimit);
                const yValueRatio = getValueRatio(yValue, yAxisLimit);
                const x = xValueRatio * this.rect.width;
                const y = (1 - yValueRatio) * this.rect.height;
                const radius = Math.max(MINIMUM_RADIUS, (datum.r / this.maxValue) * this.maxRadius);
                circleModels.push({
                    x,
                    y,
                    type: 'circle',
                    radius,
                    color,
                    style: ['default'],
                    seriesIndex,
                    name,
                    borderWidth,
                    borderColor,
                });
            });
            return circleModels;
        });
    }
    makeTooltipModel(circleData) {
        return [...circleData].flatMap(({ data, name, color }) => {
            const tooltipData = [];
            const nonNullData = data.filter((datum) => !isNull(datum));
            nonNullData.forEach((datum) => {
                const { r, label } = datum;
                tooltipData.push({
                    label: `${name}/${label}`,
                    color,
                    value: {
                        x: getCoordinateXValue(datum),
                        y: getCoordinateYValue(datum),
                        r,
                    },
                });
            });
            return tooltipData;
        });
    }
    getResponderAppliedTheme(responders, type) {
        return responders.map((responder) => deepMergedCopy(responder, this.theme[type]));
    }
    onMousemove({ responders, mousePosition }) {
        const closestResponder = getNearestResponder(responders, mousePosition, this.rect);
        const responderWithTheme = this.getResponderAppliedTheme(closestResponder, 'hover');
        this.eventBus.emit('renderHoveredSeries', { models: responderWithTheme, name: this.name });
        this.activatedResponders = closestResponder;
        this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
        this.eventBus.emit('needDraw');
    }
    onClick({ responders, mousePosition }) {
        if (this.selectable) {
            const closestResponder = getNearestResponder(responders, mousePosition, this.rect);
            const responderWithTheme = this.getResponderAppliedTheme(closestResponder, 'select');
            this.eventBus.emit('renderSelectedSeries', {
                models: responderWithTheme,
                name: this.name,
            });
            this.eventBus.emit('needDraw');
        }
    }
}
