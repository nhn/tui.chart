import { StoreModule, RawSeries, Series, Categories } from '@t/store/store';
import { isNumber, sortCategories } from '@src/helpers/utils';
import { getCoordinateXValue } from '@src/helpers/coordinate';
import { isBulletSeries } from '@src/component/bulletSeries';

export function makeRawCategories(series: RawSeries | Series, categories?: Categories) {
  if (categories) {
    return categories;
  }

  const firstValues: Set<string | number> = new Set();

  Object.keys(series).forEach((key) => {
    if (key === 'pie') {
      return;
    }

    (series[key].data ?? series[key]).forEach(({ data, name }) => {
      if (Array.isArray(data)) {
        data.forEach((datum) => {
          const rawXValue = getCoordinateXValue(datum);

          firstValues.add(isNumber(rawXValue) ? rawXValue : rawXValue.toString());
        });
      } else if (isBulletSeries(key)) {
        firstValues.add(name);
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
    setCategory({ state, computed }) {
      const { viewRange } = computed;
      let categories = state.rawCategories;

      if (viewRange && Array.isArray(categories)) {
        const [start, end] = viewRange;
        categories = categories.slice(start, end + 1);
      }

      state.categories = categories;

      this.notify(state, 'categories');
    },
    initCategory({ initStoreState, state }) {
      const { zoomRange } = state;
      let categories = makeRawCategories(initStoreState.series);
      if (zoomRange && Array.isArray(categories)) {
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
