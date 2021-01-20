import { Axes, AxisData, StoreModule } from '@t/store/store';
import { HeatmapCategoriesType, HeatmapChartOptions } from '@t/options';
import { AxisType } from '@src/component/axis';
import {
  getAxisTheme,
  makeFormattedCategory,
  getVisibleAxisLabels,
  makeRotationData,
  getRotatableOption,
  hasAxesLayoutChanged,
  makeTitleOption,
  getMaxLabelSize,
} from '@src/helpers/axes';
import { AxisTheme } from '@t/theme';
import { getAxisLabelAnchorPoint } from '@src/helpers/calculator';
import { getTitleFontString } from '@src/helpers/style';

type HeatmapStateProp = {
  axisSize: number;
  categories: HeatmapCategoriesType;
  options: HeatmapChartOptions;
  theme: Required<AxisTheme>;
};

function getHeatmapAxisData(stateProp: HeatmapStateProp, axisType: AxisType) {
  const { categories, axisSize, options, theme } = stateProp;
  const isLabelAxis = axisType === AxisType.X;
  const axisName = isLabelAxis ? 'x' : 'y';
  const labels = makeFormattedCategory(categories[axisName], options[axisType]?.date);

  const tickIntervalCount = labels.length;
  const tickDistance = tickIntervalCount ? axisSize / tickIntervalCount : axisSize;
  const labelDistance = axisSize / tickIntervalCount;
  const pointOnColumn = true;
  const tickCount = tickIntervalCount + 1;
  const tickInterval = options[axisType]?.tick?.interval ?? 1;
  const labelInterval = options[axisType]?.label?.interval ?? 1;
  const visibleLabels = getVisibleAxisLabels(
    {
      labels,
      pointOnColumn,
      tickDistance,
      tickCount,
      tickInterval,
      labelInterval,
    },
    axisSize
  );

  const { maxLabelWidth, maxLabelHeight } = getMaxLabelSize(
    labels,
    getTitleFontString(theme.label)
  );

  const axisData = {
    labels,
    visibleLabels,
    pointOnColumn,
    isLabelAxis,
    tickCount,
    tickDistance,
    labelDistance,
    tickInterval,
    labelInterval,
    title: makeTitleOption(options.xAxis?.title),
    maxLabelWidth,
    maxLabelHeight,
  };

  if (axisType === AxisType.X) {
    const offsetY = getAxisLabelAnchorPoint(maxLabelHeight);
    const distance = axisSize / visibleLabels.length;
    const rotationData = makeRotationData(
      maxLabelWidth,
      maxLabelHeight,
      distance,
      getRotatableOption(options)
    );
    const { needRotateLabel, rotationHeight } = rotationData;
    const maxHeight = (needRotateLabel ? rotationHeight : maxLabelHeight) + offsetY;

    return {
      ...axisData,
      ...rotationData,
      maxHeight,
      offsetY,
    };
  }

  return axisData;
}

const axes: StoreModule = {
  name: 'axes',
  state: () => {
    return {
      axes: {
        xAxis: {} as AxisData,
        yAxis: {} as AxisData,
      },
    };
  },
  action: {
    setAxesData({ state }) {
      const { layout, theme } = state;
      const { width, height } = layout.plot;
      const categories = state.categories as HeatmapCategoriesType;
      const options = state.options as HeatmapChartOptions;

      const xAxisData = getHeatmapAxisData(
        { axisSize: width, categories, options, theme: getAxisTheme(theme, AxisType.X) },
        AxisType.X
      );
      const yAxisData = getHeatmapAxisData(
        { axisSize: height, categories, options, theme: getAxisTheme(theme, AxisType.X) },
        AxisType.Y
      );
      const axesState = { xAxis: xAxisData, yAxis: yAxisData } as Axes;

      if (hasAxesLayoutChanged(state.axes, axesState)) {
        this.notify(state, 'layout');
      }

      state.axes = axesState;
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
