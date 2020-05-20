import { AxisData, Options, SeriesState, StoreModule } from '@t/store/store';
import { makeLabelsFromLimit } from '@src/helpers/calculator';
import { isLabelAxisOnYAxis } from '@src/helpers/axes';
import { AxisType } from '@src/component/axis';
import { LineTypeXAxisOptions } from '@t/options';
import { extend } from '@src/store/store';

const axes: StoreModule = {
  name: 'axes',
  state: () => ({
    axes: {}
  }),
  initialize(state, options) {
    state.axes = {
      xAxis: {
        tickInterval: options.xAxis?.tick?.interval || 1,
        labelInterval: options.xAxis?.label?.interval || 1
      } as AxisData,
      yAxis: {
        tickInterval: options.yAxis?.tick?.interval || 1,
        labelInterval: options.yAxis?.label?.interval || 1
      } as AxisData
    };
  },
  action: {
    setAxesData({ state }) {
      const { scale, options, series, layout, categories = [] } = state;
      const { plot } = layout;

      const pointOnColumn = isPointOnColumn(series, options);
      const labelAxisOnYAxis = isLabelAxisOnYAxis(series);
      const labelAxisSize = labelAxisOnYAxis ? plot.height : plot.width;

      const labelAxisData = {
        labels: categories,
        tickCount: categories.length + (pointOnColumn ? 1 : 0),
        isLabelAxis: true,
        pointOnColumn,
        tickDistance: labelAxisSize / (categories.length - (pointOnColumn ? 0 : 1))
      };

      const axisName = getValueAxisName(series);
      const valueLabels = makeLabelsFromLimit(scale[axisName].limit, scale[axisName].step);
      const valueAxisSize = labelAxisOnYAxis ? plot.width : plot.height;

      const valueAxisData = {
        labels: valueLabels,
        tickCount: valueLabels.length,
        isLabelAxis: false,
        pointOnColumn: false,
        tickDistance: valueAxisSize / valueLabels.length
      };

      extend(state.axes, {
        xAxis: labelAxisOnYAxis ? valueAxisData : labelAxisData,
        yAxis: labelAxisOnYAxis ? labelAxisData : valueAxisData
      });
    }
  },
  computed: {},
  observe: {
    updateAxes() {
      this.dispatch('setAxesData');
    }
  }
};

function getValueAxisName(series) {
  return series.bar ? AxisType.X : AxisType.Y;
}

function isPointOnColumn(series: SeriesState, options: Options) {
  if (series.column || series.bar) {
    return true;
  }

  if (series.line || series.area) {
    return Boolean((options.xAxis as LineTypeXAxisOptions)?.pointOnColumn);
  }

  return false;
}

export default axes;
