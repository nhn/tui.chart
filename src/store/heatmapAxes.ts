import { Axes, AxisData, StoreModule } from '@t/store/store';
import { extend } from '@src/store/store';
import { HeatmapCategoriesType } from '@t/options';
import { AxisType } from '@src/component/axis';
import { makeTitleOption } from '@src/store/axes';

type HeatmapStateProp = { axisSize: number; categories: HeatmapCategoriesType };

function getHeatmapAxisData(stateProp: HeatmapStateProp, axisType: AxisType) {
  const { categories, axisSize } = stateProp;
  const isLabelAxis = axisType === AxisType.X;
  const axisName = isLabelAxis ? 'x' : 'y';
  const labels = categories[axisName];

  const tickIntervalCount = labels.length;
  const tickDistance = tickIntervalCount ? axisSize / tickIntervalCount : axisSize;
  const labelDistance = axisSize / labels.length;

  return {
    labels,
    pointOnColumn: true,
    isLabelAxis,
    tickCount: labels.length + 1,
    tickDistance,
    labelDistance,
  };
}

const axes: StoreModule = {
  name: 'axes',
  state: ({ options }) => {
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

    return {
      axes: axesState,
    };
  },
  action: {
    setAxesData({ state }) {
      const { layout, rawCategories } = state;
      const { width, height } = layout.plot;

      const xAxisData = getHeatmapAxisData(
        { axisSize: width, categories: rawCategories as HeatmapCategoriesType },
        AxisType.X
      );
      const yAxisData = getHeatmapAxisData(
        { axisSize: height, categories: rawCategories as HeatmapCategoriesType },
        AxisType.Y
      );

      const axesState = { xAxis: xAxisData, yAxis: yAxisData } as Axes;

      this.notify(state, 'layout');
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
