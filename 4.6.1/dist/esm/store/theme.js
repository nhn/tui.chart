import { deepMergedCopy, omit } from "../helpers/utils";
import { getNestedPieChartAliasNames, hasNestedPieSeries, hasOuterDataLabel, hasOuterPieSeriesName, } from "../helpers/pieSeries";
import { makeAxisTitleTheme, defaultSeriesTheme, getDefaultTheme } from "../helpers/theme";
function getCommonSeriesOptions(options, series, isNestedPieChart) {
    var _a, _b;
    const theme = (_a = options) === null || _a === void 0 ? void 0 : _a.theme;
    if (!((_b = theme) === null || _b === void 0 ? void 0 : _b.series)) {
        return {};
    }
    const seriesNames = isNestedPieChart ? getNestedPieChartAliasNames(series) : Object.keys(series);
    return seriesNames.reduce((acc, seriesName) => {
        delete acc[seriesName];
        return acc;
    }, Object.assign({}, theme.series));
}
function getThemeAppliedSecondaryYAxis(options) {
    var _a, _b, _c;
    const theme = Object.assign({}, options.theme);
    if (!Array.isArray(theme.yAxis)) {
        return theme;
    }
    const axisTitleTheme = makeAxisTitleTheme((_c = (_b = (_a = options) === null || _a === void 0 ? void 0 : _a.theme) === null || _b === void 0 ? void 0 : _b.chart) === null || _c === void 0 ? void 0 : _c.fontFamily);
    const yAxis = theme.yAxis.map((yAxisTheme) => deepMergedCopy({ title: Object.assign({}, axisTitleTheme) }, Object.assign({}, yAxisTheme)));
    return Object.assign(Object.assign({}, theme), { yAxis });
}
function getThemeOptionsWithSeriesName(options, series, commonSeriesOptions, isNestedPieChart) {
    var _a;
    const theme = getThemeAppliedSecondaryYAxis(options);
    if (!((_a = theme) === null || _a === void 0 ? void 0 : _a.series)) {
        return Object.assign({}, theme);
    }
    const seriesTheme = Object.assign(Object.assign({}, theme), { series: {} });
    const seriesNames = Object.keys(series);
    const isComboChart = seriesNames.length > 1;
    if (isNestedPieChart) {
        const aliasNames = getNestedPieChartAliasNames(series);
        seriesTheme.series = {
            pie: aliasNames.reduce((acc, aliasName) => {
                var _a;
                return (Object.assign(Object.assign({}, acc), { [aliasName]: deepMergedCopy((_a = theme.series) === null || _a === void 0 ? void 0 : _a[aliasName], omit(commonSeriesOptions, 'colors')) }));
            }, {}),
        };
    }
    else if (isComboChart) {
        seriesTheme.series = Object.assign({}, seriesNames.reduce((acc, seriesName) => {
            var _a;
            return (Object.assign(Object.assign({}, acc), { [seriesName]: deepMergedCopy((_a = theme.series) === null || _a === void 0 ? void 0 : _a[seriesName], omit(commonSeriesOptions, 'colors')) }));
        }, {}));
    }
    else {
        seriesTheme.series = {
            [seriesNames[0]]: theme.series,
        };
    }
    return seriesTheme;
}
function setColors(theme, series, commonSeriesOptions, isNestedPieChart, categories) {
    var _a, _b;
    let index = 0;
    const commonColorsOption = [
        ...(_b = (_a = commonSeriesOptions) === null || _a === void 0 ? void 0 : _a.colors, (_b !== null && _b !== void 0 ? _b : [])),
        ...defaultSeriesTheme.colors,
    ];
    const themeNames = isNestedPieChart ? getNestedPieChartAliasNames(series) : Object.keys(series);
    themeNames.forEach((name, idx) => {
        var _a;
        const themeSeries = series[name] || [];
        const filteredSeries = themeSeries.filter((chartSeries) => chartSeries.colorByCategories);
        const hasColorByCategories = filteredSeries.length > 0;
        let size;
        if (isNestedPieChart) {
            size = series.pie[idx].data.length;
        }
        else if (hasColorByCategories) {
            const rejectedSeries = themeSeries.filter((chartSeries) => !chartSeries.colorByCategories);
            size = rejectedSeries.length + categories.length;
        }
        else {
            size = series[name].length;
        }
        const target = isNestedPieChart ? theme.series.pie : theme.series;
        if (!((_a = target[name]) === null || _a === void 0 ? void 0 : _a.colors)) {
            target[name] = Object.assign(Object.assign({}, target[name]), { colors: commonColorsOption.slice(index, index + size) });
            index += size;
        }
    });
}
function setPlot(theme) {
    ['vertical', 'horizontal'].reduce((acc, cur) => {
        if (!acc[cur]) {
            acc[cur] = { lineColor: acc.lineColor };
        }
        return acc;
    }, theme.plot);
}
function checkAnchorPieSeriesOption(options, series, alias) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    return {
        hasOuterAnchor: !!series.pie && ((_d = (_c = (_b = (_a = options) === null || _a === void 0 ? void 0 : _a.series) === null || _b === void 0 ? void 0 : _b[alias]) === null || _c === void 0 ? void 0 : _c.dataLabels) === null || _d === void 0 ? void 0 : _d.anchor) === 'outer',
        hasOuterAnchorPieSeriesName: !!series.pie && ((_j = (_h = (_g = (_f = (_e = options) === null || _e === void 0 ? void 0 : _e.series) === null || _f === void 0 ? void 0 : _f[alias]) === null || _g === void 0 ? void 0 : _g.dataLabels) === null || _h === void 0 ? void 0 : _h.pieSeriesName) === null || _j === void 0 ? void 0 : _j.anchor) === 'outer',
    };
}
function getTheme(options, series, categories) {
    var _a, _b, _c;
    const isNestedPieChart = hasNestedPieSeries(series);
    const commonSeriesOptions = getCommonSeriesOptions(options, series, isNestedPieChart);
    let pieSeriesOuterAnchors = {
        hasOuterAnchor: hasOuterDataLabel(options, series),
        hasOuterAnchorPieSeriesName: hasOuterPieSeriesName(options, series),
    };
    if (isNestedPieChart) {
        const aliasNames = getNestedPieChartAliasNames(series);
        pieSeriesOuterAnchors = aliasNames.reduce((acc, cur) => (Object.assign(Object.assign({}, acc), { [cur]: checkAnchorPieSeriesOption(options, series, cur) })), {});
    }
    const globalFontFamily = (_c = (_b = (_a = options) === null || _a === void 0 ? void 0 : _a.theme) === null || _b === void 0 ? void 0 : _b.chart) === null || _c === void 0 ? void 0 : _c.fontFamily;
    const theme = deepMergedCopy(getDefaultTheme(series, pieSeriesOuterAnchors, globalFontFamily, isNestedPieChart), getThemeOptionsWithSeriesName(options, series, commonSeriesOptions, isNestedPieChart));
    if (!series.heatmap) {
        setColors(theme, series, commonSeriesOptions, isNestedPieChart, categories);
    }
    setPlot(theme);
    return theme;
}
const theme = {
    name: 'theme',
    state: ({ options, series, categories }) => ({
        theme: getTheme(options, series, categories),
    }),
    action: {
        initThemeState({ state, initStoreState }) {
            state.theme = getTheme(state.options, initStoreState.series, initStoreState.categories);
        },
    },
    observe: {
        updateTheme() {
            this.dispatch('initThemeState');
        },
    },
};
export default theme;
