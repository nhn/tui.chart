import { Options, Series, ChartOptionsUsingYAxis } from '@t/store/store';
import { LineTypeXAxisOptions, BulletChartOptions } from '@t/options';
import { Theme } from '@t/theme';
import { AxisType } from '@src/component/axis';

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

export function hasSecondaryYAxis(options: ChartOptionsUsingYAxis) {
  return Array.isArray(options?.yAxis) && options.yAxis.length === 2;
}

export function getYAxisOption(options: ChartOptionsUsingYAxis) {
  const secondaryYAxis = hasSecondaryYAxis(options);

  return {
    yAxis: secondaryYAxis ? options.yAxis![0] : options?.yAxis,
    secondaryYAxis: secondaryYAxis ? options.yAxis![1] : null,
  };
}

export function getValueAxisName(
  options: ChartOptionsUsingYAxis,
  seriesName: string,
  valueAxisName: string
) {
  const { secondaryYAxis } = getYAxisOption(options);

  return secondaryYAxis?.chartType === seriesName ? 'secondaryYAxis' : valueAxisName;
}

export function getValueAxisNames(options: ChartOptionsUsingYAxis, valueAxisName: string) {
  const { yAxis, secondaryYAxis } = getYAxisOption(options);

  return valueAxisName !== 'xAxis' && secondaryYAxis
    ? [yAxis.chartType, secondaryYAxis.chartType].map((seriesName, index) =>
        seriesName
          ? getValueAxisName(options, seriesName, valueAxisName)
          : ['yAxis', 'secondaryYAxis'][index]
      )
    : [valueAxisName];
}

export function getAxisTheme(theme: Theme, name: string) {
  const { xAxis, yAxis } = theme;
  let axisTheme;

  if (name === AxisType.X) {
    axisTheme = xAxis;
  } else if (Array.isArray(yAxis)) {
    axisTheme = name === AxisType.Y ? yAxis[0] : yAxis[1];
  } else {
    axisTheme = yAxis;
  }

  return axisTheme;
}
