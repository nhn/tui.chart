import { StoreModule, Options } from '@t/store/store';
import { getAxisFormatter, getInitAxisIntervalData, getMaxLabelSize } from '@src/helpers/axes';
import { initSectorOptions } from '@src/helpers/sector';
import {
  isSemiCircle,
  getDefaultRadius,
  getSemiCircleCenterY,
  getTotalAngle,
} from '@src/helpers/pieSeries';
import { Rect } from '@t/options';
import { makeLabelsFromLimit, makeTickPixelPositions } from '@src/helpers/calculator';
import { getTitleFontString } from '@src/helpers/style';

export const CATEGORY_LABEL_PADDING = 25;

type DefaultRadialAxisData = {
  axisSize: number;
  centerX: number;
  centerY: number;
  totalAngle: number;
  drawingStartAngle: number;
};

function getDefaultAxisData(
  options: Options,
  plot: Rect,
  maxLabelWidth = 0,
  maxLabelHeight = 0,
  isRadialBar = false
): DefaultRadialAxisData {
  let isSemiCircular = false;
  let centerY = plot.height / 2;
  let totalAngle = 360;
  let drawingStartAngle = 0;

  if (isRadialBar) {
    const { clockwise, startAngle, endAngle } = initSectorOptions(options.series);

    isSemiCircular = isSemiCircle(clockwise, startAngle, endAngle);
    centerY = isSemiCircular ? getSemiCircleCenterY(plot.height, clockwise) : plot.height / 2;
    totalAngle = getTotalAngle(clockwise, startAngle, endAngle);
    drawingStartAngle = startAngle;
  }

  return {
    axisSize: getDefaultRadius(plot, isSemiCircular, maxLabelWidth, maxLabelHeight),
    centerX: plot.width / 2,
    centerY,
    totalAngle,
    drawingStartAngle: drawingStartAngle - 90,
  };
}

const axes: StoreModule = {
  name: 'axes',
  state: () => ({
    radialAxes: {
      circularAxis: {},
      yAxis: {},
    },
  }),
  action: {
    setRadialAxesData({ state }) {
      const { series, options, layout, scale, theme } = state;
      const { plot } = layout;
      const isRadialBar = !!series.radialBar;
      const categories = state.categories as string[];

      const valueAxisName = isRadialBar ? 'xAxis' : 'yAxis';
      const valueFormatter = getAxisFormatter(options, valueAxisName);
      const { limit, stepSize } = scale[valueAxisName];
      const valueLabels = makeLabelsFromLimit(limit, stepSize);
      const labels = valueLabels.map((label, index) =>
        valueFormatter(label, { index, labels: valueLabels, axisName: valueAxisName })
      );
      const categoryAxisName = series.radialBar ? 'yAxis' : 'xAxis';
      const categoryFormatter = getAxisFormatter(options, categoryAxisName);
      const categoryLabels = categories.map((label, index) =>
        categoryFormatter(label, { index, labels: categories, axisName: categoryAxisName })
      );

      const yAxisLabelMargin = options?.yAxis?.label?.margin ?? (isRadialBar ? 5 : 0);
      const xAxisLabelMargin = options?.xAxis?.label?.margin ?? 25;

      let yAxis = {};
      let circularAxis = {};

      if (isRadialBar) {
        const yAxisIntervalData = getInitAxisIntervalData(true, {
          axis: options.yAxis,
          categories,
          layout,
        });
        const { maxLabelWidth, maxLabelHeight } = getMaxLabelSize(
          labels,
          xAxisLabelMargin,
          getTitleFontString(theme.radialAxis.label)
        );
        const { axisSize, centerX, centerY, totalAngle, drawingStartAngle } = getDefaultAxisData(
          options,
          plot,
          maxLabelWidth,
          maxLabelHeight,
          isRadialBar
        );

        yAxis = {
          labels: categoryLabels,
          tickDistance: axisSize / categoryLabels.length,
          axisSize,
          centerX,
          centerY,
          radiusRanges: makeTickPixelPositions(axisSize, categoryLabels.length + 1)
            .splice(1, labels.length - 1)
            .reverse(),
          pointOnColumn: true,
          labelInterval: yAxisIntervalData.labelInterval,
          ...getMaxLabelSize(
            categoryLabels,
            yAxisLabelMargin,
            getTitleFontString(theme.yAxis.label)
          ),
          labelMargin: yAxisLabelMargin,
        };
        const xAxisIntervalData = getInitAxisIntervalData(true, {
          axis: options.xAxis,
          categories,
          layout,
        });

        circularAxis = {
          labels,
          axisSize,
          centerX,
          centerY,
          degree: totalAngle / labels.length,
          maxLabelWidth,
          maxLabelHeight,
          tickInterval: xAxisIntervalData.tickInterval,
          labelInterval: xAxisIntervalData.labelInterval,
          totalAngle,
          drawingStartAngle,
          labelMargin: xAxisLabelMargin,
        };
      } else {
        const { labelInterval } = getInitAxisIntervalData(false, {
          axis: options.xAxis,
          categories,
          layout,
        });

        const { maxLabelWidth, maxLabelHeight } = getMaxLabelSize(
          categoryLabels,
          xAxisLabelMargin,
          getTitleFontString(theme.radialAxis.label)
        );
        const { axisSize, centerX, centerY, totalAngle, drawingStartAngle } = getDefaultAxisData(
          options,
          plot,
          maxLabelWidth + CATEGORY_LABEL_PADDING,
          maxLabelHeight + CATEGORY_LABEL_PADDING,
          isRadialBar
        );

        yAxis = {
          labels,
          tickDistance: axisSize / labels.length,
          axisSize,
          centerX,
          centerY,
          radiusRanges: makeTickPixelPositions(axisSize, labels.length),
          pointOnColumn: false,
          labelInterval,
          ...getMaxLabelSize(labels, yAxisLabelMargin, getTitleFontString(theme.yAxis.label)),
          labelMargin: yAxisLabelMargin,
        };

        const xAxisIntervalData = getInitAxisIntervalData(true, {
          axis: options.xAxis,
          categories,
          layout,
        });

        circularAxis = {
          labels: categoryLabels,
          axisSize,
          centerX,
          centerY,
          degree: totalAngle / categoryLabels.length,
          maxLabelWidth,
          maxLabelHeight,
          tickInterval: xAxisIntervalData.tickInterval,
          labelInterval: xAxisIntervalData.labelInterval,
          totalAngle,
          drawingStartAngle,
          labelMargin: xAxisLabelMargin,
        };
      }

      state.radialAxes = {
        circularAxis,
        yAxis,
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
