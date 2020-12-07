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
    applyResponsiveRules({ state }) {
      const { width, height } = state.chart;
      const rules = state.originalOptions?.responsive?.rules;

      if (!Array.isArray(rules) || width < 0 || height < 0) {
        return;
      }

      state.options = getOptionsBySize({ width, height }, state.originalOptions);
    },
    initOptions({ initStoreState, state }, options: Options) {
      initStoreState.options = options;
      state.originalOptions = deepCopy(options);
      const { width, height } = state.originalOptions.chart!;

      this.dispatch('setChartSize', { width, height });
    },
    updateOptions({ state, initStoreState }, options) {
      initStoreState.options = deepMergedCopy(initStoreState.options, options);
      state.originalOptions = deepMergedCopy(state.originalOptions, options);
      const {
        width: usingContainerWidth,
        height: usingContainerHeight,
      } = state.usingContainerSizeFlag;
      const width = usingContainerWidth
        ? state.container.width
        : state.originalOptions.chart!.width!;
      const height = usingContainerHeight
        ? state.container.height
        : state.originalOptions.chart!.height!;

      this.dispatch('setChartSize', { width, height });
      this.dispatch('initThemeState');
    },
  },
  observe: {
    updateOptions() {
      this.dispatch('applyResponsiveRules');
    },
  },
};

export default optionsData;
