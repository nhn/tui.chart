import { StoreModule, RawSeries } from '@t/store/store';
import { sortCategories } from '@src/helpers/utils';

export function makeRawCategories(series: RawSeries, categories?: string[]) {
  if (categories) {
    return categories;
  }

  const firstValues: Set<string> = new Set();

  Object.keys(series).forEach((key) => {
    series[key].forEach(({ data }) => {
      if (Array.isArray(data)) {
        data.forEach((datum) => {
          firstValues.add(Array.isArray(datum) ? String(datum[0]) : String(datum.x));
        });
      }
    });
  });

  return Array.from(firstValues).sort(sortCategories);
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
        categories = rawCategories.slice(start, end + 1);
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
