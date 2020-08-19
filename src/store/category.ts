import { StoreModule, RawSeries, Series } from '@t/store/store';
import { isNumber, sortCategories } from '@src/helpers/utils';
import { getCoordinateXValue } from '@src/helpers/coordinate';

export function makeRawCategories(series: RawSeries | Series, categories?: string[]) {
  if (categories) {
    return categories;
  }

  const firstValues: Set<string | number> = new Set();

  Object.keys(series).forEach((key) => {
    (series[key].data ?? series[key]).forEach(({ data }) => {
      if (Array.isArray(data)) {
        data.forEach((datum) => {
          const rawXValue = getCoordinateXValue(datum);

          firstValues.add(isNumber(rawXValue) ? rawXValue : rawXValue.toString());
        });
      }
    });
  });

  return Array.from(firstValues)
    .sort(sortCategories)
    .map((category) => String(category));
}

const category: StoreModule = {
  name: 'category',
  state: ({ categories, series }) => ({
    categories: makeRawCategories(series, categories),
  }),
  action: {
    setCategory({ state }) {
      const { rawCategories, zoomRange } = state;
      let categories = rawCategories;

      if (zoomRange) {
        const [start, end] = zoomRange;
        categories = categories.slice(start, end + 1);
      }

      state.categories = categories;

      this.notify(state, 'categories');
    },
  },
  observe: {
    updateCategory() {
      this.dispatch('setCategory');
    },
  },
};

export default category;
