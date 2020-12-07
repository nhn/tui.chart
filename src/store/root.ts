import { StoreModule } from '@t/store/store';
import { Size } from '@t/options';
import { getInitailSize, isAutoValue } from '@src/helpers/utils';

function initialSize(containerEl: HTMLElement, { width, height }: Size) {
  return {
    width: width === 0 ? containerEl.offsetWidth : width,
    height: height === 0 ? containerEl.offsetHeight : height,
  };
}

const root: StoreModule = {
  name: 'root',
  // 파라메터로 data 초기 데이터도 받아야 한다.
  state: ({ options }) => ({
    chart: {
      ...options.chart,
      width: getInitailSize(options?.chart?.width),
      height: getInitailSize(options?.chart?.height),
    },
    usingContainerSizeFlag: {
      width: isAutoValue(options?.chart?.width),
      height: isAutoValue(options?.chart?.height),
    },
    container: {} as Size,
  }),
  action: {
    setChartSize({ state }, size: Size) {
      state.chart.width = size.width;
      state.chart.height = size.height;
    },
    initChartSize({ state }, containerEl: HTMLElement) {
      const { width, height } = state.chart;

      if (width === 0 || height === 0) {
        if (containerEl.parentNode) {
          const size = initialSize(containerEl, { width, height });
          this.dispatch('setChartSize', size);
          this.dispatch('setContainerSize', size);
        } else {
          setTimeout(() => {
            const size = initialSize(containerEl, { width, height });
            this.dispatch('setChartSize', size);
            this.dispatch('setContainerSize', size);
          }, 0);
        }
      }
    },
    setContainerSize({ state }, size: Size) {
      state.container.width = size.width;
      state.container.height = size.height;
    },
    setUsingContainerSizeFlag({ state }, { width, height }: { width: boolean; height: boolean }) {
      state.usingContainerSizeFlag.width = width;
      state.usingContainerSizeFlag.height = height;
    },
  },
};

export default root;
