export function getActiveSeriesMap(legend) {
    return legend.data.reduce((acc, { active, label }) => (Object.assign(Object.assign({}, acc), { [label]: active })), {});
}
