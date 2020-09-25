import { StoreModule } from '@t/store/store';
import { Size } from '@t/options';

const root: StoreModule = {
  name: 'root',
  // 파라메터로 data 초기 데이터도 받아야 한다.
  state: ({ options }) => ({
    chart: { width: 0, height: 0, ...options.chart },
    options,
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
          '#64e38b',
          '#e3b664',
          '#fB826e',
          '#64e3C2',
          '#f66efb',
          '#e3cd64',
          '#82e364',
          '#8570ff',
          '#e39e64',
          '#fa5643',
          '#7a4b46',
          '#81b1c7',
          '#257a6c',
          '#58527a',
          '#fbb0b0',
          '#c7c7c7',
        ],
        startColor: '#ffe98a',
        endColor: '#d74177',
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
