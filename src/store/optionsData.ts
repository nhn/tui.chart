import { StoreModule, Options } from '@t/store/store';
import { Size, ResponsiveObjectType } from '@t/options';
import { deepCopy, isUndefined } from '@src/helpers/utils';

function getOptionsBySize(size: Size, options: Options): Options {
  return Array.isArray((options.responsive as ResponsiveObjectType)?.rules)
    ? (options.responsive as ResponsiveObjectType).rules!.reduce((acc, cur) => {
        if (cur.condition(size)) {
          return { ...acc, ...cur.options };
        }

        return acc;
      }, options)
    : options;
}

export function useResponsive(options: Options) {
  return isUndefined(options?.responsive) ? true : !!options?.responsive;
}

const optionsData: StoreModule = {
  name: 'optionsData',
  state: ({ options }) => ({
    prevOptions: deepCopy(options),
    options,
  }),
  action: {
    setOptions({ state }) {
      if (!useResponsive(state.options)) {
        return;
      }

      const { width, height } = state.chart;

      if (!(width > 0 && height > 0)) {
        return;
      }

      const options = getOptionsBySize({ width, height }, state.prevOptions);

      state.options = options;
    },
  },
  observe: {
    updateOptions() {
      this.dispatch('setOptions');
    },
  },
};

export default optionsData;
