import { StoreModule } from '@t/store/store';
import { Size } from '@t/options';
import { utils } from '@toast-ui/shared';

const { isNumber } = utils;

function getInitialSize(size) {
  return isNumber(size) ? size : 0;
}

function initialSize(containerEl: HTMLElement, { width, height }: Size) {
  return {
    width: width === 0 ? containerEl.offsetWidth : width,
    height: height === 0 ? containerEl.offsetHeight : height,
  };
}

const root: StoreModule = {
  name: 'root',
  state: ({ options, series }) => ({
    chart: {
      ...options.chart,
      width: getInitialSize(options?.chart?.width),
      height: getInitialSize(options?.chart?.height),
    },
    series, // @Todo: 분리해야함
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
  },
};

export default root;
