import { SelectSeriesInfo } from '@src/charts/chart';
import { BoxTypeEventDetectType, LineTypeEventDetectType } from '@t/options';
import { isNumber, isUndefined } from '@src/helpers/utils';

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
