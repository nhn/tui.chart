import { SelectSeriesInfo } from '@t/charts';
import { BoxTypeEventDetectType, LineTypeEventDetectType } from '@t/options';
import { isNumber, isUndefined } from '@src/helpers/utils';
import { Series } from '@t/store/store';

export function isAvailableShowTooltipInfo(
  info: SelectSeriesInfo,
  eventDetectType: LineTypeEventDetectType | BoxTypeEventDetectType,
  targetChartType: 'area' | 'line' | 'column' | 'radialBar'
) {
  const { index, seriesIndex, chartType } = info;

  return (
    isNumber(index) &&
    (eventDetectType === 'grouped' || isNumber(seriesIndex)) &&
    (isUndefined(chartType) || chartType === targetChartType)
  );
}

export function isAvailableSelectSeries(
  info: SelectSeriesInfo,
  targetChartType: 'area' | 'line' | 'column' | 'scatter'
) {
  const { index, seriesIndex, chartType } = info;

  return (
    isNumber(index) &&
    isNumber(seriesIndex) &&
    (isUndefined(chartType) || chartType === targetChartType)
  );
}

export function isNoData(series: Series) {
  return Object.keys(series).reduce(
    (acc, chartType) => !series[chartType].data.length && acc,
    true
  );
}
