import { extend } from "./store";
import { isUndefined, pick, isNumber } from "../helpers/utils";
import { isCenterYAxis } from "./axes";
import { BUTTON_RECT_SIZE } from "../component/exportMenu";
import { TICK_SIZE } from "../brushes/axis";
import { SPECTRUM_LEGEND_LABEL_HEIGHT, spectrumLegendBar, spectrumLegendTooltip, } from "../brushes/spectrumLegend";
import { getYAxisOption } from "../helpers/axes";
export const padding = { X: 10, Y: 15 };
export const X_AXIS_HEIGHT = 20;
const Y_AXIS_MIN_WIDTH = 40;
export function isVerticalAlign(align) {
    return align === 'top' || align === 'bottom';
}
function getValidRectSize(size, width, height) {
    var _a, _b, _c, _d;
    return {
        height: (_b = (_a = size) === null || _a === void 0 ? void 0 : _a.height, (_b !== null && _b !== void 0 ? _b : height)),
        width: (_d = (_c = size) === null || _c === void 0 ? void 0 : _c.width, (_d !== null && _d !== void 0 ? _d : width)),
    };
}
function getDefaultXAxisHeight(size) {
    var _a;
    return ((_a = size.xAxis) === null || _a === void 0 ? void 0 : _a.height) && !size.yAxis ? size.xAxis.height : X_AXIS_HEIGHT;
}
function getDefaultYAxisXPoint(yAxisRectParam) {
    const { yAxisTitle, isRightSide, visibleSecondaryYAxis } = yAxisRectParam;
    const yAxisWidth = getDefaultYAxisWidth(yAxisRectParam);
    return isRightSide && visibleSecondaryYAxis
        ? Math.max(yAxisTitle.x + yAxisTitle.width - yAxisWidth, 0)
        : yAxisTitle.x;
}
function getYAxisXPoint(yAxisRectParam) {
    const { chartSize, legend, circleLegend, hasCenterYAxis, maxLabelWidth } = yAxisRectParam;
    const { width } = chartSize;
    const { align } = legend;
    let yAxisWidth = getDefaultYAxisWidth(yAxisRectParam);
    let x = getDefaultYAxisXPoint(yAxisRectParam);
    if (hasCenterYAxis) {
        yAxisWidth = maxLabelWidth + (TICK_SIZE + padding.X) * 2;
        x = (width - legend.width - yAxisWidth + padding.X * 2) / 2;
    }
    if (legend.visible && align === 'left') {
        x = getDefaultYAxisXPoint(yAxisRectParam);
    }
    if (circleLegend.visible && align === 'left') {
        x = Math.max(circleLegend.width + padding.X, x);
    }
    return x;
}
function getYAxisYPoint({ yAxisTitle }) {
    return yAxisTitle.y + yAxisTitle.height;
}
function getDefaultYAxisWidth({ maxLabelWidth, size, isRightSide }) {
    var _a, _b, _c;
    return _c = (_b = (_a = size) === null || _a === void 0 ? void 0 : _a[isRightSide ? 'secondaryYAxis' : 'yAxis']) === null || _b === void 0 ? void 0 : _b.width, (_c !== null && _c !== void 0 ? _c : maxLabelWidth);
}
function getYAxisWidth(yAxisRectParam) {
    const { hasCenterYAxis, hasXYAxis, maxLabelWidth, visibleSecondaryYAxis = false, isRightSide = false, } = yAxisRectParam;
    let yAxisWidth = getDefaultYAxisWidth(yAxisRectParam);
    if (hasCenterYAxis && !isRightSide) {
        yAxisWidth = maxLabelWidth + (TICK_SIZE + padding.X) * 2;
    }
    else if (!hasXYAxis || (isRightSide && !visibleSecondaryYAxis)) {
        yAxisWidth = 0;
    }
    return yAxisWidth;
}
function getYAxisHeight({ chartSize, legend, yAxisTitle, hasXYAxis, size, xAxisTitleHeight, }) {
    var _a, _b, _c, _d;
    const { height } = chartSize;
    const { align, height: legendHeight } = legend;
    const xAxisHeight = getDefaultXAxisHeight(size);
    const y = yAxisTitle.y + yAxisTitle.height;
    let yAxisHeight = height - y - xAxisHeight - xAxisTitleHeight;
    if (!hasXYAxis) {
        yAxisHeight = height - y;
    }
    if (legend.visible) {
        const topArea = Math.max(y, legendHeight);
        if (align === 'top') {
            yAxisHeight = height - topArea - (hasXYAxis ? X_AXIS_HEIGHT + xAxisTitleHeight : 0);
        }
        else if (align === 'bottom') {
            yAxisHeight = height - y - X_AXIS_HEIGHT - xAxisTitleHeight - legendHeight;
        }
    }
    if (!((_b = (_a = size) === null || _a === void 0 ? void 0 : _a.yAxis) === null || _b === void 0 ? void 0 : _b.height) && ((_d = (_c = size) === null || _c === void 0 ? void 0 : _c.plot) === null || _d === void 0 ? void 0 : _d.height)) {
        yAxisHeight = size.plot.height;
    }
    return yAxisHeight;
}
function getYAxisRect(yAxisRectParam) {
    var _a, _b;
    const { size, isRightSide = false } = yAxisRectParam;
    const x = getYAxisXPoint(yAxisRectParam);
    const y = getYAxisYPoint(yAxisRectParam);
    const yAxisWidth = getYAxisWidth(yAxisRectParam);
    const yAxisHeight = getYAxisHeight(yAxisRectParam);
    return Object.assign({ x,
        y }, getValidRectSize(isRightSide ? (_a = size) === null || _a === void 0 ? void 0 : _a.secondaryYAxis : (_b = size) === null || _b === void 0 ? void 0 : _b.yAxis, yAxisWidth, yAxisHeight));
}
function getXAxisWidth({ chartSize, yAxis, hasCenterYAxis, legend, circleLegend, secondaryYAxis, xAxisData, }) {
    var _a;
    const { width } = chartSize;
    const { align, width: legendWidth } = legend;
    const legendVerticalAlign = isVerticalAlign(align);
    let xAxisWidth;
    if (legendVerticalAlign) {
        xAxisWidth = width - (yAxis.x + yAxis.width + padding.X);
        if (circleLegend.visible) {
            xAxisWidth -= circleLegend.width;
        }
    }
    else {
        xAxisWidth =
            width - (yAxis.width + Math.max(legendWidth, circleLegend.visible ? circleLegend.width : 0));
    }
    if (hasCenterYAxis) {
        xAxisWidth = width - (legendVerticalAlign ? 0 : legendWidth) - padding.X * 2;
    }
    if (secondaryYAxis.width) {
        xAxisWidth -= secondaryYAxis.width;
    }
    if ((_a = xAxisData) === null || _a === void 0 ? void 0 : _a.maxLabelWidth) {
        // subtract half of the maximum label length to secure margin size
        xAxisWidth -= xAxisData.maxLabelWidth * 0.5;
    }
    return xAxisWidth;
}
function getXAxisHeight(xAxisData, hasXYAxis = false) {
    var _a, _b;
    if (!hasXYAxis) {
        return 0;
    }
    return _b = (_a = xAxisData) === null || _a === void 0 ? void 0 : _a.maxHeight, (_b !== null && _b !== void 0 ? _b : X_AXIS_HEIGHT);
}
function getXAxisRect(xAxisRectParam) {
    var _a;
    const { hasXYAxis, hasCenterYAxis, yAxis, size, xAxisData } = xAxisRectParam;
    const x = hasCenterYAxis ? padding.X * 2 : yAxis.x + yAxis.width;
    const y = yAxis.y + yAxis.height;
    const xAxisWidth = getXAxisWidth(xAxisRectParam);
    const xAxisHeight = getXAxisHeight(xAxisData, hasXYAxis);
    return Object.assign({ x,
        y }, getValidRectSize((_a = size) === null || _a === void 0 ? void 0 : _a.xAxis, xAxisWidth, xAxisHeight));
}
function getLegendRect(legendRectParams) {
    const { legend, xAxis, yAxis, chartSize, title, hasXYAxis, secondaryYAxis, xAxisTitleHeight, } = legendRectParams;
    if (!legend.visible) {
        return {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        };
    }
    const { align, width: legendWidth, height: legendHeight } = legend;
    const { width } = chartSize;
    const verticalAlign = isVerticalAlign(align);
    let x = xAxis.x + xAxis.width + secondaryYAxis.width + padding.X;
    let y = Math.max(yAxis.y, BUTTON_RECT_SIZE);
    if (verticalAlign) {
        x = (width - legendWidth) / 2;
        if (align === 'top') {
            y = title.y + title.height;
        }
        else {
            y = yAxis.y + yAxis.height + (hasXYAxis ? xAxis.height + xAxisTitleHeight : padding.Y);
        }
    }
    else if (align === 'left') {
        x = padding.X;
    }
    return { width: legendWidth, height: legendHeight, x, y };
}
function getCircleLegendRect(xAxis, yAxis, align, width) {
    return {
        width,
        height: yAxis.height,
        x: align === 'left' ? padding.X : xAxis.x + xAxis.width + padding.X,
        y: yAxis.y,
    };
}
function getPlotRect(xAxis, yAxis, size) {
    return Object.assign({ x: xAxis.x, y: yAxis.y }, getValidRectSize(size, xAxis.width, yAxis.height));
}
function getTitleRect(chartSize, exportMenu, visible, titleHeight) {
    const point = { x: padding.X, y: padding.Y };
    const marginBottom = 5;
    const width = visible ? chartSize.width - exportMenu.width : 0;
    const height = visible
        ? Math.max(titleHeight + marginBottom, exportMenu.height)
        : exportMenu.height;
    return Object.assign({ width, height }, point);
}
function getTopLegendAreaHeight(useSpectrumLegend, legendHeight) {
    return useSpectrumLegend
        ? SPECTRUM_LEGEND_LABEL_HEIGHT +
            spectrumLegendBar.PADDING * 2 +
            spectrumLegendTooltip.POINT_HEIGHT +
            spectrumLegendTooltip.HEIGHT +
            padding.Y
        : legendHeight + padding.Y;
}
function getYAxisTitleRect({ chartSize, visible, title, legend: { align: legendAlign, width: legendWidth, height: legendHeight, visible: legendVisible, useSpectrumLegend, }, hasCenterYAxis, visibleSecondaryYAxis, isRightSide = false, yAxisTitleHeight, }) {
    const marginBottom = 5;
    const height = visible ? yAxisTitleHeight + marginBottom : 0;
    const verticalLegendAlign = isVerticalAlign(legendAlign);
    const width = (chartSize.width - (verticalLegendAlign ? padding.X * 2 : legendWidth)) /
        (visibleSecondaryYAxis ? 2 : 1);
    const point = {
        x: isRightSide ? title.x + width : title.x,
        y: title.y + title.height,
    };
    if (legendVisible) {
        if (legendAlign === 'left') {
            point.x += legendWidth;
        }
        else if (legendAlign === 'top') {
            point.y += getTopLegendAreaHeight(useSpectrumLegend, legendHeight);
        }
    }
    if (hasCenterYAxis) {
        point.x = (width + padding.X * 2) / 2;
    }
    return Object.assign({ height, width }, point);
}
function getXAxisTitleRect(visible, xAxis, xAxisTitleHeight) {
    const point = { x: xAxis.x, y: xAxis.y + xAxis.height };
    const height = visible ? xAxisTitleHeight : 0;
    const width = visible ? xAxis.width : 0;
    return Object.assign({ height, width }, point);
}
function getExportMenuRect(chartSize, visible) {
    const marginY = 5;
    const x = visible ? padding.X + chartSize.width - BUTTON_RECT_SIZE : padding.X + chartSize.width;
    const y = padding.Y;
    const height = visible ? BUTTON_RECT_SIZE + marginY : 0;
    const width = visible ? BUTTON_RECT_SIZE : 0;
    return { x, y, height, width };
}
function getResetButtonRect(exportMenu, useResetButton) {
    const marginY = 5;
    const x = useResetButton ? exportMenu.x - BUTTON_RECT_SIZE - padding.X : 0;
    const y = useResetButton ? exportMenu.y : 0;
    const height = useResetButton ? BUTTON_RECT_SIZE + marginY : 0;
    const width = useResetButton ? BUTTON_RECT_SIZE : 0;
    return { x, y, height, width };
}
export function isUsingResetButton(options) {
    var _a;
    return !!((_a = options.series) === null || _a === void 0 ? void 0 : _a.zoomable);
}
export function isExportMenuVisible(options) {
    var _a;
    const visible = (_a = options.exportMenu) === null || _a === void 0 ? void 0 : _a.visible;
    return isUndefined(visible) ? true : visible;
}
function getYAxisMaxLabelWidth(maxLabelLength) {
    return maxLabelLength ? maxLabelLength + padding.X : Y_AXIS_MIN_WIDTH;
}
function pickOptionSize(option) {
    if (!option || (isUndefined(option.width) && isUndefined(option.height))) {
        return null;
    }
    return pick(option, 'width', 'height');
}
function validOffsetValue(axis, plot, sizeKey) {
    const axisSize = axis[sizeKey];
    const plotSize = plot[sizeKey];
    if (isNumber(axisSize) && isNumber(plotSize)) {
        return Math.max(axisSize, plotSize);
    }
}
function getOptionSize(options) {
    const xAxis = pickOptionSize(options.xAxis);
    const yAxisOptions = getYAxisOption(options);
    const yAxis = pickOptionSize(yAxisOptions.yAxis);
    const secondaryYAxis = pickOptionSize(yAxisOptions.secondaryYAxis);
    const plot = pickOptionSize(options.plot);
    if (plot) {
        /*
        If both the width of the x-axis and the width of the plot are entered,
        set the maximum value.
      */
        if (xAxis) {
            xAxis.width = plot.width = validOffsetValue(xAxis, plot, 'width');
        }
        /*
        If both the height of the y-axis and the height of the plot are entered,
        set the maximum value.
      */
        if (yAxis) {
            yAxis.height = plot.height = validOffsetValue(yAxis, plot, 'height');
        }
        if (secondaryYAxis) {
            secondaryYAxis.height = plot.height = validOffsetValue(secondaryYAxis, plot, 'height');
        }
    }
    return {
        xAxis,
        yAxis,
        plot,
        secondaryYAxis,
    };
}
function getAxisTitleHeight(axisTheme, offsetY = 0) {
    const fontSize = Array.isArray(axisTheme)
        ? Math.max(axisTheme[0].title.fontSize, axisTheme[1].title.fontSize)
        : axisTheme.title.fontSize;
    return fontSize + offsetY;
}
function adjustAxisSize({ width, height }, layout, legendState) {
    if (width < 0 || height < 0) {
        return;
    }
    const { title, yAxisTitle, yAxis, xAxis, xAxisTitle, legend, secondaryYAxis } = layout;
    const { align } = legendState;
    const hasVerticalLegend = isVerticalAlign(align);
    const legendHeight = hasVerticalLegend ? legend.height : 0;
    const diffHeight = xAxis.height +
        xAxisTitle.height +
        yAxis.height +
        yAxisTitle.height +
        title.height +
        legendHeight -
        height;
    if (diffHeight > 0) {
        yAxis.height -= diffHeight;
        xAxis.y -= diffHeight;
        xAxisTitle.y -= diffHeight;
        if (hasVerticalLegend) {
            legend.y -= diffHeight;
        }
    }
    secondaryYAxis.x = xAxis.x + xAxis.width;
    secondaryYAxis.height = yAxis.height;
}
function getCircularAxisTitleRect(plot, axisTheme, circularAxis) {
    var _a, _b;
    if (!circularAxis) {
        return Object.assign({}, plot);
    }
    const { x, y } = plot;
    const { centerX, centerY, axisSize, title, radius: { outer }, } = circularAxis;
    const offsetY = (_b = (_a = title) === null || _a === void 0 ? void 0 : _a.offsetY, (_b !== null && _b !== void 0 ? _b : 0));
    return {
        x: centerX + x - axisSize / 2,
        y: centerY + y - outer / 2,
        width: axisSize,
        height: axisTheme.title.fontSize + offsetY,
    };
}
function hasXYAxes(series) {
    return !(series.pie || series.radar || series.treemap || series.radialBar || series.gauge);
}
function getYAxisOptions(options, hasXYAxis) {
    return hasXYAxis
        ? getYAxisOption(options)
        : {
            yAxis: null,
            secondaryYAxis: null,
        };
}
const layout = {
    name: 'layout',
    state: () => ({
        layout: {},
    }),
    action: {
        setLayout({ state }) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
            const { legend: legendState, theme, circleLegend: circleLegendState, series, options, chart, axes, radialAxes, } = state;
            const { width, height } = chart;
            const chartSize = {
                height: height - padding.Y * 2,
                width: width - padding.X * 2,
            };
            const hasCenterYAxis = series.bar ? isCenterYAxis(options) : false;
            const hasXYAxis = hasXYAxes(series);
            const optionSize = getOptionSize(options);
            const { yAxis: yAxisOption, secondaryYAxis: secondaryYAxisOption } = getYAxisOptions(options, hasXYAxis);
            const visibleSecondaryYAxis = !!secondaryYAxisOption;
            const titleHeight = theme.title.fontSize;
            const yAxisTitleHeight = (_d = getAxisTitleHeight(theme.yAxis, (_c = (_b = (_a = axes) === null || _a === void 0 ? void 0 : _a.yAxis) === null || _b === void 0 ? void 0 : _b.title) === null || _c === void 0 ? void 0 : _c.offsetY), (_d !== null && _d !== void 0 ? _d : 0));
            const xAxisTitleHeight = (_h = getAxisTitleHeight(theme.xAxis, (_g = (_f = (_e = axes) === null || _e === void 0 ? void 0 : _e.xAxis) === null || _f === void 0 ? void 0 : _f.title) === null || _g === void 0 ? void 0 : _g.offsetY), (_h !== null && _h !== void 0 ? _h : 0));
            // Don't change the order!
            // exportMenu -> resetButton -> title -> yAxis.title -> yAxis -> secondaryYAxisTitle -> secondaryYAxis -> xAxis -> xAxis.title -> legend -> circleLegend -> plot -> circularAxis.title
            const exportMenu = getExportMenuRect(chartSize, isExportMenuVisible(options));
            const resetButton = getResetButtonRect(exportMenu, isUsingResetButton(options));
            const btnAreaRect = exportMenu.height ? exportMenu : resetButton;
            const title = getTitleRect(chartSize, btnAreaRect, !!((_j = options.chart) === null || _j === void 0 ? void 0 : _j.title), titleHeight);
            const yAxisTitleVisible = !!((_k = yAxisOption) === null || _k === void 0 ? void 0 : _k.title) || !!((_l = secondaryYAxisOption) === null || _l === void 0 ? void 0 : _l.title);
            const yAxisTitle = getYAxisTitleRect({
                chartSize,
                visible: yAxisTitleVisible,
                title,
                legend: legendState,
                hasCenterYAxis,
                visibleSecondaryYAxis,
                yAxisTitleHeight,
            });
            const yAxis = getYAxisRect({
                chartSize,
                legend: legendState,
                circleLegend: circleLegendState,
                yAxisTitle,
                hasCenterYAxis,
                hasXYAxis,
                maxLabelWidth: getYAxisMaxLabelWidth((_m = axes) === null || _m === void 0 ? void 0 : _m.yAxis.maxLabelWidth),
                size: optionSize,
                xAxisTitleHeight,
            });
            const secondaryYAxisTitle = getYAxisTitleRect({
                chartSize,
                visible: yAxisTitleVisible,
                title,
                legend: legendState,
                hasCenterYAxis,
                isRightSide: true,
                visibleSecondaryYAxis,
                yAxisTitleHeight,
            });
            const secondaryYAxis = getYAxisRect({
                chartSize,
                legend: legendState,
                circleLegend: circleLegendState,
                yAxisTitle: secondaryYAxisTitle,
                hasCenterYAxis,
                hasXYAxis,
                maxLabelWidth: getYAxisMaxLabelWidth((_p = (_o = axes) === null || _o === void 0 ? void 0 : _o.secondaryYAxis) === null || _p === void 0 ? void 0 : _p.maxLabelWidth),
                size: optionSize,
                isRightSide: true,
                visibleSecondaryYAxis,
                xAxisTitleHeight,
            });
            const xAxis = getXAxisRect({
                chartSize,
                yAxis,
                secondaryYAxis,
                legend: legendState,
                circleLegend: circleLegendState,
                hasCenterYAxis,
                hasXYAxis,
                size: optionSize,
                xAxisData: (_q = axes) === null || _q === void 0 ? void 0 : _q.xAxis,
            });
            const xAxisTitle = getXAxisTitleRect(!!((_r = options.xAxis) === null || _r === void 0 ? void 0 : _r.title), xAxis, xAxisTitleHeight);
            const legend = getLegendRect({
                chartSize,
                xAxis,
                yAxis,
                secondaryYAxis,
                title,
                legend: legendState,
                hasXYAxis,
                xAxisTitleHeight,
            });
            adjustAxisSize(chartSize, { title, yAxisTitle, yAxis, xAxis, xAxisTitle, legend, secondaryYAxis }, legendState);
            const circleLegend = getCircleLegendRect(xAxis, yAxis, legendState.align, circleLegendState.width);
            const plot = getPlotRect(xAxis, yAxis, optionSize.plot);
            const circularAxisTitle = getCircularAxisTitleRect(plot, theme.circularAxis, (_s = radialAxes) === null || _s === void 0 ? void 0 : _s.circularAxis);
            extend(state.layout, {
                chart: { x: 0, y: 0, width, height },
                title,
                plot,
                legend,
                circleLegend,
                xAxis,
                xAxisTitle,
                yAxis,
                yAxisTitle,
                exportMenu,
                resetButton,
                secondaryYAxisTitle,
                secondaryYAxis,
                circularAxisTitle,
            });
        },
    },
    observe: {
        updateLayoutObserve() {
            this.dispatch('setLayout');
        },
    },
};
export default layout;
