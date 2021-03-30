import Component from "./component";
import { getValueRatio, setSplineControlPoint } from "../helpers/calculator";
import { getRGBA } from "../helpers/color";
import { deepCopy, deepMergedCopy, getFirstValidValue, isNull, isUndefined, range, sum, } from "../helpers/utils";
import { isRangeData } from "../helpers/range";
import { getActiveSeriesMap } from "../helpers/legend";
import { getNearestResponder, makeRectResponderModel, makeTooltipCircleMap, } from "../helpers/responders";
import { getValueAxisName } from "../helpers/axes";
import { getDataLabelsOptions } from "../helpers/dataLabels";
import { message } from "../message";
import { isAvailableSelectSeries, isAvailableShowTooltipInfo } from "../helpers/validation";
const seriesOpacity = {
    INACTIVE: 0.06,
    ACTIVE: 1,
};
export default class AreaSeries extends Component {
    constructor() {
        super(...arguments);
        this.models = { rect: [], series: [], dot: [] };
        this.activatedResponders = [];
        this.eventDetectType = 'nearest';
        this.isStackChart = false;
        this.isRangeChart = false;
        this.isSplineChart = false;
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
            if (!isAvailableSelectSeries(info, 'area')) {
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
            const models = this.getResponderSeriesWithTheme([model], 'select');
            this.eventBus.emit('renderSelectedSeries', { models, name: this.name });
            this.eventBus.emit('needDraw');
        };
        this.showTooltip = (info) => {
            const { index, seriesIndex } = info;
            if (!isAvailableShowTooltipInfo(info, this.eventDetectType, 'area')) {
                return;
            }
            const category = this.getResponderCategoryByIndex(index);
            if (!category) {
                return;
            }
            const models = this.eventDetectType === 'grouped'
                ? this.tooltipCircleMap[category]
                : [this.tooltipCircleMap[category][seriesIndex]];
            if (!models.length) {
                return;
            }
            this.onMousemoveNearType(models);
            this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
            this.eventBus.emit('needDraw');
        };
    }
    initialize() {
        this.type = 'series';
        this.name = 'area';
        this.eventBus.on('selectSeries', this.selectSeries);
        this.eventBus.on('showTooltip', this.showTooltip);
        this.eventBus.on('hideTooltip', this.onMouseoutComponent);
    }
    initUpdate(delta) {
        if (!this.drawModels) {
            return;
        }
        this.drawModels.rect[0].width = this.models.rect[0].width * delta;
    }
    getBaseYPosition(limit) {
        const baseValue = limit.min >= 0 ? limit.min : Math.min(limit.max, 0);
        const intervalSize = this.rect.height / (limit.max - limit.min);
        return (limit.max - baseValue) * intervalSize;
    }
    getStackValue(areaStackSeries, seriesIndex, index) {
        const { type } = areaStackSeries.stack;
        const { values, sum: sumValue } = areaStackSeries.stackData[index];
        const stackedValue = sum(values.slice(0, seriesIndex + 1));
        return type === 'percent' ? (stackedValue * 100) / sumValue : stackedValue;
    }
    setEventDetectType(series, options) {
        var _a, _b;
        if ((_b = (_a = options) === null || _a === void 0 ? void 0 : _a.series) === null || _b === void 0 ? void 0 : _b.eventDetectType) {
            this.eventDetectType = options.series.eventDetectType;
        }
        if (series.line || this.isStackChart) {
            this.eventDetectType = 'grouped';
        }
    }
    getAreaOptions(options) {
        var _a;
        const newOptions = Object.assign({}, options);
        if ((_a = newOptions.series) === null || _a === void 0 ? void 0 : _a.area) {
            newOptions.series = Object.assign(Object.assign({}, newOptions.series), newOptions.series.area);
        }
        return newOptions;
    }
    render(chartState, computed) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const { viewRange } = computed;
        const { layout, series, scale, axes, legend, stackSeries, theme } = chartState;
        if (!series.area) {
            throw new Error(message.noDataError(this.name));
        }
        let areaStackSeries;
        const options = this.getAreaOptions(chartState.options);
        const categories = chartState.categories;
        const rawCategories = (_a = chartState.rawCategories, (_a !== null && _a !== void 0 ? _a : []));
        this.theme = theme.series.area;
        this.rect = layout.plot;
        this.activeSeriesMap = getActiveSeriesMap(legend);
        this.startIndex = (_c = (_b = viewRange) === null || _b === void 0 ? void 0 : _b[0], (_c !== null && _c !== void 0 ? _c : 0));
        this.selectable = this.getSelectableOption(options);
        this.isSplineChart = (_e = (_d = options.series) === null || _d === void 0 ? void 0 : _d.spline, (_e !== null && _e !== void 0 ? _e : false));
        const { limit } = scale[getValueAxisName(options, this.name, 'yAxis')];
        const { tickDistance, pointOnColumn, tickCount } = axes.xAxis;
        const areaData = series.area.data;
        this.baseYPosition = this.getBaseYPosition(limit);
        if ((_f = stackSeries) === null || _f === void 0 ? void 0 : _f.area) {
            this.isStackChart = true;
            areaStackSeries = stackSeries.area;
        }
        else if (isRangeData((_g = getFirstValidValue(areaData)) === null || _g === void 0 ? void 0 : _g.data)) {
            this.isRangeChart = true;
        }
        this.setEventDetectType(series, options);
        const renderOptions = {
            pointOnColumn,
            options: options.series || {},
            tickDistance,
            tickCount,
            areaStackSeries,
        };
        this.linePointsModel = this.renderLinePointsModel(areaData, limit, renderOptions);
        const areaSeriesModel = this.renderAreaPointsModel();
        const showDot = !!((_h = options.series) === null || _h === void 0 ? void 0 : _h.showDot);
        const { dotSeriesModel, responderModel } = this.renderCircleModel(showDot);
        const tooltipDataArr = this.makeTooltipData(areaData, rawCategories);
        this.models = deepCopy({
            rect: [this.renderClipRectAreaModel()],
            series: [...this.linePointsModel, ...areaSeriesModel],
            dot: dotSeriesModel,
        });
        if (!this.drawModels) {
            this.drawModels = Object.assign(Object.assign({}, this.models), { rect: [this.renderClipRectAreaModel(true)] });
        }
        if (getDataLabelsOptions(options, this.name).visible) {
            this.renderDataLabels(this.getDataLabels(areaSeriesModel));
        }
        this.tooltipCircleMap = makeTooltipCircleMap(responderModel, tooltipDataArr);
        this.responders = this.getResponders(responderModel, tooltipDataArr, categories, rawCategories, axes.xAxis);
    }
    getResponders(responderModel, tooltipDataArr, categories, rawCategories, axisData) {
        if (this.eventDetectType === 'near') {
            return this.makeNearTypeResponderModel(responderModel, tooltipDataArr, rawCategories);
        }
        if (this.eventDetectType === 'point') {
            return this.makeNearTypeResponderModel(responderModel, tooltipDataArr, rawCategories, 0);
        }
        return makeRectResponderModel(this.rect, axisData, categories);
    }
    makeNearTypeResponderModel(seriesCircleModel, tooltipDataArr, categories, detectionSize) {
        const tooltipDataLength = tooltipDataArr.length;
        return seriesCircleModel.map((m, dataIndex) => (Object.assign(Object.assign({}, m), { data: tooltipDataArr[dataIndex % tooltipDataLength], detectionSize, label: categories[m.index] })));
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
    makeTooltipData(areaData, categories) {
        return areaData.flatMap(({ rawData, name, color }, seriesIndex) => {
            const tooltipData = [];
            rawData.forEach((datum, index) => {
                if (!isNull(datum)) {
                    const value = this.isRangeChart ? `${datum[0]} ~ ${datum[1]}` : datum;
                    tooltipData.push({
                        label: name,
                        color,
                        value,
                        category: categories[index],
                        seriesIndex,
                        index,
                    });
                }
            });
            return tooltipData;
        });
    }
    getLinePointModelValue(datum, pairModel) {
        if (this.isRangeChart) {
            return pairModel ? datum[0] : datum[1];
        }
        return datum;
    }
    getLinePointModel(series, seriesIndex, limit, renderOptions) {
        const { pointOnColumn, tickDistance, pairModel, areaStackSeries } = renderOptions;
        const { rawData, name, color: seriesColor } = series;
        const active = this.activeSeriesMap[name];
        const points = [];
        const color = getRGBA(seriesColor, active ? seriesOpacity.ACTIVE : seriesOpacity.INACTIVE);
        const { lineWidth, dashSegments } = this.theme;
        rawData.forEach((datum, idx) => {
            if (isNull(datum)) {
                points.push(null);
                return;
            }
            const value = this.getLinePointModelValue(datum, pairModel);
            const stackedValue = this.isStackChart
                ? this.getStackValue(areaStackSeries, seriesIndex, idx)
                : value;
            const valueRatio = getValueRatio(stackedValue, limit);
            const x = tickDistance * (idx - this.startIndex) + (pointOnColumn ? tickDistance / 2 : 0);
            const y = (1 - valueRatio) * this.rect.height;
            points.push({ x, y, value });
        });
        if (pairModel) {
            points.reverse(); // for range spline
        }
        if (this.isSplineChart) {
            setSplineControlPoint(points);
        }
        return {
            type: 'linePoints',
            lineWidth,
            dashSegments,
            color,
            points,
            seriesIndex,
            name,
        };
    }
    renderLinePointsModel(seriesRawData, limit, renderOptions) {
        const linePointsModels = seriesRawData.map((series, seriesIndex) => this.getLinePointModel(series, seriesIndex, limit, renderOptions));
        if (this.isRangeChart) {
            const renderOptionsForPair = deepMergedCopy(renderOptions, { pairModel: true });
            const pair = seriesRawData.map((series, seriesIndex) => this.getLinePointModel(series, seriesIndex, limit, renderOptionsForPair));
            linePointsModels.push(...pair);
        }
        return linePointsModels;
    }
    getCombinedPoints(start, end) {
        const startPoints = start >= 0 ? this.linePointsModel[start].points : [];
        const reversedEndPoints = [...this.linePointsModel[end].points].reverse();
        return [...startPoints, ...reversedEndPoints];
    }
    renderRangeAreaSeries(linePointsModel) {
        const model = [];
        linePointsModel.forEach((m) => {
            let areaPoints = [];
            const { points } = m;
            points.slice(0, points.length / 2 + 1).forEach((point, i) => {
                const lastPoint = i === points.length / 2 - 1;
                const nullPoint = isNull(point);
                if (!nullPoint) {
                    areaPoints.push(point);
                }
                if (areaPoints.length && (lastPoint || nullPoint)) {
                    const pairPoints = areaPoints
                        .map((areaPoint, idx) => {
                        const curIdx = points.length / 2 + i - areaPoints.length + idx + (!nullPoint && lastPoint ? 1 : 0);
                        return points[curIdx];
                    })
                        .reverse();
                    model.push(Object.assign(Object.assign({}, m), { type: 'areaPoints', lineWidth: 0, color: 'rgba(0, 0, 0, 0)', fillColor: this.getAreaOpacity(m.name, m.color), points: [...areaPoints, ...pairPoints] }));
                    areaPoints = [];
                }
            });
        });
        return model;
    }
    renderAreaSeries(linePointsModel) {
        const model = [];
        const bottomYPoint = [];
        linePointsModel.forEach((m) => {
            let areaPoints = [];
            const curBottomYPoint = [...bottomYPoint];
            const { points } = m;
            points.forEach((point, i) => {
                const lastPoint = i === points.length - 1;
                const nullPoint = isNull(point);
                if (!isNull(point)) {
                    areaPoints.push(point);
                }
                if (areaPoints.length && (nullPoint || lastPoint)) {
                    const pairPoints = areaPoints
                        .map((areaPoint, idx) => {
                        const curIdx = i - areaPoints.length + idx + (!nullPoint && lastPoint ? 1 : 0);
                        const bottom = isUndefined(curBottomYPoint[curIdx])
                            ? this.baseYPosition
                            : curBottomYPoint[curIdx];
                        if (this.isStackChart) {
                            bottomYPoint[curIdx] = areaPoint.y;
                        }
                        return { x: areaPoint.x, y: bottom };
                    })
                        .reverse();
                    if (this.isStackChart && this.isSplineChart) {
                        setSplineControlPoint(pairPoints); // set spline for new stack pair points
                    }
                    model.push(Object.assign(Object.assign({}, m), { type: 'areaPoints', lineWidth: 0, color: 'rgba(0, 0, 0, 0)', fillColor: this.getAreaOpacity(m.name, m.color), points: [...areaPoints, ...pairPoints] }));
                    areaPoints = [];
                }
            });
        });
        return model;
    }
    getCombinedLinePointsModel() {
        if (!this.isRangeChart) {
            return this.linePointsModel;
        }
        const len = this.linePointsModel.length / 2;
        return range(0, len).reduce((acc, i) => {
            const start = i;
            const end = len + i;
            const points = this.getCombinedPoints(start, end);
            return [...acc, Object.assign(Object.assign({}, this.linePointsModel[i]), { points })];
        }, []);
    }
    getAreaOpacity(name, color) {
        const { select, areaOpacity } = this.theme;
        const active = this.activeSeriesMap[name];
        const selected = Object.values(this.activeSeriesMap).some((elem) => !elem);
        return selected
            ? getRGBA(color, active ? select.areaOpacity : select.restSeries.areaOpacity)
            : getRGBA(color, areaOpacity);
    }
    renderAreaPointsModel() {
        const combinedLinePointsModel = this.getCombinedLinePointsModel();
        return this.isRangeChart
            ? this.renderRangeAreaSeries(combinedLinePointsModel)
            : this.renderAreaSeries(combinedLinePointsModel);
    }
    renderCircleModel(showDot) {
        const dotSeriesModel = [];
        const responderModel = [];
        const { dot: dotTheme } = this.theme;
        this.linePointsModel.forEach(({ points, color, seriesIndex, name }, modelIndex) => {
            const isPairLinePointsModel = this.isRangeChart && modelIndex >= this.linePointsModel.length / 2;
            const active = this.activeSeriesMap[name];
            points.forEach((point, index) => {
                var _a;
                if (isNull(point)) {
                    return;
                }
                const model = Object.assign(Object.assign({ type: 'circle' }, point), { seriesIndex,
                    name, index: isPairLinePointsModel ? points.length - index - 1 : index });
                if (showDot) {
                    dotSeriesModel.push(Object.assign(Object.assign({}, model), { radius: dotTheme.radius, color: getRGBA(color, active ? 1 : 0.3), style: [
                            { lineWidth: dotTheme.borderWidth, strokeStyle: (_a = dotTheme.borderColor, (_a !== null && _a !== void 0 ? _a : color)) },
                        ] }));
                }
                responderModel.push(...this.getResponderSeriesWithTheme([model], 'hover', color));
            });
        });
        return { dotSeriesModel, responderModel };
    }
    getPairCircleModel(circleModels) {
        const pairCircleModels = [];
        circleModels.forEach((circle) => {
            const { seriesIndex, y, data } = circle;
            const { category } = data;
            const pairCircleModel = this.tooltipCircleMap[category].find((model) => model.seriesIndex === seriesIndex && model.y !== y);
            pairCircleModels.push(pairCircleModel);
        });
        return pairCircleModels;
    }
    getCircleModelsFromRectResponders(responders, mousePositions) {
        var _a;
        if (!responders.length || !responders[0].label) {
            return [];
        }
        const models = (_a = this.tooltipCircleMap[responders[0].label], (_a !== null && _a !== void 0 ? _a : []));
        return this.eventDetectType === 'grouped'
            ? models
            : getNearestResponder(models, mousePositions, this.rect);
    }
    onMousemoveGroupedType(responders) {
        const circleModels = this.getCircleModelsFromRectResponders(responders);
        this.eventBus.emit('renderHoveredSeries', {
            models: circleModels,
            name: this.name,
            eventDetectType: this.eventDetectType,
        });
        this.activatedResponders = this.isRangeChart
            ? circleModels.slice(0, circleModels.length / 2) // for rendering unique tooltip data
            : circleModels;
    }
    onMousemoveNearestType(responders, mousePositions) {
        const circleModels = this.getCircleModelsFromRectResponders(responders, mousePositions);
        this.onMousemoveNearType(circleModels);
    }
    onMousemoveNearType(responders) {
        let pairCircleModels = [];
        if (this.isRangeChart) {
            pairCircleModels = this.getPairCircleModel(responders);
        }
        const hoveredSeries = [...responders, ...pairCircleModels];
        this.eventBus.emit('renderHoveredSeries', {
            models: hoveredSeries,
            name: this.name,
            eventDetectType: this.eventDetectType,
        });
        this.activatedResponders = responders;
    }
    onMousemove({ responders, mousePosition }) {
        if (this.eventDetectType === 'nearest') {
            this.onMousemoveNearestType(responders, mousePosition);
        }
        else if (['near', 'point'].includes(this.eventDetectType)) {
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
        return seriesModels.flatMap(({ points, name, fillColor }) => points.map((point) => isNull(point)
            ? {}
            : Object.assign(Object.assign({ type: 'point' }, point), { name, theme: Object.assign(Object.assign({}, dataLabelTheme), { color: dataLabelTheme.useSeriesColor ? getRGBA(fillColor, 1) : dataLabelTheme.color }) })));
    }
    getResponderSeriesWithTheme(models, type, seriesColor) {
        const { radius, color, borderWidth, borderColor } = this.theme[type].dot;
        return models.map((model) => {
            var _a;
            const modelColor = (_a = (color !== null && color !== void 0 ? color : model.color), (_a !== null && _a !== void 0 ? _a : seriesColor));
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
