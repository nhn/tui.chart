import { AxisData, Options, SeriesState, StoreModule } from '@t/store/store';
import { isLabelAxisOnYAxis, makeLabelsFromLimit } from '@src/helpers/calculator';
import { AxisType } from '@src/component/axis';
import { LineTypeXAxisOptions } from '@t/options';

const axes: StoreModule = {
  name: 'axes',
  state: () => ({
    axes: {}
  }),
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

      const xAxis: AxisData = {
        ...(labelAxisOnYAxis ? valueAxisData : labelAxisData),
        tickInterval: options.xAxis?.tick?.interval || 1
      };
      const yAxis: AxisData = {
        ...(labelAxisOnYAxis ? labelAxisData : valueAxisData),
        tickInterval: options.yAxis?.tick?.interval || 1
      };

      this.extend(state.axes, { xAxis, yAxis });
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
