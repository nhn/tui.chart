import { LegendIconType, Options, SeriesRaw, StoreModule } from '@t/store/store';
import { BubbleChartOptions } from '@t/options';
import { isUndefined } from '@src/helpers/utils';

export function showCircleLegend(options: BubbleChartOptions, isBubbleChart = false) {
  return isBubbleChart && options?.circleLegend?.visible;
}

function showLegend(options: Options, isBubbleChart = false) {
  const visible = isUndefined(options.legend?.visible) ? true : !!options.legend?.visible;

  return showCircleLegend(options, isBubbleChart) || visible;
}

function getLegendLabels(series: SeriesRaw) {
  return Object.keys(series).reduce((acc, type) => {
    const seriesName = series[type].map(({ name }) => name);

    return [...acc, ...seriesName];
  }, [] as string[]);
}

function getIconType(series: SeriesRaw): LegendIconType {
  if (series.bubble || series.scatter) {
    return 'circle';
  }

  // @TODO: ADD bullet chart
  if (series.bar || series.column || series.area) {
    return 'rect';
  }

  // @TODO: ADD radial chart
  if (series.line) {
    return 'line';
  }

  return 'spectrum';
}

const legend: StoreModule = {
  name: 'legend',
  state: ({ options, series }) => ({
    legend: {
      visible: showLegend(options, !!series.bubble),
      iconType: getIconType(series),
      data: getLegendLabels(series).map((label) => ({ label, active: true, checked: true })),
    },
  }),
  action: {
    setLegendActiveState({ state }, { name, active }) {
      const { data } = state.legend;
      const model = data.find(({ label }) => label === name)!;
      model.active = active;
      this.notify(state, 'legend');
    },
    setAllLegendActiveState({ state }, active: boolean) {
      state.legend.data.forEach((datum) => {
        datum.active = active;
      });
      this.notify(state, 'legend');
    },
    setLegendCheckedState({ state }, { name, checked }) {
      const model = state.legend.data.find(({ label }) => label === name)!;
      model.checked = checked;
      this.notify(state, 'legend');
    },
  },
};

export default legend;
