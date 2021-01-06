import { StoreModule, Options, UsingContainerSize } from '@t/store/store';
import { Size, ChartSize } from '@t/options';
import { deepCopy, deepMergedCopy } from '@src/helpers/utils';

type OptionsParam = { options: Options; containerSize: Size };

function getOptionsBySize(size: Size, options: Options): Options {
  const rules = options.responsive?.rules;

  return Array.isArray(rules)
    ? rules.reduce((acc, cur) => {
        return cur.condition(size) ? deepMergedCopy(acc, cur.options) : acc;
      }, options)
    : options;
}

function getSize(
  usingContainerSize: UsingContainerSize,
  containerSize: Size,
  chartSize: ChartSize
) {
  const { width: usingContainerWidth, height: usingContainerHeight } = usingContainerSize;

  return {
    width: usingContainerWidth ? containerSize.width : chartSize?.width,
    height: usingContainerHeight ? containerSize.height : chartSize?.height,
  };
}

const optionsData: StoreModule = {
  name: 'options',
  state: ({ options }) => ({
    originalOptions: deepCopy(options),
    options,
  }),
  action: {
    setOptions({ state }) {
      const { width, height } = state.chart;

      if (width < 0 || height < 0) {
        return;
      }

      state.options = getOptionsBySize({ width, height }, state.originalOptions);
    },
    initOptions({ initStoreState, state }, { options, containerSize }: OptionsParam) {
      initStoreState.options = options;
      state.originalOptions = deepCopy(options);

      const { usingContainerSize, originalOptions } = state;
      const size = getSize(usingContainerSize, containerSize, {
        width: originalOptions.chart!.width!,
        height: originalOptions.chart!.height!,
      });

      this.dispatch('setChartSize', size);
    },
    updateOptions({ state, initStoreState }, { options, containerSize }: OptionsParam) {
      initStoreState.options = deepMergedCopy(initStoreState.options, options);
      state.originalOptions = deepMergedCopy(state.originalOptions, options);

      const { usingContainerSize, originalOptions } = state;
      const size = getSize(usingContainerSize, containerSize, {
        width: originalOptions.chart?.width,
        height: originalOptions.chart?.height,
      });

      this.dispatch('setChartSize', size);
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
