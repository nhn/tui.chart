import { Options, Series } from '@t/store/store';
import { LineTypeXAxisOptions, BulletChartOptions } from '@t/options';

export function isLabelAxisOnYAxis(series: Series, options: Options) {
  return !!series.bar || (!!series.bullet && !(options as BulletChartOptions)?.series?.vertical);
}

export function hasBoxTypeSeries(series: Series) {
  return !!series.column || !!series.bar || !!series.boxPlot || !!series.bullet;
}

export function isPointOnColumn(series: Series, options: Options) {
  if (hasBoxTypeSeries(series)) {
    return true;
  }

  if (series.line || series.area) {
    return Boolean((options.xAxis as LineTypeXAxisOptions)?.pointOnColumn);
  }

  return false;
}

export function getAxisName(labelAxisOnYAxis: boolean) {
  return {
    valueAxisName: labelAxisOnYAxis ? 'xAxis' : 'yAxis',
    labelAxisName: labelAxisOnYAxis ? 'yAxis' : 'xAxis',
  };
}

export function getSizeKey(labelAxisOnYAxis: boolean) {
  return {
    valueSizeKey: labelAxisOnYAxis ? 'width' : 'height',
    labelSizeKey: labelAxisOnYAxis ? 'height' : 'width',
  };
}

export function getLimitOnAxis(labels: string[]) {
  const values = labels.map((label) => Number(label));

  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

function hasSecondaryYAxis(options: Options) {
  return Array.isArray(options?.yAxis) && options.yAxis.length === 2;
}

export function getYAxisOption(options: Options) {
  const hasSecondaryY = hasSecondaryYAxis(options);

  return {
    yAxis: hasSecondaryY ? options.yAxis![0] : options.yAxis,
    rightYAxis: hasSecondaryY ? options.yAxis![1] : null,
  };
}

export function getValidValueAxisName(options: Options, seriesName: string, valueAxisName: string) {
  const { rightYAxis } = getYAxisOption(options);

  return rightYAxis?.chartType === seriesName ? 'rightYAxis' : valueAxisName;
}
