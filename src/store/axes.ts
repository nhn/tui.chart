import { AxisData, Options, ScaleData, SeriesState, StoreModule } from '@t/store/store';
import {
  isLabelAxisOnYAxis,
  getAxisName,
  getSizeKey,
  hasBoxTypeSeries,
  isPointOnColumn,
} from '@src/helpers/axes';
import { extend } from '@src/store/store';
import { makeLabelsFromLimit } from '@src/helpers/calculator';
import { BoxSeriesOptions } from '@t/options';

interface StateProp {
  scale: ScaleData;
  axisSize: number;
  options: Options;
  series: SeriesState;
}

type ValueStateProp = StateProp & { categories: string[] };

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
  let valueLabels = makeLabelsFromLimit(scale.limit, scale.stepSize);

  if (hasBoxTypeSeries(series) && (options.series as BoxSeriesOptions)?.diverging) {
    valueLabels = valueLabels.slice(1).reverse().concat(valueLabels);
  }

  return {
    labels: valueLabels,
    pointOnColumn: false,
    isLabelAxis: false,
    tickCount: valueLabels.length,
    tickDistance: axisSize / valueLabels.length,
  };
}

const axes: StoreModule = {
  name: 'axes',
  state: (options) => ({
    axes: {
      xAxis: {
        tickInterval: options.xAxis?.tick?.interval || 1,
        labelInterval: options.xAxis?.label?.interval || 1,
      } as AxisData,
      yAxis: {
        tickInterval: options.yAxis?.tick?.interval || 1,
        labelInterval: options.yAxis?.label?.interval || 1,
      } as AxisData,
    },
  }),
  action: {
    setAxesData({ state }) {
      const { scale, options, series, layout, categories = [] } = state;
      const { plot } = layout;

      const labelAxisOnYAxis = isLabelAxisOnYAxis(series);
      const { valueAxisName, labelAxisName } = getAxisName(labelAxisOnYAxis);
      const { valueSizeKey, labelSizeKey } = getSizeKey(labelAxisOnYAxis);
      const valueAxisSize = plot[valueSizeKey];
      const labelAxisSize = plot[labelSizeKey];

      const valueAxisData = getValueAxisData({
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
