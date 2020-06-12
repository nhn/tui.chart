import { StoreModule } from '@t/store/store';
import { Size } from '@t/options';
import { deepMergedCopy } from '@src/helpers/utils';

const root: StoreModule = {
  name: 'root',
  // 파라메터로 data 초기 데이터도 받아야 한다.
  state: ({ options }) => ({
    chart: options.chart ?? { width: 0, height: 0 },
    options: deepMergedCopy(
      {
        legend: { visible: true },
      },
      options
    ),
    theme: {
      series: {
        colors: [
          '#00a9ff',
          '#ffb840',
          '#ff5a46',
          '#00bd9f',
          '#785fff',
          '#f28b8c',
          '#989486',
          '#516f7d',
          '#29dbe3',
          '#dddddd',
        ],
      },
    },
  }),
  action: {
    setChartSize({ state }, size: Size) {
      state.chart.width = size.width;
      state.chart.height = size.height;
    },
    initChartSize({ state }, containerEl: HTMLElement) {
      if (state.chart.width === 0 || state.chart.height === 0) {
        if (containerEl.parentNode) {
          this.dispatch('setChartSize', {
            width: containerEl.offsetWidth,
            height: containerEl.offsetHeight,
          });
        } else {
          setTimeout(() => {
            this.dispatch('setChartSize', {
              width: containerEl.offsetWidth,
              height: containerEl.offsetHeight,
            });
          }, 0);
        }
      }
    },
  },
};

export default root;
