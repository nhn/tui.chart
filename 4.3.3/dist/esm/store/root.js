import { getInitialSize, isAutoValue } from "../helpers/utils";
function initialSize(containerEl, { width, height }) {
    return {
        width: width === 0 ? containerEl.offsetWidth : width,
        height: height === 0 ? containerEl.offsetHeight : height,
    };
}
const root = {
    name: 'root',
    state: ({ options }) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return ({
            chart: Object.assign(Object.assign({}, options.chart), { width: getInitialSize((_b = (_a = options) === null || _a === void 0 ? void 0 : _a.chart) === null || _b === void 0 ? void 0 : _b.width), height: getInitialSize((_d = (_c = options) === null || _c === void 0 ? void 0 : _c.chart) === null || _d === void 0 ? void 0 : _d.height) }),
            usingContainerSize: {
                width: isAutoValue((_f = (_e = options) === null || _e === void 0 ? void 0 : _e.chart) === null || _f === void 0 ? void 0 : _f.width),
                height: isAutoValue((_h = (_g = options) === null || _g === void 0 ? void 0 : _g.chart) === null || _h === void 0 ? void 0 : _h.height),
            },
            container: {},
        });
    },
    action: {
        setChartSize({ state }, size) {
            state.chart.width = size.width;
            state.chart.height = size.height;
            this.notify(state, 'chart');
        },
        initChartSize({ state }, containerEl) {
            const { width, height } = state.chart;
            if (width === 0 || height === 0) {
                if (containerEl.parentNode) {
                    this.dispatch('setChartSize', initialSize(containerEl, { width, height }));
                }
                else {
                    setTimeout(() => {
                        this.dispatch('setChartSize', initialSize(containerEl, { width, height }));
                    }, 0);
                }
            }
        },
        setUsingContainerSize({ state }, { width, height }) {
            state.usingContainerSize.width = width;
            state.usingContainerSize.height = height;
        },
    },
};
export default root;
