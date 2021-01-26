import { isUndefined, sum, includes, deepMergedCopy, isNumber } from "../helpers/utils";
import { LEGEND_CHECKBOX_SIZE, LEGEND_ICON_SIZE, LEGEND_ITEM_MARGIN_X, LEGEND_MARGIN_X, } from "../brushes/legend";
import { getTextWidth } from "../helpers/calculator";
import { isVerticalAlign, padding } from "./layout";
import { spectrumLegendBar, spectrumLegendTooltip } from "../brushes/spectrumLegend";
import { hasNestedPieSeries } from "../helpers/pieSeries";
import { extend } from "./store";
import { getTitleFontString } from "../helpers/style";
import { makeDefaultTheme } from "../helpers/theme";
function calculateLegendWidth({ defaultWidth, legendWidths, useSpectrumLegend, options, align, visible, checkbox, }) {
    var _a, _b;
    const verticalAlign = isVerticalAlign(align);
    const legendOptions = (_a = options) === null || _a === void 0 ? void 0 : _a.legend;
    let legendWidth = defaultWidth;
    if (!visible) {
        return 0;
    }
    if ((_b = legendOptions) === null || _b === void 0 ? void 0 : _b.width) {
        return legendOptions.width;
    }
    if (useSpectrumLegend && verticalAlign) {
        const labelAreaWidth = sum(legendWidths);
        legendWidth = Math.max(getInitialWidth(options) / 4, labelAreaWidth);
    }
    else if (useSpectrumLegend && !verticalAlign) {
        const spectrumAreaWidth = spectrumLegendTooltip.PADDING * 2 +
            spectrumLegendBar.PADDING * 2 +
            spectrumLegendTooltip.POINT_HEIGHT +
            spectrumLegendBar.HEIGHT +
            padding.X * 2;
        legendWidth = Math.max(...legendWidths) + spectrumAreaWidth;
    }
    else if (!useSpectrumLegend && verticalAlign) {
        legendWidth = sum(legendWidths) + LEGEND_ITEM_MARGIN_X * (legendWidths.length - 1);
    }
    else {
        const labelAreaWidth = Math.max(...legendWidths);
        legendWidth =
            (checkbox ? LEGEND_CHECKBOX_SIZE + LEGEND_MARGIN_X : 0) +
                LEGEND_ICON_SIZE +
                LEGEND_MARGIN_X +
                Math.max(labelAreaWidth, legendWidth);
    }
    return legendWidth;
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
function getNestedPieLegendLabels(series) {
    const result = [];
    series.pie.forEach(({ data }) => {
        data.forEach(({ name, parentName }) => {
            if (!parentName) {
                result.push({
                    label: name,
                    type: 'pie',
                });
            }
        });
    });
    return result;
}
function getLegendLabels(series) {
    return Object.keys(series).flatMap((type) => series[type].map(({ name, colorValue }) => ({
        label: colorValue ? colorValue : name,
        type,
    })));
}
function useRectIcon(type) {
    return includes(['bar', 'column', 'area', 'pie', 'boxPlot', 'bullet'], type);
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
function getInitialWidth(options) {
    var _a;
    return isNumber((_a = options.chart) === null || _a === void 0 ? void 0 : _a.width) ? options.chart.width : 0;
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
    const legendLabels = hasNestedPieSeries(series)
        ? getNestedPieLegendLabels(series)
        : getLegendLabels(series);
    const data = legendLabels.map(({ label, type }) => ({
        label,
        active: true,
        checked: true,
        width: getItemWidth(label, checkboxVisible, useSpectrumLegend, font),
        iconType: getIconType(type),
        chartType: type,
    }));
    return {
        useSpectrumLegend,
        useScatterChartIcon,
        data,
    };
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
            const { legend: { data: legendData, useSpectrumLegend }, series, options, } = state;
            const align = getAlign(options);
            const visible = showLegend(options, series);
            const checkbox = showCheckbox(options);
            const initialWidth = Math.min(getInitialWidth(options) / 10, 150);
            const legendWidths = legendData.map(({ width }) => width);
            const legendWidth = calculateLegendWidth({
                defaultWidth: initialWidth,
                legendWidths,
                useSpectrumLegend,
                options,
                align,
                visible,
                checkbox,
            });
            const isNestedPieChart = hasNestedPieSeries(initStoreState.series);
            const isScatterChart = !!series.scatter;
            const circleLegendWidth = isVerticalAlign(align)
                ? initialWidth
                : Math.max(initialWidth, legendWidth);
            const circleLegendVisible = series.bubble
                ? showCircleLegend(options)
                : false;
            extend(state.legend, {
                visible,
                align,
                showCheckbox: checkbox,
                width: legendWidth,
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
