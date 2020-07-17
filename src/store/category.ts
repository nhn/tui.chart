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
  state: () => ({
    categories: [],
  }),
  action: {
    setCategory({ state }) {
      const { rawCategories, zoomRange } = state;
      const [start, end] = zoomRange;

      state.categories = rawCategories.slice(start, end + 1);

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
