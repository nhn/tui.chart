import { StoreModule } from '@t/store/store';
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

      const labelAxisData = {
        labels: categories,
        tickCount: categories.length,
        validTickCount: categories.length,
        isLabelAxis: true,
        isCategoryType: false
      };

      if (isCategoryType({ series, options })) {
        labelAxisData.tickCount += 1;
        labelAxisData.isCategoryType = true;
      }

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

function isCategoryType({ series, options }) {
  return (
    (series.line && options.xAxis && options.xAxis.pointOnColumn) || series.column || series.bar
  );
}

export default axes;
