import { deepCopy, deepMergedCopy } from "../helpers/utils";
function getOptionsBySize(size, options) {
    var _a;
    const rules = (_a = options.responsive) === null || _a === void 0 ? void 0 : _a.rules;
    return Array.isArray(rules)
        ? rules.reduce((acc, cur) => {
            return cur.condition(size) ? deepMergedCopy(acc, cur.options) : acc;
        }, options)
        : options;
}
function getSize(usingContainerSize, containerSize, chartSize) {
    var _a, _b;
    const { width: usingContainerWidth, height: usingContainerHeight } = usingContainerSize;
    return {
        width: usingContainerWidth ? containerSize.width : (_a = chartSize) === null || _a === void 0 ? void 0 : _a.width,
        height: usingContainerHeight ? containerSize.height : (_b = chartSize) === null || _b === void 0 ? void 0 : _b.height,
    };
}
const optionsData = {
    name: 'options',
    state: ({ options }) => ({
        originalOptions: deepCopy(options),
        options,
    }),
    action: {
        setOptions({ state }) {
            const { width, height } = state.chart;
            if (width < 0 || height < 0) {
                return;
            }
            state.options = getOptionsBySize({ width, height }, state.originalOptions);
        },
        initOptions({ initStoreState, state }, { options, containerSize }) {
            initStoreState.options = options;
            state.originalOptions = deepCopy(options);
            const { usingContainerSize, originalOptions } = state;
            const size = getSize(usingContainerSize, containerSize, {
                width: originalOptions.chart.width,
                height: originalOptions.chart.height,
            });
            this.dispatch('setChartSize', size);
        },
        updateOptions({ state, initStoreState }, { options, containerSize }) {
            var _a, _b;
            initStoreState.options = deepMergedCopy(initStoreState.options, options);
            state.originalOptions = deepMergedCopy(state.originalOptions, options);
            const { usingContainerSize, originalOptions } = state;
            const size = getSize(usingContainerSize, containerSize, {
                width: (_a = originalOptions.chart) === null || _a === void 0 ? void 0 : _a.width,
                height: (_b = originalOptions.chart) === null || _b === void 0 ? void 0 : _b.height,
            });
            this.dispatch('setChartSize', size);
            this.dispatch('initThemeState');
        },
    },
    observe: {
        updateOptions() {
            this.dispatch('setOptions');
        },
    },
};
export default optionsData;
