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
} from '@t/store/store';
import {
  getAxisName,
  getSizeKey,
  hasBoxTypeSeries,
  isLabelAxisOnYAxis,
  isPointOnColumn,
  getYAxisOption,
  getAutoAdjustingInterval,
} from '@src/helpers/axes';
import {
  makeLabelsFromLimit,
  getTextHeight,
  getMaxLengthLabelWidth,
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

interface StateProp {
  scale: ScaleData;
  axisSize: number;
  options: Options;
  series: Series;
  centerYAxis?: Pick<CenterYAxisData, 'xAxisHalfSize'> | null;
  zoomRange?: RangeDataType<number>;
  initialAxisData: InitAxisData;
  axisName: string;
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
  valueAxisName: string;
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

export function getLabelAxisData(stateProp: ValueStateProp): LabelAxisState {
  const {
    axisSize,
    categories,
    series,
    options,
    scale,
    zoomRange,
    rawCategories,
    initialAxisData,
    isCoordinateTypeChart,
    axisName,
  } = stateProp;
  const pointOnColumn = isPointOnColumn(series, options);
  const labels =
    !isZooming(rawCategories, zoomRange) && isCoordinateTypeChart
      ? makeLabelsFromLimit(scale.limit, scale.stepSize, options)
      : makeFormattedCategory(categories, options?.xAxis?.date);

  const tickIntervalCount = categories.length - (pointOnColumn ? 0 : 1);
  const tickDistance = tickIntervalCount ? axisSize / tickIntervalCount : axisSize;
  const labelDistance = axisSize / (labels.length - (pointOnColumn ? 0 : 1));
  const formatter = options[axisName]?.formatter ?? ((value) => value);

  return {
    labels: labels.map((label) => formatter(label)),
    pointOnColumn,
    isLabelAxis: true,
    tickCount: labels.length + (pointOnColumn ? 1 : 0),
    tickDistance,
    labelDistance,
    ...initialAxisData,
    maxLabelWidth: getMaxLengthLabelWidth(labels),
  };
}

export function getValueAxisData(stateProp: StateProp): ValueAxisState {
  const { scale, axisSize, series, options, centerYAxis, initialAxisData, axisName } = stateProp;
  const { limit, stepSize } = scale;
  const size = centerYAxis ? centerYAxis?.xAxisHalfSize : axisSize;
  const divergingBoxSeries = isDivergingBoxSeries(series, options);
  const formatter = options[axisName]?.formatter ?? ((value) => value);
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

  const axisData: ValueAxisState = {
    labels: valueLabels.map((label) => formatter(label)),
    pointOnColumn: false,
    isLabelAxis: false,
    tickCount: valueLabels.length,
    tickDistance: size / valueLabels.length,
    ...initialAxisData,
    maxLabelWidth: getMaxLengthLabelWidth(valueLabels),
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
    maxLabelTextWidth: getMaxLengthLabelWidth(valueLabels),
    labelTextHeight: getTextHeight(valueLabels[0], DEFAULT_LABEL_TEXT),
    labelInterval,
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
  valueAxisName,
  initialAxisData,
  isCoordinateTypeChart,
}: SecondaryYAxisParam): LabelAxisState | ValueAxisState {
  const { scale, options, series, zoomRange } = state;
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
        zoomRange,
        initialAxisData,
        isCoordinateTypeChart,
        axisName: labelAxisName,
      })
    : getValueAxisData({
        scale: scale.secondaryYAxis!,
        axisSize: valueAxisSize,
        options,
        series,
        centerYAxis: null,
        initialAxisData,
        axisName: valueAxisName,
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
      const { scale, options, series, layout, zoomRange } = state;
      const { xAxis, yAxis, plot } = layout;

      const labelOnYAxis = isLabelAxisOnYAxis(series, options);
      const categories = (state.categories as string[]) ?? [];
      const rawCategories = (state.rawCategories as string[]) ?? [];

      const { valueAxisName, labelAxisName } = getAxisName(labelOnYAxis);
      const { valueSizeKey, labelSizeKey } = getSizeKey(labelOnYAxis);
      const valueAxisSize = plot[valueSizeKey];
      const labelAxisSize = plot[labelSizeKey];
      const centerYAxis = state.axes.centerYAxis;
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
        centerYAxis: centerYAxis
          ? {
              xAxisHalfSize: (xAxis.width - yAxis.width) / 2,
            }
          : null,
        initialAxisData: initialAxisData[valueAxisName],
        axisName: valueAxisName,
      });

      const labelAxisData = getLabelAxisData({
        scale: scale[labelAxisName],
        axisSize: labelAxisSize,
        categories,
        rawCategories,
        options,
        series,
        zoomRange,
        initialAxisData: initialAxisData[labelAxisName],
        isCoordinateTypeChart,
        axisName: labelAxisName,
      });

      const axesState = {
        xAxis: labelOnYAxis ? valueAxisData : labelAxisData,
        yAxis: labelOnYAxis ? labelAxisData : valueAxisData,
      } as Axes;

      if (state.axes.secondaryYAxis) {
        axesState.secondaryYAxis = getSecondaryYAxisData({
          state,
          labelOnYAxis,
          valueAxisSize,
          labelAxisSize,
          labelAxisName,
          valueAxisName,
          initialAxisData: initialAxisData.secondaryYAxis!,
          isCoordinateTypeChart,
        }) as AxisData;
      }

      if (centerYAxis) {
        const xAxisHalfSize = (xAxis.width - yAxis.width) / 2;
        axesState.centerYAxis = deepMergedCopy(valueAxisData, {
          x: xAxis.x + xAxisHalfSize,
          xAxisHalfSize,
          secondStartX: (xAxis.width + yAxis.width) / 2,
          yAxisLabelAnchorPoint: yAxis.width / 2,
          yAxisHeight: yAxis.height,
        }) as CenterYAxisData;
      }

      if (state.axes.radialAxis) {
        axesState.radialAxis = getRadialAxis(scale[valueAxisName], plot, initialAxisData.yAxis);
      }

      if (hasYAxisTypeMaxLabelChanged(state.axes, axesState)) {
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
