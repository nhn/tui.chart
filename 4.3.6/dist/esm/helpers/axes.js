import { AxisType } from "../component/axis";
import { divisors, makeTickPixelPositions, getTextHeight, getTextWidth, } from "./calculator";
import { range, isString, isUndefined, isNumber, calculateSizeWithPercentString, includes, } from "./utils";
import { ANGLE_CANDIDATES, calculateRotatedWidth, calculateRotatedHeight, } from "./geometric";
import { getDateFormat, formatDate } from "./formatDate";
import { calculateDegreeToRadian, DEGREE_360, DEGREE_0, initSectorOptions, getDefaultRadius, } from "./sector";
import { DEFAULT_LABEL_TEXT } from "../brushes/label";
import { getSemiCircleCenterY, getTotalAngle, isSemiCircle } from "./pieSeries";
import { RadialAxisType } from "../store/radialAxes";
function makeAdjustingIntervalInfo(blockCount, axisWidth, blockSize) {
    let remainBlockCount;
    let newBlockCount = Math.floor(axisWidth / blockSize);
    let intervalInfo = null;
    const interval = newBlockCount ? Math.floor(blockCount / newBlockCount) : blockCount;
    if (interval > 1) {
        // remainBlockCount : remaining block count after filling new blocks
        // | | | | | | | | | | | |  - previous block interval
        // |     |     |     |      - new block interval
        //                   |*|*|  - remaining block
        remainBlockCount = blockCount - interval * newBlockCount;
        if (remainBlockCount >= interval) {
            newBlockCount += Math.floor(remainBlockCount / interval);
            remainBlockCount = remainBlockCount % interval;
        }
        intervalInfo = {
            blockCount: newBlockCount,
            remainBlockCount,
            interval,
        };
    }
    return intervalInfo;
}
export function getAutoAdjustingInterval(count, axisWidth, categories) {
    var _a;
    const autoInterval = {
        MIN_WIDTH: 90,
        MAX_WIDTH: 121,
        STEP_SIZE: 5,
    };
    const LABEL_MARGIN = 5;
    if ((_a = categories) === null || _a === void 0 ? void 0 : _a[0]) {
        const categoryMinWidth = getTextWidth(categories[0]);
        if (categoryMinWidth < axisWidth / count - LABEL_MARGIN) {
            return 1;
        }
    }
    let candidates = [];
    divisors(count).forEach((interval) => {
        const intervalWidth = (interval / count) * axisWidth;
        if (intervalWidth >= autoInterval.MIN_WIDTH && intervalWidth <= autoInterval.MAX_WIDTH) {
            candidates.push({ interval, blockCount: Math.floor(count / interval), remainBlockCount: 0 });
        }
    });
    if (!candidates.length) {
        const blockSizeRange = range(autoInterval.MIN_WIDTH, autoInterval.MAX_WIDTH, autoInterval.STEP_SIZE);
        candidates = blockSizeRange.reduce((acc, blockSize) => {
            const candidate = makeAdjustingIntervalInfo(count, axisWidth, blockSize);
            return candidate ? [...acc, candidate] : acc;
        }, []);
    }
    let tickInterval = 1;
    if (candidates.length) {
        const candidate = candidates.reduce((acc, cur) => (cur.blockCount > acc.blockCount ? cur : acc), { blockCount: 0, interval: 1 });
        tickInterval = candidate.interval;
    }
    return tickInterval;
}
export function isLabelAxisOnYAxis({ series, options, categories, }) {
    var _a, _b;
    return (!!series.bar ||
        !!series.radialBar ||
        (!!series.gauge && Array.isArray(categories) && !categories.length) ||
        (!!series.bullet && !((_b = (_a = options) === null || _a === void 0 ? void 0 : _a.series) === null || _b === void 0 ? void 0 : _b.vertical)));
}
export function hasBoxTypeSeries(series) {
    return !!series.column || !!series.bar || !!series.boxPlot || !!series.bullet;
}
export function isPointOnColumn(series, options) {
    var _a;
    if (hasBoxTypeSeries(series)) {
        return true;
    }
    if (series.line || series.area) {
        return Boolean((_a = options.xAxis) === null || _a === void 0 ? void 0 : _a.pointOnColumn);
    }
    return false;
}
export function isSeriesUsingRadialAxes(series) {
    return !!series.radar || !!series.radialBar || !!series.gauge;
}
function getAxisNameUsingRadialAxes(labelAxisOnYAxis) {
    return {
        valueAxisName: labelAxisOnYAxis ? 'circularAxis' : 'verticalAxis',
        labelAxisName: labelAxisOnYAxis ? 'verticalAxis' : 'circularAxis',
    };
}
export function getAxisName(labelAxisOnYAxis, series) {
    return isSeriesUsingRadialAxes(series)
        ? getAxisNameUsingRadialAxes(labelAxisOnYAxis)
        : {
            valueAxisName: labelAxisOnYAxis ? 'xAxis' : 'yAxis',
            labelAxisName: labelAxisOnYAxis ? 'yAxis' : 'xAxis',
        };
}
export function getSizeKey(labelAxisOnYAxis) {
    return {
        valueSizeKey: labelAxisOnYAxis ? 'width' : 'height',
        labelSizeKey: labelAxisOnYAxis ? 'height' : 'width',
    };
}
export function getLimitOnAxis(labels) {
    const values = labels.map((label) => Number(label));
    return {
        min: Math.min(...values),
        max: Math.max(...values),
    };
}
export function hasSecondaryYAxis(options) {
    var _a;
    return Array.isArray((_a = options) === null || _a === void 0 ? void 0 : _a.yAxis) && options.yAxis.length === 2;
}
export function getYAxisOption(options) {
    var _a;
    const secondaryYAxis = hasSecondaryYAxis(options);
    return {
        yAxis: secondaryYAxis ? options.yAxis[0] : (_a = options) === null || _a === void 0 ? void 0 : _a.yAxis,
        secondaryYAxis: secondaryYAxis ? options.yAxis[1] : null,
    };
}
export function getValueAxisName(options, seriesName, valueAxisName) {
    var _a;
    const { secondaryYAxis } = getYAxisOption(options);
    return ((_a = secondaryYAxis) === null || _a === void 0 ? void 0 : _a.chartType) === seriesName ? 'secondaryYAxis' : valueAxisName;
}
export function getValueAxisNames(options, valueAxisName) {
    if (includes([AxisType.X, AxisType.CIRCULAR, AxisType.VERTICAL], valueAxisName)) {
        return [valueAxisName];
    }
    const optionsUsingYAxis = options;
    const { yAxis, secondaryYAxis } = getYAxisOption(optionsUsingYAxis);
    return secondaryYAxis
        ? [yAxis.chartType, secondaryYAxis.chartType].map((seriesName, index) => seriesName
            ? getValueAxisName(optionsUsingYAxis, seriesName, valueAxisName)
            : ['yAxis', 'secondaryYAxis'][index])
        : [valueAxisName];
}
export function getAxisTheme(theme, name) {
    const { xAxis, yAxis, circularAxis } = theme;
    let axisTheme;
    if (name === AxisType.X) {
        axisTheme = xAxis;
    }
    else if (Array.isArray(yAxis)) {
        axisTheme = name === AxisType.Y ? yAxis[0] : yAxis[1];
    }
    else if (name === RadialAxisType.CIRCULAR) {
        axisTheme = circularAxis;
    }
    else {
        axisTheme = yAxis;
    }
    return axisTheme;
}
function getRotationDegree(distance, labelWidth, labelHeight, axisLayout) {
    let degree = 0;
    ANGLE_CANDIDATES.every((angle) => {
        const compareWidth = calculateRotatedWidth(angle, labelWidth, labelHeight);
        degree = angle;
        return compareWidth > distance || compareWidth / 2 > axisLayout.x;
    });
    return distance < labelWidth || labelWidth / 2 > axisLayout.x ? degree : 0;
}
function hasYAxisMaxLabelLengthChanged(previousAxes, currentAxes, field) {
    var _a, _b;
    const prevYAxis = previousAxes[field];
    const yAxis = currentAxes[field];
    if (!prevYAxis && !yAxis) {
        return false;
    }
    return ((_a = prevYAxis) === null || _a === void 0 ? void 0 : _a.maxLabelWidth) !== ((_b = yAxis) === null || _b === void 0 ? void 0 : _b.maxLabelWidth);
}
function hasYAxisTypeMaxLabelChanged(previousAxes, currentAxes) {
    return (hasYAxisMaxLabelLengthChanged(previousAxes, currentAxes, 'yAxis') ||
        hasYAxisMaxLabelLengthChanged(previousAxes, currentAxes, 'secondaryYAxis'));
}
function hasXAxisSizeChanged(previousAxes, currentAxes) {
    const { maxHeight: prevMaxHeight } = previousAxes.xAxis;
    const { maxHeight } = currentAxes.xAxis;
    return prevMaxHeight !== maxHeight;
}
export function hasAxesLayoutChanged(previousAxes, currentAxes) {
    return (hasYAxisTypeMaxLabelChanged(previousAxes, currentAxes) ||
        hasXAxisSizeChanged(previousAxes, currentAxes));
}
export function getRotatableOption(options) {
    var _a, _b, _c, _d;
    return _d = (_c = (_b = (_a = options) === null || _a === void 0 ? void 0 : _a.xAxis) === null || _b === void 0 ? void 0 : _b.label) === null || _c === void 0 ? void 0 : _c.rotatable, (_d !== null && _d !== void 0 ? _d : true);
}
export function getViewAxisLabels(axisData, axisSize) {
    var _a, _b, _c, _d;
    const { labels, pointOnColumn, labelDistance, tickDistance, labelInterval, tickInterval, tickCount, scale, } = axisData;
    let axisSizeAppliedRatio = axisSize;
    let additional = 0;
    let labelAdjustment = 0;
    if (scale) {
        const sizeRatio = (_b = (_a = scale) === null || _a === void 0 ? void 0 : _a.sizeRatio, (_b !== null && _b !== void 0 ? _b : 1));
        const positionRatio = (_d = (_c = scale) === null || _c === void 0 ? void 0 : _c.positionRatio, (_d !== null && _d !== void 0 ? _d : 0));
        axisSizeAppliedRatio = axisSize * sizeRatio;
        additional = axisSize * positionRatio;
    }
    else {
        const interval = labelInterval === tickInterval ? labelInterval : 1;
        labelAdjustment = pointOnColumn ? ((labelDistance !== null && labelDistance !== void 0 ? labelDistance : tickDistance * interval)) / 2 : 0;
    }
    const relativePositions = makeTickPixelPositions(axisSizeAppliedRatio, tickCount, additional);
    return labels.reduce((acc, text, index) => {
        const offsetPos = relativePositions[index] + labelAdjustment;
        const needRender = !(index % labelInterval) && offsetPos <= axisSize;
        return needRender ? [...acc, { offsetPos, text }] : acc;
    }, []);
}
export function makeTitleOption(title) {
    if (isUndefined(title)) {
        return title;
    }
    const defaultOption = { text: '', offsetX: 0, offsetY: 0 };
    return isString(title) ? Object.assign(Object.assign({}, defaultOption), { text: title }) : Object.assign(Object.assign({}, defaultOption), title);
}
export function getAxisFormatter(options, axisName) {
    var _a, _b, _c;
    const axisOptions = Object.assign(Object.assign({}, getYAxisOption(options)), { xAxis: options.xAxis });
    return _c = (_b = (_a = axisOptions[axisName]) === null || _a === void 0 ? void 0 : _a.label) === null || _b === void 0 ? void 0 : _b.formatter, (_c !== null && _c !== void 0 ? _c : ((value) => value));
}
export function getLabelsAppliedFormatter(labels, options, dateType, axisName) {
    var _a, _b;
    const dateFormatter = getDateFormat((_b = (_a = options) === null || _a === void 0 ? void 0 : _a[axisName]) === null || _b === void 0 ? void 0 : _b.date);
    const formattedLabels = dateType && dateFormatter
        ? labels.map((label) => formatDate(dateFormatter, new Date(label)))
        : labels;
    const formatter = getAxisFormatter(options, axisName);
    return formattedLabels.map((label, index) => formatter(label, { index, labels, axisName }));
}
export function makeRotationData(maxLabelWidth, maxLabelHeight, distance, rotatable, axisLayout) {
    const degree = getRotationDegree(distance, maxLabelWidth, maxLabelHeight, axisLayout);
    if (!rotatable || degree === 0) {
        return {
            needRotateLabel: false,
            radian: 0,
            rotationHeight: maxLabelHeight,
        };
    }
    return {
        needRotateLabel: degree > 0,
        radian: calculateDegreeToRadian(degree, 0),
        rotationHeight: calculateRotatedHeight(degree, maxLabelWidth, maxLabelHeight),
    };
}
export function getMaxLabelSize(labels, xMargin, font = DEFAULT_LABEL_TEXT) {
    const maxLengthLabel = labels.reduce((acc, cur) => (acc.length > cur.length ? acc : cur), '');
    return {
        maxLabelWidth: getTextWidth(maxLengthLabel, font) + xMargin,
        maxLabelHeight: getTextHeight(maxLengthLabel, font),
    };
}
export function getLabelXMargin(axisName, options) {
    var _a, _b, _c, _d;
    if (axisName === 'xAxis') {
        return 0;
    }
    const axisOptions = getYAxisOption(options);
    return Math.abs((_d = (_c = (_b = (_a = axisOptions) === null || _a === void 0 ? void 0 : _a[axisName]) === null || _b === void 0 ? void 0 : _b.label) === null || _c === void 0 ? void 0 : _c.margin, (_d !== null && _d !== void 0 ? _d : 0)));
}
export function getInitAxisIntervalData(isLabelAxis, params) {
    var _a, _b, _c, _d, _e, _f;
    const { axis, categories, layout, isCoordinateTypeChart } = params;
    const tickInterval = (_b = (_a = axis) === null || _a === void 0 ? void 0 : _a.tick) === null || _b === void 0 ? void 0 : _b.interval;
    const labelInterval = (_d = (_c = axis) === null || _c === void 0 ? void 0 : _c.label) === null || _d === void 0 ? void 0 : _d.interval;
    const existIntervalOptions = isNumber(tickInterval) || isNumber(labelInterval);
    const needAdjustInterval = isLabelAxis &&
        !isNumber((_f = (_e = axis) === null || _e === void 0 ? void 0 : _e.scale) === null || _f === void 0 ? void 0 : _f.stepSize) &&
        !params.shift &&
        !existIntervalOptions &&
        !isCoordinateTypeChart;
    const initTickInterval = needAdjustInterval ? getInitTickInterval(categories, layout) : 1;
    const initLabelInterval = needAdjustInterval ? initTickInterval : 1;
    const axisData = {
        tickInterval: (tickInterval !== null && tickInterval !== void 0 ? tickInterval : initTickInterval),
        labelInterval: (labelInterval !== null && labelInterval !== void 0 ? labelInterval : initLabelInterval),
    };
    return axisData;
}
function getInitTickInterval(categories, layout) {
    if (!categories || !layout) {
        return 1;
    }
    const { width } = layout.xAxis;
    const count = categories.length;
    return getAutoAdjustingInterval(count, width, categories);
}
export function getDefaultRadialAxisData(options, plot, maxLabelWidth = 0, maxLabelHeight = 0, isLabelOnVerticalAxis = false) {
    var _a;
    const centerX = plot.width / 2;
    if (isLabelOnVerticalAxis) {
        const { startAngle, endAngle, clockwise } = initSectorOptions((_a = options) === null || _a === void 0 ? void 0 : _a.series);
        const isSemiCircular = isSemiCircle(clockwise, startAngle, endAngle);
        return {
            isSemiCircular,
            axisSize: getDefaultRadius(plot, isSemiCircular, maxLabelWidth, maxLabelHeight),
            centerX,
            centerY: isSemiCircular ? getSemiCircleCenterY(plot.height, clockwise) : plot.height / 2,
            totalAngle: getTotalAngle(clockwise, startAngle, endAngle),
            drawingStartAngle: startAngle,
            clockwise,
            startAngle,
            endAngle,
        };
    }
    return {
        isSemiCircular: false,
        axisSize: getDefaultRadius(plot, false, maxLabelWidth, maxLabelHeight),
        centerX,
        centerY: plot.height / 2,
        totalAngle: DEGREE_360,
        drawingStartAngle: DEGREE_0,
        clockwise: true,
        startAngle: DEGREE_0,
        endAngle: DEGREE_360,
    };
}
export function getRadiusInfo(axisSize, radiusRange, count = 1) {
    var _a, _b, _c, _d;
    const innerRadius = calculateSizeWithPercentString(axisSize, (_b = (_a = radiusRange) === null || _a === void 0 ? void 0 : _a.inner, (_b !== null && _b !== void 0 ? _b : 0)));
    const outerRadius = calculateSizeWithPercentString(axisSize, (_d = (_c = radiusRange) === null || _c === void 0 ? void 0 : _c.outer, (_d !== null && _d !== void 0 ? _d : axisSize)));
    return {
        radiusRanges: makeTickPixelPositions(outerRadius - innerRadius, count, innerRadius)
            .splice(innerRadius === 0 ? 1 : 0, count)
            .reverse(),
        innerRadius,
        outerRadius,
    };
}
export function isDateType(options, axisName) {
    var _a;
    return !!((_a = options[axisName]) === null || _a === void 0 ? void 0 : _a.date);
}
