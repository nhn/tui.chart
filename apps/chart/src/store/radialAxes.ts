import {
  StoreModule,
  InitAxisData,
  Scale,
  RadialAxes,
  VerticalAxisData,
  CircularAxisData,
  ChartOptionsUsingRadialAxes,
  DefaultRadialAxisData,
  ChartOptionsUsingVerticalAxis,
} from '@t/store/store';
import {
  getInitAxisIntervalData,
  getMaxLabelSize,
  isLabelAxisOnYAxis,
  getDefaultRadialAxisData,
  getRadiusInfo,
} from '@src/helpers/axes';
import { RadialBarSeriesOptions, UsingRadialAxesChartTypeTheme } from '@t/options';
import { makeLabelsFromLimit, makeTickPixelPositions } from '@src/helpers/calculator';
import { getTitleFontString } from '@src/helpers/style';
import { CircularAxisTheme, VerticalAxisTheme } from '@t/theme';
import { pick } from '@src/helpers/utils';
import { DEGREE_360, DEGREE_0 } from '@src/helpers/sector';
import { max } from '@src/helpers/arrayUtil';

const Y_LABEL_PADDING = 5;
export const RADIAL_LABEL_PADDING = 25;

export enum RadialAxisType {
  CIRCULAR = 'circularAxis',
  VERTICAL = 'verticalAxis',
}

type BaseAxisDataParam = {
  labels: string[];
  intervalData: InitAxisData;
  defaultAxisData: DefaultRadialAxisData;
};

interface CircularAxisDataParam extends BaseAxisDataParam {
  circularAxisLabelMargin: number;
  circularAxisLabelFont: string;
  radiusData: RadiusInfo;
}
interface VerticalAxisDataParam extends BaseAxisDataParam {
  isLabelOnVerticalAxis: boolean;
  pointOnColumn: boolean;
  verticalAxisLabelMargin: number;
  verticalAxisLabelFont: string;
  radiusData: RadiusInfo;
}

type RadiusInfo = {
  radiusRanges: number[];
  innerRadius: number;
  outerRadius: number;
};

function getYAxisLabelAlign(clockwise = true, isLabelOnVerticalAxis = false) {
  let align: CanvasTextAlign = 'center';

  if (isLabelOnVerticalAxis) {
    align = clockwise ? 'right' : 'left';
  }

  return align;
}

function getVerticalAxisData({
  labels,
  pointOnColumn,
  intervalData,
  isLabelOnVerticalAxis,
  verticalAxisLabelMargin,
  verticalAxisLabelFont,
  defaultAxisData,
  radiusData,
}: VerticalAxisDataParam): VerticalAxisData {
  const { clockwise, axisSize, centerX, centerY, startAngle, endAngle } = defaultAxisData;
  const { radiusRanges, innerRadius, outerRadius } = radiusData;
  const { labelInterval } = intervalData;
  /*
  return {
    labels,
    tickDistance: (outerRadius - innerRadius) / labels.length,
    ...pick(defaultAxisData, 'axisSize', 'centerX', 'centerY', 'startAngle', 'endAngle'),
    pointOnColumn,
    radiusRanges,
    innerRadius,
    outerRadius,
    labelInterval,
    labelMargin: verticalAxisLabelMargin,
    labelAlign: getYAxisLabelAlign(clockwise, isLabelOnVerticalAxis),
    ...getMaxLabelSize(labels, verticalAxisLabelMargin, verticalAxisLabelFont),
  };
  */
  const { maxLabelWidth, maxLabelHeight } = getMaxLabelSize(
    labels,
    verticalAxisLabelMargin,
    verticalAxisLabelFont
  );

  return {
    axisSize,
    centerX,
    centerY,
    label: {
      labels,
      interval: labelInterval,
      margin: verticalAxisLabelMargin,
      maxWidth: maxLabelWidth,
      maxHeight: maxLabelHeight,
      align: getYAxisLabelAlign(clockwise, isLabelOnVerticalAxis),
    },
    radius: {
      inner: innerRadius,
      outer: outerRadius,
      ranges: radiusRanges,
    },
    angle: {
      start: startAngle,
      end: endAngle,
    },

    tickDistance: (outerRadius - innerRadius) / labels.length,
    pointOnColumn,
  };
}

function getCircularAxisData({
  labels,
  intervalData,
  circularAxisLabelMargin,
  circularAxisLabelFont,
  defaultAxisData,
  radiusData,
}: CircularAxisDataParam): CircularAxisData {
  const { maxLabelWidth, maxLabelHeight } = getMaxLabelSize(
    labels,
    circularAxisLabelMargin,
    circularAxisLabelFont
  );
  const {
    totalAngle,
    clockwise,
    axisSize,
    centerX,
    centerY,
    startAngle,
    endAngle,
    drawingStartAngle,
  } = defaultAxisData;
  const { tickInterval, labelInterval } = intervalData;
  const { innerRadius, outerRadius } = radiusData;
  const centralAngle = totalAngle / (labels.length + (totalAngle < DEGREE_360 ? -1 : DEGREE_0));
  /*
  return {
    labels,
    ...defaultAxisData,
    centralAngle,
    tickInterval,
    labelInterval,
    labelMargin: circularAxisLabelMargin,
    maxLabelWidth,
    maxLabelHeight,
    innerRadius,
    outerRadius,
  };
  */

  return {
    axisSize,
    centerX,
    centerY,
    label: {
      labels,
      interval: labelInterval,
      margin: circularAxisLabelMargin,
      maxWidth: maxLabelWidth,
      maxHeight: maxLabelHeight,
    },
    radius: {
      inner: innerRadius,
      outer: outerRadius,
    },
    angle: {
      start: startAngle,
      end: endAngle,
      total: totalAngle,
      central: centralAngle,
      drawingStart: drawingStartAngle,
    },
    tickInterval,
    clockwise,
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
      (options as ChartOptionsUsingVerticalAxis)?.verticalAxis?.label?.margin ??
      (isLabelOnVerticalAxis ? Y_LABEL_PADDING : 0),
    circularAxisLabelMargin: options?.circularAxis?.label?.margin ?? RADIAL_LABEL_PADDING,
  };
}

const axes: StoreModule = {
  name: 'radialAxes',
  state: () => ({
    radialAxes: {} as RadialAxes,
  }),
  action: {
    setRadialAxesData({ state }) {
      const { series, layout, scale } = state;
      const categories = state.categories as string[];
      const { plot } = layout;
      const isLabelOnVerticalAxis = isLabelAxisOnYAxis({ series, categories });
      const options = state.options as ChartOptionsUsingRadialAxes;
      const theme = state.theme as UsingRadialAxesChartTypeTheme;

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

      const defaultAxisData = getDefaultRadialAxisData(
        options,
        plot,
        maxLabelWidth,
        maxLabelHeight + circularAxisLabelMargin,
        isLabelOnVerticalAxis
      );

      const { axisSize } = defaultAxisData;
      const radiusData = isLabelOnVerticalAxis
        ? getRadiusInfo(
            axisSize,
            (options?.series as RadialBarSeriesOptions)?.radiusRange,
            yAxisLabels.length + 1
          )
        : {
            radiusRanges: makeTickPixelPositions(axisSize, yAxisLabels.length),
            innerRadius: 0,
            outerRadius: axisSize,
          };

      const verticalAxisData = getVerticalAxisData({
        labels: yAxisLabels,
        pointOnColumn: isLabelOnVerticalAxis,
        isLabelOnVerticalAxis,
        intervalData: getInitAxisIntervalData(isLabelOnVerticalAxis, {
          axis: (options as ChartOptionsUsingVerticalAxis).verticalAxis,
          categories,
          layout,
        }),
        verticalAxisLabelMargin,
        verticalAxisLabelFont,
        defaultAxisData,
        radiusData,
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
          radiusData,
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
