import { StoreModule, Options } from '@t/store/store';
import { Size, ResponsiveObjectType } from '@t/options';
import { deepCopy, isUndefined, deepMergedCopy } from '@src/helpers/utils';

function getOptionsBySize(size: Size, options: Options): Options {
  const rules = (options.responsive as ResponsiveObjectType)?.rules;

  return Array.isArray(rules)
    ? rules.reduce((acc, cur) => {
        return cur.condition(size) ? deepMergedCopy(acc, cur.options) : acc;
      }, options)
    : options;
}

export function useResponsive(options: Options) {
  return isUndefined(options?.responsive) ? true : !!options?.responsive;
}

const optionsData: StoreModule = {
  name: 'options',
  state: ({ options }) => ({
    originalOptions: deepCopy(options),
    options,
  }),
  action: {
    setOptions({ state }) {
      if (!useResponsive(state.options)) {
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
