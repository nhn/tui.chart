import { Axes, AxisData, StoreModule } from '@t/store/store';
import { HeatmapCategoriesType, HeatmapChartOptions } from '@t/options';
import { AxisType } from '@src/component/axis';
import {
  getAxisTheme,
  makeFormattedCategory,
  getViewAxisLabels,
  makeRotationData,
  getRotatableOption,
  hasAxesLayoutChanged,
  makeTitleOption,
  getMaxLabelSize,
  getLabelXMargin,
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
  const { axisSize, options, theme } = stateProp;
  const isLabelAxis = axisType === AxisType.X;
  const categories = isLabelAxis ? stateProp.categories.x : [...stateProp.categories.y].reverse();
  const formatter = options[axisType]?.label?.formatter ?? ((value) => value);
  const labelsBeforeFormatting = makeFormattedCategory(categories, options[axisType]?.date);
  const labels = labelsBeforeFormatting.map((label, index) =>
    formatter(label, { index, labels: labelsBeforeFormatting, axisName: axisType })
  );

  const tickIntervalCount = labels.length;
  const tickDistance = tickIntervalCount ? axisSize / tickIntervalCount : axisSize;
  const labelDistance = axisSize / tickIntervalCount;
  const pointOnColumn = true;
  const tickCount = tickIntervalCount + 1;
  const tickInterval = options[axisType]?.tick?.interval ?? 1;
  const labelInterval = options[axisType]?.label?.interval ?? 1;
  const viewLabels = getViewAxisLabels(
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
  const labelXMargin = getLabelXMargin(axisType, options);

  const { maxLabelWidth, maxLabelHeight } = getMaxLabelSize(
    labels,
    labelXMargin,
    getTitleFontString(theme.label)
  );

  const axisData = {
    labels,
    viewLabels,
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
    const labelMargin = options.xAxis?.label?.margin ?? 0;
    const offsetY = getAxisLabelAnchorPoint(maxLabelHeight) + labelMargin;
    const distance = axisSize / viewLabels.length;
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
