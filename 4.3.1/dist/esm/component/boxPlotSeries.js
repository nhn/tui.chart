import Component from "./component";
import { getActiveSeriesMap } from "../helpers/legend";
import { getRGBA } from "../helpers/color";
import { getBoxTypeSeriesPadding } from "../helpers/style";
import { isNumber, calculateSizeWithPercentString, isNull } from "../helpers/utils";
import { crispPixel } from "../helpers/calculator";
import { message } from "../message";
const MIN_BAR_WIDTH = 5;
function getPadding(tickDistance, barWidth, seriesLength) {
    return (tickDistance - barWidth * seriesLength) / (seriesLength + 1);
}
function getDefaultColor(defaultColor, color) {
    return (color !== null && color !== void 0 ? color : defaultColor);
}
export default class BoxPlotSeries extends Component {
    constructor() {
        super(...arguments);
        this.models = { rect: [], line: [], circle: [] };
        this.activatedResponders = [];
        this.eventDetectType = 'point';
        this.onMouseoutComponent = () => {
            this.eventBus.emit('seriesPointHovered', { models: [], name: this.name });
            this.eventBus.emit('renderHoveredSeries', {
                models: [],
                name: this.name,
                eventDetectType: this.eventDetectType,
            });
            this.eventBus.emit('needDraw');
        };
        this.selectSeries = ({ index, seriesIndex, state, }) => {
            if (!isNumber(index) || !isNumber(seriesIndex)) {
                return;
            }
            const { name } = state.series.boxPlot[seriesIndex];
            const models = this.getRespondersWithTheme(this.tooltipRectMap[`${name}-${index}`], 'select');
            this.eventBus.emit('renderSelectedSeries', {
                models,
                name: this.name,
                eventDetectType: this.eventDetectType,
            });
            this.eventBus.emit('needDraw');
        };
        this.showTooltip = ({ index, seriesIndex, state }) => {
            if (!isNumber(index) || !isNumber(seriesIndex)) {
                return;
            }
            const { name } = state.series.boxPlot[seriesIndex];
            const models = this.getRespondersWithTheme(this.tooltipRectMap[`${name}-${index}`], 'hover');
            this.eventBus.emit('renderHoveredSeries', {
                models,
                name: this.name,
                eventDetectType: this.eventDetectType,
            });
            this.activatedResponders = models;
            this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
            this.eventBus.emit('needDraw');
        };
    }
    initialize() {
        this.type = 'series';
        this.name = 'boxPlot';
        this.eventBus.on('selectSeries', this.selectSeries);
        this.eventBus.on('showTooltip', this.showTooltip);
        this.eventBus.on('hideTooltip', this.onMouseoutComponent);
    }
    render(state) {
        var _a, _b;
        const { layout, axes, series, scale, legend, options, theme } = state;
        if (!series.boxPlot) {
            throw new Error(message.noDataError(this.name));
        }
        if ((_b = (_a = options) === null || _a === void 0 ? void 0 : _a.series) === null || _b === void 0 ? void 0 : _b.eventDetectType) {
            this.eventDetectType = options.series.eventDetectType;
        }
        this.theme = theme.series.boxPlot;
        this.rect = layout.plot;
        this.activeSeriesMap = getActiveSeriesMap(legend);
        this.selectable = this.getSelectableOption(options);
        const categories = state.categories;
        const { tickDistance } = axes.xAxis;
        const { min, max } = scale.yAxis.limit;
        const boxPlotData = series.boxPlot.data;
        const seriesLength = boxPlotData.length;
        const renderOptions = Object.assign({ ratio: this.rect.height / (max - min), tickDistance }, this.getBarWidths(tickDistance, seriesLength));
        const boxPlotModelData = this.makeBoxPlots(boxPlotData, renderOptions);
        const seriesModels = this.renderSeriesModels(boxPlotModelData);
        this.models = seriesModels;
        if (!this.drawModels) {
            this.drawModels = {
                rect: seriesModels.rect.map((m) => (Object.assign(Object.assign({}, m), { y: m.y + m.height, height: 0 }))),
                line: seriesModels.line,
                circle: seriesModels.circle,
            };
        }
        const tooltipData = this.makeTooltipModel(boxPlotData, categories);
        this.tooltipRectMap = this.makeTooltipRectMap(boxPlotModelData, tooltipData);
        this.responders =
            this.eventDetectType === 'grouped'
                ? this.makeGroupedResponderModel(boxPlotModelData)
                : this.makeDefaultResponderModel(boxPlotModelData, tooltipData);
    }
    makeTooltipRectMap(boxPlotModelData, tooltipData) {
        const result = {};
        boxPlotModelData.forEach((m, tooltipIndex) => {
            if (!isNull(m)) {
                const propName = `${m.name}-${m.index}`;
                if (!result[propName]) {
                    result[propName] = [];
                }
                result[propName].push(Object.assign(Object.assign({}, this.makeHoveredModel(m)), { data: tooltipData[tooltipIndex] }));
            }
        });
        return result;
    }
    makeGroupedResponderModel(boxPlotModelData) {
        const result = [];
        boxPlotModelData.forEach((m) => {
            const { type, index, name } = m;
            const propName = `${name}-${index}`;
            if (type === 'boxPlot' && !result[propName]) {
                const { boxPlotDetection } = m;
                result.push(Object.assign(Object.assign({ type: 'rect', name: propName }, boxPlotDetection), { y: 0, height: this.rect.height }));
            }
        });
        return result;
    }
    makeDefaultResponderModel(boxPlotModelData, tooltipDataArr) {
        return boxPlotModelData.map((m, index) => (Object.assign(Object.assign({}, this.makeHoveredModel(m)), { data: tooltipDataArr[index], color: getRGBA(m.color, 1) })));
    }
    makeHoveredModel(model) {
        const point = model.type === 'boxPlot' && model.rect
            ? { x: model.rect.x, y: model.rect.y }
            : { x: model.x, y: model.y };
        const hoveredModel = Object.assign({}, model);
        if (model.type === 'boxPlot') {
            ['lowerWhisker', 'upperWhisker', 'maximum', 'minimum', 'median'].forEach((prop) => {
                if (model[prop]) {
                    model[prop].detectionSize = 3;
                }
            });
            model.color = getRGBA(hoveredModel.color, 1);
        }
        return Object.assign(Object.assign({}, hoveredModel), point);
    }
    getResponderModelFromMap(responders) {
        if (!responders.length) {
            return [];
        }
        const propName = responders[0].name;
        return this.tooltipRectMap[propName];
    }
    onMousemove({ responders }) {
        if (this.eventDetectType === 'grouped') {
            const models = this.getResponderModelFromMap(responders);
            this.eventBus.emit('renderHoveredSeries', {
                models: this.getRespondersWithTheme(models, 'select'),
                name: this.name,
                eventDetectType: this.eventDetectType,
            });
            this.activatedResponders = models;
        }
        else {
            this.eventBus.emit('renderHoveredSeries', {
                models: this.getRespondersWithTheme(responders, 'hover'),
                name: this.name,
                eventDetectType: this.eventDetectType,
            });
            this.activatedResponders = responders;
        }
        this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
        this.eventBus.emit('needDraw');
    }
    onClick({ responders }) {
        if (this.selectable) {
            let models;
            if (this.eventDetectType === 'grouped') {
                models = this.getRespondersWithTheme(this.getResponderModelFromMap(responders), 'select');
            }
            else {
                models = this.getRespondersWithTheme(responders, 'select');
            }
            this.eventBus.emit('renderSelectedSeries', {
                models,
                name: this.name,
                eventDetectType: this.eventDetectType,
            });
            this.eventBus.emit('needDraw');
        }
    }
    renderSeriesModels(boxPlots) {
        return boxPlots.reduce((acc, cur) => {
            const { type, name } = cur;
            if (type === 'boxPlot') {
                acc.rect.push(Object.assign({ name }, cur.rect));
                ['maximum', 'minimum', 'median', 'upperWhisker', 'lowerWhisker'].forEach((prop) => {
                    acc.line.push(Object.assign({ name }, cur[prop]));
                });
            }
            else {
                acc.circle.push(Object.assign({}, cur));
            }
            return acc;
        }, { rect: [], line: [], circle: [] });
    }
    makeBoxPlots(seriesData, renderOptions) {
        const { ratio, barWidth } = renderOptions;
        const boxPlotModels = [];
        const seriesLength = seriesData.length;
        const { dot } = this.theme;
        seriesData.forEach(({ outliers, data, name, color }, seriesIndex) => {
            const seriesColor = this.getSeriesColor(name, color);
            ((data !== null && data !== void 0 ? data : [])).forEach((datum, dataIndex) => {
                if (!isNull(datum)) {
                    const startX = this.getStartX(seriesIndex, dataIndex, renderOptions, seriesLength);
                    const rect = this.getRect(datum, startX, seriesColor, renderOptions);
                    boxPlotModels.push(Object.assign(Object.assign({ type: 'boxPlot', color: seriesColor, name,
                        rect, median: this.getMedian(datum, startX, seriesColor, renderOptions), minimum: this.getMinimum(datum, startX, seriesColor, renderOptions), maximum: this.getMaximum(datum, startX, seriesColor, renderOptions) }, this.getWhisker(datum, startX, seriesColor, renderOptions, rect)), { index: dataIndex, boxPlotDetection: {
                            x: startX,
                            width: barWidth,
                        } }));
                }
            });
            const { color: dotColor, radius, borderColor, borderWidth, useSeriesColor, } = dot;
            ((outliers !== null && outliers !== void 0 ? outliers : [])).forEach((datum) => {
                const [dataIndex, value] = datum;
                const startX = this.getStartX(seriesIndex, dataIndex, renderOptions, seriesLength);
                boxPlotModels.push({
                    type: 'circle',
                    name,
                    x: startX + barWidth / 2,
                    y: this.getYPos(value, ratio),
                    radius: radius,
                    style: [{ strokeStyle: (borderColor !== null && borderColor !== void 0 ? borderColor : seriesColor), lineWidth: borderWidth }],
                    color: useSeriesColor ? seriesColor : dotColor,
                    index: dataIndex,
                });
            });
        });
        return boxPlotModels;
    }
    makeTooltipModel(seriesData, categories) {
        const tooltipData = [];
        seriesData.forEach(({ outliers, data, name, color }) => {
            ((data !== null && data !== void 0 ? data : [])).forEach((datum, dataIndex) => {
                if (!isNull(datum)) {
                    const boxPlotData = [...datum].reverse();
                    tooltipData.push({
                        label: name,
                        color: color,
                        value: [
                            'Maximum',
                            'Upper Quartile',
                            'Median',
                            'Lower Quartile',
                            'Minimum',
                        ].reduce((acc, title, index) => {
                            const value = boxPlotData[index];
                            return isNull(value) ? acc : [...acc, { title, value }];
                        }, []),
                        category: categories[dataIndex],
                        templateType: 'boxPlot',
                    });
                }
            });
            ((outliers !== null && outliers !== void 0 ? outliers : [])).forEach((datum) => {
                if (!isNull(datum)) {
                    const [dataIndex, dataValue] = datum;
                    tooltipData.push({
                        label: name,
                        color: color,
                        value: [{ title: 'Outlier', value: dataValue }],
                        category: categories[dataIndex],
                        templateType: 'boxPlot',
                    });
                }
            });
        });
        return tooltipData;
    }
    getStartX(seriesIndex, dataIndex, renderOptions, seriesLength) {
        const { tickDistance, barWidth } = renderOptions;
        const padding = getPadding(tickDistance, barWidth, seriesLength);
        return dataIndex * tickDistance + (seriesIndex + 1) * padding + barWidth * seriesIndex;
    }
    getYPos(value, ratio, lineWidth) {
        return isNumber(lineWidth)
            ? crispPixel(this.rect.height - value * ratio, lineWidth)
            : this.rect.height - value * ratio;
    }
    getBarWidths(tickDistance, seriesLength) {
        const { barWidth: barThemeWidth, barWidthRatios } = this.theme;
        const { barRatio, minMaxBarRatio } = barWidthRatios;
        const defaultBarWidth = Math.max((tickDistance - getBoxTypeSeriesPadding(tickDistance) * (2 + (seriesLength - 1))) /
            seriesLength, MIN_BAR_WIDTH);
        const barWidth = barThemeWidth
            ? calculateSizeWithPercentString(tickDistance / seriesLength, barThemeWidth)
            : defaultBarWidth;
        return {
            barWidth: barWidth * barRatio,
            minMaxBarWidth: barWidth * minMaxBarRatio,
        };
    }
    getRespondersWithTheme(responders, type) {
        const { color, rect, dot, line, shadowColor, shadowOffsetX, shadowOffsetY, shadowBlur, } = this.theme[type];
        const { whisker, median, maximum, minimum } = line;
        const { color: dotColor, radius, borderColor, borderWidth, useSeriesColor, } = dot;
        return responders.map((m) => {
            const { type: modelType, data } = m;
            let seriesColor = m.color;
            let model;
            if (modelType === 'circle') {
                seriesColor = data.color;
                model = Object.assign(Object.assign({}, m), { radius, color: useSeriesColor ? seriesColor : dotColor, style: [
                        { strokeStyle: getDefaultColor(seriesColor, borderColor), lineWidth: borderWidth },
                    ] });
            }
            else {
                const { rect: seriesRect, upperWhisker, lowerWhisker, median: seriesMedian, maximum: seriesMaximum, minimum: seriesMinimum, } = m;
                model = Object.assign(Object.assign({}, m), { rect: Object.assign(Object.assign({}, seriesRect), { color: (color !== null && color !== void 0 ? color : getRGBA(seriesColor, 1)), thickness: rect.borderWidth, borderColor: rect.borderColor, style: [{ shadowColor, shadowOffsetX, shadowOffsetY, shadowBlur }] }), upperWhisker: Object.assign(Object.assign({}, upperWhisker), { strokeStyle: getDefaultColor(seriesColor, whisker.color), lineWidth: whisker.lineWidth }), lowerWhisker: Object.assign(Object.assign({}, lowerWhisker), { strokeStyle: getDefaultColor(seriesColor, whisker.color), lineWidth: whisker.lineWidth }), median: Object.assign(Object.assign({}, seriesMedian), { strokeStyle: getDefaultColor(seriesColor, median.color), lineWidth: median.lineWidth }), maximum: Object.assign(Object.assign({}, seriesMaximum), { strokeStyle: getDefaultColor(seriesColor, maximum.color), lineWidth: maximum.lineWidth }), minimum: Object.assign(Object.assign({}, seriesMinimum), { strokeStyle: getDefaultColor(seriesColor, minimum.color), lineWidth: minimum.lineWidth }) });
            }
            return model;
        });
    }
    getRect(datum, startX, seriesColor, { barWidth, ratio }) {
        const { rect } = this.theme;
        const [, lowerQuartile, , highQuartile] = datum;
        return {
            type: 'rect',
            x: startX,
            y: this.getYPos(highQuartile, ratio),
            width: barWidth,
            height: (highQuartile - lowerQuartile) * ratio,
            thickness: rect.borderWidth,
            borderColor: rect.borderColor,
            color: seriesColor,
        };
    }
    getWhisker(datum, startX, seriesColor, { barWidth, ratio }, rect) {
        const [minimum, , , , maximum] = datum;
        const { lineWidth, color } = this.theme.line.whisker;
        const x = crispPixel(startX + barWidth / 2, lineWidth);
        return {
            upperWhisker: {
                type: 'line',
                x,
                y: this.getYPos(maximum, ratio, lineWidth),
                x2: x,
                y2: rect.y,
                strokeStyle: (color !== null && color !== void 0 ? color : seriesColor),
                lineWidth,
            },
            lowerWhisker: {
                type: 'line',
                x,
                y: this.getYPos(minimum, ratio, lineWidth),
                x2: x,
                y2: crispPixel(rect.y + rect.height, lineWidth),
                strokeStyle: (color !== null && color !== void 0 ? color : seriesColor),
                lineWidth,
            },
        };
    }
    getMedian(datum, startX, seriesColor, { barWidth, ratio }) {
        const median = datum[2];
        const { lineWidth, color } = this.theme.line.median;
        return {
            type: 'line',
            x: crispPixel(startX, lineWidth),
            y: this.getYPos(median, ratio, lineWidth),
            x2: crispPixel(startX + barWidth, lineWidth),
            y2: this.getYPos(median, ratio, lineWidth),
            strokeStyle: (color !== null && color !== void 0 ? color : seriesColor),
            lineWidth: lineWidth,
        };
    }
    getMinimum(datum, startX, seriesColor, { barWidth, ratio, minMaxBarWidth }) {
        const minimum = datum[0];
        const { lineWidth, color } = this.theme.line.minimum;
        return {
            type: 'line',
            x: crispPixel(startX + (barWidth - minMaxBarWidth) / 2, lineWidth),
            y: this.getYPos(minimum, ratio, lineWidth),
            x2: crispPixel(startX + (barWidth - minMaxBarWidth) / 2 + minMaxBarWidth, lineWidth),
            y2: this.getYPos(minimum, ratio, lineWidth),
            strokeStyle: (color !== null && color !== void 0 ? color : seriesColor),
            lineWidth: lineWidth,
        };
    }
    getMaximum(datum, startX, seriesColor, { barWidth, ratio, minMaxBarWidth }) {
        const maximum = datum[4];
        const { lineWidth, color } = this.theme.line.maximum;
        return {
            type: 'line',
            x: crispPixel(startX + (barWidth - minMaxBarWidth) / 2, lineWidth),
            y: this.getYPos(maximum, ratio, lineWidth),
            x2: crispPixel(startX + (barWidth - minMaxBarWidth) / 2 + minMaxBarWidth, lineWidth),
            y2: this.getYPos(maximum, ratio, lineWidth),
            strokeStyle: (color !== null && color !== void 0 ? color : seriesColor),
            lineWidth: lineWidth,
        };
    }
    getSeriesColor(seriesName, seriesColor) {
        const { select, areaOpacity } = this.theme;
        const active = this.activeSeriesMap[seriesName];
        const selected = Object.values(this.activeSeriesMap).some((elem) => !elem);
        const selectedOpacity = active ? select.areaOpacity : select.restSeries.areaOpacity;
        const opacity = selected ? selectedOpacity : areaOpacity;
        return getRGBA(seriesColor, opacity);
    }
}
