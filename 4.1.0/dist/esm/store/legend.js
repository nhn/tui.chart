import { isUndefined, sum, includes, deepMergedCopy, range } from "../helpers/utils";
import { getLegendItemHeight, LEGEND_CHECKBOX_SIZE, LEGEND_ICON_SIZE, LEGEND_ITEM_MARGIN_X, LEGEND_MARGIN_X, } from "../brushes/legend";
import { getTextWidth } from "../helpers/calculator";
import { isVerticalAlign, padding } from "./layout";
import { spectrumLegendBar, spectrumLegendTooltip } from "../brushes/spectrumLegend";
import { hasNestedPieSeries } from "../helpers/pieSeries";
import { extend } from "./store";
import { getTitleFontString } from "../helpers/style";
import { makeDefaultTheme } from "../helpers/theme";
const INITIAL_LEGEND_WIDTH = 100;
const INITIAL_CIRCLE_LEGEND_WIDTH = 150;
function recalculateLegendWhenHeightOverflows(params, legendHeight) {
    const { legendWidths, itemHeight } = params;
    const totalHeight = legendWidths.length * itemHeight;
    const columnCount = Math.ceil(totalHeight / legendHeight);
    const rowCount = legendWidths.length / columnCount;
    let legendWidth = 0;
    range(0, columnCount).forEach((count) => {
        legendWidth += Math.max(...legendWidths.slice(count * rowCount, (count + 1) * rowCount));
    });
    legendWidth += LEGEND_ITEM_MARGIN_X * (columnCount - 1);
    return { legendWidth, legendHeight: rowCount * itemHeight + padding.Y, columnCount, rowCount };
}
function recalculateLegendWhenWidthOverflows(params, prevLegendWidth) {
    const { legendWidths, itemHeight } = params;
    let columnCount = 0;
    let legendWidth = 0;
    const { rowCount } = legendWidths.reduce((acc, width) => {
        const widthWithMargin = LEGEND_ITEM_MARGIN_X + width;
        if (acc.totalWidth + width > prevLegendWidth) {
            acc.totalWidth = widthWithMargin;
            acc.rowCount += 1;
            acc.columnCount = 1;
            columnCount = Math.max(columnCount, acc.columnCount);
        }
        else {
            acc.totalWidth += widthWithMargin;
            acc.columnCount += 1;
        }
        legendWidth = Math.max(legendWidth, acc.totalWidth);
        return acc;
    }, { totalWidth: 0, rowCount: 1, columnCount: 0 });
    return { legendHeight: itemHeight * rowCount, rowCount, columnCount, legendWidth };
}
function calculateLegendSize(params) {
    if (!params.visible) {
        return { legendWidth: 0, legendHeight: 0, rowCount: 0, columnCount: 0 };
    }
    const { chart, verticalAlign, legendWidths } = params;
    const { legendWidth, isOverflow: widthOverflow } = calculateLegendWidth(params);
    const { legendHeight, isOverflow: heightOverflow } = calculateLegendHeight(params);
    const columnCount = verticalAlign ? legendWidths.length : 1;
    const rowCount = verticalAlign ? Math.ceil(legendWidth / chart.width) : legendWidths.length;
    if (widthOverflow) {
        return recalculateLegendWhenWidthOverflows(params, legendWidth / rowCount);
    }
    if (heightOverflow) {
        return recalculateLegendWhenHeightOverflows(params, legendHeight);
    }
    return { legendWidth, legendHeight, columnCount, rowCount };
}
function calculateLegendHeight(params) {
    const { verticalAlign, itemHeight, legendWidths } = params;
    const { height: chartHeight } = getDefaultLegendSize(params);
    let legendHeight;
    let isOverflow = false;
    if (verticalAlign) {
        legendHeight = chartHeight;
    }
    else {
        const totalHeight = legendWidths.length * (padding.Y + itemHeight);
        isOverflow = chartHeight < totalHeight;
        legendHeight = isOverflow ? chartHeight : totalHeight;
    }
    return { legendHeight, isOverflow };
}
function getSpectrumLegendWidth(params, verticalAlign) {
    const { legendWidths, chart } = params;
    let legendWidth;
    if (verticalAlign) {
        const labelAreaWidth = sum(legendWidths);
        legendWidth = Math.max(chart.width / 4, labelAreaWidth);
    }
    else {
        const spectrumAreaWidth = spectrumLegendTooltip.PADDING * 2 +
            spectrumLegendBar.PADDING * 2 +
            spectrumLegendTooltip.POINT_HEIGHT +
            spectrumLegendBar.HEIGHT +
            padding.X * 2;
        legendWidth = Math.max(...legendWidths) + spectrumAreaWidth;
    }
    return { isOverflow: false, legendWidth };
}
function getNormalLegendWidth(params, verticalAlign) {
    const { initialWidth, legendWidths, checkbox } = params;
    let isOverflow = false;
    let legendWidth;
    if (verticalAlign) {
        const { width: chartWidth } = getDefaultLegendSize(params);
        const totalWidth = sum(legendWidths) + LEGEND_ITEM_MARGIN_X * (legendWidths.length - 1);
        isOverflow = totalWidth > chartWidth;
        legendWidth = totalWidth;
    }
    else {
        const labelAreaWidth = Math.max(...legendWidths);
        legendWidth =
            (checkbox ? LEGEND_CHECKBOX_SIZE + LEGEND_MARGIN_X : 0) +
                LEGEND_ICON_SIZE +
                LEGEND_MARGIN_X +
                Math.max(labelAreaWidth, initialWidth);
    }
    return { legendWidth, isOverflow };
}
function calculateLegendWidth(params) {
    var _a, _b;
    const { useSpectrumLegend, options, verticalAlign, visible } = params;
    const legendOptions = (_a = options) === null || _a === void 0 ? void 0 : _a.legend;
    if (!visible) {
        return { legendWidth: 0, isOverflow: false };
    }
    if ((_b = legendOptions) === null || _b === void 0 ? void 0 : _b.width) {
        return { legendWidth: legendOptions.width, isOverflow: false };
    }
    return useSpectrumLegend
        ? getSpectrumLegendWidth(params, verticalAlign)
        : getNormalLegendWidth(params, verticalAlign);
}
function getDefaultLegendSize(params) {
    const { verticalAlign, chart, itemHeight, initialWidth, circleLegendVisible } = params;
    const COMPONENT_HEIGHT_EXCEPT_Y_AXIS = 100;
    const restAreaHeight = COMPONENT_HEIGHT_EXCEPT_Y_AXIS + (circleLegendVisible ? INITIAL_CIRCLE_LEGEND_WIDTH : 0); // rest area temporary value (yAxisTitle.height + xAxis.height + circleLegend.height)
    return verticalAlign
        ? { width: chart.width - padding.X * 2, height: itemHeight }
        : {
            width: initialWidth,
            height: chart.height - restAreaHeight,
        };
}
export function showCircleLegend(options) {
    var _a, _b, _c, _d;
    return isUndefined((_b = (_a = options) === null || _a === void 0 ? void 0 : _a.circleLegend) === null || _b === void 0 ? void 0 : _b.visible) ? true : !!((_d = (_c = options) === null || _c === void 0 ? void 0 : _c.circleLegend) === null || _d === void 0 ? void 0 : _d.visible);
}
function showLegend(options, series) {
    var _a, _b, _c;
    if (series.treemap && !((_a = options.series) === null || _a === void 0 ? void 0 : _a.useColorValue)) {
        return false;
    }
    return isUndefined((_b = options.legend) === null || _b === void 0 ? void 0 : _b.visible) ? true : !!((_c = options.legend) === null || _c === void 0 ? void 0 : _c.visible);
}
function showCheckbox(options) {
    var _a, _b;
    return isUndefined((_a = options.legend) === null || _a === void 0 ? void 0 : _a.showCheckbox) ? true : !!((_b = options.legend) === null || _b === void 0 ? void 0 : _b.showCheckbox);
}
function getNestedPieLegendLabelsInfo(series) {
    const result = [];
    series.pie.forEach(({ data }) => {
        data.forEach(({ name, parentName, visible }) => {
            if (!parentName) {
                result.push({
                    label: name,
                    type: 'pie',
                    checked: (visible !== null && visible !== void 0 ? visible : true),
                });
            }
        });
    });
    return result;
}
function getLegendLabelsInfo(series) {
    return Object.keys(series).flatMap((type) => series[type].map(({ name, colorValue, visible }) => ({
        label: colorValue ? colorValue : name,
        type,
        checked: (visible !== null && visible !== void 0 ? visible : true),
    })));
}
function useRectIcon(type) {
    return includes(['bar', 'column', 'area', 'pie', 'boxPlot', 'bullet', 'radialBar'], type);
}
function useCircleIcon(type) {
    return includes(['bubble', 'scatter'], type);
}
function useLineIcon(type) {
    return includes(['line', 'radar'], type);
}
function getIconType(type) {
    let iconType = 'spectrum';
    if (useCircleIcon(type)) {
        iconType = 'circle';
    }
    else if (useRectIcon(type)) {
        iconType = 'rect';
    }
    else if (useLineIcon(type)) {
        iconType = 'line';
    }
    return iconType;
}
function getAlign(options) {
    var _a, _b;
    return isUndefined((_a = options.legend) === null || _a === void 0 ? void 0 : _a.align) ? 'right' : (_b = options.legend) === null || _b === void 0 ? void 0 : _b.align;
}
function getItemWidth(label, checkboxVisible, useSpectrumLegend, font) {
    return ((useSpectrumLegend
        ? 0
        : (checkboxVisible ? LEGEND_CHECKBOX_SIZE + LEGEND_MARGIN_X : 0) +
            LEGEND_ICON_SIZE +
            LEGEND_MARGIN_X) + getTextWidth(label, font));
}
function getLegendDataAppliedTheme(data, series) {
    const colors = Object.values(series).reduce((acc, cur) => (cur && cur.colors ? [...acc, ...cur.colors] : acc), []);
    return data.map((datum, idx) => (Object.assign(Object.assign({}, datum), { color: colors[idx] })));
}
function getLegendState(options, series) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const checkboxVisible = showCheckbox(options);
    const useSpectrumLegend = (_c = (_b = (_a = options) === null || _a === void 0 ? void 0 : _a.series) === null || _b === void 0 ? void 0 : _b.useColorValue, (_c !== null && _c !== void 0 ? _c : !!series.heatmap));
    const useScatterChartIcon = !!((_d = series) === null || _d === void 0 ? void 0 : _d.scatter);
    const defaultTheme = makeDefaultTheme((_g = (_f = (_e = options) === null || _e === void 0 ? void 0 : _e.theme) === null || _f === void 0 ? void 0 : _f.chart) === null || _g === void 0 ? void 0 : _g.fontFamily);
    const font = getTitleFontString(deepMergedCopy(defaultTheme.legend.label, Object.assign({}, (_j = (_h = options.theme) === null || _h === void 0 ? void 0 : _h.legend) === null || _j === void 0 ? void 0 : _j.label)));
    const legendLabelsInfo = hasNestedPieSeries(series)
        ? getNestedPieLegendLabelsInfo(series)
        : getLegendLabelsInfo(series);
    const data = legendLabelsInfo.map(({ label, type, checked }) => ({
        label,
        active: true,
        checked,
        width: getItemWidth(label, checkboxVisible, useSpectrumLegend, font),
        iconType: getIconType(type),
        chartType: type,
        rowIndex: 0,
        columnIndex: 0,
    }));
    return {
        useSpectrumLegend,
        useScatterChartIcon,
        data,
    };
}
function getNextColumnRowIndex(params) {
    const { verticalAlign, columnCount, rowCount, legendCount } = params;
    let { rowIndex, columnIndex } = params;
    if (verticalAlign) {
        const maxLen = legendCount / rowCount;
        if (maxLen - 1 > columnIndex) {
            columnIndex += 1;
        }
        else {
            rowIndex += 1;
            columnIndex = 0;
        }
    }
    else {
        const maxLen = legendCount / columnCount;
        if (maxLen - 1 > rowIndex) {
            rowIndex += 1;
        }
        else {
            columnIndex += 1;
            rowIndex = 0;
        }
    }
    return [rowIndex, columnIndex];
}
function setIndexToLegendData(legendData, rowCount, columnCount, legendCount, verticalAlign) {
    let columnIndex = 0;
    let rowIndex = 0;
    legendData.forEach((datum) => {
        datum.rowIndex = rowIndex;
        datum.columnIndex = columnIndex;
        [rowIndex, columnIndex] = getNextColumnRowIndex({
            rowCount,
            columnCount,
            verticalAlign,
            legendCount,
            rowIndex,
            columnIndex,
        });
    });
}
const legend = {
    name: 'legend',
    state: ({ options, series }) => {
        return {
            legend: getLegendState(options, series),
            circleLegend: {},
        };
    },
    action: {
        initLegendState({ state, initStoreState }) {
            extend(state.legend, getLegendState(initStoreState.options, initStoreState.series));
        },
        setLegendLayout({ state, initStoreState }) {
            const { legend: { data: legendData, useSpectrumLegend }, series, options, chart, theme, } = state;
            const align = getAlign(options);
            const visible = showLegend(options, series);
            const checkbox = showCheckbox(options);
            const initialWidth = Math.min(chart.width / 5, INITIAL_LEGEND_WIDTH);
            const verticalAlign = isVerticalAlign(align);
            const circleLegendVisible = series.bubble
                ? showCircleLegend(options)
                : false;
            const legendWidths = legendData.map(({ width }) => width);
            const itemHeight = getLegendItemHeight(theme.legend.label.fontSize);
            const { legendWidth, legendHeight, rowCount, columnCount } = calculateLegendSize({
                initialWidth,
                legendWidths,
                useSpectrumLegend,
                options,
                verticalAlign,
                visible,
                checkbox,
                chart,
                itemHeight,
                circleLegendVisible,
            });
            const isNestedPieChart = hasNestedPieSeries(initStoreState.series);
            const isScatterChart = !!series.scatter;
            const circleLegendWidth = legendWidth === 0
                ? INITIAL_CIRCLE_LEGEND_WIDTH
                : Math.min(legendWidth, INITIAL_CIRCLE_LEGEND_WIDTH);
            setIndexToLegendData(legendData, rowCount, columnCount, legendWidths.length, verticalAlign);
            extend(state.legend, {
                visible,
                align,
                showCheckbox: checkbox,
                width: legendWidth,
                height: legendHeight,
            });
            extend(state.circleLegend, {
                visible: circleLegendVisible,
                width: circleLegendVisible ? circleLegendWidth : 0,
                radius: circleLegendVisible ? Math.max((circleLegendWidth - LEGEND_MARGIN_X) / 2, 0) : 0,
            });
            if (!isNestedPieChart) {
                this.dispatch('updateLegendColor');
            }
            if (isScatterChart) {
                this.dispatch('updateLegendIcon');
            }
        },
        setLegendActiveState({ state }, { name, active }) {
            const { data } = state.legend;
            const model = data.find(({ label }) => label === name);
            model.active = active;
            this.notify(state, 'legend');
        },
        setAllLegendActiveState({ state }, active) {
            state.legend.data.forEach((datum) => {
                datum.active = active;
            });
            this.notify(state, 'legend');
        },
        setLegendCheckedState({ state }, { name, checked }) {
            const model = state.legend.data.find(({ label }) => label === name);
            model.checked = checked;
            this.notify(state, 'legend');
        },
        updateLegendColor({ state }) {
            var _a, _b, _c;
            const { legend: legendData, series, options } = state;
            const useSpectrumLegend = (_c = (_b = (_a = options) === null || _a === void 0 ? void 0 : _a.series) === null || _b === void 0 ? void 0 : _b.useColorValue, (_c !== null && _c !== void 0 ? _c : !!series.heatmap));
            const data = useSpectrumLegend
                ? legendData.data
                : getLegendDataAppliedTheme(legendData.data, series);
            extend(state.legend, { data });
        },
        updateLegendIcon({ state }) {
            const { legend: legendData, series } = state;
            const data = legendData.data.reduce((acc, cur) => {
                var _a;
                if (cur.chartType === 'scatter' && ((_a = series.scatter) === null || _a === void 0 ? void 0 : _a.data)) {
                    const model = series.scatter.data.find(({ name }) => name === cur.label);
                    const iconType = model ? model.iconType : cur.iconType;
                    return [...acc, Object.assign(Object.assign({}, cur), { iconType })];
                }
                return [...acc, cur];
            }, []);
            extend(state.legend, { data });
        },
        updateNestedPieChartLegend({ state }) {
            const { legend: legendData, nestedPieSeries } = state;
            extend(state.legend, {
                data: getLegendDataAppliedTheme(legendData.data, nestedPieSeries),
            });
        },
    },
    observe: {
        updateLegendLayout() {
            this.dispatch('setLegendLayout');
        },
    },
};
export default legend;
