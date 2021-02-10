import {
  StoreModule,
  RadialYAxisData,
  RadialAxisData,
  Options,
  InitAxisData,
  Scale,
} from '@t/store/store';
import { getAxisFormatter, getInitAxisIntervalData, getMaxLabelSize } from '@src/helpers/axes';
import { isSemiCircle, getSemiCircleCenterY, getTotalAngle } from '@src/helpers/pieSeries';
import { Rect, RadarChartOptions, RadialBarChartOptions, RadialBarSeriesOptions } from '@t/options';
import { makeLabelsFromLimit, makeTickPixelPositions } from '@src/helpers/calculator';
import { getTitleFontString } from '@src/helpers/style';
import { RadialBarChartThemeOptions, RadarChartThemeOptions, AxisTheme } from '@t/theme';
import { calculateSizeWithPercentString } from '@src/helpers/utils';
import { getDefaultRadius } from '@src/helpers/sector';
const Y_LABEL_PADDING = 5;
export const RADIAL_LABEL_PADDING = 25;

type UsingRadialAxesChartTypeOptions = RadarChartOptions | RadialBarChartOptions;
type UsingRadialAxesChartTypeTheme =
  | Required<RadarChartThemeOptions>
  | Required<RadialBarChartThemeOptions>;

type DefaultRadialAxisData = {
  axisSize: number;
  centerX: number;
  centerY: number;
  totalAngle: number;
  drawingStartAngle: number;
  clockwise: boolean;
};

type BaseAxisDataParam = {
  labels: string[];
  intervalData: InitAxisData;
  defaultAxisData: DefaultRadialAxisData;
};

interface RadialAxisDataParam extends BaseAxisDataParam {
  radialAxisLabelMargin: number;
  radialAxisLabelFont: string;
  outerRadius: number;
}
interface YAxisDataParam extends BaseAxisDataParam {
  options: UsingRadialAxesChartTypeOptions;
  isLabelOnYAxis: boolean;
  pointOnColumn: boolean;
  yAxisLabelMargin: number;
  radialYAxisLabelFont: string;
}

function getClockwise(seriesOptions: RadialBarSeriesOptions) {
  return seriesOptions?.clockwise ?? true;
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
  isLabelOnYAxis = false
): DefaultRadialAxisData {
  let isSemiCircular = false;
  let centerY = plot.height / 2;
  let totalAngle = 360;
  let drawingStartAngle = 0;
  let clockwise = true;

  if (isLabelOnYAxis) {
    clockwise = getClockwise(options?.series as RadialBarSeriesOptions);
    const startAngle = 0;
    const endAngle = 360;

    isSemiCircular = isSemiCircle(clockwise, startAngle, endAngle);
    centerY = isSemiCircular ? getSemiCircleCenterY(plot.height, clockwise) : plot.height / 2;
    totalAngle = getTotalAngle(clockwise, startAngle, endAngle);
    drawingStartAngle = clockwise ? startAngle : endAngle;
  }

  return {
    axisSize: getDefaultRadius(plot, isSemiCircular, maxLabelWidth, maxLabelHeight),
    centerX: plot.width / 2,
    centerY,
    totalAngle,
    drawingStartAngle: drawingStartAngle,
    clockwise,
  };
}

function getYAxisLabelAlign(clockwise = true, isLabelOnYAxis = false) {
  let align: CanvasTextAlign = 'center';

  if (isLabelOnYAxis) {
    align = clockwise ? 'right' : 'left';
  }

  return align;
}

function getYAxisData({
  options,
  labels,
  pointOnColumn,
  intervalData,
  isLabelOnYAxis,
  yAxisLabelMargin,
  radialYAxisLabelFont,
  defaultAxisData,
}: YAxisDataParam): RadialYAxisData {
  const { axisSize, centerX, centerY, clockwise } = defaultAxisData;
  const { radiusRanges, innerRadius, outerRadius } = isLabelOnYAxis
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
    pointOnColumn,
    radiusRanges,
    innerRadius,
    outerRadius,
    labelInterval,
    labelMargin: yAxisLabelMargin,
    labelAlign: getYAxisLabelAlign(clockwise, isLabelOnYAxis),
    ...getMaxLabelSize(labels, yAxisLabelMargin, radialYAxisLabelFont),
  };
}

function getRadialAxisData({
  labels,
  intervalData,
  radialAxisLabelMargin,
  radialAxisLabelFont,
  defaultAxisData,
  outerRadius,
}: RadialAxisDataParam): RadialAxisData {
  const { maxLabelWidth, maxLabelHeight } = getMaxLabelSize(
    labels,
    radialAxisLabelMargin,
    radialAxisLabelFont
  );
  const { axisSize, centerX, centerY, clockwise, totalAngle, drawingStartAngle } = defaultAxisData;
  const { tickInterval, labelInterval } = intervalData;

  return {
    labels,
    axisSize,
    centerX,
    centerY,
    totalAngle,
    drawingStartAngle,
    clockwise,
    degree: totalAngle / labels.length,
    tickInterval,
    labelInterval,
    labelMargin: radialAxisLabelMargin,
    maxLabelWidth,
    maxLabelHeight,
    outerRadius,
  };
}

function makeLabels(
  options: UsingRadialAxesChartTypeOptions,
  rawLabels: string[],
  axisName: 'xAxis' | 'yAxis'
) {
  const formatter = getAxisFormatter(options, axisName);

  return rawLabels.map((label, index) => formatter(label, { index, labels: rawLabels, axisName }));
}

function getAxisLabels(
  isLabelOnYAxis: boolean,
  options: UsingRadialAxesChartTypeOptions,
  categories: string[],
  scale: Scale
) {
  const valueAxisName = isLabelOnYAxis ? 'xAxis' : 'yAxis';
  const { limit, stepSize } = scale[valueAxisName];
  const valueLabels = makeLabels(options, makeLabelsFromLimit(limit, stepSize), valueAxisName);
  const categoryLabels = makeLabels(options, categories, isLabelOnYAxis ? 'yAxis' : 'xAxis');

  return {
    radialAxisLabels: isLabelOnYAxis ? valueLabels : categoryLabels,
    yAxisLabels: isLabelOnYAxis ? categoryLabels : valueLabels,
  };
}

function getAxisLabelMargin(isLabelOnYAxis: boolean, options: UsingRadialAxesChartTypeOptions) {
  return {
    yAxisLabelMargin: options?.yAxis?.label?.margin ?? (isLabelOnYAxis ? Y_LABEL_PADDING : 0),
    radialAxisLabelMargin: options?.radialAxis?.label?.margin ?? RADIAL_LABEL_PADDING,
  };
}

const axes: StoreModule = {
  name: 'axes',
  state: () => ({
    radialAxes: {
      radialAxis: {} as RadialAxisData,
      yAxis: {} as RadialYAxisData,
    },
  }),
  action: {
    setRadialAxesData({ state }) {
      const { series, layout, scale } = state;
      const { plot } = layout;
      const isLabelOnYAxis = !!series.radialBar;
      const options = state.options as UsingRadialAxesChartTypeOptions;
      const theme = state.theme as UsingRadialAxesChartTypeTheme;
      const categories = state.categories as string[];

      const radialAxisLabelFont = getTitleFontString(
        (theme.radialAxis as Required<AxisTheme>).label
      );

      const radialYAxisLabelFont = getTitleFontString(
        (theme.yAxis as Required<Omit<AxisTheme, 'title'>>).label
      );

      const { yAxisLabelMargin, radialAxisLabelMargin } = getAxisLabelMargin(
        isLabelOnYAxis,
        options
      );

      const { radialAxisLabels, yAxisLabels } = getAxisLabels(
        isLabelOnYAxis,
        options,
        categories,
        scale
      );

      const { maxLabelWidth, maxLabelHeight } = getMaxLabelSize(
        radialAxisLabels,
        radialAxisLabelMargin,
        radialAxisLabelFont
      );

      const defaultAxisData = getDefaultAxisData(
        options,
        plot,
        maxLabelWidth,
        maxLabelHeight + radialAxisLabelMargin,
        isLabelOnYAxis
      );

      const yAxisData = getYAxisData({
        options,
        labels: yAxisLabels,
        pointOnColumn: isLabelOnYAxis,
        isLabelOnYAxis,
        intervalData: getInitAxisIntervalData(isLabelOnYAxis, {
          axis: options.yAxis,
          categories,
          layout,
        }),
        yAxisLabelMargin,
        radialYAxisLabelFont,
        defaultAxisData,
      });

      state.radialAxes = {
        radialAxis: getRadialAxisData({
          labels: radialAxisLabels,
          intervalData: getInitAxisIntervalData(true, {
            axis: options.radialAxis,
            categories,
            layout,
          }),
          defaultAxisData,
          radialAxisLabelMargin,
          radialAxisLabelFont,
          outerRadius: yAxisData.outerRadius,
        }),
        yAxis: yAxisData,
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
