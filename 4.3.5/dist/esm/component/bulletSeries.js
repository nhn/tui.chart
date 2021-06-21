import Component from "./component";
import { getActiveSeriesMap } from "../helpers/legend";
import { getRGBA, getAlpha } from "../helpers/color";
import { isLabelAxisOnYAxis, getAxisName, getSizeKey } from "../helpers/axes";
import { getDataLabelsOptions } from "../helpers/dataLabels";
import { DEFAULT_BULLET_RANGE_OPACITY } from "../helpers/theme";
import { isNumber, omit, calculateSizeWithPercentString, pick, isNull, deepCopyArray, } from "../helpers/utils";
import { message } from "../message";
import { makeRectResponderModel } from "../helpers/responders";
const DEFAULT_WIDTH_RATIO = 0.6;
const MARKER_LINE_DETECTION_SIZE = 5;
function getRectSize(vertical, barWidth, barLength) {
    return {
        width: vertical ? barWidth : barLength,
        height: vertical ? barLength : barWidth,
    };
}
function getStartX(seriesIndex, tickDistance, barWidth) {
    return seriesIndex * tickDistance + (tickDistance - barWidth) / 2;
}
function makeBulletResponderModel(models, tooltipData) {
    const { range, marker, bullet } = models;
    const { range: tooltipRange, marker: tooltipMarker, bullet: tooltipBullet } = tooltipData;
    return [
        ...range.map((m, index) => (Object.assign(Object.assign({}, m), { data: tooltipRange[index] }))),
        ...bullet.map((m, index) => (Object.assign(Object.assign({}, m), { data: tooltipBullet[index] }))),
        ...marker.map((m, index) => (Object.assign(Object.assign({}, m), { detectionSize: MARKER_LINE_DETECTION_SIZE, data: tooltipMarker[index] }))),
    ];
}
export default class BulletSeries extends Component {
    constructor() {
        super(...arguments);
        this.models = { range: [], bullet: [], marker: [] };
        this.activatedResponders = [];
        this.eventDetectType = 'point';
        this.vertical = false;
        this.onMouseoutComponent = () => {
            this.eventBus.emit('seriesPointHovered', { models: [], name: this.name });
            this.eventBus.emit('renderHoveredSeries', {
                models: [],
                name: this.name,
            });
            this.eventBus.emit('needDraw');
        };
        this.selectSeries = ({ seriesIndex, state }) => {
            var _a;
            if (!isNumber(seriesIndex)) {
                return;
            }
            const { name } = (_a = state.series.bullet) === null || _a === void 0 ? void 0 : _a[seriesIndex];
            const model = this.filterBulletResponder(this.responders).filter(({ name: dataName }) => dataName === name);
            if (!model) {
                throw new Error(message.SELECT_SERIES_API_INDEX_ERROR);
            }
            this.eventBus.emit('renderSelectedSeries', {
                models: this.getRespondersWithTheme(model, 'select'),
                name: this.name,
            });
            this.eventBus.emit('needDraw');
        };
        this.showTooltip = ({ seriesIndex, state }) => {
            var _a;
            if (!isNumber(seriesIndex)) {
                return;
            }
            const { name } = (_a = state.series.bullet) === null || _a === void 0 ? void 0 : _a[seriesIndex];
            const models = this.filterBulletResponder(this.responders).filter(({ name: dataName }) => dataName === name);
            if (!models.length) {
                return;
            }
            this.onMousemove({ responders: models });
        };
    }
    initialize() {
        this.type = 'series';
        this.name = 'bullet';
        this.eventBus.on('selectSeries', this.selectSeries);
        this.eventBus.on('showTooltip', this.showTooltip);
        this.eventBus.on('hideTooltip', this.onMouseoutComponent);
    }
    initUpdate(delta) {
        if (!this.drawModels) {
            return;
        }
        const { clipRect } = this.drawModels;
        if (!clipRect) {
            return;
        }
        const offsetKey = this.vertical ? 'y' : 'x';
        const key = this.vertical ? 'height' : 'width';
        const current = clipRect[0];
        const target = this.models.clipRect[0];
        const offsetSize = current[key] + (target[key] - current[key]) * delta;
        current[key] = offsetSize;
        current[offsetKey] = Math.max(this.basePosition - (offsetSize * this.basePosition) / target[key], 0);
    }
    render(state) {
        var _a, _b;
        const { layout, axes, series, scale, legend, options, theme, categories } = state;
        if (!series.bullet) {
            throw new Error(message.noDataError(this.name));
        }
        this.setEventDetectType(series, options);
        this.theme = theme.series.bullet;
        this.rect = layout.plot;
        this.activeSeriesMap = getActiveSeriesMap(legend);
        this.selectable = this.getSelectableOption(options);
        this.vertical = !!((_b = (_a = options) === null || _a === void 0 ? void 0 : _a.series) === null || _b === void 0 ? void 0 : _b.vertical);
        const labelAxisOnYAxis = isLabelAxisOnYAxis({ series, options });
        const { labelAxisName, valueAxisName } = getAxisName(labelAxisOnYAxis, series);
        const { valueSizeKey } = getSizeKey(labelAxisOnYAxis);
        const { tickDistance } = axes[labelAxisName];
        const { zeroPosition } = axes[valueAxisName];
        const { min, max } = scale[valueAxisName].limit;
        const bulletData = series.bullet.data;
        this.basePosition = (zeroPosition !== null && zeroPosition !== void 0 ? zeroPosition : 0);
        const renderOptions = Object.assign({ ratio: this.rect[valueSizeKey] / (max - min), tickDistance,
            zeroPosition }, this.getBulletBarWidths(tickDistance));
        const rangeModels = this.renderRanges(bulletData, renderOptions);
        const bulletModels = this.renderBullet(bulletData, renderOptions);
        const markerModels = this.renderMarkers(bulletData, renderOptions);
        const clipRect = this.renderClipRectArea();
        this.models.clipRect = [clipRect];
        this.models.range = rangeModels;
        this.models.bullet = bulletModels;
        this.models.marker = markerModels;
        if (!this.drawModels) {
            this.drawModels = {
                clipRect: [this.makeInitialClipRectModel(clipRect)],
                range: deepCopyArray(rangeModels),
                bullet: deepCopyArray(bulletModels),
                marker: deepCopyArray(markerModels),
            };
        }
        const models = {
            range: rangeModels,
            bullet: bulletModels,
            marker: markerModels,
        };
        const tooltipData = this.makeTooltipModel(models);
        this.tooltipRectMap = this.makeTooltipRectMap(models, tooltipData);
        this.responders = this.getBulletSeriesResponders(models, tooltipData, axes, categories);
        if (getDataLabelsOptions(options, this.name).visible) {
            this.renderDataLabels(this.getDataLabels([...rangeModels, ...bulletModels, ...markerModels], this.vertical, this.rect[valueSizeKey]));
        }
    }
    renderClipRectArea() {
        return {
            type: 'clipRectArea',
            x: 0,
            y: 0,
            width: this.rect.width,
            height: this.rect.height,
        };
    }
    makeInitialClipRectModel(clipRect) {
        const width = this.vertical ? clipRect.width : 0;
        const height = this.vertical ? 0 : clipRect.height;
        const x = this.vertical ? clipRect.x : 0;
        const y = this.vertical ? 0 : clipRect.y;
        return { type: 'clipRectArea', width, height, x, y };
    }
    getDataLabels(seriesModels, vertical, size) {
        const { dataLabels: dataLabelTheme } = this.theme;
        const bulletLabelTheme = omit(dataLabelTheme, 'marker');
        const { useSeriesColor, color } = bulletLabelTheme;
        const { marker } = dataLabelTheme;
        return seriesModels
            .filter((m) => m.type === 'line' || m.modelType !== 'range')
            .map((m) => {
            var _a;
            if (m.type === 'line') {
                return Object.assign(Object.assign({}, m), { x: vertical ? (m.x + m.x2) / 2 : m.x, theme: Object.assign(Object.assign({}, marker), { color: marker.useSeriesColor ? m.strokeStyle : marker.color }) });
            }
            const isValueNegative = isNumber(m.value) && ((_a = m) === null || _a === void 0 ? void 0 : _a.value) < 0;
            let direction = vertical ? 'top' : 'right';
            if (isValueNegative) {
                direction = vertical ? 'bottom' : 'left';
            }
            return Object.assign(Object.assign({}, m), { direction, plot: {
                    x: 0,
                    y: 0,
                    size,
                }, theme: Object.assign(Object.assign({}, bulletLabelTheme), { color: useSeriesColor ? m.color : color }) });
        });
    }
    setEventDetectType(series, options) {
        var _a, _b;
        if ((_b = (_a = options) === null || _a === void 0 ? void 0 : _a.series) === null || _b === void 0 ? void 0 : _b.eventDetectType) {
            this.eventDetectType = options.series.eventDetectType;
        }
    }
    getBulletSeriesResponders(models, tooltipData, axes, categories) {
        return this.eventDetectType === 'grouped'
            ? makeRectResponderModel(this.rect, (this.vertical ? axes.xAxis : axes.yAxis), categories, this.vertical)
            : makeBulletResponderModel(models, tooltipData);
    }
    makeTooltipRectMap(models, tooltipData) {
        const result = {};
        Object.keys(models).forEach((seriesType) => {
            models[seriesType].forEach((m, index) => {
                const label = m.name;
                if (!result[label]) {
                    result[label] = [];
                }
                const tooltipModel = Object.assign(Object.assign({}, m), { data: tooltipData[seriesType][index] });
                result[label].push(tooltipModel);
            });
        });
        return result;
    }
    getBulletSeriesModelsFromRectResponders(responders) {
        var _a;
        if (!responders.length) {
            return [];
        }
        return _a = this.tooltipRectMap[responders[0].label], (_a !== null && _a !== void 0 ? _a : []);
    }
    getGroupedRect(responders, type) {
        const bulletSeriesModels = this.getBulletSeriesModelsFromRectResponders(responders);
        const { color, opacity } = this.theme[type].groupedRect;
        return bulletSeriesModels.length
            ? responders.map((m) => (Object.assign(Object.assign({}, m), { color: getRGBA(color, opacity) })))
            : [];
    }
    onMousemoveGroupedType(responders) {
        const bulletSeriesModels = this.getBulletSeriesModelsFromRectResponders(responders);
        this.eventBus.emit('renderHoveredSeries', {
            models: [
                ...this.getGroupedRect(responders, 'hover'),
                ...this.getRespondersWithTheme(bulletSeriesModels, 'hover'),
            ],
            name: this.name,
            eventDetectType: this.eventDetectType,
        });
        this.activatedResponders = bulletSeriesModels;
    }
    onMousemove({ responders }) {
        if (this.eventDetectType === 'grouped') {
            this.onMousemoveGroupedType(responders);
        }
        else {
            this.eventBus.emit('renderHoveredSeries', {
                models: this.getRespondersWithTheme(responders, 'hover'),
                name: this.name,
            });
            this.activatedResponders = responders.length ? [responders[responders.length - 1]] : [];
        }
        this.eventBus.emit('seriesPointHovered', {
            models: this.activatedResponders,
            name: this.name,
        });
        this.eventBus.emit('needDraw');
    }
    onClick({ responders }) {
        if (this.selectable) {
            const models = this.eventDetectType === 'grouped'
                ? [
                    ...this.getGroupedRect(responders, 'select'),
                    ...this.getRespondersWithTheme(this.getBulletSeriesModelsFromRectResponders(responders), 'select'),
                ]
                : this.getRespondersWithTheme(responders, 'select');
            this.eventBus.emit('renderSelectedSeries', {
                models,
                name: this.name,
                eventDetectType: this.eventDetectType,
            });
            this.eventBus.emit('needDraw');
        }
    }
    filterBulletResponder(responders) {
        return responders.filter((model) => { var _a; return ((_a = model) === null || _a === void 0 ? void 0 : _a.modelType) === 'bullet'; });
    }
    renderRanges(bulletData, { tickDistance, ratio, zeroPosition, rangeWidth }) {
        const rangeModels = [];
        bulletData.forEach(({ ranges, color, name }, seriesIndex) => {
            ((ranges !== null && ranges !== void 0 ? ranges : [])).forEach((range, rangeIndex) => {
                if (!isNull(range)) {
                    const [start, end] = range;
                    const barLength = (end - start) * ratio;
                    const rangeStartX = getStartX(seriesIndex, tickDistance, rangeWidth);
                    rangeModels.push(Object.assign(Object.assign({ type: 'rect', name, color: this.getRangeColor(getRGBA(color, this.getSeriesOpacity(name)), rangeIndex, name), x: this.vertical ? rangeStartX : start * ratio + zeroPosition, y: this.vertical ? zeroPosition - end * ratio : rangeStartX }, getRectSize(this.vertical, rangeWidth, barLength)), { modelType: 'range', seriesColor: color, tooltipColor: this.getRangeColor(color, rangeIndex, name, true), value: range }));
                }
            });
        });
        return rangeModels;
    }
    renderBullet(bulletData, { tickDistance, ratio, zeroPosition, bulletWidth }) {
        const { borderColor, borderWidth: thickness } = this.theme;
        return bulletData.reduce((acc, { data, color, name }, seriesIndex) => {
            if (isNull(data)) {
                return [...acc];
            }
            const bulletLength = Math.max(Math.abs(data * ratio), 2);
            const bulletStartX = getStartX(seriesIndex, tickDistance, bulletWidth);
            const x = this.vertical ? bulletStartX : zeroPosition - (data < 0 ? bulletLength : 0);
            const y = this.vertical
                ? zeroPosition - bulletLength + (data < 0 ? bulletLength : 0)
                : bulletStartX;
            const bullet = Object.assign({ type: 'rect', name, color: getRGBA(color, this.getSeriesOpacity(name)), x,
                y,
                thickness,
                borderColor, modelType: 'bullet', seriesColor: color, tooltipColor: color, value: data }, getRectSize(this.vertical, bulletWidth, bulletLength));
            return [...acc, bullet];
        }, []);
    }
    renderMarkers(bulletData, { tickDistance, ratio, zeroPosition, markerWidth }) {
        const { markerLineWidth } = this.theme;
        const markerModels = [];
        bulletData.forEach(({ markers, color, name }, seriesIndex) => {
            const markerStartX = getStartX(seriesIndex, tickDistance, markerWidth);
            ((markers !== null && markers !== void 0 ? markers : [])).forEach((marker) => {
                if (!isNull(marker)) {
                    const dataPosition = marker * ratio;
                    const x = this.vertical ? markerStartX : dataPosition + zeroPosition;
                    const y = this.vertical ? zeroPosition - dataPosition : markerStartX;
                    markerModels.push({
                        type: 'line',
                        name,
                        x,
                        y,
                        x2: this.vertical ? x + markerWidth : x,
                        y2: this.vertical ? y : y + markerWidth,
                        strokeStyle: getRGBA(color, this.getSeriesOpacity(name)),
                        lineWidth: markerLineWidth,
                        seriesColor: color,
                        tooltipColor: color,
                        value: marker,
                    });
                }
            });
        });
        return markerModels;
    }
    makeTooltipModel(seriesModels) {
        const { range, bullet, marker } = seriesModels;
        return {
            range: this.makeTooltipData(range, 'Range'),
            bullet: this.makeTooltipData(bullet, 'Actual'),
            marker: this.makeTooltipData(marker, 'Marker'),
        };
    }
    makeTooltipData(data, title) {
        return data.map((m) => {
            const { name, seriesColor, tooltipColor, value } = m;
            return {
                label: name,
                color: getRGBA(seriesColor, 1),
                value: [{ title, value, color: tooltipColor }],
                templateType: 'bullet',
            };
        });
    }
    getBulletBarWidths(tickDistance) {
        const { barWidth: barThemeWidth, barWidthRatios } = this.theme;
        const { rangeRatio, bulletRatio, markerRatio } = barWidthRatios;
        const barWidth = barThemeWidth
            ? calculateSizeWithPercentString(tickDistance, barThemeWidth)
            : tickDistance * DEFAULT_WIDTH_RATIO;
        return {
            rangeWidth: barWidth * rangeRatio,
            bulletWidth: barWidth * bulletRatio,
            markerWidth: barWidth * markerRatio,
        };
    }
    getRangeColor(seriesColor, rangeIndex, seriesName, ignoreRestSeriesOpacity = false) {
        const { rangeColors } = this.theme;
        const hasThemeRangeColor = Array.isArray(rangeColors) && rangeColors[rangeIndex];
        const color = hasThemeRangeColor ? rangeColors[rangeIndex] : seriesColor;
        const opacity = hasThemeRangeColor
            ? getAlpha(rangeColors[rangeIndex])
            : DEFAULT_BULLET_RANGE_OPACITY[rangeIndex];
        return getRGBA(color, opacity * this.getSeriesOpacity(seriesName, ignoreRestSeriesOpacity));
    }
    getSeriesOpacity(seriesName, ignoreRestSeriesOpacity = false) {
        const { select, areaOpacity } = this.theme;
        const active = this.activeSeriesMap[seriesName];
        const selected = Object.values(this.activeSeriesMap).some((elem) => !elem);
        const restOpacity = ignoreRestSeriesOpacity ? areaOpacity : select.restSeries.areaOpacity;
        const selectedOpacity = active ? select.areaOpacity : restOpacity;
        return selected ? selectedOpacity : areaOpacity;
    }
    getRespondersWithTheme(responders, type) {
        const { color, borderColor, borderWidth: thickness } = this.theme[type];
        return this.filterBulletResponder(responders).map((model) => {
            return Object.assign(Object.assign({}, model), { color: (color !== null && color !== void 0 ? color : model.tooltipColor), thickness,
                borderColor, style: [
                    Object.assign({}, pick(this.theme[type], 'shadowBlur', 'shadowColor', 'shadowOffsetX', 'shadowOffsetY')),
                ] });
        });
    }
}
