import { StoreModule, SeriesRaw } from '@t/store/store';

import { sortCategories } from '@src/helpers/utils';

function makeCategories(series: SeriesRaw) {
  const categories: Set<string> = new Set();

  Object.keys(series).forEach((key) => {
    series[key].forEach(({ data }) => {
      if (Array.isArray(data)) {
        data.forEach((datum) => {
          categories.add(Array.isArray(datum) ? String(datum[0]) : String(datum.x));
        });
      }
    });
  });

  return Array.from(categories).sort(sortCategories);
}

const category: StoreModule = {
  name: 'category',
  state: ({ series, categories }) => ({
    categories: categories ? categories : makeCategories(series),
  }),
};

export default category;
