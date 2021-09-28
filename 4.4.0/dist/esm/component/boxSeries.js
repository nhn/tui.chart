import Component from "./component";
import { first, hasNegative, deepCopyArray, last, hasNegativeOnly, hasPositiveOnly, isNull, isNumber, calculateSizeWithPercentString, omit, } from "../helpers/utils";
import { makeTickPixelPositions, makeLabelsFromLimit } from "../helpers/calculator";
import { getRGBA, getAlpha } from "../helpers/color";
import { getDataInRange, isRangeData, isRangeValue } from "../helpers/range";
import { getLimitOnAxis, getValueAxisName } from "../helpers/axes";
import { calibrateDrawingValue } from "../helpers/boxSeries";
import { getDataLabelsOptions } from "../helpers/dataLabels";
import { getActiveSeriesMap } from "../helpers/legend";
import { getBoxTypeSeriesPadding } from "../helpers/style";
import { makeRectResponderModel } from "../helpers/responders";
import { message } from "../message";
import { isAvailableSelectSeries, isAvailableShowTooltipInfo } from "../helpers/validation";
export var SeriesDirection;
(function (SeriesDirection) {
    SeriesDirection[SeriesDirection["POSITIVE"] = 0] = "POSITIVE";
    SeriesDirection[SeriesDirection["NEGATIVE"] = 1] = "NEGATIVE";
    SeriesDirection[SeriesDirection["BOTH"] = 2] = "BOTH";
})(SeriesDirection || (SeriesDirection = {}));
const BOX = {
    BAR: 'bar',
    COLUMN: 'column',
};
export function isLeftBottomSide(seriesIndex) {
    return !!(seriesIndex % 2);
}
function calculateBarLength(value, min, max) {
    if (isRangeValue(value)) {
        let [start, end] = value;
        if (start < min) {
            start = min;
        }
        if (end > max) {
            end = max;
        }
        return end - start;
    }
    return calibrateDrawingValue(value, min, max);
}
export default class BoxSeries extends Component {
    constructor() {
        super(...arguments);
        this.models = { series: [] };
        this.activatedResponders = [];
        this.isBar = true;
        this.valueAxis = 'xAxis';
        this.labelAxis = 'yAxis';
        this.anchorSizeKey = 'height';
        this.offsetSizeKey = 'width';
        this.basePosition = 0;
        this.leftBasePosition = 0;
        this.rightBasePosition = 0;
        this.isRangeData = false;
        this.offsetKey = 'x';
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
        this.selectSeries = (info) => {
            const { index, seriesIndex } = info;
            if (!isAvailableSelectSeries(info, 'column')) {
                return;
            }
            const model = this.tooltipRectMap[seriesIndex][index];
            if (!model) {
                throw new Error(message.SELECT_SERIES_API_INDEX_ERROR);
            }
            this.eventBus.emit('renderSelectedSeries', {
                models: this.getRespondersWithTheme([model], 'select'),
                name: this.name,
            });
            this.eventBus.emit('needDraw');
        };
        this.showTooltip = (info) => {
            const { index, seriesIndex } = info;
            if (!isAvailableShowTooltipInfo(info, this.eventDetectType, 'column')) {
                return;
            }
            const models = this.eventDetectType === 'grouped'
                ? this.getGroupedRect([this.responders[index]], 'hover')
                : this.getRespondersWithTheme([this.tooltipRectMap[index][seriesIndex]], 'hover');
            if (!models.length) {
                return;
            }
            this.eventBus.emit('renderHoveredSeries', {
                models,
                name: this.name,
                eventDetectType: this.eventDetectType,
            });
            this.activatedResponders =
                this.eventDetectType === 'grouped' ? this.tooltipRectMap[index] : models;
            this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
            this.eventBus.emit('needDraw');
        };
    }
    initialize({ name, stackChart }) {
        this.initializeFields(name);
        if (!stackChart) {
            this.eventBus.on('selectSeries', this.selectSeries);
            this.eventBus.on('showTooltip', this.showTooltip);
            this.eventBus.on('hideTooltip', this.onMouseoutComponent);
        }
    }
    initializeFields(name) {
        this.type = 'series';
        this.name = name;
        this.isBar = name === BOX.BAR;
        this.offsetKey = this.isBar ? 'x' : 'y';
        this.valueAxis = this.isBar ? 'xAxis' : 'yAxis';
        this.labelAxis = this.isBar ? 'yAxis' : 'xAxis';
        this.anchorSizeKey = this.isBar ? 'height' : 'width';
        this.offsetSizeKey = this.isBar ? 'width' : 'height';
    }
    initUpdate(delta) {
        if (!this.drawModels) {
            return;
        }
        if (this.isRangeData) {
            this.initUpdateRangeData(delta);
            return;
        }
        this.initUpdateClipRect(delta);
        this.initUpdateConnector(delta);
    }
    initUpdateRangeData(delta) {
        const { series } = this.drawModels;
        this.drawModels.clipRect = this.models.clipRect;
        const target = this.models.series;
        series.forEach((current, index) => {
            const targetModel = target[index];
            if (delta === 0) {
                current[this.offsetSizeKey] = 0;
            }
            const offsetSize = current[this.offsetSizeKey] +
                (targetModel[this.offsetSizeKey] - current[this.offsetSizeKey]) * delta;
            current[this.offsetSizeKey] = offsetSize;
            if (!this.isBar) {
                current[this.offsetKey] =
                    targetModel[this.offsetKey] + targetModel[this.offsetSizeKey] - offsetSize;
            }
        });
    }
    initUpdateClipRect(delta) {
        const { clipRect } = this.drawModels;
        if (!clipRect) {
            return;
        }
        const current = clipRect[0];
        const key = this.offsetSizeKey;
        const target = this.models.clipRect[0];
        const offsetSize = current[key] + (target[key] - current[key]) * delta;
        current[key] = offsetSize;
        current[this.offsetKey] = Math.max(this.basePosition - (offsetSize * this.basePosition) / target[key], 0);
    }
    initUpdateConnector(delta) {
        const { connector } = this.drawModels;
        if (!connector) {
            return;
        }
        const target = this.models.connector;
        connector.forEach((current, index) => {
            const alpha = getAlpha(target[index].strokeStyle) * delta;
            current.strokeStyle = getRGBA(current.strokeStyle, alpha);
        });
    }
    setEventDetectType(series, options) {
        var _a, _b;
        if (series.line) {
            this.eventDetectType = 'grouped';
        }
        if ((_b = (_a = options) === null || _a === void 0 ? void 0 : _a.series) === null || _b === void 0 ? void 0 : _b.eventDetectType) {
            this.eventDetectType = options.series.eventDetectType;
        }
    }
    getOptions(chartOptions) {
        var _a;
        const options = Object.assign({}, chartOptions);
        if (((_a = options) === null || _a === void 0 ? void 0 : _a.series) && options.series.column) {
            options.series = Object.assign(Object.assign({}, options.series), options.series.column);
        }
        return options;
    }
    render(chartState, computed) {
        var _a, _b;
        const { layout, series, axes, stackSeries, legend, theme, scale } = chartState;
        this.isShow = !(stackSeries && stackSeries[this.name]);
        if (!this.isShow) {
            return;
        }
        const categories = (_a = chartState.categories, (_a !== null && _a !== void 0 ? _a : []));
        const options = this.getOptions(chartState.options);
        this.setEventDetectType(series, options);
        this.theme = theme.series[this.name];
        this.rect = layout.plot;
        this.activeSeriesMap = getActiveSeriesMap(legend);
        this.selectable = this.getSelectableOption(options);
        this.valueAxis = getValueAxisName(options, this.name, this.isBar ? 'xAxis' : 'yAxis');
        const seriesData = series[this.name].data.map((seriesDatum) => (Object.assign(Object.assign({}, seriesDatum), { data: getDataInRange(seriesDatum.data, computed.viewRange) })));
        if (axes.centerYAxis) {
            this.valueAxis = 'centerYAxis';
        }
        const { tickDistance } = axes[this.labelAxis];
        const diverging = !!((_b = options.series) === null || _b === void 0 ? void 0 : _b.diverging);
        const { limit, stepSize } = this.getScaleData(scale);
        const labels = makeLabelsFromLimit(limit, stepSize);
        const { min, max } = getLimitOnAxis(labels);
        this.basePosition = this.getBasePosition(axes[this.valueAxis]);
        let offsetSize = this.getOffsetSize();
        const { centerYAxis } = axes;
        if (diverging) {
            const [left, right] = this.getDivergingBasePosition(centerYAxis);
            this.basePosition = this.getOffsetSize() / 2;
            this.leftBasePosition = left;
            this.rightBasePosition = right;
            offsetSize = this.getOffsetSizeWithDiverging(centerYAxis);
        }
        const renderOptions = {
            min,
            max,
            tickDistance,
            diverging,
            ratio: this.getValueRatio(min, max, offsetSize),
            hasNegativeValue: hasNegative(labels),
            seriesDirection: this.getSeriesDirection(labels),
            defaultPadding: getBoxTypeSeriesPadding(tickDistance),
        };
        const seriesModels = this.renderSeriesModel(seriesData, renderOptions);
        const tooltipData = this.makeTooltipData(seriesData, renderOptions, categories);
        const clipRect = this.renderClipRectAreaModel();
        this.models = {
            clipRect: [clipRect],
            series: seriesModels,
        };
        if (!this.drawModels) {
            this.drawModels = {
                clipRect: [this.initClipRect(clipRect)],
                series: deepCopyArray(seriesModels),
            };
        }
        if (getDataLabelsOptions(options, this.name).visible) {
            const dataLabelData = seriesModels.reduce((acc, data) => {
                return isRangeValue(data.value)
                    ? [...acc, ...this.makeDataLabelRangeData(data)]
                    : [...acc, this.makeDataLabel(data, centerYAxis)];
            }, []);
            this.renderDataLabels(dataLabelData);
        }
        this.tooltipRectMap = this.makeTooltipRectMap(seriesModels, tooltipData);
        this.responders = this.getBoxSeriesResponders(seriesModels, tooltipData, axes, categories);
    }
    getScaleData(scale) {
        return scale[this.valueAxis === 'centerYAxis' ? 'xAxis' : this.valueAxis];
    }
    getBoxSeriesResponders(seriesModels, tooltipData, axes, categories) {
        const hoveredSeries = this.renderHoveredSeriesModel(seriesModels);
        return this.eventDetectType === 'grouped'
            ? makeRectResponderModel(this.rect, (this.isBar ? axes.yAxis : axes.xAxis), categories, !this.isBar)
            : hoveredSeries.map((m, index) => (Object.assign(Object.assign({}, m), { data: tooltipData[index] })));
    }
    makeTooltipRectMap(seriesModels, tooltipDataArr) {
        return seriesModels.reduce((acc, cur, dataIndex) => {
            const index = cur.index;
            const tooltipModel = Object.assign(Object.assign({}, cur), { data: tooltipDataArr[dataIndex] });
            if (!acc[index]) {
                acc[index] = [];
            }
            acc[index].push(tooltipModel);
            return acc;
        }, []);
    }
    renderClipRectAreaModel() {
        return {
            type: 'clipRectArea',
            x: 0,
            y: 0,
            width: this.rect.width,
            height: this.rect.height,
        };
    }
    initClipRect(clipRect) {
        return {
            type: 'clipRectArea',
            width: this.isBar ? 0 : clipRect.width,
            height: this.isBar ? clipRect.height : 0,
            x: this.isBar ? 0 : clipRect.x,
            y: this.isBar ? clipRect.y : 0,
        };
    }
    renderSeriesModel(seriesData, renderOptions) {
        const { tickDistance, diverging } = renderOptions;
        const seriesLength = seriesData.length;
        const validDiverging = diverging && seriesData.length === 2;
        const columnWidth = this.getColumnWidth(renderOptions, seriesLength, validDiverging);
        const seriesModels = [];
        const padding = (tickDistance - columnWidth * (validDiverging ? 1 : seriesLength)) / 2;
        seriesData.forEach(({ data, color: seriesColor, name, colorByCategories }, seriesIndex) => {
            const seriesPos = (diverging ? 0 : seriesIndex) * columnWidth + padding;
            const isLBSideWithDiverging = diverging && isLeftBottomSide(seriesIndex);
            const colorLength = colorByCategories ? seriesColor.length : 1;
            this.isRangeData = isRangeData(data);
            data.forEach((value, index) => {
                const dataStart = seriesPos + index * tickDistance;
                const barLength = this.makeBarLength(value, renderOptions);
                const color = this.getSeriesColor(name, colorByCategories ? seriesColor[index % colorLength] : seriesColor);
                if (isNumber(barLength)) {
                    const startPosition = this.getStartPosition(barLength, value, renderOptions, isLBSideWithDiverging);
                    seriesModels.push(Object.assign(Object.assign({ type: 'rect', color,
                        value }, this.getAdjustedRect(dataStart, startPosition, barLength, columnWidth)), { name,
                        index }));
                }
            });
        });
        return seriesModels;
    }
    renderHoveredSeriesModel(seriesModel) {
        return seriesModel.map((data) => {
            return this.makeHoveredSeriesModel(data);
        });
    }
    makeHoveredSeriesModel(data) {
        const { x, y, width, height, color, index } = data;
        return {
            type: 'rect',
            color: getRGBA(color, 1),
            x,
            y,
            width,
            height,
            index,
        };
    }
    getRectModelsFromRectResponders(responders) {
        var _a;
        if (!responders.length) {
            return [];
        }
        return _a = this.tooltipRectMap[responders[0].index], (_a !== null && _a !== void 0 ? _a : []);
    }
    getGroupedRect(responders, type) {
        const rectModels = this.getRectModelsFromRectResponders(responders);
        const { color, opacity } = this.theme[type].groupedRect;
        return rectModels.length
            ? responders.map((m) => (Object.assign(Object.assign({}, m), { color: getRGBA(color, opacity) })))
            : [];
    }
    onMousemoveGroupedType(responders) {
        const rectModels = this.getRectModelsFromRectResponders(responders);
        this.eventBus.emit('renderHoveredSeries', {
            models: this.getGroupedRect(responders, 'hover'),
            name: this.name,
            eventDetectType: this.eventDetectType,
        });
        this.activatedResponders = rectModels;
    }
    onMousemove({ responders }) {
        if (this.eventDetectType === 'grouped') {
            this.onMousemoveGroupedType(responders);
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
    makeTooltipData(seriesData, renderOptions, categories) {
        const tooltipData = [];
        seriesData.forEach(({ data, name, color, colorByCategories }) => {
            data.forEach((value, dataIndex) => {
                if (!isNull(value)) {
                    const barLength = this.makeBarLength(value, renderOptions);
                    if (isNumber(barLength)) {
                        tooltipData.push({
                            label: name,
                            color: colorByCategories ? color[dataIndex] : color,
                            value: this.getTooltipValue(value),
                            category: categories.length ? categories[dataIndex] : '',
                        });
                    }
                }
            });
        });
        return tooltipData;
    }
    getTooltipValue(value) {
        return isRangeValue(value) ? `${value[0]} ~ ${value[1]}` : value;
    }
    getBasePosition({ labels, tickCount, zeroPosition }) {
        const valueLabels = this.isBar ? labels : [...labels].reverse();
        const tickPositions = makeTickPixelPositions(this.getOffsetSize(), tickCount);
        const seriesDirection = this.getSeriesDirection(valueLabels);
        return zeroPosition
            ? zeroPosition
            : this.getTickPositionIfNotZero(tickPositions, seriesDirection);
    }
    getDivergingBasePosition(centerYAxis) {
        let leftZeroPosition, rightZeroPosition;
        if (centerYAxis) {
            leftZeroPosition = centerYAxis.xAxisHalfSize;
            rightZeroPosition = centerYAxis.secondStartX;
        }
        else {
            const divergingZeroPosition = this.getOffsetSize() / 2;
            leftZeroPosition = rightZeroPosition = divergingZeroPosition;
        }
        return [leftZeroPosition, rightZeroPosition];
    }
    getOffsetSize() {
        return this.rect[this.offsetSizeKey];
    }
    getValueRatio(min, max, size) {
        return size / (max - min);
    }
    makeBarLength(value, renderOptions) {
        if (isNull(value)) {
            return null;
        }
        const { min, max, ratio } = renderOptions;
        const calculatedValue = calculateBarLength(value, min, max);
        return Math.max(this.getBarLength(calculatedValue, ratio), 2);
    }
    getBarLength(value, ratio) {
        return value < 0 ? Math.abs(value) * ratio : value * ratio;
    }
    getStartPositionWithRangeValue(value, barLength, renderOptions) {
        const { min, ratio } = renderOptions;
        let [start] = value;
        if (start < min) {
            start = min;
        }
        const startPosition = (start - min) * ratio;
        return this.isBar ? startPosition : this.getOffsetSize() - startPosition - barLength;
    }
    getStartPosition(barLength, value, renderOptions, isLBSideWithDiverging) {
        const { diverging, seriesDirection } = renderOptions;
        let startPos;
        if (isRangeValue(value)) {
            startPos = this.getStartPositionWithRangeValue(value, barLength, renderOptions);
        }
        else if (diverging) {
            startPos = isLBSideWithDiverging
                ? this.getStartPosOnLeftBottomSide(barLength, diverging)
                : this.getStartPosOnRightTopSide(barLength, diverging);
        }
        else if (seriesDirection === SeriesDirection.POSITIVE) {
            startPos = this.getStartPosOnRightTopSide(barLength);
        }
        else if (seriesDirection === SeriesDirection.NEGATIVE) {
            startPos = this.getStartPosOnLeftBottomSide(barLength);
        }
        else {
            startPos =
                value < 0
                    ? this.getStartPosOnLeftBottomSide(barLength)
                    : this.getStartPosOnRightTopSide(barLength);
        }
        return startPos;
    }
    getStartPosOnRightTopSide(barLength, diverging = false) {
        let pos;
        if (diverging) {
            pos = this.isBar ? this.rightBasePosition : this.rightBasePosition - barLength;
        }
        else {
            pos = this.isBar ? this.basePosition : this.basePosition - barLength;
        }
        return pos;
    }
    getStartPosOnLeftBottomSide(barLength, diverging = false) {
        let pos;
        if (diverging) {
            pos = this.isBar ? this.leftBasePosition - barLength : this.leftBasePosition;
        }
        else {
            pos = this.isBar ? this.basePosition - barLength : this.basePosition;
        }
        return pos;
    }
    getAdjustedRect(seriesPosition, dataPosition, barLength, columnWidth) {
        return {
            x: this.isBar ? dataPosition : seriesPosition,
            y: this.isBar ? seriesPosition : dataPosition,
            width: this.isBar ? barLength : columnWidth,
            height: this.isBar ? columnWidth : barLength,
        };
    }
    getColumnWidth(renderOptions, seriesLength, validDiverging = false) {
        const { tickDistance, defaultPadding } = renderOptions;
        seriesLength = validDiverging ? 1 : seriesLength;
        const themeBarWidth = this.theme.barWidth;
        return themeBarWidth
            ? calculateSizeWithPercentString(tickDistance, themeBarWidth)
            : (tickDistance - defaultPadding * 2) / seriesLength;
    }
    getSeriesDirection(labels) {
        let result = SeriesDirection.BOTH;
        if (hasPositiveOnly(labels)) {
            result = SeriesDirection.POSITIVE;
        }
        else if (hasNegativeOnly(labels)) {
            result = SeriesDirection.NEGATIVE;
        }
        return result;
    }
    getTickPositionIfNotZero(tickPositions, direction) {
        if (!tickPositions.length) {
            return 0;
        }
        const firstTickPosition = Number(first(tickPositions));
        const lastTickPosition = Number(last(tickPositions));
        if (direction === SeriesDirection.POSITIVE) {
            return this.isBar ? firstTickPosition : lastTickPosition;
        }
        if (direction === SeriesDirection.NEGATIVE) {
            return this.isBar ? lastTickPosition : firstTickPosition;
        }
        return 0;
    }
    makeDataLabel(rect, centerYAxis) {
        const { dataLabels } = this.theme;
        return Object.assign(Object.assign({}, rect), { direction: this.getDataLabelDirection(rect, centerYAxis), plot: { x: 0, y: 0, size: this.getOffsetSize() }, theme: Object.assign(Object.assign({}, omit(dataLabels, 'stackTotal')), { color: dataLabels.useSeriesColor ? rect.color : dataLabels.color }) });
    }
    makeDataLabelRangeData(rect) {
        const { dataLabels } = this.theme;
        return rect.value.reduce((acc, value, index) => [
            ...acc,
            Object.assign(Object.assign({}, rect), { value, direction: this.getDataLabelRangeDataDirection(index % 2 === 0), plot: { x: 0, y: 0, size: this.getOffsetSize() }, theme: Object.assign(Object.assign({}, omit(dataLabels, 'stackTotal')), { color: dataLabels.useSeriesColor ? rect.color : dataLabels.color }) }),
        ], []);
    }
    getDataLabelRangeDataDirection(isEven) {
        let direction;
        if (this.isBar) {
            direction = isEven ? 'left' : 'right';
        }
        else {
            direction = isEven ? 'bottom' : 'top';
        }
        return direction;
    }
    getDataLabelDirection(rect, centerYAxis) {
        let direction;
        if (this.isBar) {
            const basePos = centerYAxis ? this.leftBasePosition : this.basePosition;
            direction = rect.x < basePos ? 'left' : 'right';
        }
        else {
            direction = rect.y >= this.basePosition ? 'bottom' : 'top';
        }
        return direction;
    }
    getOffsetSizeWithDiverging(centerYAxis) {
        return centerYAxis ? centerYAxis.xAxisHalfSize : this.getOffsetSize() / 2;
    }
    onClick({ responders }) {
        if (this.selectable) {
            let models;
            if (this.eventDetectType === 'grouped') {
                models = [
                    ...this.getGroupedRect(responders, 'select'),
                    ...this.getRectModelsFromRectResponders(responders),
                ];
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
    getRespondersWithTheme(responders, type) {
        const { color, borderColor, borderWidth, shadowBlur, shadowColor, shadowOffsetX, shadowOffsetY, } = this.theme[type];
        return responders.map((model) => (Object.assign(Object.assign({}, model), { color: (color !== null && color !== void 0 ? color : model.color), thickness: borderWidth, borderColor, style: [
                {
                    shadowBlur,
                    shadowColor,
                    shadowOffsetX,
                    shadowOffsetY,
                },
            ] })));
    }
    getSeriesColor(name, color) {
        const { select, areaOpacity } = this.theme;
        const active = this.activeSeriesMap[name];
        const selected = Object.values(this.activeSeriesMap).some((elem) => !elem);
        return selected
            ? getRGBA(color, active ? select.areaOpacity : select.restSeries.areaOpacity)
            : getRGBA(color, areaOpacity);
    }
}
