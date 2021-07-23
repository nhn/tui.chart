import { Axes, AxisData, StoreModule } from '@t/store/store';
import { HeatmapCategoriesType, HeatmapChartOptions, Rect } from '@t/options';
import { AxisType } from '@src/component/axis';
import {
  getAxisTheme,
  getViewAxisLabels,
  makeRotationData,
  getRotatableOption,
  hasAxesLayoutChanged,
  makeTitleOption,
  getMaxLabelSize,
  getLabelXMargin,
  getLabelsAppliedFormatter,
  isDateType,
} from '@src/helpers/axes';
import { AxisTheme } from '@t/theme';
import { getAxisLabelAnchorPoint } from '@src/helpers/calculator';
import { getTitleFontString } from '@src/helpers/style';

type HeatmapStateProp = {
  axisSize: number;
  categories: HeatmapCategoriesType;
  options: HeatmapChartOptions;
  theme: Required<AxisTheme>;
  axisLayout?: Rect;
};

function getHeatmapAxisData(stateProp: HeatmapStateProp, axisType: AxisType) {
  const { categories, axisSize, axisLayout, options, theme } = stateProp;
  const isLabelAxis = axisType === AxisType.X;
  const axisName = isLabelAxis ? 'x' : 'y';
  const dateType = isDateType(options, axisType);
  const labels = getLabelsAppliedFormatter(categories[axisName], options, dateType, axisType);

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
    title: makeTitleOption(options[axisType]?.title),
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
      getRotatableOption(options),
      axisLayout!
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
        {
          axisSize: width,
          categories,
          options,
          theme: getAxisTheme(theme, AxisType.X),
          axisLayout: layout[AxisType.X],
        },
        AxisType.X
      );
      const yAxisData = getHeatmapAxisData(
        {
          axisSize: height,
          categories,
          options,
          theme: getAxisTheme(theme, AxisType.Y),
        },
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
