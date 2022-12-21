import BoxSeries, { isLeftBottomSide, SeriesDirection } from "./boxSeries";
import { deepCopyArray, includes, isNumber, hasNegative, calculateSizeWithPercentString, } from "../helpers/utils";
import { getLimitOnAxis } from "../helpers/axes";
import { isGroupStack, isPercentStack } from "../store/stackSeriesData";
import { calibrateBoxStackDrawingValue, sumValuesBeforeIndex } from "../helpers/boxSeries";
import { getDataLabelsOptions } from "../helpers/dataLabels";
import { getRGBA } from "../helpers/color";
import { getActiveSeriesMap } from "../helpers/legend";
import { getBoxTypeSeriesPadding } from "../helpers/style";
import { getDataInRange } from "../helpers/range";
import { message } from "../message";
import { makeLabelsFromLimit } from "../helpers/calculator";
function calibrateDrawingValue(values, seriesIndex, renderOptions) {
    const { stack, min, max } = renderOptions;
    return isPercentStack(stack)
        ? values[seriesIndex]
        : calibrateBoxStackDrawingValue(values, seriesIndex, min, max);
}
function getDivisorForPercent(total, scaleType) {
    const { positive, negative } = total;
    let divisor = positive + Math.abs(negative);
    if (includes(['dualPercentStack', 'divergingPercentStack'], scaleType)) {
        divisor *= 2;
    }
    return divisor;
}
function getDirectionKeys(seriesDirection) {
    let result = ['positive', 'negative'];
    if (seriesDirection === SeriesDirection.POSITIVE) {
        result = ['positive'];
    }
    else if (seriesDirection === SeriesDirection.NEGATIVE) {
        result = ['negative'];
    }
    return result;
}
function getStackSeriesDataInViewRange(stackSeriesData, viewRange) {
    if (!viewRange) {
        return stackSeriesData;
    }
    const stackData = Array.isArray(stackSeriesData.stackData)
        ? getDataInRange(stackSeriesData.stackData, viewRange)
        : Object.assign({}, Object.keys(stackSeriesData.stackData).reduce((acc, name) => (Object.assign(Object.assign({}, acc), { [name]: getDataInRange(stackSeriesData.stackData[name], viewRange) })), {}));
    const data = stackSeriesData.data.map((seriesDatum) => (Object.assign(Object.assign({}, seriesDatum), { data: getDataInRange(seriesDatum.data, viewRange) })));
    return Object.assign(Object.assign({}, stackSeriesData), { data, stackData });
}
export default class BoxStackSeries extends BoxSeries {
    constructor() {
        super(...arguments);
        this.selectSeries = ({ index, seriesIndex, state, }) => {
            if (!isNumber(index) || !isNumber(seriesIndex)) {
                return;
            }
            const { stackSeries } = state;
            const stackSeriesData = stackSeries[this.name];
            const { name } = stackSeriesData.data[seriesIndex];
            const model = this.tooltipRectMap[index].find(({ name: seriesName }) => seriesName === name);
            if (!model) {
                throw new Error(message.SELECT_SERIES_API_INDEX_ERROR);
            }
            this.eventBus.emit('renderSelectedSeries', {
                models: this.getRespondersWithTheme([model], 'select'),
                name: this.name,
                eventDetectType: this.eventDetectType,
            });
            this.eventBus.emit('needDraw');
        };
    }
    initialize({ name, stackChart }) {
        this.initializeFields(name);
        if (stackChart) {
            this.eventBus.on('selectSeries', this.selectSeries);
            this.eventBus.on('showTooltip', this.showTooltip);
            this.eventBus.on('hideTooltip', this.onMouseoutComponent);
        }
    }
    render(chartState, computed) {
        var _a, _b;
        const { layout, series: seriesData, axes, stackSeries, legend, theme, scale } = chartState;
        const { viewRange } = computed;
        this.isShow = !!stackSeries[this.name];
        if (!this.isShow) {
            return;
        }
        const categories = (_a = chartState.categories, (_a !== null && _a !== void 0 ? _a : []));
        const options = this.getOptions(chartState.options);
        this.setEventDetectType(seriesData, options);
        this.theme = theme.series[this.name];
        this.rect = layout.plot;
        this.activeSeriesMap = getActiveSeriesMap(legend);
        this.selectable = this.getSelectableOption(options);
        const stackSeriesData = getStackSeriesDataInViewRange(stackSeries[this.name], viewRange);
        const { tickDistance } = axes[this.labelAxis];
        const diverging = !!((_b = options.series) === null || _b === void 0 ? void 0 : _b.diverging);
        const { limit, stepSize } = this.getScaleData(scale);
        const labels = makeLabelsFromLimit(limit, stepSize);
        const { min, max } = getLimitOnAxis(labels);
        const { stack, scaleType } = stackSeriesData;
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
            stack,
            scaleType,
            tickDistance,
            min,
            max,
            diverging,
            hasNegativeValue: hasNegative(labels),
            seriesDirection: this.getSeriesDirection(labels),
            defaultPadding: getBoxTypeSeriesPadding(tickDistance),
            offsetSize,
            centerYAxis,
        };
        const { series, connector } = this.renderStackSeriesModel(stackSeriesData, renderOptions);
        const clipRect = this.renderClipRectAreaModel();
        const tooltipData = this.getTooltipData(stackSeriesData, categories);
        this.models = {
            clipRect: [clipRect],
            series,
            connector,
        };
        if (!this.drawModels) {
            this.drawModels = {
                clipRect: [this.initClipRect(clipRect)],
                series: deepCopyArray(series),
                connector: deepCopyArray(connector),
            };
        }
        if (getDataLabelsOptions(options, this.name).visible) {
            const dataLabelData = this.getDataLabels(series, renderOptions);
            const stackTotalData = this.getTotalDataLabels(stackSeriesData, renderOptions);
            this.renderDataLabels([...dataLabelData, ...stackTotalData]);
        }
        this.tooltipRectMap = this.makeTooltipRectMap(series, tooltipData);
        this.responders = this.getBoxSeriesResponders(series, tooltipData, axes, categories);
    }
    renderStackSeriesModel(seriesData, renderOptions) {
        const { stackData } = seriesData;
        return isGroupStack(stackData)
            ? this.makeStackGroupSeriesModel(seriesData, renderOptions)
            : this.makeStackSeriesModel(stackData, renderOptions, seriesData.data);
    }
    makeStackSeriesModel(stackData, renderOptions, seriesRawData, stackGroupCount = 1, stackGroupIndex = 0) {
        const seriesModels = [];
        const columnWidth = this.getStackColumnWidth(renderOptions, stackGroupCount);
        const { diverging } = renderOptions;
        const isLBSideWithDiverging = diverging && isLeftBottomSide(stackGroupIndex);
        stackData.forEach(({ values, total }, dataIndex) => {
            const seriesPos = this.getSeriesPosition(renderOptions, columnWidth, dataIndex, stackGroupIndex, stackGroupCount);
            const ratio = this.getStackValueRatio(total, renderOptions);
            values.forEach((value, seriesIndex) => {
                const { barLength, dataPosition } = this.getStackRectInfo(values, seriesIndex, ratio, renderOptions, isLBSideWithDiverging);
                const { name, colorByCategories, color: rawColor } = seriesRawData[seriesIndex];
                const active = this.activeSeriesMap[name];
                const colorLength = rawColor.length || 1;
                const hexColor = colorByCategories ? rawColor[dataIndex % colorLength] : rawColor;
                const color = getRGBA(hexColor, active ? 1 : 0.2);
                seriesModels.push(Object.assign(Object.assign({ type: 'rect', color,
                    name,
                    value }, this.getAdjustedRect(seriesPos, dataPosition, (barLength !== null && barLength !== void 0 ? barLength : 0), columnWidth)), { index: dataIndex }));
            });
        });
        return {
            series: seriesModels,
            connector: this.makeConnectorSeriesModel(stackData, renderOptions, stackGroupCount, stackGroupIndex),
        };
    }
    makeStackGroupSeriesModel(stackSeries, renderOptions) {
        const { stack } = renderOptions;
        const stackGroupData = stackSeries.stackData;
        const seriesRawData = stackSeries.data;
        const stackGroupIds = Object.keys(stackGroupData);
        let seriesModels = [];
        let connectorModels = [];
        stackGroupIds.forEach((groupId, groupIndex) => {
            const filtered = seriesRawData.filter(({ stackGroup }) => stackGroup === groupId);
            const { series, connector } = this.makeStackSeriesModel(stackGroupData[groupId], renderOptions, filtered, stackGroupIds.length, groupIndex);
            seriesModels = [...seriesModels, ...series];
            if (stack.connector) {
                connectorModels = [...connectorModels, ...connector];
            }
        });
        return {
            series: seriesModels,
            connector: connectorModels,
        };
    }
    makeConnectorSeriesModel(stackData, renderOptions, stackGroupCount = 1, stackGroupIndex = 0) {
        const { diverging, stack: { connector }, } = renderOptions;
        if (!connector) {
            return [];
        }
        const columnWidth = this.getStackColumnWidth(renderOptions, stackGroupCount);
        const isLBSideWithDiverging = diverging && isLeftBottomSide(stackGroupIndex);
        const connectorPoints = [];
        stackData.forEach(({ values, total }, index) => {
            const seriesPos = this.getSeriesPosition(renderOptions, columnWidth, index, stackGroupIndex, stackGroupCount);
            const points = [];
            const ratio = this.getStackValueRatio(total, renderOptions);
            values.forEach((value, seriesIndex) => {
                const { barLength, dataPosition } = this.getStackRectInfo(values, seriesIndex, ratio, renderOptions, isLBSideWithDiverging);
                const { x, y } = this.getAdjustedRect(seriesPos, dataPosition, barLength, columnWidth);
                const xPos = !isLBSideWithDiverging && this.isBar ? x + barLength : x;
                const yPos = isLBSideWithDiverging && !this.isBar ? y + barLength : y;
                points.push({ x: xPos, y: yPos });
            });
            connectorPoints.push(points);
        });
        return this.makeConnectorModel(connectorPoints, connector, columnWidth);
    }
    getTooltipData(seriesData, categories) {
        const seriesRawData = seriesData.data;
        const { stackData } = seriesData;
        const colors = seriesRawData.map(({ color }) => color);
        return isGroupStack(stackData)
            ? this.makeGroupStackTooltipData(seriesRawData, stackData, categories)
            : this.makeStackTooltipData(seriesRawData, stackData, colors, categories);
    }
    makeGroupStackTooltipData(seriesRawData, stackData, categories) {
        return Object.keys(stackData).flatMap((groupId) => {
            const rawDataWithSameGroupId = seriesRawData.filter(({ stackGroup }) => stackGroup === groupId);
            const colors = rawDataWithSameGroupId.map(({ color }) => color);
            return this.makeStackTooltipData(rawDataWithSameGroupId, stackData[groupId], colors, categories);
        });
    }
    makeStackTooltipData(seriesRawData, stackData, colors, categories) {
        const tooltipData = [];
        stackData.forEach(({ values }, dataIndex) => {
            values.forEach((value, seriesIndex) => {
                tooltipData.push({
                    label: seriesRawData[seriesIndex].name,
                    color: colors[seriesIndex],
                    value,
                    category: categories.length ? categories[dataIndex] : '',
                });
            });
        });
        return tooltipData;
    }
    makeConnectorModel(pointsForConnector, connector, columnWidth) {
        if (!connector || !pointsForConnector.length) {
            return [];
        }
        const { color, lineWidth, dashSegments } = this.theme.connector;
        const connectorModels = [];
        const seriesDataCount = pointsForConnector.length;
        const seriesCount = pointsForConnector[0].length;
        for (let seriesIndex = 0; seriesIndex < seriesCount; seriesIndex += 1) {
            const points = [];
            for (let dataIndex = 0; dataIndex < seriesDataCount; dataIndex += 1) {
                points.push(pointsForConnector[dataIndex][seriesIndex]);
            }
            points.forEach((point, index) => {
                const { x, y } = point;
                if (index < points.length - 1) {
                    const { x: nextX, y: nextY } = points[index + 1];
                    connectorModels.push({
                        type: 'line',
                        x: this.isBar ? x : x + columnWidth,
                        y: this.isBar ? y + columnWidth : y,
                        x2: nextX,
                        y2: nextY,
                        dashSegments,
                        strokeStyle: color,
                        lineWidth,
                    });
                }
            });
        }
        return connectorModels;
    }
    getStackValueRatio(total, renderOptions) {
        const { stack: { type: stackType }, scaleType, min, max, offsetSize, } = renderOptions;
        if (stackType === 'percent') {
            return offsetSize / getDivisorForPercent(total, scaleType);
        }
        return this.getValueRatio(min, max, offsetSize);
    }
    getStackBarLength(values, seriesIndex, ratio, renderOptions) {
        const value = calibrateDrawingValue(values, seriesIndex, renderOptions);
        return isNumber(value) ? this.getBarLength(value, ratio) : null;
    }
    getStackColumnWidth(renderOptions, stackGroupCount) {
        const { tickDistance, diverging, defaultPadding } = renderOptions;
        const divisor = diverging ? 1 : stackGroupCount;
        const themeBarWidth = this.theme.barWidth;
        return themeBarWidth
            ? calculateSizeWithPercentString(tickDistance, themeBarWidth)
            : (tickDistance - defaultPadding * 2) / divisor;
    }
    getSeriesPosition(renderOptions, columnWidth, dataIndex, stackGroupIndex, stackGroupCount) {
        const { tickDistance, diverging } = renderOptions;
        const groupIndex = diverging ? 0 : stackGroupIndex;
        const groupCount = diverging ? 1 : stackGroupCount;
        const padding = (tickDistance - columnWidth * groupCount) / 2;
        return dataIndex * tickDistance + padding + columnWidth * groupIndex;
    }
    getStackStartPosition(values, currentIndex, ratio, renderOptions, isLBSideWithDiverging) {
        const { stack, diverging, seriesDirection } = renderOptions;
        let startPos;
        if (diverging) {
            startPos = isLBSideWithDiverging
                ? this.calcStartPosOnLeftBottomSide(values, currentIndex, renderOptions, ratio)
                : this.calcStartPosOnRightTopSide(values, currentIndex, renderOptions, ratio);
        }
        else if (isPercentStack(stack)) {
            startPos = this.calcStartPositionWithPercent(values, currentIndex, ratio);
        }
        else if (seriesDirection === SeriesDirection.POSITIVE) {
            startPos = this.calcStartPosOnRightTopSide(values, currentIndex, renderOptions, ratio);
        }
        else if (seriesDirection === SeriesDirection.NEGATIVE) {
            startPos = this.calcStartPosOnLeftBottomSide(values, currentIndex, renderOptions, ratio);
        }
        else {
            startPos = this.calcStartPositionWithStack(values, currentIndex, renderOptions, ratio);
        }
        return startPos;
    }
    calcStartPosOnLeftBottomSide(values, currentIndex, renderOptions, ratio) {
        const { min, max, diverging } = renderOptions;
        const basePosition = diverging ? this.leftBasePosition : this.basePosition;
        const totalOfIndexBefore = sumValuesBeforeIndex(values, currentIndex, false);
        const totalOfValues = sumValuesBeforeIndex(values, currentIndex, true);
        const collideEdge = totalOfValues < min;
        const usingValue = this.isBar ? totalOfValues : totalOfIndexBefore;
        const result = max < 0 ? Math.min(usingValue - max, 0) : usingValue;
        let pos;
        if (this.isBar) {
            pos = collideEdge ? 0 : basePosition - Math.abs(result) * ratio;
        }
        else {
            pos = basePosition + Math.abs(result) * ratio;
        }
        return pos;
    }
    calcStartPosOnRightTopSide(values, currentIndex, renderOptions, ratio) {
        const { min, max, diverging } = renderOptions;
        const basePosition = diverging ? this.rightBasePosition : this.basePosition;
        const totalOfIndexBefore = sumValuesBeforeIndex(values, currentIndex, false);
        const totalOfValues = sumValuesBeforeIndex(values, currentIndex, true);
        const collideEdge = totalOfValues > max;
        const usingValue = this.isBar ? totalOfIndexBefore : totalOfValues;
        const result = min > 0 ? Math.max(usingValue - min, 0) : usingValue;
        const barLength = result * ratio;
        let pos;
        if (this.isBar) {
            pos = basePosition + barLength;
        }
        else {
            pos = collideEdge ? 0 : basePosition - barLength;
        }
        return pos;
    }
    calcStartPositionWithStack(values, currentIndex, renderOptions, ratio) {
        return values[currentIndex] < 0
            ? this.calcStartPosOnLeftBottomSide(values, currentIndex, renderOptions, ratio)
            : this.calcStartPosOnRightTopSide(values, currentIndex, renderOptions, ratio);
    }
    calcStartPositionWithPercent(values, currentIndex, ratio) {
        const basePosition = this.basePosition;
        const totalPrevValues = sumValuesBeforeIndex(values, currentIndex, this.isBar ? values[currentIndex] < 0 : values[currentIndex] > 0);
        return this.isBar
            ? totalPrevValues * ratio + basePosition
            : basePosition - totalPrevValues * ratio;
    }
    getStackRectInfo(values, seriesIndex, ratio, renderOptions, isLBSideWithDiverging) {
        const barLength = this.getStackBarLength(values, seriesIndex, ratio, renderOptions);
        const dataPosition = this.getStackStartPosition(values, seriesIndex, ratio, renderOptions, isLBSideWithDiverging);
        return {
            barLength,
            dataPosition,
        };
    }
    getDataLabels(seriesModels, renderOptions) {
        return seriesModels.map((data) => this.makeDataLabel(data, renderOptions.centerYAxis));
    }
    getTotalDataLabels(seriesData, renderOptions) {
        const { stackData, stack } = seriesData;
        if (isPercentStack(stack)) {
            return [];
        }
        return isGroupStack(stackData)
            ? this.makeGroupTotalDataLabels(seriesData, renderOptions)
            : this.makeTotalDataLabels(stackData, renderOptions);
    }
    makeGroupTotalDataLabels(stackSeries, renderOptions) {
        let dataLabels = [];
        const stackGroupData = stackSeries.stackData;
        const stackGroupIds = Object.keys(stackGroupData);
        stackGroupIds.forEach((groupId, groupIndex) => {
            const totalDataLabels = this.makeTotalDataLabels(stackGroupData[groupId], renderOptions, stackGroupIds.length, groupIndex);
            dataLabels = [...dataLabels, ...totalDataLabels];
        });
        return dataLabels;
    }
    makeTotalDataLabels(stackData, renderOptions, stackGroupCount = 1, stackGroupIndex = 0) {
        const dataLabels = [];
        const { min, max, seriesDirection, diverging, centerYAxis } = renderOptions;
        const columnWidth = this.getStackColumnWidth(renderOptions, stackGroupCount);
        stackData.forEach((data, dataIndex) => {
            const { total } = data;
            const seriesPos = this.getSeriesPosition(renderOptions, columnWidth, dataIndex, stackGroupIndex, stackGroupCount);
            const ratio = this.getStackValueRatio(total, renderOptions);
            const directionKeys = getDirectionKeys(seriesDirection);
            directionKeys.forEach((key) => {
                const value = total[key];
                if (!value) {
                    return;
                }
                const barLength = this.makeBarLength(value, {
                    min,
                    max,
                    ratio,
                });
                const dataPosition = this.getStartPosition(barLength, value, renderOptions, diverging && isLeftBottomSide(stackGroupIndex));
                const stackTotal = Object.assign({ type: 'stackTotal', value, name: `totalLabel-${key}`, theme: this.theme.dataLabels.stackTotal }, this.getAdjustedRect(seriesPos, dataPosition, barLength, columnWidth));
                dataLabels.push(this.makeTotalDataLabel(stackTotal, centerYAxis));
            });
        });
        return dataLabels;
    }
    makeTotalDataLabel(totalLabel, centerYAxis) {
        return Object.assign(Object.assign({}, totalLabel), { direction: this.getDataLabelDirection(totalLabel, centerYAxis), plot: {
                x: 0,
                y: 0,
                size: this.getOffsetSize(),
            } });
    }
    onMousemoveGroupedType(responders) {
        const rectModels = this.getRectModelsFromRectResponders(responders);
        this.eventBus.emit('renderHoveredSeries', {
            models: [...rectModels, ...this.getGroupedRect(responders, 'hover')],
            name: this.name,
            eventDetectType: this.eventDetectType,
        });
        this.activatedResponders = rectModels;
    }
}
