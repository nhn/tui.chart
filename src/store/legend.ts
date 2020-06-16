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

function getLegendNames(series: SeriesRaw) {
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
      names: getLegendNames(series),
      iconType: getIconType(series),
    },
  }),
};

export default legend;
