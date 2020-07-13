import {
  AxisData,
  Options,
  ScaleData,
  Series,
  StoreModule,
  ValueEdge,
  Layout,
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
import { AxisTitle, BoxSeriesOptions } from '@t/options';
import {
  deepMergedCopy,
  hasNegativeOnly,
  isString,
  isUndefined,
  isNumber,
} from '@src/helpers/utils';

interface StateProp {
  scale: ScaleData;
  axisSize: number;
  options: Options;
  series: Series;
}

type ValueStateProp = StateProp & { categories: string[] };

type YCenterStateProp = {
  scale: ScaleData;
  axisSize: number;
  layout: Layout;
};

function getZeroPosition(limit: ValueEdge, axisSize: number, labelAxisOnYAxis: boolean) {
  const { min, max } = limit;
  const hasZeroValue = min <= 0 && max >= 0;

  if (!hasZeroValue) {
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
  const { scale, axisSize, series, options } = stateProp;
  const { limit, stepSize } = scale;

  let valueLabels = makeLabelsFromLimit(limit, stepSize);
  let zeroPosition = getZeroPosition(limit, axisSize, isLabelAxisOnYAxis(series));

  if (hasBoxTypeSeries(series) && (options.series as BoxSeriesOptions)?.diverging) {
    valueLabels = getDivergingValues(valueLabels);
    zeroPosition = null;
  }

  const axisData = {
    labels: valueLabels,
    pointOnColumn: false,
    isLabelAxis: false,
    tickCount: valueLabels.length,
    tickDistance: axisSize / valueLabels.length,
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

function getValueYCenterAxisData(stateProp: YCenterStateProp) {
  const { scale, axisSize, layout } = stateProp;
  const { limit, stepSize } = scale;
  const valueLabels = makeLabelsFromLimit(limit, stepSize);
  const halfSize = (axisSize - layout.yAxis.width) / 2;

  return {
    labels: valueLabels,
    pointOnColumn: false,
    isLabelAxis: false,
    tickCount: valueLabels.length,
    tickDistance: halfSize / valueLabels.length,
  };
}

const axes: StoreModule = {
  name: 'axes',
  state: ({ options }) => ({
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
    },
  }),
  action: {
    setAxesData({ state }) {
      const { scale, options, series, layout, categories = [], yCenterAxis } = state;
      const { plot } = layout;

      const labelAxisOnYAxis = isLabelAxisOnYAxis(series);
      const { valueAxisName, labelAxisName } = getAxisName(labelAxisOnYAxis);
      const { valueSizeKey, labelSizeKey } = getSizeKey(labelAxisOnYAxis);
      const valueAxisSize = plot[valueSizeKey];
      const labelAxisSize = plot[labelSizeKey];

      const valueAxisData = yCenterAxis?.visible
        ? getValueYCenterAxisData({
            scale: scale[valueAxisName],
            axisSize: valueAxisSize,
            layout,
          })
        : getValueAxisData({
            scale: scale[valueAxisName],
            axisSize: valueAxisSize,
            options,
            series,
          });
      const labelAxisData = getLabelAxisData({
        scale: scale[labelAxisName],
        axisSize: labelAxisSize,
        categories,
        options,
        series,
      });

      extend(state.axes, {
        xAxis: (labelAxisOnYAxis ? valueAxisData : labelAxisData) as AxisData,
        yAxis: (labelAxisOnYAxis ? labelAxisData : valueAxisData) as AxisData,
      });
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
