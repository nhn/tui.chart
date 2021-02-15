import {
  StoreModule,
  Options,
  InitAxisData,
  Scale,
  RadialAxes,
  VerticalAxisData,
  CircularAxisData,
  ChartOptionsUsingRadialAxes,
} from '@t/store/store';
import { getInitAxisIntervalData, getMaxLabelSize } from '@src/helpers/axes';
import { isSemiCircle, getSemiCircleCenterY, getTotalAngle } from '@src/helpers/pieSeries';
import { Rect, RadialBarSeriesOptions, UsingRadialAxesChartTypeTheme } from '@t/options';
import { makeLabelsFromLimit, makeTickPixelPositions } from '@src/helpers/calculator';
import { getTitleFontString } from '@src/helpers/style';
import { CircularAxisTheme, VerticalAxisTheme } from '@t/theme';
import { calculateSizeWithPercentString } from '@src/helpers/utils';
import { getDefaultRadius, initSectorOptions } from '@src/helpers/sector';

const Y_LABEL_PADDING = 5;
export const RADIAL_LABEL_PADDING = 25;

export enum RadialAxisType {
  CIRCULAR = 'circularAxis',
  VERTICAL = 'verticalAxis',
}

type DefaultRadialAxisData = {
  axisSize: number;
  centerX: number;
  centerY: number;
  totalAngle: number;
  drawingStartAngle: number;
  clockwise: boolean;
  startAngle: number;
  endAngle: number;
};

type BaseAxisDataParam = {
  labels: string[];
  intervalData: InitAxisData;
  defaultAxisData: DefaultRadialAxisData;
};

interface CircularAxisDataParam extends BaseAxisDataParam {
  circularAxisLabelMargin: number;
  circularAxisLabelFont: string;
  outerRadius: number;
}
interface VerticalAxisDataParam extends BaseAxisDataParam {
  options: ChartOptionsUsingRadialAxes;
  isLabelOnVerticalAxis: boolean;
  pointOnColumn: boolean;
  verticalAxisLabelMargin: number;
  verticalAxisLabelFont: string;
}

function getRadiusInfo(axisSize: number, count: number, seriesOptions?: RadialBarSeriesOptions) {
  const innerRadius = calculateSizeWithPercentString(
    axisSize,
    seriesOptions?.radiusRange?.inner ?? 0
  );
  const outerRadius = calculateSizeWithPercentString(
    axisSize,
    seriesOptions?.radiusRange?.outer ?? axisSize
  );

  return {
    radiusRanges: makeTickPixelPositions(outerRadius - innerRadius, count, innerRadius)
      .splice(innerRadius === 0 ? 1 : 0, count)
      .reverse(),
    innerRadius: innerRadius,
    outerRadius: outerRadius,
  };
}

function getDefaultAxisData(
  options: Options,
  plot: Rect,
  maxLabelWidth = 0,
  maxLabelHeight = 0,
  isLabelOnVerticalAxis = false
): DefaultRadialAxisData {
  let isSemiCircular = false;
  let centerY = plot.height / 2;
  let totalAngle = 360;
  let drawingStartAngle = 0;
  let clockwiseOption = true;
  let startAngleOption = 0;
  let endAngleOpotion = 360;

  if (isLabelOnVerticalAxis) {
    const { startAngle, endAngle, clockwise } = initSectorOptions(options?.series);

    isSemiCircular = isSemiCircle(clockwise, startAngle, endAngle);
    centerY = isSemiCircular ? getSemiCircleCenterY(plot.height, clockwise) : plot.height / 2;
    totalAngle = getTotalAngle(clockwise, startAngle, endAngle);
    drawingStartAngle = startAngle;
    clockwiseOption = clockwise;
    startAngleOption = startAngle;
    endAngleOpotion = endAngle;
  }

  return {
    axisSize: getDefaultRadius(plot, isSemiCircular, maxLabelWidth, maxLabelHeight),
    centerX: plot.width / 2,
    centerY,
    totalAngle,
    drawingStartAngle: drawingStartAngle,
    clockwise: clockwiseOption,
    startAngle: startAngleOption,
    endAngle: endAngleOpotion,
  };
}

function getYAxisLabelAlign(clockwise = true, isLabelOnVerticalAxis = false) {
  let align: CanvasTextAlign = 'center';

  if (isLabelOnVerticalAxis) {
    align = clockwise ? 'right' : 'left';
  }

  return align;
}

function getVerticalAxisData({
  options,
  labels,
  pointOnColumn,
  intervalData,
  isLabelOnVerticalAxis,
  verticalAxisLabelMargin,
  verticalAxisLabelFont,
  defaultAxisData,
}: VerticalAxisDataParam): VerticalAxisData {
  const { axisSize, centerX, centerY, clockwise, startAngle, endAngle } = defaultAxisData;
  const { radiusRanges, innerRadius, outerRadius } = isLabelOnVerticalAxis
    ? getRadiusInfo(axisSize, labels.length + 1, options?.series)
    : {
        radiusRanges: makeTickPixelPositions(axisSize, labels.length),
        innerRadius: 0,
        outerRadius: axisSize,
      };
  const { labelInterval } = intervalData;

  return {
    labels,
    tickDistance: (outerRadius - innerRadius) / labels.length,
    axisSize,
    centerX,
    centerY,
    startAngle,
    endAngle,
    pointOnColumn,
    radiusRanges,
    innerRadius,
    outerRadius,
    labelInterval,
    labelMargin: verticalAxisLabelMargin,
    labelAlign: getYAxisLabelAlign(clockwise, isLabelOnVerticalAxis),
    ...getMaxLabelSize(labels, verticalAxisLabelMargin, verticalAxisLabelFont),
  };
}

function getCircularAxisData({
  labels,
  intervalData,
  circularAxisLabelMargin,
  circularAxisLabelFont,
  defaultAxisData,
  outerRadius,
}: CircularAxisDataParam): CircularAxisData {
  const { maxLabelWidth, maxLabelHeight } = getMaxLabelSize(
    labels,
    circularAxisLabelMargin,
    circularAxisLabelFont
  );
  const {
    axisSize,
    centerX,
    centerY,
    clockwise,
    totalAngle,
    drawingStartAngle,
    startAngle,
    endAngle,
  } = defaultAxisData;
  const { tickInterval, labelInterval } = intervalData;

  return {
    labels,
    axisSize,
    centerX,
    centerY,
    startAngle,
    endAngle,
    totalAngle,
    drawingStartAngle,
    clockwise,
    degree: totalAngle / (labels.length + (totalAngle < 360 ? -1 : 0)),
    tickInterval,
    labelInterval,
    labelMargin: circularAxisLabelMargin,
    maxLabelWidth,
    maxLabelHeight,
    outerRadius,
  };
}

function makeLabels(options: ChartOptionsUsingRadialAxes, rawLabels: string[], axisName: string) {
  const formatter = options[axisName]?.label?.formatter ?? ((value) => value);

  return rawLabels.map((label, index) => formatter(label, { index, labels: rawLabels, axisName }));
}

function getAxisLabels(
  isLabelOnVerticalAxis: boolean,
  options: ChartOptionsUsingRadialAxes,
  categories: string[],
  scale: Scale
) {
  const valueAxisName: RadialAxisType = isLabelOnVerticalAxis
    ? RadialAxisType.CIRCULAR
    : RadialAxisType.VERTICAL;
  const { limit, stepSize } = scale[valueAxisName]!;
  const valueLabels = makeLabels(options, makeLabelsFromLimit(limit, stepSize), valueAxisName);
  const categoryLabels = makeLabels(
    options,
    categories,
    isLabelOnVerticalAxis ? RadialAxisType.VERTICAL : RadialAxisType.CIRCULAR
  );

  return {
    radialAxisLabels: isLabelOnVerticalAxis ? valueLabels : categoryLabels,
    yAxisLabels: isLabelOnVerticalAxis ? categoryLabels : valueLabels,
  };
}

function getAxisLabelMargin(isLabelOnVerticalAxis: boolean, options: ChartOptionsUsingRadialAxes) {
  return {
    verticalAxisLabelMargin:
      options?.verticalAxis?.label?.margin ?? (isLabelOnVerticalAxis ? Y_LABEL_PADDING : 0),
    circularAxisLabelMargin: options?.circularAxis?.label?.margin ?? RADIAL_LABEL_PADDING,
  };
}

const axes: StoreModule = {
  name: 'axes',
  state: () => ({
    radialAxes: {} as RadialAxes,
  }),
  action: {
    setRadialAxesData({ state }) {
      const { series, layout, scale } = state;
      const { plot } = layout;
      const isLabelOnVerticalAxis = !!series.radialBar;
      const options = state.options as ChartOptionsUsingRadialAxes;
      const theme = state.theme as UsingRadialAxesChartTypeTheme;
      const categories = state.categories as string[];

      const circularAxisLabelFont = getTitleFontString(
        (theme.circularAxis as Required<CircularAxisTheme>).label
      );

      const verticalAxisLabelFont = getTitleFontString(
        (theme.verticalAxis as Required<VerticalAxisTheme>).label
      );

      const { verticalAxisLabelMargin, circularAxisLabelMargin } = getAxisLabelMargin(
        isLabelOnVerticalAxis,
        options
      );

      const { radialAxisLabels, yAxisLabels } = getAxisLabels(
        isLabelOnVerticalAxis,
        options,
        categories,
        scale
      );

      const { maxLabelWidth, maxLabelHeight } = getMaxLabelSize(
        radialAxisLabels,
        circularAxisLabelMargin,
        circularAxisLabelFont
      );

      const defaultAxisData = getDefaultAxisData(
        options,
        plot,
        maxLabelWidth,
        maxLabelHeight + circularAxisLabelMargin,
        isLabelOnVerticalAxis
      );

      const verticalAxisData = getVerticalAxisData({
        options,
        labels: yAxisLabels,
        pointOnColumn: isLabelOnVerticalAxis,
        isLabelOnVerticalAxis,
        intervalData: getInitAxisIntervalData(isLabelOnVerticalAxis, {
          axis: options.verticalAxis,
          categories,
          layout,
        }),
        verticalAxisLabelMargin,
        verticalAxisLabelFont,
        defaultAxisData,
      });

      state.radialAxes = {
        circularAxis: getCircularAxisData({
          labels: radialAxisLabels,
          intervalData: getInitAxisIntervalData(true, {
            axis: options.circularAxis,
            categories,
            layout,
          }),
          defaultAxisData,
          circularAxisLabelMargin,
          circularAxisLabelFont,
          outerRadius: verticalAxisData.outerRadius,
        }),
        verticalAxis: verticalAxisData,
      };
    },
  },
  observe: {
    updateRadialAxes() {
      this.dispatch('setRadialAxesData');
    },
  },
};

export default axes;
