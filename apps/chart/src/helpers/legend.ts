import { ChartType, Legend, LegendIconType, Options, RawSeries, Series } from '@t/store/store';
import {
  Align,
  BubbleChartOptions,
  HeatmapChartOptions,
  TreemapChartOptions,
  TreemapChartSeriesOptions,
} from '@t/options';
import { includes, isUndefined } from '@src/helpers/utils';

export type OptionsWithNormalLegendType = Exclude<
  Options,
  TreemapChartOptions | HeatmapChartOptions
>;

export function getActiveSeriesMap(legend: Legend) {
  return legend.data.reduce((acc, { active, label }) => ({ ...acc, [label]: active }), {});
}

export function showCircleLegend(options: BubbleChartOptions) {
  return isUndefined(options?.circleLegend?.visible) ? true : !!options?.circleLegend?.visible;
}

export function showLegend(options: Options, series: Series | RawSeries) {
  if (series.treemap && !(options.series as TreemapChartSeriesOptions)?.useColorValue) {
    return false;
  }

  return isUndefined(options.legend?.visible) ? true : !!options.legend?.visible;
}

export function showCheckbox(options: OptionsWithNormalLegendType) {
  return isUndefined(options.legend?.showCheckbox) ? true : !!options.legend?.showCheckbox;
}

function useRectIcon(type: ChartType) {
  return includes(['bar', 'column', 'area', 'pie', 'boxPlot', 'bullet', 'radialBar'], type);
}

function useCircleIcon(type: ChartType) {
  return includes(['bubble', 'scatter'], type);
}

function useLineIcon(type: ChartType) {
  return includes(['line', 'radar'], type);
}

export function getIconType(type: ChartType): LegendIconType {
  let iconType: LegendIconType = 'spectrum';

  if (useCircleIcon(type)) {
    iconType = 'circle';
  } else if (useRectIcon(type)) {
    iconType = 'rect';
  } else if (useLineIcon(type)) {
    iconType = 'line';
  }

  return iconType;
}

export function getLegendAlign(options: Options) {
  return isUndefined(options.legend?.align) ? 'right' : (options.legend?.align as Align);
}
