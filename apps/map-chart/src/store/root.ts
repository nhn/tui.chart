import { ActionParams, StoreModule } from '@t/store';
import { Size } from '@t/store';
import { isNumber } from '@toast-ui/shared';

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
  state: ({ options }) => ({
    chart: {
      ...options.chart,
      width: getInitialSize(options?.chart?.width),
      height: getInitialSize(options?.chart?.height),
    },
    options,
    container: {} as Size,
  }),
  action: {
    setChartSize({ state }: ActionParams, size: Size) {
      state.chart.width = size.width;
      state.chart.height = size.height;
      this.notify(state, 'chart');
    },
    initChartSize({ state }: ActionParams, containerEl: HTMLElement) {
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
