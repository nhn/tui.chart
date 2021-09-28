import Component from "./component";
import { isNumber, pick, isNull, isString, calculateSizeWithPercentString, } from "../helpers/utils";
import { message } from "../message";
import { getRadialPosition, calculateDegreeToRadian, calculateValidAngle, withinRadian, DEGREE_NEGATIVE_90, DEGREE_360, DEGREE_90, } from "../helpers/sector";
import { getActiveSeriesMap } from "../helpers/legend";
import { getRGBA } from "../helpers/color";
import { getTotalAngle } from "../helpers/pieSeries";
import { isLabelAxisOnYAxis } from "../helpers/axes";
import { getScaleMaxLimitValue } from "./radialPlot";
import { getDataLabelsOptions } from "../helpers/dataLabels";
import { DATA_LABEL_MARGIN } from "../store/gaugeAxes";
const DETECTION_SIZE_MARGIN = 3;
export default class GaugeSeries extends Component {
    constructor() {
        super(...arguments);
        this.models = { clockHand: [], solid: [], backgroundSolid: [] };
        this.activatedResponders = [];
        this.onMouseoutComponent = () => {
            this.eventBus.emit('seriesPointHovered', { models: [], name: this.name });
            this.eventBus.emit('renderHoveredSeries', { models: [], name: this.name });
            this.eventBus.emit('needDraw');
        };
        this.selectSeries = (info) => {
            var _a;
            const { index } = info;
            if (!isNumber(index)) {
                return;
            }
            const model = (_a = this.tooltipMap.clockHand[index], (_a !== null && _a !== void 0 ? _a : this.tooltipMap.solid[index]));
            if (!model) {
                return;
            }
            const models = this.getResponderModelsWithTheme(this.getResponderModels([model]), 'select');
            if (!models.length) {
                throw new Error(message.SELECT_SERIES_API_INDEX_ERROR);
            }
            this.eventBus.emit('renderSelectedSeries', {
                models: models,
                name: this.name,
            });
            this.eventBus.emit('needDraw');
        };
        this.showTooltip = (info) => {
            const { index } = info;
            const models = this.getResponderModelsWithTheme([this.tooltipMap.clockHand[index]], 'hover');
            if (!models.length) {
                return;
            }
            this.eventBus.emit('renderHoveredSeries', {
                models,
                name: this.name,
            });
            this.activatedResponders = models;
            this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
            this.eventBus.emit('needDraw');
        };
    }
    initialize() {
        this.type = 'series';
        this.name = 'gauge';
        this.eventBus.on('selectSeries', this.selectSeries);
        this.eventBus.on('showTooltip', this.showTooltip);
        this.eventBus.on('hideTooltip', this.onMouseoutComponent);
    }
    initUpdate(delta) {
        if (!this.drawModels) {
            return;
        }
        const { angle: { start: startAngle, total: totalAngle }, clockwise, } = this.circularAxis;
        const currentDegree = clockwise
            ? startAngle + totalAngle * delta
            : startAngle - totalAngle * delta;
        this.models.clockHand.forEach((model, index) => {
            const { x, y, animationDegree, handSize } = model;
            if ((clockwise && animationDegree < currentDegree) ||
                (!clockwise && animationDegree > currentDegree)) {
                this.syncEndAngle(index);
                return;
            }
            const { x: x2, y: y2 } = getRadialPosition(x, y, handSize, calculateDegreeToRadian(calculateValidAngle(currentDegree)));
            this.drawModels.clockHand[index].x2 = x2;
            this.drawModels.clockHand[index].y2 = y2;
        });
        this.models.solid.forEach(() => {
            const index = this.models.solid.findIndex(({ animationDegree }) => {
                const { start, end } = animationDegree;
                return withinRadian(clockwise, start, end, currentDegree);
            });
            this.syncSectorEndAngle(index < 0 ? this.models.solid.length : index);
            if (index !== -1) {
                this.drawModels.solid[index].degree.end = calculateValidAngle(currentDegree);
            }
        });
    }
    updateModels(current, target, delta) {
        const { angle: { total }, } = this.circularAxis;
        Object.keys(current).forEach((key) => {
            if (!current || !target) {
                return;
            }
            if (key[0] !== '_') {
                if (isNumber(current[key])) {
                    current[key] = current[key] + (target[key] - current[key]) * delta;
                }
                else if (key === 'degree') {
                    if (total < DEGREE_360 && current.degree.end < DEGREE_90) {
                        current[key].end =
                            DEGREE_360 +
                                current[key].end -
                                (DEGREE_360 - target[key].end + current[key].end) * delta;
                    }
                    else {
                        current[key].end = current[key].end + (target[key].end - current[key].end) * delta;
                    }
                }
                else {
                    current[key] = target[key];
                }
            }
        });
    }
    update(delta) {
        this.models.clockHand.forEach((model, index) => {
            this.updateModels(this.drawModels.clockHand[index], model, delta);
        });
        this.models.solid.forEach((model, index) => {
            this.updateModels(this.drawModels.solid[index], model, delta);
        });
    }
    syncEndAngle(index) {
        const model = this.models.clockHand[index];
        const drawModel = this.drawModels.clockHand[index];
        if (model.x2 !== drawModel.x2 || model.y2 !== drawModel.y2) {
            drawModel.x2 = model.x2;
            drawModel.y2 = model.y2;
        }
    }
    syncSectorEndAngle(index) {
        if (!index) {
            return;
        }
        for (let i = 0; i < index; i += 1) {
            const prevTargetEndDegree = this.models.solid[i].degree.end;
            if (this.drawModels.solid[i].degree.end !== prevTargetEndDegree) {
                this.drawModels.solid[i].degree.end = prevTargetEndDegree;
            }
        }
    }
    render(chartState) {
        var _a, _b;
        const { layout, series, legend, options, theme, scale, radialAxes } = chartState;
        const categories = (_a = chartState.categories, (_a !== null && _a !== void 0 ? _a : []));
        if (!series.gauge) {
            throw new Error(message.noDataError(this.name));
        }
        this.theme = theme.series.gauge;
        this.rect = layout.plot;
        this.circularAxis = radialAxes.circularAxis;
        this.activeSeriesMap = getActiveSeriesMap(legend);
        this.selectable = this.getSelectableOption(options);
        const seriesData = series.gauge.data;
        const hasCategoryAxis = !isLabelAxisOnYAxis({ series, categories });
        const renderOptions = this.makeRenderOptions(hasCategoryAxis, categories, scale, (_b = options) === null || _b === void 0 ? void 0 : _b.series);
        const clockHandModels = this.renderClockHands(seriesData, renderOptions);
        this.models.clockHand = renderOptions.useClockHand ? clockHandModels : [];
        const solidModels = this.renderSolidModels(seriesData, clockHandModels, renderOptions);
        const tooltipData = this.makeTooltipData(clockHandModels);
        if (!this.drawModels) {
            this.initDrawModels();
        }
        if (getDataLabelsOptions(options, this.name).visible) {
            const { value, name, x, y, seriesData: data } = clockHandModels[0];
            this.renderDataLabels([
                {
                    type: 'point',
                    theme: this.theme.dataLabels,
                    value,
                    name,
                    x,
                    y: y + DATA_LABEL_MARGIN,
                    data,
                },
            ]);
        }
        this.tooltipMap = this.makeTooltipMap(tooltipData, renderOptions);
        this.responders = this.getResponders(clockHandModels, solidModels, tooltipData, renderOptions.useClockHand);
    }
    renderSolidModels(seriesData, clockHandModels, renderOptions) {
        let solidModels = [];
        this.models.clockHand = renderOptions.useClockHand ? clockHandModels : [];
        if (renderOptions.solidData.visible) {
            solidModels = this.renderSectors(seriesData, renderOptions);
            this.models.backgroundSolid = this.renderBackgroundSolid(renderOptions);
            this.models.solid = solidModels;
        }
        return solidModels;
    }
    initDrawModels() {
        const { angle: { start }, } = this.circularAxis;
        this.drawModels = {
            clockHand: this.models.clockHand.map((m) => {
                const { x: x2, y: y2 } = getRadialPosition(m.x, m.y, m.handSize, calculateDegreeToRadian(start));
                return Object.assign(Object.assign({}, m), { x2, y2, testDegree: 0 });
            }),
            backgroundSolid: this.models.backgroundSolid,
            solid: this.models.solid.map((m) => (Object.assign(Object.assign({}, m), { degree: Object.assign(Object.assign({}, m.degree), { end: m.degree.start }) }))),
        };
    }
    getResponders(clockHandModels, sectorModels, tooltipData, useClockHand = true) {
        const clockHandResponders = !useClockHand
            ? []
            : clockHandModels.map((m, index) => (Object.assign(Object.assign({}, m), { detectionSize: m.baseLine + DETECTION_SIZE_MARGIN, data: Object.assign({}, tooltipData[index]) })));
        return sectorModels.length
            ? [
                ...sectorModels.map((m, index) => (Object.assign(Object.assign({}, m), { data: Object.assign({}, tooltipData[index]) }))),
                ...clockHandResponders,
            ]
            : clockHandResponders;
    }
    getHandSize(size, index = 0) {
        const maxClockHandSize = this.circularAxis.maxClockHandSize;
        if (size) {
            return Array.isArray(size)
                ? calculateSizeWithPercentString(maxClockHandSize, size[index])
                : calculateSizeWithPercentString(maxClockHandSize, size);
        }
        return maxClockHandSize;
    }
    renderClockHands(seriesData, renderOptions) {
        const { centerX, centerY, totalAngle, clockwise, scaleMaxLimitValue, categories, drawingStartAngle, } = renderOptions;
        const seriesModels = [];
        const { size, baseLine, color: clockHandColor } = this.theme.clockHand;
        const { radius, color: pinColor, borderWidth, borderColor } = this.theme.pin;
        seriesData.forEach(({ name, data, color }, seriesIndex) => {
            const seriesColor = this.getSeriesColor(name, color);
            data.forEach((value, index) => {
                const val = isString(value)
                    ? categories.findIndex((category) => category === value)
                    : value;
                const degree = drawingStartAngle + (val / scaleMaxLimitValue) * totalAngle * (clockwise ? 1 : -1);
                const validDegree = calculateValidAngle(degree);
                const handSize = this.getHandSize(size, index);
                const { x: x2, y: y2 } = getRadialPosition(centerX, centerY, handSize, calculateDegreeToRadian(validDegree));
                seriesModels.push({
                    type: 'clockHand',
                    color: (clockHandColor !== null && clockHandColor !== void 0 ? clockHandColor : seriesColor),
                    name,
                    value,
                    x: centerX,
                    y: centerY,
                    x2,
                    y2,
                    pin: {
                        radius: radius,
                        color: (pinColor !== null && pinColor !== void 0 ? pinColor : seriesColor),
                        style: [
                            {
                                strokeStyle: (borderColor !== null && borderColor !== void 0 ? borderColor : getRGBA(seriesColor, 0.1)),
                                lineWidth: borderWidth ? borderWidth + radius : 0,
                            },
                        ],
                    },
                    degree: validDegree,
                    animationDegree: degree,
                    baseLine: baseLine,
                    handSize,
                    seriesData: data,
                    index,
                    seriesIndex,
                });
            });
        });
        return seriesModels;
    }
    renderBackgroundSolid(renderOptions) {
        const { centerX, centerY, startAngle, totalAngle, clockwise, solidData } = renderOptions;
        const { color } = this.theme.solid.backgroundSolid;
        return [
            {
                type: 'sector',
                color: color,
                x: centerX,
                y: centerY,
                clockwise,
                degree: {
                    start: startAngle,
                    end: startAngle + totalAngle,
                },
                radius: solidData.radiusRange,
            },
        ];
    }
    renderSectors(seriesData, renderOptions) {
        const sectors = [];
        const { centerX, centerY, clockwise, totalAngle, scaleMaxLimitValue, startAngle, categories, solidData, } = renderOptions;
        const { radiusRange } = solidData;
        const { lineWidth, strokeStyle } = this.theme.solid;
        seriesData.forEach(({ name, data, color }, index) => {
            const seriesColor = this.getSeriesColor(name, color);
            const value = data[0];
            const val = isString(value) ? categories.findIndex((category) => category === value) : value;
            const degree = (val / scaleMaxLimitValue) * totalAngle * (clockwise ? 1 : -1);
            const validDegree = calculateValidAngle(degree);
            const startDegree = startAngle;
            const endDegree = startDegree + degree;
            const animationStartDegree = startAngle;
            const animationEndDegree = animationStartDegree + validDegree;
            sectors.push({
                type: 'sector',
                color: seriesColor,
                x: centerX,
                y: centerY,
                clockwise,
                degree: {
                    start: startDegree,
                    end: endDegree,
                },
                radius: radiusRange,
                animationDegree: {
                    start: animationStartDegree,
                    end: animationEndDegree,
                },
                drawingStartAngle: DEGREE_NEGATIVE_90,
                style: [{ strokeStyle }],
                lineWidth,
                index,
            });
        });
        return sectors;
    }
    makeTooltipMap(tooltipData, renderOptions) {
        const { clockHand, solid } = this.models;
        const { useClockHand } = renderOptions;
        return tooltipData.reduce((acc, data, index) => {
            if (useClockHand) {
                acc.clockHand.push(Object.assign(Object.assign({}, clockHand[index]), { detectionSize: clockHand[index].baseLine + 3, data }));
            }
            if (solid[index]) {
                acc.solid.push(Object.assign(Object.assign({}, solid[index]), { data }));
            }
            return acc;
        }, { solid: [], clockHand: [] });
    }
    makeRenderOptions(hasCategoryAxis, categories, scale, options) {
        var _a, _b;
        const { centerX, centerY, solidData, angle: { start, end, drawingStart }, radius: { outer }, } = this.circularAxis;
        const solid = this.circularAxis.solidData;
        const clockwise = (_b = (_a = options) === null || _a === void 0 ? void 0 : _a.clockwise, (_b !== null && _b !== void 0 ? _b : true));
        const totalAngle = getTotalAngle(clockwise, start, end);
        return {
            clockwise,
            centerX,
            centerY,
            angleRange: { start, end },
            totalAngle,
            scaleMaxLimitValue: hasCategoryAxis
                ? categories.length
                : getScaleMaxLimitValue(scale.circularAxis, totalAngle),
            startAngle: start,
            categories,
            drawingStartAngle: drawingStart,
            outerRadius: outer,
            useClockHand: solid.visible ? solid.clockHand : true,
            solidData: solidData,
        };
    }
    getSeriesColor(name, color) {
        const { select, areaOpacity } = this.theme;
        const active = this.activeSeriesMap[name];
        const selected = Object.values(this.activeSeriesMap).some((elem) => !elem);
        return selected
            ? getRGBA(color, active ? select.areaOpacity : select.restSeries.areaOpacity)
            : getRGBA(color, areaOpacity);
    }
    makeTooltipData(seriesModels) {
        return seriesModels.reduce((acc, { color, name, value, index, seriesIndex }) => isNull(value) ? acc : [...acc, { label: name, color, value: value, index, seriesIndex }], []);
    }
    onMousemove({ responders }) {
        this.eventBus.emit('renderHoveredSeries', {
            models: this.getResponderModelsWithTheme(this.getResponderModels(responders), 'hover'),
            name: this.name,
        });
        this.activatedResponders = responders.map((responder) => (Object.assign({}, responder)));
        this.eventBus.emit('seriesPointHovered', {
            models: this.activatedResponders,
            name: this.name,
        });
        this.eventBus.emit('needDraw');
    }
    getResponderModels(responders) {
        const { clockHand, solid } = this.tooltipMap;
        return responders.reduce((acc, responder) => {
            const index = responder.index;
            const clockHandModel = clockHand[index] ? [clockHand[index]] : [];
            const solidModel = solid[index] ? [solid[index]] : [];
            return [...acc, ...clockHandModel, ...solidModel];
        }, []);
    }
    onClick({ responders }) {
        if (this.selectable) {
            const models = this.getResponderModelsWithTheme(this.getResponderModels(responders), 'select');
            this.eventBus.emit('renderSelectedSeries', {
                models,
                name: this.name,
            });
            this.eventBus.emit('needDraw');
        }
    }
    getResponderModelsWithSolidTheme(responder, type) {
        var _a;
        const solidTheme = this.theme[type].solid;
        const lineWidth = solidTheme.lineWidth;
        const isSameLineWidth = this.theme.solid === lineWidth;
        const thickness = isSameLineWidth ? 0 : lineWidth * 0.5;
        return Object.assign(Object.assign({}, responder), { color: (_a = solidTheme.color, (_a !== null && _a !== void 0 ? _a : responder.color)), lineWidth, style: [
                pick(solidTheme, 'strokeStyle', 'shadowBlur', 'shadowColor', 'shadowOffsetX', 'shadowOffsetY'),
            ], radius: {
                inner: Math.max(responder.radius.inner - thickness, 0),
                outer: responder.radius.outer + thickness,
            } });
    }
    getResponderWithClockHandTheme(responder, type) {
        const { clockHand, pin } = this.theme[type];
        const { size, baseLine, color: clockHandColor } = clockHand;
        const { radius, color: pinColor, borderWidth, borderColor } = pin;
        const pinRadius = (radius !== null && radius !== void 0 ? radius : responder.pin.radius);
        const pinStyle = [
            {
                strokeStyle: (borderColor !== null && borderColor !== void 0 ? borderColor : getRGBA(responder.pin.style[0].strokeStyle, 0.3)),
                lineWidth: borderWidth ? borderWidth + pinRadius : 0,
            },
        ];
        return Object.assign(Object.assign({}, responder), { color: (clockHandColor !== null && clockHandColor !== void 0 ? clockHandColor : responder.color), pin: {
                radius: pinRadius,
                color: (pinColor !== null && pinColor !== void 0 ? pinColor : responder.pin.color),
                style: pinStyle,
            }, baseLine: (baseLine !== null && baseLine !== void 0 ? baseLine : responder.baseLine), handSize: size ? this.getHandSize(size, responder.index) : responder.handSize });
    }
    getResponderModelsWithTheme(responders, type) {
        return responders.map((m) => {
            var _a;
            return ((_a = m) === null || _a === void 0 ? void 0 : _a.type) === 'sector'
                ? this.getResponderModelsWithSolidTheme(m, type)
                : this.getResponderWithClockHandTheme(m, type);
        });
    }
}
