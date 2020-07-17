import {
  AxisData,
  Options,
  ScaleData,
  Series,
  StoreModule,
  ValueEdge,
  CenterYAxisData,
  Axes,
} from '@t/store/store';
import {
  isLabelAxisOnYAxis,
  getAxisName,
  getSizeKey,
  hasBoxTypeSeries,
  isPointOnColumn,
} from '@src/helpers/axes';
import { extend } from '@src/store/store';
import { makeLabelsFromLimit } from '@src/helpers/calculator';
import { AxisTitle, BoxSeriesOptions, BarTypeYAxisOptions, RangeDataType } from '@t/options';
import {
  deepMergedCopy,
  hasNegativeOnly,
  isString,
  isUndefined,
  isNumber,
  pickProperty,
} from '@src/helpers/utils';

interface StateProp {
  scale: ScaleData;
  axisSize: number;
  options: Options;
  series: Series;
  centerYAxis?: Pick<CenterYAxisData, 'xAxisHalfSize'> | null;
  zoomRange?: RangeDataType;
}

type ValueStateProp = StateProp & { categories: string[] };

export function isCenterYAxis(options: Options, isBar: boolean) {
  const diverging = !!pickProperty(options, ['series', 'diverging']);
  const alignCenter = (options.yAxis as BarTypeYAxisOptions)?.align === 'center';

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

export function getLabelAxisData(stateProp: ValueStateProp) {
  const { axisSize, categories, series, options, scale, zoomRange } = stateProp;
  const pointOnColumn = isPointOnColumn(series, options);
  const labels =
    !zoomRange && scale ? makeLabelsFromLimit(scale.limit, scale.stepSize) : categories;

  return {
    labels,
    pointOnColumn,
    isLabelAxis: true,
    tickCount: labels.length + (pointOnColumn ? 1 : 0),
    tickDistance: axisSize / (categories.length - (pointOnColumn ? 0 : 1)),
  };
}

export function getValueAxisData(stateProp: StateProp) {
  const { scale, axisSize, series, options, centerYAxis } = stateProp;
  const { limit, stepSize } = scale;
  const size = centerYAxis ? centerYAxis?.xAxisHalfSize : axisSize;
  const divergingBoxSeries = isDivergingBoxSeries(series, options);
  const zeroPosition = getZeroPosition(
    limit,
    axisSize,
    isLabelAxisOnYAxis(series),
    divergingBoxSeries
  );
  let valueLabels = makeLabelsFromLimit(limit, stepSize);

  if (!centerYAxis && divergingBoxSeries) {
    valueLabels = getDivergingValues(valueLabels);
  }

  const axisData = {
    labels: valueLabels,
    pointOnColumn: false,
    isLabelAxis: false,
    tickCount: valueLabels.length,
    tickDistance: size / valueLabels.length,
  } as AxisData;

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

function makeTitleOption(title?: AxisTitle) {
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

const axes: StoreModule = {
  name: 'axes',
  state: ({ series, options }) => {
    const axesState: Axes = {
      xAxis: {
        tickInterval: options.xAxis?.tick?.interval ?? 1,
        labelInterval: options.xAxis?.label?.interval ?? 1,
        title: makeTitleOption(options.xAxis?.title),
      } as AxisData,
      yAxis: {
        tickInterval: options.yAxis?.tick?.interval ?? 1,
        labelInterval: options.yAxis?.label?.interval ?? 1,
        title: makeTitleOption(options.yAxis?.title),
      } as AxisData,
    };

    if (isCenterYAxis(options, !!series.bar)) {
      axesState.centerYAxis = {} as CenterYAxisData;
    }

    return {
      axes: axesState,
    };
  },
  action: {
    setAxesData({ state }) {
      const { scale, options, series, layout, zoomRange } = state;
      const categories = state.categories!;
      const { xAxis, yAxis, plot } = layout;

      const labelAxisOnYAxis = isLabelAxisOnYAxis(series);
      const { valueAxisName, labelAxisName } = getAxisName(labelAxisOnYAxis);
      const { valueSizeKey, labelSizeKey } = getSizeKey(labelAxisOnYAxis);
      const valueAxisSize = plot[valueSizeKey];
      const labelAxisSize = plot[labelSizeKey];
      const centerYAxis = state.axes.centerYAxis;

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
      });

      const labelAxisData = getLabelAxisData({
        scale: scale[labelAxisName],
        axisSize: labelAxisSize,
        categories,
        options,
        series,
        zoomRange,
      });

      const axesState = {
        xAxis: labelAxisOnYAxis ? valueAxisData : labelAxisData,
        yAxis: labelAxisOnYAxis ? labelAxisData : valueAxisData,
      } as Axes;

      if (centerYAxis) {
        axesState.centerYAxis = deepMergedCopy(valueAxisData, {
          xAxisHalfSize: (xAxis.width - yAxis.width) / 2,
          secondStartX: (xAxis.width + yAxis.width) / 2,
          yAxisLabelAnchorPoint: yAxis.width / 2,
          yAxisHeight: yAxis.height,
        }) as CenterYAxisData;
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
