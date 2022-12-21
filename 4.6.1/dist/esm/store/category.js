import { isNull, isNumber, isUndefined, sortCategories } from "../helpers/utils";
import { getCoordinateXValue } from "../helpers/coordinate";
import { getDataInRange } from "../helpers/range";
export function makeRawCategories(series, categories) {
    if (categories) {
        return categories;
    }
    const firstValues = new Set();
    Object.keys(series).forEach((key) => {
        var _a;
        if (key === 'pie' || key === 'gauge') {
            return;
        }
        (_a = series[key].data, (_a !== null && _a !== void 0 ? _a : series[key])).forEach(({ data, name, visible }) => {
            if (Array.isArray(data)) {
                data.forEach((datum) => {
                    if (!isNull(datum)) {
                        const rawXValue = getCoordinateXValue(datum);
                        firstValues.add(isNumber(rawXValue) ? rawXValue : rawXValue.toString());
                    }
                });
            }
            else if ((key === 'bullet' && isUndefined(visible)) || visible) {
                firstValues.add(name);
            }
        });
    });
    return Array.from(firstValues)
        .sort(sortCategories)
        .map((category) => String(category));
}
const category = {
    name: 'category',
    state: ({ categories, series }) => ({
        categories: makeRawCategories(series, categories),
    }),
    action: {
        setCategory({ state, computed }) {
            const { viewRange } = computed;
            let categories = state.rawCategories;
            if (viewRange) {
                if (Array.isArray(categories)) {
                    categories = getDataInRange(categories, viewRange);
                }
                else {
                    categories = Object.assign(Object.assign({}, categories), { x: getDataInRange(categories.x, viewRange) });
                }
            }
            state.categories = categories;
            this.notify(state, 'categories');
        },
        initCategory({ initStoreState, state }) {
            const { zoomRange } = state;
            let categories = makeRawCategories(initStoreState.series);
            if (zoomRange && Array.isArray(categories)) {
                categories = getDataInRange(categories, zoomRange);
            }
            state.categories = categories;
            this.notify(state, 'categories');
        },
        removeCategoryByName({ state }, name) {
            const index = state.categories.findIndex((seriesName) => seriesName === name);
            state.categories.splice(index, 1);
            this.notify(state, 'axes');
        },
    },
    observe: {
        updateCategory() {
            this.dispatch('setCategory');
        },
    },
};
export default category;
