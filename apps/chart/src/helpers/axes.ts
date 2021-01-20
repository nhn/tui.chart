import { Options, Series, ChartOptionsUsingYAxis } from '@t/store/store';
import { LineTypeXAxisOptions, BulletChartOptions } from '@t/options';
import { Theme } from '@t/theme';
import { AxisType } from '@src/component/axis';
import { divisors } from '@src/helpers/calculator';
import { range } from '@src/helpers/utils';

interface IntervalInfo {
  blockCount: number;
  remainBlockCount: number;
  interval: number;
}

function makeAdjustingIntervalInfo(blockCount: number, axisWidth: number, blockSize: number) {
  let remainBlockCount;
  let newBlockCount = Math.floor(axisWidth / blockSize);
  let intervalInfo: IntervalInfo | null = null;
  const interval = newBlockCount ? Math.floor(blockCount / newBlockCount) : blockCount;

  if (interval > 1) {
    // remainBlockCount : remaining block count after filling new blocks
    // | | | | | | | | | | | |  - previous block interval
    // |     |     |     |      - new block interval
    //                   |*|*|  - remaining block
    remainBlockCount = blockCount - interval * newBlockCount;

    if (remainBlockCount >= interval) {
      newBlockCount += Math.floor(remainBlockCount / interval);
      remainBlockCount = remainBlockCount % interval;
    }

    intervalInfo = {
      blockCount: newBlockCount,
      remainBlockCount,
      interval,
    };
  }

  return intervalInfo;
}

export function getAutoAdjustingInterval(count: number, axisWidth: number) {
  const autoInterval = {
    MIN_WIDTH: 90,
    MAX_WIDTH: 121,
    STEP_SIZE: 5,
  };

  let candidates: IntervalInfo[] = [];
  divisors(count).forEach((interval) => {
    const intervalWidth = (interval / count) * axisWidth;
    if (intervalWidth >= autoInterval.MIN_WIDTH && intervalWidth <= autoInterval.MAX_WIDTH) {
      candidates.push({ interval, blockCount: Math.floor(count / interval), remainBlockCount: 0 });
    }
  });

  if (!candidates.length) {
    const blockSizeRange = range(
      autoInterval.MIN_WIDTH,
      autoInterval.MAX_WIDTH,
      autoInterval.STEP_SIZE
    );

    candidates = blockSizeRange.reduce<IntervalInfo[]>((acc, blockSize) => {
      const candidate = makeAdjustingIntervalInfo(count, axisWidth, blockSize);

      return candidate ? [...acc, candidate] : acc;
    }, []);
  }

  let tickInterval = 1;
  if (candidates.length) {
    const candidate = candidates.reduce(
      (acc, cur) => (cur.blockCount > acc.blockCount ? cur : acc),
      { blockCount: 0, interval: 1 }
    );

    tickInterval = candidate.interval;
  }

  return tickInterval;
}

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
