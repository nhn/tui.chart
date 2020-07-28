import { StoreModule, RawSeries, Options } from '@t/store/store';
import { isObject, sortCategories } from '@src/helpers/utils';
import { formatDate } from '@src/helpers/formatDate';

export function makeRawCategories(series: RawSeries, options: Options, categories?: string[]) {
  let categoriesArr, format;
  if (isObject(options?.xAxis?.date)) {
    format = options.xAxis?.date.format;
  }

  if (categories) {
    categoriesArr = categories;
  } else {
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

    categoriesArr = Array.from(firstValues).sort(sortCategories);
  }

  return categoriesArr.map((category) => {
    return format ? formatDate(format, new Date(category)) : category;
  });
}

const category: StoreModule = {
  name: 'category',
  state: ({ categories, series, options }) => ({
    categories: makeRawCategories(series, options, categories),
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
