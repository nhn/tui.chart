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
} from '@t/store/store';
import {
  getAxisName,
  getSizeKey,
  hasBoxTypeSeries,
  isLabelAxisOnYAxis,
  isPointOnColumn,
  getYAxisOption,
} from '@src/helpers/axes';
import { extend } from '@src/store/store';
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

interface StateProp {
  scale: ScaleData;
  axisSize: number;
  options: Options;
  series: Series;
  centerYAxis?: Pick<CenterYAxisData, 'xAxisHalfSize'> | null;
  zoomRange?: RangeDataType<number>;
  initialAxisData: InitAxisData;
}

type ValueStateProp = StateProp & { categories: string[]; rawCategories: string[] };

type LabelAxisState = Omit<LabelAxisData, 'tickInterval' | 'labelInterval'>;
type ValueAxisState = Omit<ValueAxisData, 'tickInterval' | 'labelInterval'>;

type SecondaryYAxisParam = {
  state: ChartState<Options>;
  labelOnYAxis: boolean;
  valueAxisSize: number;
  labelAxisSize: number;
  labelAxisName: string;
  initialAxisData: InitAxisData;
};

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
  } = stateProp;
  const pointOnColumn = isPointOnColumn(series, options);
  const labels =
    !isZooming(rawCategories, zoomRange) && scale
      ? makeLabelsFromLimit(scale.limit, scale.stepSize, options)
      : makeFormattedCategory(categories, options?.xAxis?.date);

  const tickIntervalCount = categories.length - (pointOnColumn ? 0 : 1);
  const tickDistance = tickIntervalCount ? axisSize / tickIntervalCount : axisSize;
  const labelDistance = axisSize / (labels.length - (pointOnColumn ? 0 : 1));

  return {
    labels,
    pointOnColumn,
    isLabelAxis: true,
    tickCount: labels.length + (pointOnColumn ? 1 : 0),
    tickDistance,
    labelDistance,
    ...initialAxisData,
  };
}

export function getValueAxisData(stateProp: StateProp): ValueAxisState {
  const { scale, axisSize, series, options, centerYAxis, initialAxisData } = stateProp;
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

  const axisData: ValueAxisState = {
    labels: valueLabels,
    pointOnColumn: false,
    isLabelAxis: false,
    tickCount: valueLabels.length,
    tickDistance: size / valueLabels.length,
    ...initialAxisData,
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
    labelTextHeight: getTextHeight(DEFAULT_LABEL_TEXT),
    labelInterval,
  };
}

function makeDefaultAxisData(
  axis?: BaseAxisOptions | BaseXAxisOptions | LineTypeXAxisOptions
): InitAxisData {
  const axisData: InitAxisData = {
    tickInterval: axis?.tick?.interval ?? 1,
    labelInterval: axis?.label?.interval ?? 1,
  };

  const title = makeTitleOption(axis?.title);

  if (title) {
    axisData.title = title;
  }

  return axisData;
}

function getInitialAxisData(options: Options) {
  const { yAxis, secondaryYAxis } = getYAxisOption(options);

  return {
    xAxis: makeDefaultAxisData(options?.xAxis),
    yAxis: makeDefaultAxisData(yAxis),
    secondaryYAxis: secondaryYAxis ? makeDefaultAxisData(secondaryYAxis) : null,
  };
}

function getSecondaryYAxisData({
  state,
  labelOnYAxis,
  valueAxisSize,
  labelAxisSize,
  labelAxisName,
  initialAxisData,
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
      })
    : getValueAxisData({
        scale: scale.secondaryYAxis!,
        axisSize: valueAxisSize,
        options,
        series,
        centerYAxis: null,
        initialAxisData,
      });
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

      const labelAxisOnYAxis = isLabelAxisOnYAxis(series, options);
      const { valueAxisName, labelAxisName } = getAxisName(labelAxisOnYAxis);
      const { valueSizeKey, labelSizeKey } = getSizeKey(labelAxisOnYAxis);
      const valueAxisSize = plot[valueSizeKey];
      const labelAxisSize = plot[labelSizeKey];
      const centerYAxis = state.axes.centerYAxis;

      const initialAxisData = getInitialAxisData(options);

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
          initialAxisData: initialAxisData.secondaryYAxis!,
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

      extend(state.axes, axesState);
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
