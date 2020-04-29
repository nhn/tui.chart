import { Options, SeriesState, StoreModule } from '@t/store/store';
import { makeLabelsFromLimit } from '@src/helpers/calculator';
import { AxisType } from '@src/component/axis';

const axes: StoreModule = {
  name: 'axes',
  state: () => ({
    axes: {}
  }),
  action: {
    setAxesData({ state }) {
      const { scale, options, series, categories = [] } = state;

      const pointOnColumn = isPointOnColumn(series, options);

      const labelAxisData = {
        labels: categories,
        tickCount: categories.length + (pointOnColumn ? 1 : 0),
        validTickCount: categories.length,
        isLabelAxis: true,
        pointOnColumn
      };

      const axisName = getValueAxisName(series);
      const valueLabels = makeLabelsFromLimit(scale[axisName].limit, scale[axisName].step);

      const valueAxisData = {
        labels: valueLabels,
        tickCount: valueLabels.length,
        validTickCount: valueLabels.length
      };

      if (series.bar) {
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

  return options.xAxis && options.xAxis.pointOnColumn;
}

export default axes;
