import { StoreModule, Options } from '@t/store/store';
import { Size } from '@t/options';
import { deepCopy, deepMergedCopy } from '@src/helpers/utils';

function getOptionsBySize(size: Size, options: Options): Options {
  const rules = options.responsive?.rules;

  return Array.isArray(rules)
    ? rules.reduce((acc, cur) => {
        return cur.condition(size) ? deepMergedCopy(acc, cur.options) : acc;
      }, options)
    : options;
}

const optionsData: StoreModule = {
  name: 'options',
  state: ({ options }) => ({
    originalOptions: deepCopy(options),
    options,
  }),
  action: {
    setOptions({ state }) {
      const rules = state.options.responsive?.rules;

      if (!Array.isArray(rules)) {
        return;
      }

      const { width, height } = state.chart;

      if (width < 0 || height < 0) {
        return;
      }

      state.options = getOptionsBySize({ width, height }, state.originalOptions);
    },
    updateOptions({ state, initStoreState }, options) {
      initStoreState.options = deepMergedCopy(initStoreState.options, options);
      state.originalOptions = deepMergedCopy(state.originalOptions, options);

      const width = state.originalOptions.chart!.width!;
      const height = state.originalOptions.chart!.height!;

      this.dispatch('setChartSize', { width, height });
      this.dispatch('initThemeState');
    },
  },
  observe: {
    updateOptions() {
      this.dispatch('setOptions');
    },
  },
};

export default optionsData;
