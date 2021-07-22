import {
  Options,
  Series,
  ChartOptionsUsingYAxis,
  Axes,
  ViewAxisLabel,
  RotationLabelData,
  InitAxisData,
  Layout,
  Categories,
  DefaultRadialAxisData,
  RadiusInfo,
  ScaleData,
} from '@t/store/store';
import { LineTypeXAxisOptions, BulletChartOptions, AxisTitle, Rect } from '@t/options';
import { Theme } from '@t/theme';
import { AxisType } from '@src/component/axis';
import {
  divisors,
  makeTickPixelPositions,
  getTextHeight,
  getTextWidth,
} from '@src/helpers/calculator';
import {
  range,
  isString,
  isUndefined,
  isNumber,
  calculateSizeWithPercentString,
  includes,
} from '@src/helpers/utils';
import {
  ANGLE_CANDIDATES,
  calculateRotatedWidth,
  calculateRotatedHeight,
} from '@src/helpers/geometric';
import { getDateFormat, formatDate } from '@src/helpers/formatDate';
import {
  calculateDegreeToRadian,
  DEGREE_360,
  DEGREE_0,
  initSectorOptions,
  getDefaultRadius,
} from '@src/helpers/sector';
import { DEFAULT_LABEL_TEXT } from '@src/brushes/label';
import { AxisDataParams } from '@src/store/axes';
import { getSemiCircleCenterY, getTotalAngle, isSemiCircle } from './pieSeries';
import { RadialAxisType } from '@src/store/radialAxes';

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

export function getAutoAdjustingInterval(count: number, axisWidth: number, categories?: string[]) {
  const autoInterval = {
    MIN_WIDTH: 90,
    MAX_WIDTH: 121,
    STEP_SIZE: 5,
  };
  const LABEL_MARGIN = 5;

  if (categories?.[0]) {
    const categoryMinWidth = getTextWidth(categories[0]);
    if (categoryMinWidth < axisWidth / count - LABEL_MARGIN) {
      return 1;
    }
  }

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

export function isLabelAxisOnYAxis({
  series,
  options,
  categories,
}: {
  series: Series;
  options?: Options;
  categories?: Categories;
}) {
  return (
    !!series.bar ||
    !!series.radialBar ||
    (!!series.gauge && Array.isArray(categories) && !categories.length) ||
    (!!series.bullet && !(options as BulletChartOptions)?.series?.vertical)
  );
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

export function isSeriesUsingRadialAxes(series: Series): boolean {
  return !!series.radar || !!series.radialBar || !!series.gauge;
}

function getAxisNameUsingRadialAxes(labelAxisOnYAxis: boolean) {
  return {
    valueAxisName: labelAxisOnYAxis ? 'circularAxis' : 'verticalAxis',
    labelAxisName: labelAxisOnYAxis ? 'verticalAxis' : 'circularAxis',
  };
}

export function getAxisName(labelAxisOnYAxis: boolean, series: Series) {
  return isSeriesUsingRadialAxes(series)
    ? getAxisNameUsingRadialAxes(labelAxisOnYAxis)
    : {
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

export function getValueAxisNames(options: Options, valueAxisName: string) {
  if (includes([AxisType.X, AxisType.CIRCULAR, AxisType.VERTICAL], valueAxisName)) {
    return [valueAxisName];
  }

  const optionsUsingYAxis = options as ChartOptionsUsingYAxis;
  const { yAxis, secondaryYAxis } = getYAxisOption(optionsUsingYAxis);

  return secondaryYAxis
    ? [yAxis.chartType, secondaryYAxis.chartType].map((seriesName, index) =>
        seriesName
          ? getValueAxisName(optionsUsingYAxis, seriesName, valueAxisName)
          : ['yAxis', 'secondaryYAxis'][index]
      )
    : [valueAxisName];
}

export function getAxisTheme(theme: Theme, name: string) {
  const { xAxis, yAxis, circularAxis } = theme;
  let axisTheme;

  if (name === AxisType.X) {
    axisTheme = xAxis;
  } else if (Array.isArray(yAxis)) {
    axisTheme = name === AxisType.Y ? yAxis[0] : yAxis[1];
  } else if (name === RadialAxisType.CIRCULAR) {
    axisTheme = circularAxis;
  } else {
    axisTheme = yAxis;
  }

  return axisTheme;
}

function getRotationDegree(
  distance: number,
  labelWidth: number,
  labelHeight: number,
  axisLayout: Rect
) {
  let degree = 0;

  ANGLE_CANDIDATES.every((angle) => {
    const compareWidth = calculateRotatedWidth(angle, labelWidth, labelHeight);
    degree = angle;

    return compareWidth > distance || compareWidth / 2 > axisLayout.x;
  });

  return distance < labelWidth || labelWidth / 2 > axisLayout.x ? degree : 0;
}

function hasYAxisMaxLabelLengthChanged(
  previousAxes: Axes,
  currentAxes: Axes,
  field: 'yAxis' | 'secondaryYAxis'
) {
  const prevYAxis = previousAxes[field];
  const yAxis = currentAxes[field];

  if (!prevYAxis && !yAxis) {
    return false;
  }

  return prevYAxis?.maxLabelWidth !== yAxis?.maxLabelWidth;
}

function hasYAxisTypeMaxLabelChanged(previousAxes: Axes, currentAxes: Axes): boolean {
  return (
    hasYAxisMaxLabelLengthChanged(previousAxes, currentAxes, 'yAxis') ||
    hasYAxisMaxLabelLengthChanged(previousAxes, currentAxes, 'secondaryYAxis')
  );
}

function hasXAxisSizeChanged(previousAxes: Axes, currentAxes: Axes): boolean {
  const { maxHeight: prevMaxHeight } = previousAxes.xAxis;
  const { maxHeight } = currentAxes.xAxis;

  return prevMaxHeight !== maxHeight;
}

export function hasAxesLayoutChanged(previousAxes: Axes, currentAxes: Axes) {
  return (
    hasYAxisTypeMaxLabelChanged(previousAxes, currentAxes) ||
    hasXAxisSizeChanged(previousAxes, currentAxes)
  );
}

export function getRotatableOption(options: Options) {
  return options?.xAxis?.label?.rotatable ?? true;
}

type ViewAxisLabelParam = {
  labels: string[];
  pointOnColumn?: boolean;
  labelDistance?: number;
  scale?: ScaleData;
  labelInterval: number;
  tickDistance: number;
  tickInterval: number;
  tickCount: number;
};

export function getViewAxisLabels(axisData: ViewAxisLabelParam, axisSize: number) {
  const {
    labels,
    pointOnColumn,
    labelDistance,
    tickDistance,
    labelInterval,
    tickInterval,
    tickCount,
    scale,
  } = axisData;

  let axisSizeAppliedRatio = axisSize;
  let additional = 0;
  let labelAdjustment = 0;

  if (scale) {
    const sizeRatio = scale?.sizeRatio ?? 1;
    const positionRatio = scale?.positionRatio ?? 0;
    axisSizeAppliedRatio = axisSize * sizeRatio;
    additional = axisSize * positionRatio;
  } else {
    const interval = labelInterval === tickInterval ? labelInterval : 1;
    labelAdjustment = pointOnColumn ? (labelDistance ?? tickDistance * interval) / 2 : 0;
  }

  const relativePositions = makeTickPixelPositions(axisSizeAppliedRatio, tickCount, additional);

  return labels.reduce<ViewAxisLabel[]>((acc, text, index) => {
    const offsetPos = relativePositions[index] + labelAdjustment;
    const needRender = !(index % labelInterval) && offsetPos <= axisSize;

    return needRender ? [...acc, { offsetPos, text }] : acc;
  }, []);
}

export function makeTitleOption(title?: AxisTitle) {
  if (isUndefined(title)) {
    return title;
  }

  const defaultOption = { text: '', offsetX: 0, offsetY: 0 };

  return isString(title) ? { ...defaultOption, text: title } : { ...defaultOption, ...title };
}

export function getAxisFormatter(options: ChartOptionsUsingYAxis, axisName: string) {
  const axisOptions = {
    ...getYAxisOption(options),
    xAxis: options.xAxis,
  };

  return axisOptions[axisName]?.label?.formatter ?? ((value) => value);
}

export function getLabelsAppliedFormatter(
  labels: string[],
  options: Options,
  dateType: boolean,
  axisName: string
) {
  const dateFormatter = getDateFormat(options?.[axisName]?.date);
  const formattedLabels =
    dateType && dateFormatter
      ? labels.map((label) => formatDate(dateFormatter, new Date(label)))
      : labels;
  const formatter = getAxisFormatter(options as ChartOptionsUsingYAxis, axisName);

  return formattedLabels.map((label, index) => formatter(label, { index, labels, axisName }));
}

export function makeRotationData(
  maxLabelWidth: number,
  maxLabelHeight: number,
  distance: number,
  rotatable: boolean,
  axisLayout: Rect
): Required<RotationLabelData> {
  const degree = getRotationDegree(distance, maxLabelWidth, maxLabelHeight, axisLayout);

  if (!rotatable || degree === 0) {
    return {
      needRotateLabel: false,
      radian: 0,
      rotationHeight: maxLabelHeight,
    };
  }

  return {
    needRotateLabel: degree > 0,
    radian: calculateDegreeToRadian(degree, 0),
    rotationHeight: calculateRotatedHeight(degree, maxLabelWidth, maxLabelHeight),
  };
}

export function getMaxLabelSize(labels: string[], xMargin: number, font = DEFAULT_LABEL_TEXT) {
  const maxLengthLabel = labels.reduce((acc, cur) => (acc.length > cur.length ? acc : cur), '');

  return {
    maxLabelWidth: getTextWidth(maxLengthLabel, font) + xMargin,
    maxLabelHeight: getTextHeight(maxLengthLabel, font),
  };
}

export function getLabelXMargin(axisName: string, options: Options) {
  if (axisName === 'xAxis') {
    return 0;
  }
  const axisOptions = getYAxisOption(options as ChartOptionsUsingYAxis);

  return Math.abs(axisOptions?.[axisName]?.label?.margin ?? 0);
}

export function getInitAxisIntervalData(isLabelAxis: boolean, params: AxisDataParams) {
  const { axis, categories, layout, isCoordinateTypeChart } = params;
  const tickInterval = axis?.tick?.interval;
  const labelInterval = axis?.label?.interval;
  const existIntervalOptions = isNumber(tickInterval) || isNumber(labelInterval);

  const needAdjustInterval =
    isLabelAxis &&
    !isNumber(axis?.scale?.stepSize) &&
    !params.shift &&
    !existIntervalOptions &&
    !isCoordinateTypeChart;

  const initTickInterval = needAdjustInterval ? getInitTickInterval(categories, layout) : 1;
  const initLabelInterval = needAdjustInterval ? initTickInterval : 1;

  const axisData: InitAxisData = {
    tickInterval: tickInterval ?? initTickInterval,
    labelInterval: labelInterval ?? initLabelInterval,
  };

  return axisData;
}

function getInitTickInterval(categories?: string[], layout?: Layout) {
  if (!categories || !layout) {
    return 1;
  }

  const { width } = layout.xAxis;
  const count = categories.length;

  return getAutoAdjustingInterval(count, width, categories);
}

export function getDefaultRadialAxisData(
  options: Options,
  plot: Rect,
  maxLabelWidth = 0,
  maxLabelHeight = 0,
  isLabelOnVerticalAxis = false
): DefaultRadialAxisData {
  const centerX = plot.width / 2;

  if (isLabelOnVerticalAxis) {
    const { startAngle, endAngle, clockwise } = initSectorOptions(options?.series);
    const isSemiCircular = isSemiCircle(clockwise, startAngle, endAngle);

    return {
      isSemiCircular,
      axisSize: getDefaultRadius(plot, isSemiCircular, maxLabelWidth, maxLabelHeight),
      centerX,
      centerY: isSemiCircular ? getSemiCircleCenterY(plot.height, clockwise) : plot.height / 2,
      totalAngle: getTotalAngle(clockwise, startAngle, endAngle),
      drawingStartAngle: startAngle,
      clockwise,
      startAngle,
      endAngle,
    };
  }

  return {
    isSemiCircular: false,
    axisSize: getDefaultRadius(plot, false, maxLabelWidth, maxLabelHeight),
    centerX,
    centerY: plot.height / 2,
    totalAngle: DEGREE_360,
    drawingStartAngle: DEGREE_0,
    clockwise: true,
    startAngle: DEGREE_0,
    endAngle: DEGREE_360,
  };
}

export function getRadiusInfo(
  axisSize: number,
  radiusRange?: { inner?: number | string; outer?: number | string },
  count = 1
): RadiusInfo {
  const innerRadius = calculateSizeWithPercentString(axisSize, radiusRange?.inner ?? 0);
  const outerRadius = calculateSizeWithPercentString(axisSize, radiusRange?.outer ?? axisSize);

  return {
    radiusRanges: makeTickPixelPositions(outerRadius - innerRadius, count, innerRadius)
      .splice(innerRadius === 0 ? 1 : 0, count)
      .reverse(),
    innerRadius,
    outerRadius,
  };
}

export function isDateType(options: Options, axisName: string) {
  return !!options[axisName]?.date;
}
