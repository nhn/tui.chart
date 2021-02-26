import Component from "./component";
import { getValueRatio, setSplineControlPoint, getXPosition } from "../helpers/calculator";
import { getCoordinateDataIndex, getCoordinateXValue, getCoordinateYValue, } from "../helpers/coordinate";
import { getRGBA } from "../helpers/color";
import { pick, includes, isNull } from "../helpers/utils";
import { getActiveSeriesMap } from "../helpers/legend";
import { getNearestResponder, makeRectResponderModel, makeTooltipCircleMap, } from "../helpers/responders";
import { getValueAxisName } from "../helpers/axes";
import { getDataLabelsOptions } from "../helpers/dataLabels";
import { message } from "../message";
import { isAvailableSelectSeries, isAvailableShowTooltipInfo } from "../helpers/validation";
export default class LineSeries extends Component {
    constructor() {
        super(...arguments);
        this.models = { rect: [], series: [], dot: [] };
        this.activatedResponders = [];
        this.eventDetectType = 'nearest';
        this.yAxisName = 'yAxis';
        this.onMouseoutComponent = () => {
            this.eventBus.emit('seriesPointHovered', { models: [], name: this.name });
            this.eventBus.emit('renderHoveredSeries', {
                models: [],
                name: this.name,
                eventDetectType: this.eventDetectType,
            });
            this.eventBus.emit('needDraw');
        };
        this.selectSeries = (info) => {
            const { index, seriesIndex } = info;
            if (!isAvailableSelectSeries(info, 'line')) {
                return;
            }
            const category = this.getResponderCategoryByIndex(index);
            if (!category) {
                throw new Error(message.SELECT_SERIES_API_INDEX_ERROR);
            }
            const model = this.tooltipCircleMap[category][seriesIndex];
            if (!model) {
                throw new Error(message.SELECT_SERIES_API_INDEX_ERROR);
            }
            this.eventBus.emit('renderSelectedSeries', { models: [model], name: this.name });
            this.eventBus.emit('needDraw');
        };
        this.showTooltip = (info) => {
            var _a;
            const { index, seriesIndex } = info;
            if (!isAvailableShowTooltipInfo(info, this.eventDetectType, 'line')) {
                return;
            }
            const category = this.getResponderCategoryByIndex(index);
            if (!category) {
                return;
            }
            const models = this.eventDetectType === 'grouped'
                ? this.tooltipCircleMap[category]
                : [this.tooltipCircleMap[category][seriesIndex]];
            if (!((_a = models) === null || _a === void 0 ? void 0 : _a.length)) {
                return;
            }
            this.onMousemoveNearType(models);
            this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
            this.eventBus.emit('needDraw');
        };
    }
    initialize() {
        this.type = 'series';
        this.name = 'line';
        this.eventBus.on('selectSeries', this.selectSeries);
        this.eventBus.on('showTooltip', this.showTooltip);
        this.eventBus.on('hideTooltip', this.onMouseoutComponent);
    }
    initUpdate(delta) {
        this.drawModels.rect[0].width = this.models.rect[0].width * delta;
    }
    setEventDetectType(series, options) {
        var _a, _b;
        if (series.area || series.column) {
            this.eventDetectType = 'grouped';
        }
        if ((_b = (_a = options) === null || _a === void 0 ? void 0 : _a.series) === null || _b === void 0 ? void 0 : _b.eventDetectType) {
            this.eventDetectType = options.series.eventDetectType;
        }
        if (series.scatter) {
            this.eventDetectType = 'near';
        }
    }
    render(chartState, computed) {
        var _a, _b;
        const { viewRange } = computed;
        const { layout, series, scale, axes, legend, theme } = chartState;
        if (!series.line) {
            throw new Error(message.noDataError(this.name));
        }
        const categories = (_a = chartState.categories, (_a !== null && _a !== void 0 ? _a : []));
        const options = Object.assign({}, chartState.options);
        if (((_b = options) === null || _b === void 0 ? void 0 : _b.series) && 'line' in options.series) {
            options.series = Object.assign(Object.assign({}, options.series), options.series.line);
        }
        this.setEventDetectType(series, options);
        const labelAxisData = axes.xAxis;
        const { tickDistance, pointOnColumn, labelDistance } = labelAxisData;
        const lineSeriesData = series.line.data;
        const renderLineOptions = {
            pointOnColumn,
            options: (options.series || {}),
            tickDistance,
            labelDistance,
        };
        this.theme = theme.series.line;
        this.rect = layout.plot;
        this.activeSeriesMap = getActiveSeriesMap(legend);
        this.startIndex = viewRange ? viewRange[0] : 0;
        this.selectable = this.getSelectableOption(options);
        this.yAxisName = getValueAxisName(options, this.name, 'yAxis');
        const lineSeriesModel = this.renderLinePointsModel(lineSeriesData, scale, renderLineOptions, categories);
        const { dotSeriesModel, responderModel } = this.renderCircleModel(lineSeriesModel, renderLineOptions);
        const tooltipDataArr = this.makeTooltipData(lineSeriesData, categories);
        this.tooltipCircleMap = makeTooltipCircleMap(responderModel, tooltipDataArr);
        this.models = {
            rect: [this.renderClipRectAreaModel()],
            series: lineSeriesModel,
            dot: dotSeriesModel,
        };
        if (!this.drawModels) {
            this.drawModels = Object.assign(Object.assign({}, this.models), { rect: [this.renderClipRectAreaModel(true)] });
        }
        if (getDataLabelsOptions(options, this.name).visible) {
            this.renderDataLabels(this.getDataLabels(lineSeriesModel));
        }
        this.responders = this.getResponders(labelAxisData, responderModel, tooltipDataArr, categories);
    }
    getResponders(axisData, seriesCircleModel, tooltipDataArr, categories) {
        let res;
        if (this.eventDetectType === 'near') {
            res = this.makeNearTypeResponderModel(seriesCircleModel, tooltipDataArr);
        }
        else if (this.eventDetectType === 'point') {
            res = this.makeNearTypeResponderModel(seriesCircleModel, tooltipDataArr, 0);
        }
        else {
            res = makeRectResponderModel(this.rect, axisData, categories);
        }
        return res;
    }
    makeNearTypeResponderModel(seriesCircleModel, tooltipDataArr, detectionSize) {
        return seriesCircleModel.map((m, index) => (Object.assign(Object.assign({}, m), { data: tooltipDataArr[index], detectionSize })));
    }
    makeTooltipData(lineSeriesData, categories) {
        return lineSeriesData.flatMap(({ rawData, name, color }, seriesIndex) => {
            return rawData.map((datum, index) => isNull(datum)
                ? {}
                : {
                    label: name,
                    color,
                    value: getCoordinateYValue(datum),
                    category: categories[getCoordinateDataIndex(datum, categories, index, this.startIndex)],
                    seriesIndex,
                    index,
                });
        });
    }
    renderClipRectAreaModel(isDrawModel) {
        return {
            type: 'clipRectArea',
            x: 0,
            y: 0,
            width: isDrawModel ? 0 : this.rect.width,
            height: this.rect.height,
        };
    }
    renderLinePointsModel(seriesRawData, scale, renderOptions, categories) {
        var _a, _b;
        const { spline } = renderOptions.options;
        const yAxisLimit = scale[this.yAxisName].limit;
        const xAxisLimit = (_b = (_a = scale) === null || _a === void 0 ? void 0 : _a.xAxis) === null || _b === void 0 ? void 0 : _b.limit;
        const { lineWidth, dashSegments } = this.theme;
        return seriesRawData.map(({ rawData, name, color: seriesColor }, seriesIndex) => {
            const points = [];
            const active = this.activeSeriesMap[name];
            rawData.forEach((datum, idx) => {
                if (isNull(datum)) {
                    return points.push(null);
                }
                const value = getCoordinateYValue(datum);
                const yValueRatio = getValueRatio(value, yAxisLimit);
                const y = (1 - yValueRatio) * this.rect.height;
                const x = getXPosition(pick(renderOptions, 'pointOnColumn', 'tickDistance', 'labelDistance'), this.rect.width, getCoordinateXValue(datum), getCoordinateDataIndex(datum, categories, idx, this.startIndex), xAxisLimit);
                points.push({ x, y, value });
            });
            if (spline) {
                setSplineControlPoint(points);
            }
            return {
                type: 'linePoints',
                points,
                seriesIndex,
                name,
                color: getRGBA(seriesColor, active ? 1 : 0.3),
                lineWidth,
                dashSegments,
            };
        });
    }
    renderCircleModel(lineSeriesModel, { options }) {
        const dotSeriesModel = [];
        const responderModel = [];
        const showDot = !!options.showDot;
        const { hover, dot: dotTheme } = this.theme;
        const hoverDotTheme = hover.dot;
        lineSeriesModel.forEach(({ color, name, points }, seriesIndex) => {
            const active = this.activeSeriesMap[name];
            points.forEach((point, index) => {
                var _a, _b;
                if (isNull(point)) {
                    return;
                }
                const { x, y } = point;
                const model = { type: 'circle', x, y, seriesIndex, name, index };
                if (showDot) {
                    dotSeriesModel.push(Object.assign(Object.assign({}, model), { radius: dotTheme.radius, color: getRGBA(color, active ? 1 : 0.3), style: [
                            { lineWidth: dotTheme.borderWidth, strokeStyle: (_a = dotTheme.borderColor, (_a !== null && _a !== void 0 ? _a : color)) },
                        ] }));
                }
                responderModel.push(Object.assign(Object.assign({}, model), { radius: hoverDotTheme.radius, color: (_b = hoverDotTheme.color, (_b !== null && _b !== void 0 ? _b : getRGBA(color, 1))), style: ['default'] }));
            });
        });
        return { dotSeriesModel, responderModel };
    }
    getCircleModelsFromRectResponders(responders, mousePositions) {
        var _a, _b;
        if (!responders.length || !responders[0].label) {
            return [];
        }
        const models = (_b = this.tooltipCircleMap[(_a = responders[0]) === null || _a === void 0 ? void 0 : _a.label], (_b !== null && _b !== void 0 ? _b : []));
        return this.eventDetectType === 'grouped'
            ? models
            : getNearestResponder(models, mousePositions, this.rect);
    }
    onMousemoveNearType(responders) {
        this.eventBus.emit('renderHoveredSeries', {
            models: this.getResponderSeriesWithTheme(responders, 'hover'),
            name: this.name,
            eventDetectType: this.eventDetectType,
        });
        this.activatedResponders = responders;
    }
    onMousemoveNearestType(responders, mousePositions) {
        const circleModels = this.getCircleModelsFromRectResponders(responders, mousePositions);
        this.onMousemoveNearType(circleModels);
    }
    onMousemoveGroupedType(responders) {
        const circleModels = this.getCircleModelsFromRectResponders(responders);
        this.onMousemoveNearType(circleModels);
    }
    onMousemove({ responders, mousePosition }) {
        if (this.eventDetectType === 'nearest') {
            this.onMousemoveNearestType(responders, mousePosition);
        }
        else if (includes(['near', 'point'], this.eventDetectType)) {
            this.onMousemoveNearType(responders);
        }
        else {
            this.onMousemoveGroupedType(responders);
        }
        this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
        this.eventBus.emit('needDraw');
    }
    getDataLabels(seriesModels) {
        const dataLabelTheme = this.theme.dataLabels;
        return seriesModels.flatMap(({ points, name, color }) => points.map((point) => isNull(point)
            ? {}
            : Object.assign(Object.assign({ type: 'point' }, point), { name, theme: Object.assign(Object.assign({}, dataLabelTheme), { color: dataLabelTheme.useSeriesColor ? color : dataLabelTheme.color }) })));
    }
    getResponderSeriesWithTheme(models, type) {
        const { radius, color, borderWidth, borderColor } = this.theme[type].dot;
        return models.map((model) => {
            const modelColor = (color !== null && color !== void 0 ? color : model.color);
            return Object.assign(Object.assign({}, model), { radius, color: modelColor, style: [{ lineWidth: borderWidth, strokeStyle: (borderColor !== null && borderColor !== void 0 ? borderColor : getRGBA(modelColor, 0.5)) }] });
        });
    }
    onClick({ responders, mousePosition }) {
        if (this.selectable) {
            let models;
            if (this.eventDetectType === 'near') {
                models = responders;
            }
            else {
                models = this.getCircleModelsFromRectResponders(responders, mousePosition);
            }
            this.eventBus.emit('renderSelectedSeries', {
                models: this.getResponderSeriesWithTheme(models, 'select'),
                name: this.name,
            });
            this.eventBus.emit('needDraw');
        }
    }
    getResponderCategoryByIndex(index) {
        var _a, _b;
        const responder = Object.values(this.tooltipCircleMap)
            .flatMap((val) => val)
            .find((model) => model.index === index);
        return (_b = (_a = responder) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.category;
    }
}
