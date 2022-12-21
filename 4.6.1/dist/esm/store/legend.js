import { isUndefined, sum, deepMergedCopy, range, isNumber } from "../helpers/utils";
import { getLegendItemHeight, LEGEND_CHECKBOX_SIZE, LEGEND_ICON_SIZE, LEGEND_ITEM_MARGIN_X, LEGEND_MARGIN_X, } from "../brushes/legend";
import { getTextWidth } from "../helpers/calculator";
import { isVerticalAlign, padding } from "./layout";
import { SPECTRUM_LEGEND_LABEL_HEIGHT, spectrumLegendBar, spectrumLegendTooltip, } from "../brushes/spectrumLegend";
import { hasNestedPieSeries } from "../helpers/pieSeries";
import { extend } from "./store";
import { getTitleFontString } from "../helpers/style";
import { makeDefaultTheme } from "../helpers/theme";
import { isNoData } from "../helpers/validation";
import { getIconType, getLegendAlign, showCheckbox, showCircleLegend, showLegend, } from "../helpers/legend";
const INITIAL_LEGEND_WIDTH = 100;
const INITIAL_CIRCLE_LEGEND_WIDTH = 150;
const COMPONENT_HEIGHT_EXCEPT_Y_AXIS = 100;
const ELLIPSIS_DOT_TEXT = '...';
const WIDEST_TEXT = 'W'; // The widest text width in Arial font.
const NUMBER_OF_BOTH_SIDES = 2;
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
        const totalHeight = legendWidths.length * itemHeight;
        isOverflow = chartHeight < totalHeight;
        legendHeight = isOverflow ? chartHeight : totalHeight;
    }
    return { legendHeight, isOverflow };
}
function getSpectrumLegendWidth(legendWidths, chartWidth, verticalAlign) {
    if (verticalAlign) {
        const labelAreaWidth = sum(legendWidths);
        return Math.max(chartWidth / 4, labelAreaWidth);
    }
    const spectrumAreaWidth = (spectrumLegendTooltip.PADDING + spectrumLegendBar.PADDING + padding.X) * NUMBER_OF_BOTH_SIDES +
        spectrumLegendTooltip.POINT_HEIGHT +
        spectrumLegendBar.HEIGHT;
    return Math.max(...legendWidths) + spectrumAreaWidth;
}
function getSpectrumLegendHeight(itemHeight, chartHeight, verticalAlign) {
    return verticalAlign
        ? SPECTRUM_LEGEND_LABEL_HEIGHT +
            spectrumLegendBar.PADDING * NUMBER_OF_BOTH_SIDES +
            spectrumLegendTooltip.POINT_HEIGHT +
            spectrumLegendTooltip.HEIGHT +
            padding.Y
        : (chartHeight * 3) / 4;
}
function getNormalLegendWidth(params) {
    const { initialWidth, legendWidths, checkbox, verticalAlign } = params;
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
    const { options, visible } = params;
    const legendOptions = (_a = options) === null || _a === void 0 ? void 0 : _a.legend;
    if (!visible) {
        return { legendWidth: 0, isOverflow: false };
    }
    if ((_b = legendOptions) === null || _b === void 0 ? void 0 : _b.width) {
        return { legendWidth: legendOptions.width, isOverflow: false };
    }
    return getNormalLegendWidth(params);
}
function getDefaultLegendSize(params) {
    const { verticalAlign, chart, itemHeight, initialWidth, circleLegendVisible } = params;
    const restAreaHeight = COMPONENT_HEIGHT_EXCEPT_Y_AXIS + (circleLegendVisible ? INITIAL_CIRCLE_LEGEND_WIDTH : 0); // rest area temporary value (yAxisTitle.height + xAxis.height + circleLegend.height)
    return verticalAlign
        ? { width: chart.width - padding.X * NUMBER_OF_BOTH_SIDES, height: itemHeight }
        : {
            width: initialWidth,
            height: chart.height - restAreaHeight,
        };
}
function getNestedPieLegendLabelsInfo(series, legendInfo) {
    const result = [];
    const maxTextLengthWithEllipsis = getMaxTextLengthWithEllipsis(legendInfo);
    series.pie.forEach(({ data }) => {
        data.forEach(({ name, parentName, visible }) => {
            if (!parentName) {
                const { width, viewLabel } = getViewLabelInfo(legendInfo, name, maxTextLengthWithEllipsis);
                result.push({
                    label: name,
                    type: 'pie',
                    checked: (visible !== null && visible !== void 0 ? visible : true),
                    viewLabel,
                    width,
                });
            }
        });
    });
    return result;
}
function getMaxTextLengthWithEllipsis(legendInfo) {
    var _a, _b;
    const { legendOptions, font, checkboxVisible } = legendInfo;
    const width = (_b = (_a = legendOptions) === null || _a === void 0 ? void 0 : _a.item) === null || _b === void 0 ? void 0 : _b.width;
    if (isUndefined(width)) {
        return;
    }
    const checkboxWidth = checkboxVisible ? LEGEND_CHECKBOX_SIZE + LEGEND_MARGIN_X : 0;
    const iconWidth = LEGEND_ICON_SIZE + LEGEND_MARGIN_X;
    const ellipsisDotWidth = getTextWidth(ELLIPSIS_DOT_TEXT, font);
    const widestTextWidth = getTextWidth(WIDEST_TEXT, font);
    const maxTextCount = Math.floor((width - ellipsisDotWidth - checkboxWidth - iconWidth) / widestTextWidth);
    return maxTextCount > 0 ? maxTextCount : 0;
}
function getViewLabelInfo(legendInfo, label, maxTextLength) {
    var _a, _b;
    const { checkboxVisible, useSpectrumLegend, font, legendOptions } = legendInfo;
    let viewLabel = label;
    const itemWidth = (_b = (_a = legendOptions) === null || _a === void 0 ? void 0 : _a.item) === null || _b === void 0 ? void 0 : _b.width;
    const itemWidthWithFullText = getItemWidth(viewLabel, checkboxVisible, useSpectrumLegend, font);
    if (isNumber(itemWidth) && isNumber(maxTextLength) && itemWidth < itemWidthWithFullText) {
        viewLabel = `${label.slice(0, maxTextLength)}${ELLIPSIS_DOT_TEXT}`;
    }
    return { viewLabel, width: (itemWidth !== null && itemWidth !== void 0 ? itemWidth : itemWidthWithFullText) };
}
function getLegendLabelsInfo(series, legendInfo, categories) {
    const maxTextLengthWithEllipsis = getMaxTextLengthWithEllipsis(legendInfo);
    let colorIndex = 0;
    return Object.keys(series).flatMap((type) => {
        const labelInfo = series[type].map(({ name, colorValue, visible, colorByCategories }) => {
            const label = colorValue ? colorValue : name;
            const currentColorIndex = colorIndex;
            const { width, viewLabel } = getViewLabelInfo(legendInfo, label, maxTextLengthWithEllipsis);
            colorIndex += colorByCategories ? categories.length : 1;
            return {
                label,
                type,
                colorByCategories: !!colorByCategories,
                colorIndex: currentColorIndex,
                checked: (visible !== null && visible !== void 0 ? visible : true),
                viewLabel,
                width,
            };
        });
        colorIndex += series[type].length - 1;
        return labelInfo;
    });
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
    const hasColorByCategories = data.some((legend) => legend.colorByCategories);
    return data.map((datum, idx) => {
        const { colorByCategories, colorIndex } = datum;
        const index = hasColorByCategories ? colorIndex || idx : idx;
        return Object.assign(Object.assign({}, datum), { color: colorByCategories ? '#aaa' : colors[index % colors.length] });
    });
}
function getLegendState(options, series, categories) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const useSpectrumLegend = (_c = (_b = (_a = options) === null || _a === void 0 ? void 0 : _a.series) === null || _b === void 0 ? void 0 : _b.useColorValue, (_c !== null && _c !== void 0 ? _c : !!series.heatmap));
    const useScatterChartIcon = !!((_d = series) === null || _d === void 0 ? void 0 : _d.scatter);
    const checkboxVisible = useSpectrumLegend
        ? false
        : showCheckbox(options);
    const defaultTheme = makeDefaultTheme(series, (_g = (_f = (_e = options) === null || _e === void 0 ? void 0 : _e.theme) === null || _f === void 0 ? void 0 : _f.chart) === null || _g === void 0 ? void 0 : _g.fontFamily);
    const font = getTitleFontString(deepMergedCopy(defaultTheme.legend.label, Object.assign({}, (_j = (_h = options.theme) === null || _h === void 0 ? void 0 : _h.legend) === null || _j === void 0 ? void 0 : _j.label)));
    const legendInfo = {
        checkboxVisible,
        font,
        useSpectrumLegend,
        legendOptions: options.legend,
    };
    const legendLabelsInfo = hasNestedPieSeries(series)
        ? getNestedPieLegendLabelsInfo(series, legendInfo)
        : getLegendLabelsInfo(series, legendInfo, categories);
    const data = legendLabelsInfo.map(({ label, type, checked, width, viewLabel, colorByCategories, colorIndex }) => ({
        label,
        active: true,
        checked,
        width,
        iconType: getIconType(type),
        chartType: type,
        rowIndex: 0,
        columnIndex: 0,
        viewLabel,
        colorByCategories,
        colorIndex,
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
    state: ({ options, series, categories }) => {
        return {
            legend: getLegendState(options, series, categories),
            circleLegend: {},
        };
    },
    action: {
        initLegendState({ state, initStoreState }) {
            extend(state.legend, getLegendState(initStoreState.options, initStoreState.series, initStoreState.categories));
        },
        setLegendLayout({ state }) {
            if (state.legend.useSpectrumLegend) {
                this.dispatch('setSpectrumLegendLayout');
            }
            else {
                this.dispatch('setNormalLegendLayout');
            }
        },
        setSpectrumLegendLayout({ state }) {
            const { legend: { data: legendData }, series, options, chart, theme, } = state;
            const align = getLegendAlign(options);
            const visible = showLegend(options, series);
            const verticalAlign = isVerticalAlign(align);
            const legendWidths = legendData.map(({ width }) => width);
            const itemHeight = getLegendItemHeight(theme.legend.label.fontSize);
            const width = getSpectrumLegendWidth(legendWidths, chart.width, verticalAlign);
            const height = getSpectrumLegendHeight(itemHeight, chart.height, verticalAlign);
            extend(state.legend, { visible, align, width, height });
        },
        setNormalLegendLayout({ state, initStoreState }) {
            const { legend: { data: legendData }, series, options, chart, theme, } = state;
            const align = getLegendAlign(options);
            const visible = showLegend(options, series);
            const checkbox = showCheckbox(options);
            const initialWidth = Math.min(chart.width / 5, INITIAL_LEGEND_WIDTH);
            const verticalAlign = isVerticalAlign(align);
            const isNestedPieChart = hasNestedPieSeries(initStoreState.series);
            const isScatterChart = !!series.scatter;
            const isBubbleChart = !!series.bubble;
            const circleLegendVisible = isBubbleChart
                ? showCircleLegend(options)
                : false;
            const legendWidths = legendData.map(({ width }) => width);
            const itemHeight = getLegendItemHeight(theme.legend.label.fontSize);
            const { legendWidth, legendHeight, rowCount, columnCount } = calculateLegendSize({
                initialWidth,
                legendWidths,
                options,
                verticalAlign,
                visible,
                checkbox,
                chart,
                itemHeight,
                circleLegendVisible,
            });
            setIndexToLegendData(legendData, rowCount, columnCount, legendWidths.length, verticalAlign);
            extend(state.legend, {
                visible,
                align,
                showCheckbox: checkbox,
                width: legendWidth,
                height: legendHeight,
            });
            if (isBubbleChart && circleLegendVisible) {
                this.dispatch('updateCircleLegendLayout', { legendWidth });
            }
            if (!isNestedPieChart && !isNoData(series)) {
                this.dispatch('updateLegendColor');
            }
            if (isScatterChart) {
                this.dispatch('updateLegendIcon');
            }
        },
        updateCircleLegendLayout({ state }, { legendWidth }) {
            const width = legendWidth === 0
                ? INITIAL_CIRCLE_LEGEND_WIDTH
                : Math.min(legendWidth, INITIAL_CIRCLE_LEGEND_WIDTH);
            const radius = Math.max((width - LEGEND_MARGIN_X) / 2, 0);
            extend(state.circleLegend, { visible: true, width, radius });
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
            const { legend: legendData, series } = state;
            const data = getLegendDataAppliedTheme(legendData.data, series);
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
