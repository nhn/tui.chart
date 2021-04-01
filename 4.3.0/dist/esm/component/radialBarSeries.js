import Component from "./component";
import { isNumber, pick, isNull, calculateSizeWithPercentString, deepCopy, } from "../helpers/utils";
import { message } from "../message";
import { makeGroupedSectorResponderModel } from "../helpers/responders";
import { getRadialAnchorPosition, makeAnchorPositionParam, withinRadian, getRadiusRanges, DEGREE_360, DEGREE_0, DEGREE_NEGATIVE_90, } from "../helpers/sector";
import { getActiveSeriesMap } from "../helpers/legend";
import { getDataLabelsOptions } from "../helpers/dataLabels";
import { getRGBA } from "../helpers/color";
import { getTotalAngle } from "../helpers/pieSeries";
import { isAvailableShowTooltipInfo } from "../helpers/validation";
export default class RadialBarSeries extends Component {
    constructor() {
        super(...arguments);
        this.models = {};
        this.activatedResponders = [];
        this.eventDetectType = 'point';
        this.onMouseoutComponent = () => {
            this.eventBus.emit('seriesPointHovered', { models: [], name: this.name });
            this.eventBus.emit('renderHoveredSeries', { models: [], name: this.name });
            this.eventBus.emit('needDraw');
        };
        this.selectSeries = (info) => {
            var _a;
            const { index, seriesIndex } = info;
            const isAvailable = isNumber(index) && (this.eventDetectType === 'grouped' || isNumber(seriesIndex));
            if (!isAvailable) {
                return;
            }
            const models = this.eventDetectType === 'grouped'
                ? [
                    ...this.getGroupedSector([this.responders[index]], 'select'),
                    ...this.getRadialBarSectorModelsFromResponders([this.responders[index]]),
                ]
                : (_a = this.getResponderModelsWithTheme([this.tooltipSectorMap[index][seriesIndex]], 'select'), (_a !== null && _a !== void 0 ? _a : []));
            if (!models.length) {
                throw new Error(message.SELECT_SERIES_API_INDEX_ERROR);
            }
            this.eventBus.emit('renderSelectedSeries', {
                models: models,
                name: this.name,
                eventDetectType: this.eventDetectType,
            });
            this.eventBus.emit('needDraw');
        };
        this.showTooltip = (info) => {
            const { index, seriesIndex } = info;
            if (!isAvailableShowTooltipInfo(info, this.eventDetectType, 'radialBar')) {
                return;
            }
            const models = this.eventDetectType === 'grouped'
                ? this.getGroupedSector([this.responders[index]], 'hover')
                : this.getResponderModelsWithTheme([this.tooltipSectorMap[index][seriesIndex]], 'hover');
            if (!models.length) {
                return;
            }
            this.eventBus.emit('renderHoveredSeries', {
                models,
                name: this.name,
                eventDetectType: this.eventDetectType,
            });
            this.activatedResponders =
                this.eventDetectType === 'grouped' ? this.tooltipSectorMap[index] : models;
            this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
            this.eventBus.emit('needDraw');
        };
    }
    initUpdate(delta) {
        if (!this.drawModels) {
            return;
        }
        const { angle: { start: startAngle, total: totalAngle }, } = this.circularAxis;
        let currentDegree;
        Object.keys(this.models).forEach((category) => {
            const index = this.models[category].findIndex(({ clockwise, degree: { start, end } }) => {
                currentDegree = clockwise
                    ? startAngle + totalAngle * delta
                    : startAngle - totalAngle * delta;
                return withinRadian(clockwise, start, end, currentDegree);
            });
            this.syncEndAngle(index < 0 ? this.models[category].length : index, category);
            if (index !== -1) {
                this.drawModels[category][index].degree.end = currentDegree;
            }
        });
    }
    syncEndAngle(index, category) {
        if (index < 1) {
            return;
        }
        for (let i = 0; i < index; i += 1) {
            const prevTargetEndDegree = this.models[category][i].degree.end;
            if (this.drawModels[category][i].degree.end !== prevTargetEndDegree) {
                this.drawModels[category][i].degree.end = prevTargetEndDegree;
            }
        }
    }
    initialize() {
        this.type = 'series';
        this.name = 'radialBar';
        this.eventBus.on('selectSeries', this.selectSeries);
        this.eventBus.on('showTooltip', this.showTooltip);
        this.eventBus.on('hideTooltip', this.onMouseoutComponent);
    }
    render(chartState) {
        var _a, _b;
        const { layout, series, legend, options, theme, stackSeries, scale, radialAxes } = chartState;
        const categories = (_a = chartState.categories, (_a !== null && _a !== void 0 ? _a : []));
        if (!series.radialBar || !stackSeries.radialBar) {
            throw new Error(message.noDataError(this.name));
        }
        this.theme = theme.series.radialBar;
        this.rect = layout.plot;
        this.activeSeriesMap = getActiveSeriesMap(legend);
        this.selectable = this.getSelectableOption(options);
        this.setEventDetectType(options);
        const initialCategoryMap = categories.reduce((acc, category) => {
            if (!acc[category]) {
                acc[category] = [];
            }
            return acc;
        }, {});
        const seriesData = series.radialBar.data;
        this.circularAxis = radialAxes.circularAxis;
        const verticalAxisData = radialAxes.verticalAxis;
        const renderOptions = this.makeRenderOptions(verticalAxisData, scale.circularAxis, (_b = options) === null || _b === void 0 ? void 0 : _b.series);
        const { categoryMap, seriesModels } = this.makeSeriesModelData(seriesData, stackSeries.radialBar.stackData, renderOptions, initialCategoryMap);
        const tooltipData = this.makeTooltipData(seriesModels, categories);
        this.models = categoryMap;
        if (!this.drawModels) {
            this.initDrawModels(categoryMap);
        }
        if (getDataLabelsOptions(options, this.name).visible) {
            const dataLabelData = seriesModels.reduce((acc, data) => {
                return [...acc, Object.assign(Object.assign({}, data), { type: 'sector', theme: this.theme.dataLabels })];
            }, []);
            this.renderDataLabels(dataLabelData);
        }
        this.tooltipSectorMap = this.makeTooltipSectorMap(seriesModels, tooltipData);
        this.responders = this.makeResponders(verticalAxisData.radius.ranges, seriesModels, renderOptions, categories, tooltipData);
    }
    initDrawModels(categoryMap) {
        this.drawModels = {};
        Object.keys(categoryMap).forEach((category) => {
            this.drawModels[category] = categoryMap[category].map((m) => (Object.assign(Object.assign({}, m), { degree: Object.assign(Object.assign({}, m.degree), { end: m.degree.start }) })));
        });
    }
    makeResponders(radiusRanges, seriesModels, renderOptions, categories, tooltipData) {
        return this.eventDetectType === 'grouped'
            ? makeGroupedSectorResponderModel(radiusRanges, renderOptions, categories)
            : seriesModels.map((m, index) => (Object.assign(Object.assign({}, m), { data: Object.assign({}, tooltipData[index]) })));
    }
    makeTooltipSectorMap(seriesModels, tooltipData) {
        return seriesModels.reduce((acc, cur, index) => {
            const categoryIndex = cur.index;
            if (!acc[categoryIndex]) {
                acc[categoryIndex] = [];
            }
            acc[categoryIndex].push(Object.assign(Object.assign({}, cur), { data: Object.assign({}, tooltipData[index]) }));
            return acc;
        }, {});
    }
    setEventDetectType(options) {
        var _a, _b;
        if ((_b = (_a = options) === null || _a === void 0 ? void 0 : _a.series) === null || _b === void 0 ? void 0 : _b.eventDetectType) {
            this.eventDetectType = options.series.eventDetectType;
        }
    }
    getBarWidth(tickDistance, axisSize) {
        const { barWidth } = this.theme;
        const DEFAULT_PADDING = 5;
        return barWidth
            ? Math.min(tickDistance, calculateSizeWithPercentString(axisSize, barWidth))
            : tickDistance - DEFAULT_PADDING * 2;
    }
    makeRenderOptions({ axisSize, centerX, centerY, tickDistance, radius: { ranges }, angle: { start, end }, }, scale, options) {
        var _a, _b;
        const { limit: { max }, stepSize, } = scale;
        const clockwise = (_b = (_a = options) === null || _a === void 0 ? void 0 : _a.clockwise, (_b !== null && _b !== void 0 ? _b : true));
        const totalAngle = getTotalAngle(clockwise, start, end);
        const barWidth = this.getBarWidth(tickDistance, axisSize);
        const padding = (tickDistance - barWidth) / 2;
        const scaleMaxLimitValue = max + (totalAngle < DEGREE_360 ? DEGREE_0 : stepSize);
        return {
            clockwise,
            centerX,
            centerY,
            radiusRanges: getRadiusRanges(ranges, padding),
            angleRange: {
                start,
                end,
            },
            totalAngle,
            scaleMaxLimitValue,
            startAngle: start,
        };
    }
    makeSeriesModelData(seriesData, stackSeriesData, renderOptions, initialCategoryMap) {
        const { clockwise, centerX, centerY, radiusRanges, totalAngle, scaleMaxLimitValue, startAngle, } = renderOptions;
        const defaultStartDegree = startAngle;
        const { lineWidth, strokeStyle } = this.theme;
        const sectorModels = [];
        const categories = Object.keys(initialCategoryMap);
        const categoryMap = deepCopy(initialCategoryMap);
        stackSeriesData.forEach(({ values }, categoryIndex) => {
            const { inner, outer } = radiusRanges[categoryIndex];
            values.forEach((value, seriesIndex) => {
                if (!isNull(value)) {
                    const degree = Math.max((value / scaleMaxLimitValue) * totalAngle, 1) * (clockwise ? 1 : -1);
                    const prevModel = sectorModels[sectorModels.length - 1];
                    const startDegree = seriesIndex && prevModel ? prevModel.degree.end : defaultStartDegree;
                    const endDegree = clockwise
                        ? Math.min(startDegree + degree, DEGREE_360)
                        : Math.max(startDegree + degree, DEGREE_0);
                    const { name, color: seriesColor } = seriesData[seriesIndex];
                    const color = this.getSeriesColor(name, seriesColor);
                    const sectorModel = {
                        type: 'sector',
                        name,
                        color: color,
                        x: centerX,
                        y: centerY,
                        degree: {
                            start: startDegree,
                            end: endDegree,
                        },
                        radius: {
                            inner,
                            outer,
                        },
                        value,
                        style: [{ strokeStyle }],
                        lineWidth,
                        clockwise,
                        totalAngle,
                        seriesColor,
                        seriesIndex,
                        index: categoryIndex,
                        drawingStartAngle: DEGREE_NEGATIVE_90,
                    };
                    categoryMap[categories[categoryIndex]].push(sectorModel);
                    sectorModels.push(sectorModel);
                }
            });
        });
        return { seriesModels: sectorModels, categoryMap };
    }
    getSeriesColor(name, color) {
        const { select, areaOpacity } = this.theme;
        const active = this.activeSeriesMap[name];
        const selected = Object.values(this.activeSeriesMap).some((elem) => !elem);
        return selected
            ? getRGBA(color, active ? select.areaOpacity : select.restSeries.areaOpacity)
            : getRGBA(color, areaOpacity);
    }
    makeTooltipData(seriesModels, categories) {
        const tooltipData = [];
        seriesModels.forEach(({ seriesColor, name, value, index }) => {
            if (!isNull(value)) {
                tooltipData.push({
                    label: name,
                    color: seriesColor,
                    value: value,
                    category: isNumber(index) ? categories[index] : '',
                });
            }
        });
        return tooltipData;
    }
    makeTooltipResponder(responders) {
        const categories = Object.keys(this.models);
        return responders.map((responder) => (Object.assign(Object.assign({}, responder), getRadialAnchorPosition(makeAnchorPositionParam('center', this.models[categories[responder.index]].find(({ name }) => name === responder.name))))));
    }
    getRadialBarSectorModelsFromResponders(responders) {
        var _a;
        if (!responders.length) {
            return [];
        }
        return _a = this.tooltipSectorMap[responders[0].index], (_a !== null && _a !== void 0 ? _a : []);
    }
    getGroupedSector(responders, type) {
        const RadialBarSectorModels = this.getRadialBarSectorModelsFromResponders(responders);
        const { color, opacity } = this.theme[type].groupedSector;
        return RadialBarSectorModels.length
            ? responders.map((m) => (Object.assign(Object.assign({}, m), { color: getRGBA(color, opacity) })))
            : [];
    }
    onMousemoveGroupedType(responders) {
        const RadialBarSectorModels = this.getRadialBarSectorModelsFromResponders(responders);
        this.eventBus.emit('renderHoveredSeries', {
            models: this.getGroupedSector(responders, 'hover'),
            name: this.name,
            eventDetectType: this.eventDetectType,
        });
        this.activatedResponders = RadialBarSectorModels;
    }
    onMousemove({ responders }) {
        if (this.eventDetectType === 'grouped') {
            this.onMousemoveGroupedType(responders);
        }
        else {
            this.eventBus.emit('renderHoveredSeries', {
                models: this.getResponderModelsWithTheme(responders, 'hover'),
                name: this.name,
            });
            this.activatedResponders = this.makeTooltipResponder(responders);
        }
        this.eventBus.emit('seriesPointHovered', {
            models: this.activatedResponders,
            name: this.name,
            eventDetectType: this.eventDetectType,
        });
        this.eventBus.emit('needDraw');
    }
    onClick({ responders }) {
        if (this.selectable) {
            let models;
            if (this.eventDetectType === 'grouped') {
                models = [
                    ...this.getGroupedSector(responders, 'select'),
                    ...this.getRadialBarSectorModelsFromResponders(responders),
                ];
            }
            else {
                models = this.getResponderModelsWithTheme(responders, 'select');
            }
            this.eventBus.emit('renderSelectedSeries', {
                models,
                name: this.name,
                eventDetectType: this.eventDetectType,
            });
            this.eventBus.emit('needDraw');
        }
    }
    getResponderModelsWithTheme(responders, type) {
        const theme = this.theme[type];
        const lineWidth = theme.lineWidth;
        const isSameLineWidth = this.theme.lineWidth === lineWidth;
        const thickness = isSameLineWidth ? 0 : lineWidth * 0.5;
        return responders.map((m) => {
            var _a, _b;
            return (Object.assign(Object.assign({}, m), { color: (_b = (_a = theme) === null || _a === void 0 ? void 0 : _a.color, (_b !== null && _b !== void 0 ? _b : m.color)), lineWidth: lineWidth, style: [
                    pick(theme, 'strokeStyle', 'shadowBlur', 'shadowColor', 'shadowOffsetX', 'shadowOffsetY'),
                ], radius: {
                    inner: Math.max(m.radius.inner - thickness, 0),
                    outer: m.radius.outer + thickness,
                } }));
        });
    }
}
