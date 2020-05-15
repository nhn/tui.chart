import { Options, SeriesState, StoreModule } from '@t/store/store';
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
        tickDistance: valueAxisSize / valueLabels.length
      };

      if (labelAxisOnYAxis) {
        this.extend(state.axes, {
          xAxis: valueAxisData,
          yAxis: labelAxisData
        });
      } else {
        this.extend(state.axes, {
          xAxis: labelAxisData,
          yAxis: valueAxisData
        });
      }
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
    return (options.xAxis as LineTypeXAxisOptions)?.pointOnColumn;
  }

  return false;
}

export default axes;
