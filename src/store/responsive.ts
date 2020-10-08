import { StoreModule, Options, RawSeries, Series } from '@t/store/store';
import { Size } from '@t/options';
import { extend } from './store';
import { deepMergedCopy, deepCopy } from '@src/helpers/utils';

function getOptionsBySize(size: Size, options: Options) {
  return !Array.isArray(options.responsive)
    ? options
    : options.responsive.reduce((acc, cur) => {
        if (cur.condition(size)) {
          return { ...acc, ...cur.options };
        }

        return acc;
      }, {});
}

function initOptions(series: Series = {}) {
  return {
    chart: {
      title: '',
    },
    legend: {
      align: 'right',
      showCheckbox: true,
      visible: true,
    },
    circleLegend: { visible: !!series.bubble },
    exportMenu: { filename: 'toast-ui-chartdata', visible: true },
    xAxis: { title: '' },
    yAxis: { title: '' },
    series: { selectable: false, dataLabels: { visible: false } },
    responsive: true,
  };
}

const responsive: StoreModule = {
  name: 'responsive',
  state: ({ options }) => ({
    responsive: options.responsive ?? true,
    responsiveOptions: deepCopy(options),
  }),
  action: {
    setOptions({ state }) {
      if (!state.responsive) {
        return;
      }

      const { width, height } = state.chart;

      if (!(width > 0 && height > 0)) {
        return;
      }

      const { series, options } = state;
      const optionsBySize = getOptionsBySize({ width, height }, options);

      state.responsiveOptions = {
        ...initOptions(series),
        ...deepMergedCopy(options, optionsBySize),
      } as Options;
    },
  },
  observe: {
    updateOptions() {
      this.dispatch('setOptions');
    },
  },
};

export default responsive;
