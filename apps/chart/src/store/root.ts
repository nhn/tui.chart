import { StoreModule, UsingContainerSize } from '@t/store/store';
import { Size } from '@t/options';
import { getInitialSize, isAutoValue } from '@src/helpers/utils';

function initialSize(containerEl: HTMLElement, { width, height }: Size) {
  return {
    width: width === 0 ? containerEl.offsetWidth : width,
    height: height === 0 ? containerEl.offsetHeight : height,
  };
}

const root: StoreModule = {
  name: 'root',
  state: ({ options }) => ({
    chart: {
      ...options.chart,
      width: getInitialSize(options?.chart?.width),
      height: getInitialSize(options?.chart?.height),
    },
    usingContainerSize: {
      width: isAutoValue(options?.chart?.width),
      height: isAutoValue(options?.chart?.height),
    },
    container: {} as Size,
  }),
  action: {
    setChartSize({ state }, size: Size) {
      state.chart.width = size.width;
      state.chart.height = size.height;
      this.notify(state, 'chart');
    },
    initChartSize({ state }, containerEl: HTMLElement) {
      const { width, height } = state.chart;

      if (width === 0 || height === 0) {
        if (containerEl.parentNode) {
          this.dispatch('setChartSize', initialSize(containerEl, { width, height }));
        } else {
          setTimeout(() => {
            this.dispatch('setChartSize', initialSize(containerEl, { width, height }));
          }, 0);
        }
      }
    },
    setUsingContainerSize({ state }, { width, height }: UsingContainerSize) {
      state.usingContainerSize.width = width;
      state.usingContainerSize.height = height;
    },
  },
};

export default root;
