function findRootName(rawSeries, seriesIndex, parentName) {
    var _a, _b;
    const item = (_a = rawSeries.pie) === null || _a === void 0 ? void 0 : _a[seriesIndex].data.find(({ name }) => name === parentName);
    return ((_b = item) === null || _b === void 0 ? void 0 : _b.parentName) ? findRootName(rawSeries, seriesIndex - 1, item.parentName) : parentName;
}
const nestedPieSeriesData = {
    name: 'seriesData',
    state: () => ({
        nestedPieSeries: {},
    }),
    action: {
        setNestedPieSeriesData({ state, initStoreState }) {
            const { theme, disabledSeries } = state;
            const rawSeries = initStoreState.series;
            const newSeriesData = {};
            const colorMap = {};
            rawSeries.pie.forEach(({ name: alias, data }, seriesIndex) => {
                const { colors } = theme.series.pie[alias];
                const colorList = [];
                const originSeriesData = data.map((m, index) => {
                    var _a;
                    const { parentName, name: dataName } = m;
                    const color = parentName && seriesIndex ? colorMap[parentName] : (_a = colors) === null || _a === void 0 ? void 0 : _a[index];
                    colorList.push(color);
                    colorMap[dataName] = color;
                    const rootParentName = parentName && seriesIndex
                        ? findRootName(rawSeries, seriesIndex - 1, parentName)
                        : dataName;
                    return Object.assign(Object.assign({}, m), { data: m.data, rootParentName,
                        color });
                });
                newSeriesData[alias] = {
                    data: originSeriesData.filter(({ rootParentName }) => {
                        return !disabledSeries.includes(rootParentName);
                    }),
                    colors: colorList,
                };
            });
            state.nestedPieSeries = newSeriesData;
            this.dispatch('updateNestedPieChartLegend');
        },
    },
    observe: {
        updateNestedPieSeriesData() {
            this.dispatch('setNestedPieSeriesData');
        },
    },
};
export default nestedPieSeriesData;
