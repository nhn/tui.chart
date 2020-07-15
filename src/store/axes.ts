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
import { AxisTitle, BoxSeriesOptions, BarTypeYAxisOptions } from '@t/options';
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
  centerYAxis?: Pick<CenterYAxisData, 'visible' | 'xAxisHalfSize'>;
}

type ValueStateProp = StateProp & { categories: string[] };

export function enableCenterYAxis(options: Options, isBar: boolean) {
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
  const zeroPosition = labelAxisOnYAxis ? position : axisSize - position;

  return zeroPosition;
}

export function getLabelAxisData(stateProp: ValueStateProp) {
  const { scale, axisSize, categories, series, options } = stateProp;
  const pointOnColumn = isPointOnColumn(series, options);
  const labels = scale ? makeLabelsFromLimit(scale.limit, scale.stepSize) : categories;

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
  const visibleCenterYAxis = centerYAxis!.visible;
  const size = visibleCenterYAxis ? centerYAxis!.xAxisHalfSize : axisSize;
  const divergingBoxSeries = isDivergingBoxSeries(series, options);
  const zeroPosition = getZeroPosition(
    limit,
    axisSize,
    isLabelAxisOnYAxis(series),
    divergingBoxSeries
  );
  let valueLabels = makeLabelsFromLimit(limit, stepSize);

  if (!visibleCenterYAxis && divergingBoxSeries) {
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
  state: ({ series, options }) => ({
    axes: {
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
      centerYAxis: {
        visible: enableCenterYAxis(options, !!series.bar),
      } as CenterYAxisData,
    },
  }),
  action: {
    setAxesData({ state }) {
      const { scale, options, series, layout, categories = [] } = state;
      const { xAxis, yAxis, plot } = layout;

      const labelAxisOnYAxis = isLabelAxisOnYAxis(series);
      const { valueAxisName, labelAxisName } = getAxisName(labelAxisOnYAxis);
      const { valueSizeKey, labelSizeKey } = getSizeKey(labelAxisOnYAxis);
      const valueAxisSize = plot[valueSizeKey];
      const labelAxisSize = plot[labelSizeKey];
      const visibleCenterYAxis = state.axes.centerYAxis.visible;

      const valueAxisData = getValueAxisData({
        scale: scale[valueAxisName],
        axisSize: valueAxisSize,
        options,
        series,
        centerYAxis: {
          visible: visibleCenterYAxis,
          xAxisHalfSize: (xAxis.width - yAxis.width) / 2,
        },
      });

      const labelAxisData = getLabelAxisData({
        scale: scale[labelAxisName],
        axisSize: labelAxisSize,
        categories,
        options,
        series,
      });

      const axesState = {
        xAxis: labelAxisOnYAxis ? valueAxisData : labelAxisData,
        yAxis: labelAxisOnYAxis ? labelAxisData : valueAxisData,
      } as Axes;

      if (visibleCenterYAxis) {
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
