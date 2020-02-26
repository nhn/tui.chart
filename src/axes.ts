import { StoreModule } from '@src/store/store';

import { makeLabelsFromLimit } from '@src/helpers/calculator';

const axes: StoreModule = {
  name: 'axes',
  state: () => ({
    axes: {}
  }),
  action: {
    setAxesData({ state }) {
      const { data, scale, options } = state;
      const { categories } = data;

      const labelAxisData = {
        labels: categories,
        tickCount: categories.length,
        validTickCount: categories.length,
        isLabelAxis: true
      };

      if (options.xAxis.pointOnColumn) {
        labelAxisData.tickCount += 1;
      }

      const valueLabels = makeLabelsFromLimit(scale.yAxis.limit, scale.yAxis.step);

      const valueAxisData = {
        labels: valueLabels,
        tickCount: valueLabels.length,
        validTickCount: valueLabels.length
      };

      this.extend(state.axes, {
        xAxis: labelAxisData,
        yAxis: valueAxisData
      });
    }
  },
  computed: {
    // reaction 방식과 computed 방식 비교
    // 'axes.xAxis': ({categories}) => {
    //   return {
    //     labels: categories,
    //     tickCount: categories.length,
    //     validTickCount: categories.length,
    //     isLabelAxis: true
    //   };
    // },
    // 'axes.yAxis': ({scale}) => {
    //   return {
    //     labels: makeLabelsFromLimit(scale.yAxis.limit, scale.yAxis.step)
    //   };
    // }
  },
  observe: {
    updateAxes() {
      this.dispatch('setAxesData');
    }
    // updateAxes({categories, scale}) {
    //   const labelAxisData = {
    //     labels: categories,
    //     tickCount: categories.length,
    //     validTickCount: categories.length,
    //     isLabelAxis: true
    //   };
    //   const valueAxisData = {
    //     labels: makeLabelsFromLimit(scale.yAxis.limit, scale.yAxis.step)
    //   };
    //   this.dispatch('setAxesData', {
    //     xAxis: labelAxisData,
    //     yAxis: valueAxisData
    //   });
    // }
  }
};

export default axes;
