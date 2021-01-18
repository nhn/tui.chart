import {
  Axes,
  AxisData,
  CenterYAxisData,
  Options,
  RadialAxisData,
  ScaleData,
  Series,
  StoreModule,
  ValueEdge,
  ChartOptionsUsingYAxis,
  ChartState,
  LabelAxisData,
  ValueAxisData,
  InitAxisData,
  Layout,
  FilterAxisLabel,
} from '@t/store/store';
import {
  getAxisName,
  getSizeKey,
  hasBoxTypeSeries,
  isLabelAxisOnYAxis,
  isPointOnColumn,
  getYAxisOption,
  getAutoAdjustingInterval,
  getAxisTheme,
  getRotationDegree,
} from '@src/helpers/axes';
import {
  makeLabelsFromLimit,
  getTextHeight,
  getTextWidth,
  makeTickPixelPositions,
  getAxisLabelAnchorPoint,
} from '@src/helpers/calculator';
import {
  AxisTitle,
  BaseAxisOptions,
  BarTypeYAxisOption,
  BaseXAxisOptions,
  LineTypeXAxisOptions,
  BoxSeriesOptions,
  RangeDataType,
  Rect,
  DateOption,
  LineTypeSeriesOptions,
} from '@t/options';
import {
  deepMergedCopy,
  hasNegativeOnly,
  isNumber,
  isString,
  isUndefined,
  pickProperty,
} from '@src/helpers/utils';
import { formatDate, getDateFormat } from '@src/helpers/formatDate';
import { isZooming } from '@src/helpers/range';
import { DEFAULT_LABEL_TEXT } from '@src/brushes/label';
import { isCoordinateSeries } from '@src/helpers/coordinate';
import { AxisTheme } from '@t/theme';
import { getTitleFontString } from '@src/helpers/style';
import { AxisType } from '@src/component/axis';
import { calculateDegreeToRadian } from '@src/helpers/sector';
import { calculateRotatedWidth, calculateRotatedHeight } from '@src/helpers/geometric';

interface StateProp {
  scale: ScaleData;
  axisSize: number;
  options: Options;
  series: Series;
  theme: Required<AxisTheme>;
  centerYAxis?: Pick<CenterYAxisData, 'xAxisHalfSize'> | null;
  zoomRange?: RangeDataType<number>;
  initialAxisData: InitAxisData;
}

type ValueStateProp = StateProp & {
  categories: string[];
  rawCategories: string[];
  isCoordinateTypeChart: boolean;
};

type LabelAxisState = Omit<LabelAxisData, 'tickInterval' | 'labelInterval'>;
type ValueAxisState = Omit<ValueAxisData, 'tickInterval' | 'labelInterval'>;

type SecondaryYAxisParam = {
  state: ChartState<Options>;
  labelOnYAxis: boolean;
  valueAxisSize: number;
  labelAxisSize: number;
  labelAxisName: string;
  initialAxisData: InitAxisData;
  isCoordinateTypeChart: boolean;
};

interface AxisDataParams {
  axis?: BaseAxisOptions | BaseXAxisOptions | LineTypeXAxisOptions;
  categories?: string[];
  layout?: Layout;
  shift?: boolean;
  isCoordinateTypeChart?: boolean;
}

function getMaxLabelSize(labels: string[], font = DEFAULT_LABEL_TEXT) {
  const maxLengthLabel = labels.reduce((acc, cur) => (acc.length > cur.length ? acc : cur), '');
  const maxLabelHeight = getTextHeight(maxLengthLabel, font);

  return {
    maxLabelWidth: getTextWidth(maxLengthLabel, font),
    maxLabelHeight,
  };
}

export function isCenterYAxis(options: ChartOptionsUsingYAxis, isBar: boolean) {
  const diverging = !!pickProperty(options, ['series', 'diverging']);
  const alignCenter = (options.yAxis as BarTypeYAxisOption)?.align === 'center';

  return isBar && diverging && alignCenter;
}

function isDivergingBoxSeries(series: Series, options: Options) {
  return hasBoxTypeSeries(series) && !!(options.series as BoxSeriesOptions)?.diverging;
}

function getZeroPosition(
  limit: ValueEdge,
  axisSize: number,
  labelAxisOnYAxis: boolean,
  isDivergingSeries: boolean
) {
  const { min, max } = limit;
  const hasZeroValue = min <= 0 && max >= 0;

  if (!hasZeroValue || isDivergingSeries) {
    return null;
  }

  const position = ((0 - min) / (max - min)) * axisSize;

  return labelAxisOnYAxis ? position : axisSize - position;
}

export function makeFormattedCategory(categories: string[], date?: DateOption) {
  const format = getDateFormat(date);

  return categories.map((category) => (format ? formatDate(format, new Date(category)) : category));
}

type FilterLabelParam = {
  labels: string[];
  pointOnColumn?: boolean;
  labelDistance?: number;
  labelInterval: number;
  tickDistance: number;
  tickInterval: number;
  tickCount: number;
};

function filterLabels(axisData: FilterLabelParam, axisSize: number) {
  const {
    labels,
    pointOnColumn,
    labelDistance,
    tickDistance,
    labelInterval,
    tickInterval,
    tickCount,
  } = axisData;
  const relativePositions = makeTickPixelPositions(axisSize, tickCount);
  const interval = labelInterval === tickInterval ? labelInterval : 1;
  const labelAdjustment = pointOnColumn ? (labelDistance ?? tickDistance * interval) / 2 : 0;

  return labels.reduce<FilterAxisLabel[]>((acc, text, index) => {
    const offsetPos = relativePositions[index] + labelAdjustment;
    const needRender = !(index % labelInterval) && offsetPos <= axisSize;

    return needRender
      ? [
          ...acc,
          {
            offsetPos,
            text,
          },
        ]
      : acc;
  }, []);
}

function makeRotationData(axisData: LabelAxisData, distance: number, rotatable: boolean) {
  const { maxLabelWidth, maxLabelHeight } = axisData;
  const degree = getRotationDegree(distance, maxLabelWidth, maxLabelHeight);

  if (!rotatable || degree === 0) {
    return {
      needRotateLabel: false,
      radian: 0,
    };
  }

  const rotationWidth = calculateRotatedWidth(degree, maxLabelWidth, maxLabelHeight);
  const rotationHeight = calculateRotatedHeight(degree, maxLabelWidth, maxLabelHeight);

  return {
    needRotateLabel: degree > 0,
    radian: calculateDegreeToRadian(degree, 0),
    rotationWidth,
    rotationHeight,
  };
}

export function getLabelAxisData(stateProp: ValueStateProp): LabelAxisState {
  const {
    axisSize,
    categories,
    series,
    options,
    theme,
    scale,
    zoomRange,
    rawCategories,
    initialAxisData,
    isCoordinateTypeChart,
  } = stateProp;
  const pointOnColumn = isPointOnColumn(series, options);
  const labels =
    !isZooming(rawCategories, zoomRange) && isCoordinateTypeChart
      ? makeLabelsFromLimit(scale.limit, scale.stepSize, options)
      : makeFormattedCategory(categories, options?.xAxis?.date);

  const tickIntervalCount = categories.length - (pointOnColumn ? 0 : 1);
  const tickDistance = tickIntervalCount ? axisSize / tickIntervalCount : axisSize;
  const labelDistance = axisSize / (labels.length - (pointOnColumn ? 0 : 1));
  const tickCount = labels.length + (pointOnColumn ? 1 : 0);
  const filteredLabels = filterLabels(
    {
      labels,
      tickDistance,
      tickCount,
      ...initialAxisData,
    },
    axisSize
  );

  return {
    labels,
    filteredLabels,
    pointOnColumn,
    labelDistance,
    tickDistance,
    tickCount,
    isLabelAxis: true,
    ...initialAxisData,
    ...getMaxLabelSize(labels, getLabelFont(theme)),
  };
}

export function getValueAxisData(stateProp: StateProp): ValueAxisState {
  const { scale, axisSize, series, options, centerYAxis, initialAxisData, theme } = stateProp;
  const { limit, stepSize } = scale;
  const size = centerYAxis ? centerYAxis?.xAxisHalfSize : axisSize;
  const divergingBoxSeries = isDivergingBoxSeries(series, options);
  const zeroPosition = getZeroPosition(
    limit,
    axisSize,
    isLabelAxisOnYAxis(series, options),
    divergingBoxSeries
  );
  let valueLabels = makeLabelsFromLimit(limit, stepSize);

  if (!centerYAxis && divergingBoxSeries) {
    valueLabels = getDivergingValues(valueLabels);
  }

  const tickDistance = size / valueLabels.length;
  const tickCount = valueLabels.length;
  const filteredLabels = filterLabels(
    {
      labels: [...valueLabels].reverse(),
      tickDistance,
      tickCount,
      ...initialAxisData,
    },
    size
  );

  const axisData: ValueAxisState = {
    labels: valueLabels,
    filteredLabels,
    pointOnColumn: false,
    isLabelAxis: false,
    tickCount,
    tickDistance,
    ...initialAxisData,
    ...getMaxLabelSize(valueLabels, getLabelFont(theme)),
  };

  if (isNumber(zeroPosition)) {
    axisData.zeroPosition = zeroPosition;
  }

  return axisData;
}

function getDivergingValues(valueLabels) {
  return hasNegativeOnly(valueLabels)
    ? valueLabels.reverse().slice(1).concat(valueLabels)
    : valueLabels.slice(1).reverse().concat(valueLabels);
}

export function makeTitleOption(title?: AxisTitle) {
  if (isUndefined(title)) {
    return title;
  }

  const defaultOption = {
    text: '',
    offsetX: 0,
    offsetY: 0,
  };

  return isString(title)
    ? deepMergedCopy(defaultOption, { text: title })
    : deepMergedCopy(defaultOption, title);
}

function getRadialAxis(
  scale: ScaleData,
  plot: Rect,
  theme: Required<AxisTheme>,
  { labelInterval }: InitAxisData
): RadialAxisData {
  const { limit, stepSize } = scale;
  const { width, height } = plot;
  const valueLabels = makeLabelsFromLimit(limit, stepSize);

  return {
    labels: valueLabels,
    axisSize: Math.min(width, height) / 2 - 50,
    centerX: width / 2,
    centerY: height / 2,
    labelInterval,
    ...getMaxLabelSize(valueLabels, getLabelFont(theme)),
  };
}

export function getInitTickInterval(categories?: string[], layout?: Layout) {
  if (!categories || !layout) {
    return 1;
  }

  const { width } = layout.xAxis;
  const count = categories.length;

  return getAutoAdjustingInterval(count, width);
}

function getInitAxisIntervalData(isLabelAxis: boolean, params: AxisDataParams) {
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

function makeDefaultAxisData(isLabelAxis: boolean, params: AxisDataParams): InitAxisData {
  const axisData = getInitAxisIntervalData(isLabelAxis, params);
  const title = makeTitleOption(params?.axis?.title);

  if (title) {
    axisData.title = title;
  }

  return axisData;
}

function getInitialAxisData(
  options: Options,
  labelOnYAxis: boolean,
  categories: string[],
  layout: Layout,
  isCoordinateTypeChart: boolean
) {
  const { yAxis, secondaryYAxis } = getYAxisOption(options);
  const shift = (options?.series as LineTypeSeriesOptions)?.shift;

  return {
    xAxis: makeDefaultAxisData(!labelOnYAxis, {
      categories,
      axis: options?.xAxis,
      layout,
      shift,
      isCoordinateTypeChart,
    }),
    yAxis: makeDefaultAxisData(labelOnYAxis, { axis: yAxis }),
    secondaryYAxis: secondaryYAxis
      ? makeDefaultAxisData(labelOnYAxis, { axis: secondaryYAxis })
      : null,
  };
}

function getSecondaryYAxisData({
  state,
  labelOnYAxis,
  valueAxisSize,
  labelAxisSize,
  labelAxisName,
  initialAxisData,
  isCoordinateTypeChart,
}: SecondaryYAxisParam): LabelAxisState | ValueAxisState {
  const { scale, options, series, zoomRange, theme } = state;
  const categories = state.categories as string[];
  const rawCategories = state.rawCategories as string[];

  return labelOnYAxis
    ? getLabelAxisData({
        scale: scale[labelAxisName],
        axisSize: labelAxisSize,
        categories: getYAxisOption(options).secondaryYAxis?.categories ?? categories,
        rawCategories,
        options,
        series,
        theme: getAxisTheme(theme, AxisType.SECONDARY_Y),
        zoomRange,
        initialAxisData,
        isCoordinateTypeChart,
      })
    : getValueAxisData({
        scale: scale.secondaryYAxis!,
        axisSize: valueAxisSize,
        options,
        series,
        theme: getAxisTheme(theme, AxisType.SECONDARY_Y),
        centerYAxis: null,
        initialAxisData,
      });
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

function hasAxesLayoutChanged(previousAxes: Axes, currentAxes: Axes) {
  return (
    hasYAxisTypeMaxLabelChanged(previousAxes, currentAxes) ||
    hasXAxisSizeChanged(previousAxes, currentAxes)
  );
}

function getLabelFont(theme: Required<AxisTheme>) {
  return getTitleFontString(theme.label);
}

function getAdditionalLabelWidth(axisData, rotationData) {
  const { pointOnColumn, maxLabelWidth, tickDistance } = axisData;
  const { needRotateLabel, rotationWidth } = rotationData;

  let width = 0;

  if (pointOnColumn) {
    if (needRotateLabel) {
      width += (tickDistance + rotationWidth) / 2;
    } else {
      width += (tickDistance + maxLabelWidth) / 2;
    }
  } else if (needRotateLabel) {
    width += rotationWidth;
  } else {
    width += maxLabelWidth / 2;
  }

  return width;
}

function getXAxisMaxWidth(axisData, rotationData) {
  const { labels, tickDistance } = axisData;

  return tickDistance * (labels.length - 1) + getAdditionalLabelWidth(axisData, rotationData);
}

function makeXAxisData({ axisData, axisSize, centerYAxis, rotatable }): AxisData {
  const { filteredLabels, pointOnColumn, maxLabelHeight } = axisData;
  const offsetY = getAxisLabelAnchorPoint(maxLabelHeight);
  const size = centerYAxis ? centerYAxis.xAxisHalfSize : axisSize;
  const distance = size / (filteredLabels.length - (pointOnColumn ? 0 : 1));
  const rotationData = makeRotationData(axisData, distance, rotatable);
  const { needRotateLabel, rotationHeight } = rotationData;
  const maxWidth = getXAxisMaxWidth(axisData, rotationData);
  const maxHeight = (needRotateLabel ? rotationHeight : maxLabelHeight) + offsetY;

  return {
    ...axisData,
    ...rotationData,
    maxWidth,
    maxHeight,
    offsetY,
  };
}

function getRotatableOption(options: Options) {
  return options?.xAxis?.label?.rotatable ?? true;
}

const axes: StoreModule = {
  name: 'axes',
  state: ({ series, options }) => {
    const { secondaryYAxis } = getYAxisOption(options);
    const axesState: Axes = {
      xAxis: {} as AxisData,
      yAxis: {} as AxisData,
    };

    if (isCenterYAxis(options, !!series.bar)) {
      axesState.centerYAxis = {} as CenterYAxisData;
    }

    if (series.radar) {
      axesState.radialAxis = {} as RadialAxisData;
    }

    if (secondaryYAxis) {
      axesState.secondaryYAxis = {} as AxisData;
    }

    return {
      axes: axesState,
    };
  },
  action: {
    setAxesData({ state }) {
      const { scale, options, series, layout, zoomRange, theme } = state;
      const { xAxis, yAxis, plot } = layout;

      const labelOnYAxis = isLabelAxisOnYAxis(series, options);
      const categories = (state.categories as string[]) ?? [];
      const rawCategories = (state.rawCategories as string[]) ?? [];

      const { valueAxisName, labelAxisName } = getAxisName(labelOnYAxis);
      const { valueSizeKey, labelSizeKey } = getSizeKey(labelOnYAxis);
      const valueAxisSize = plot[valueSizeKey];
      const labelAxisSize = plot[labelSizeKey];
      const hasCenterYAxis = state.axes.centerYAxis;
      const isCoordinateTypeChart = isCoordinateSeries(series);

      const initialAxisData = getInitialAxisData(
        options,
        labelOnYAxis,
        rawCategories,
        layout,
        isCoordinateTypeChart
      );

      const valueAxisData = getValueAxisData({
        scale: scale[valueAxisName],
        axisSize: valueAxisSize,
        options,
        series,
        theme: getAxisTheme(theme, valueAxisName),
        centerYAxis: hasCenterYAxis
          ? {
              xAxisHalfSize: (xAxis.width - yAxis.width) / 2,
            }
          : null,
        initialAxisData: initialAxisData[valueAxisName],
      });

      const labelAxisData = getLabelAxisData({
        scale: scale[labelAxisName],
        axisSize: labelAxisSize,
        categories,
        rawCategories,
        options,
        series,
        theme: getAxisTheme(theme, labelAxisName),
        zoomRange,
        initialAxisData: initialAxisData[labelAxisName],
        isCoordinateTypeChart,
      });

      let secondaryYAxis, centerYAxis, radialAxis;

      if (state.axes.secondaryYAxis) {
        secondaryYAxis = getSecondaryYAxisData({
          state,
          labelOnYAxis,
          valueAxisSize,
          labelAxisSize,
          labelAxisName,
          initialAxisData: initialAxisData.secondaryYAxis!,
          isCoordinateTypeChart,
        }) as AxisData;
      }

      if (hasCenterYAxis) {
        const xAxisHalfSize = (xAxis.width - yAxis.width) / 2;
        centerYAxis = deepMergedCopy(valueAxisData, {
          x: xAxis.x + xAxisHalfSize,
          xAxisHalfSize,
          secondStartX: (xAxis.width + yAxis.width) / 2,
          yAxisLabelAnchorPoint: yAxis.width / 2,
          yAxisHeight: yAxis.height,
        }) as CenterYAxisData;
      }

      if (state.axes.radialAxis) {
        radialAxis = getRadialAxis(
          scale[valueAxisName],
          plot,
          getAxisTheme(theme, valueAxisName),
          initialAxisData.yAxis
        );
      }
      const rotatable = getRotatableOption(options);
      const axesState = {
        xAxis: makeXAxisData(
          labelOnYAxis
            ? { axisData: valueAxisData, axisSize: valueAxisSize, centerYAxis, rotatable }
            : { axisData: labelAxisData, axisSize: labelAxisSize, centerYAxis, rotatable }
        ),
        yAxis: labelOnYAxis ? labelAxisData : valueAxisData,
        secondaryYAxis,
        centerYAxis,
        radialAxis,
      } as Axes;

      if (hasAxesLayoutChanged(state.axes, axesState)) {
        this.notify(state, 'layout');
      }

      state.axes = axesState;
    },
  },
  computed: {},
  observe: {
    updateAxes() {
      this.dispatch('setAxesData');
    },
  },
};

export default axes;
