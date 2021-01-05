import { StoreModule, Layout, CircleLegend, Legend, Options } from '@t/store/store';
import { extend } from '@src/store/store';
import {
  Align,
  Rect,
  Size,
  BaseSizeOptions,
  LineTypeSeriesOptions,
  TreemapChartSeriesOptions,
} from '@t/options';

import { isUndefined, pick, isNumber } from '@src/helpers/utils';
import { isCenterYAxis } from './axes';
import { BUTTON_RECT_SIZE } from '@src/component/exportMenu';
import { TICK_SIZE } from '@src/brushes/axis';
import {
  SPECTRUM_LEGEND_LABEL_HEIGHT,
  spectrumLegendBar,
  spectrumLegendTooltip,
} from '@src/brushes/spectrumLegend';
import { getYAxisOption } from '@src/helpers/axes';
import { getMaxLengthLabelWidth } from '@src/helpers/calculator';
import { AxisTheme } from '@t/theme';
import { getLegendItemHeight } from '@src/brushes/legend';

export const padding = { X: 10, Y: 15 };
export const X_AXIS_HEIGHT = 20;
const Y_AXIS_MIN_WIDTH = 40;

export function isVerticalAlign(align?: Align) {
  return align === 'top' || align === 'bottom';
}

type OptionalSize = Partial<Size> | null;

type OptionSize = {
  yAxis: OptionalSize;
  xAxis: OptionalSize;
  plot: OptionalSize;
  secondaryYAxis: OptionalSize;
};

type AxisParam = {
  chartSize: Size;
  legend: Legend;
  circleLegend: CircleLegend;
  hasCenterYAxis: boolean;
  hasAxis: boolean;
  size: OptionSize;
};

type YAxisRectParam = AxisParam & {
  yAxisTitle: Rect;
  maxLabelWidth: number;
  isRightSide?: boolean;
  visibleSecondaryYAxis?: boolean;
  xAxisTitleHeight: number;
  legendItemHeight: number;
};

type XAxisRectParam = AxisParam & {
  yAxis: Rect;
  secondaryYAxis: Rect;
};

type YAxisTitleRectParam = {
  chartSize: Size;
  visible: boolean;
  title: Rect;
  legend: Legend;
  hasCenterYAxis: boolean;
  isRightSide?: boolean;
  visibleSecondaryYAxis?: boolean;
  yAxisTitleHeight: number;
  legendItemHeight: number;
};

type LegendRectParams = {
  legend: Legend;
  xAxis: Rect;
  yAxis: Rect;
  title: Rect;
  chartSize: Size;
  hasAxis: boolean;
  secondaryYAxis: Rect;
  xAxisTitleHeight: number;
  legendItemHeight: number;
};

function getValidRectSize(size: OptionalSize, width: number, height: number) {
  return {
    height: size?.height ?? height,
    width: size?.width ?? width,
  };
}

function getDefaultXAxisHeight(size: OptionSize) {
  return size.xAxis?.height && !size.yAxis ? size.xAxis.height : X_AXIS_HEIGHT;
}

function getDefaultYAxisXPoint(yAxisRectParam: YAxisRectParam) {
  const { yAxisTitle, isRightSide, visibleSecondaryYAxis } = yAxisRectParam;
  const yAxisWidth = getDefaultYAxisWidth(yAxisRectParam);

  return isRightSide && visibleSecondaryYAxis
    ? Math.max(yAxisTitle.x + yAxisTitle.width - yAxisWidth, 0)
    : yAxisTitle.x;
}

function getYAxisXPoint(yAxisRectParam: YAxisRectParam) {
  const { chartSize, legend, circleLegend, hasCenterYAxis, maxLabelWidth } = yAxisRectParam;
  const { width } = chartSize;
  const { align } = legend;

  let yAxisWidth = getDefaultYAxisWidth(yAxisRectParam);
  let x = getDefaultYAxisXPoint(yAxisRectParam);

  if (hasCenterYAxis) {
    yAxisWidth = maxLabelWidth + (TICK_SIZE + padding.X) * 2;
    x = (width - legend.width - yAxisWidth + padding.X * 2) / 2;
  }

  if (legend.visible && align === 'left') {
    x = getDefaultYAxisXPoint(yAxisRectParam);
  }

  if (circleLegend.visible && align === 'left') {
    x = Math.max(circleLegend.width + padding.X, x);
  }

  return x;
}

function getYAxisYPoint({ yAxisTitle }: YAxisRectParam) {
  return yAxisTitle.y + yAxisTitle.height;
}

function getDefaultYAxisWidth({ maxLabelWidth, size, isRightSide }: YAxisRectParam) {
  return size?.[isRightSide ? 'secondaryYAxis' : 'yAxis']?.width ?? maxLabelWidth;
}

function getYAxisWidth(yAxisRectParam: YAxisRectParam) {
  const {
    hasCenterYAxis,
    hasAxis,
    maxLabelWidth,
    visibleSecondaryYAxis = false,
    isRightSide = false,
  } = yAxisRectParam;
  let yAxisWidth = getDefaultYAxisWidth(yAxisRectParam);

  if (hasCenterYAxis && !isRightSide) {
    yAxisWidth = maxLabelWidth + (TICK_SIZE + padding.X) * 2;
  } else if (!hasAxis || (isRightSide && !visibleSecondaryYAxis)) {
    yAxisWidth = 0;
  }

  return yAxisWidth;
}

function getYAxisHeight({
  chartSize,
  legend,
  yAxisTitle,
  hasAxis,
  size,
  xAxisTitleHeight,
  legendItemHeight,
}: YAxisRectParam) {
  const { height } = chartSize;
  const { align, useSpectrumLegend } = legend;
  const xAxisHeight = getDefaultXAxisHeight(size);

  const y = yAxisTitle.y + yAxisTitle.height;
  let yAxisHeight = height - y - xAxisHeight - xAxisTitleHeight;

  if (!hasAxis) {
    yAxisHeight = height - y;
  }

  if (legend.visible) {
    const legendAreaHeight = getTopLegendAreaHeight(useSpectrumLegend, legendItemHeight);
    const topArea = Math.max(y, legendAreaHeight);

    if (align === 'top') {
      yAxisHeight = height - topArea - (hasAxis ? X_AXIS_HEIGHT + xAxisTitleHeight : 0);
    } else if (align === 'bottom') {
      yAxisHeight = height - y - X_AXIS_HEIGHT - xAxisTitleHeight - legendItemHeight;
    }
  }

  if (!size?.yAxis?.height && size?.plot?.height) {
    yAxisHeight = size.plot.height;
  }

  return yAxisHeight;
}

function getYAxisRect(yAxisRectParam: YAxisRectParam) {
  const { size, isRightSide = false } = yAxisRectParam;
  const x = getYAxisXPoint(yAxisRectParam);
  const y = getYAxisYPoint(yAxisRectParam);
  const yAxisWidth = getYAxisWidth(yAxisRectParam);
  const yAxisHeight = getYAxisHeight(yAxisRectParam);

  return {
    x,
    y,
    ...getValidRectSize(isRightSide ? size?.secondaryYAxis : size?.yAxis, yAxisWidth, yAxisHeight),
  };
}

function getXAxisWidth({
  chartSize,
  yAxis,
  hasCenterYAxis,
  legend,
  circleLegend,
  secondaryYAxis,
}: XAxisRectParam) {
  const { width } = chartSize;
  const { align, width: legendWidth } = legend;
  const verticalAlign = isVerticalAlign(align);

  let xAxisWidth;

  if (verticalAlign) {
    xAxisWidth = width - (yAxis.x + yAxis.width + padding.X);

    if (circleLegend.visible) {
      xAxisWidth -= circleLegend.width;
    }
  } else {
    xAxisWidth = width - (yAxis.width + Math.max(legendWidth, circleLegend.width));
  }

  if (hasCenterYAxis) {
    xAxisWidth = width - legendWidth - padding.X * 2;
  }

  return xAxisWidth - secondaryYAxis.width;
}

function getXAxisRect(xAxisRectParam: XAxisRectParam) {
  const { hasAxis, hasCenterYAxis, yAxis, size } = xAxisRectParam;
  const x = hasCenterYAxis ? padding.X * 2 : yAxis.x + yAxis.width;
  const y = yAxis.y + yAxis.height;
  const xAxisWidth = getXAxisWidth(xAxisRectParam);
  const xAxisHeight = !hasAxis ? 0 : X_AXIS_HEIGHT;

  return {
    x,
    y,
    ...getValidRectSize(size?.xAxis, xAxisWidth, xAxisHeight),
  };
}

function getLegendRect(legendRectParams: LegendRectParams) {
  const {
    legend,
    xAxis,
    yAxis,
    chartSize,
    title,
    hasAxis,
    secondaryYAxis,
    xAxisTitleHeight,
    legendItemHeight,
  } = legendRectParams;

  const { align, width: legendWidth } = legend;
  const { width } = chartSize;
  const verticalAlign = isVerticalAlign(align);
  let x = xAxis.x + xAxis.width + secondaryYAxis.width + padding.X;
  let y = Math.max(yAxis.y, BUTTON_RECT_SIZE);
  let height = yAxis.height - xAxis.height;

  if (verticalAlign) {
    x = (width - legendWidth) / 2;
    if (align === 'top') {
      y = title.y + title.height;
      height = getTopLegendAreaHeight(legend.useSpectrumLegend, legendItemHeight);
    } else {
      y = yAxis.y + yAxis.height + (hasAxis ? X_AXIS_HEIGHT + xAxisTitleHeight : padding.Y);
    }
  } else if (align === 'left') {
    x = padding.X;
  }

  return { width: legendWidth, height, x, y };
}

function getCircleLegendRect(xAxis: Rect, yAxis: Rect, align: Align, width: number) {
  return {
    width,
    height: yAxis.height,
    x: align === 'left' ? padding.X : xAxis.x + xAxis.width + padding.X,
    y: yAxis.y,
  };
}

function getPlotRect(xAxis: Rect, yAxis: Rect, size: OptionalSize) {
  return {
    x: xAxis.x,
    y: yAxis.y,
    ...getValidRectSize(size, Math.max(xAxis.width, 1), Math.max(yAxis.height, 1)),
    // @TODO: Math.max(xAxis.width, 1), Math.max(yAxis.height, 1) 리팩토링 필요
    // 차트 사이즈를 지정하지 않는 상태에서 plot의 너비와 높이가 잘못 계산되고,
    // scale의 stepSize에 영향을 줌. xAxis.width, yAxis.height 값을 보정하도록 해야함.
  };
}

function getTitleRect(chartSize: Size, exportMenu: Rect, visible: boolean, titleHeight: number) {
  const point = { x: padding.X, y: padding.Y };
  const marginBottom = 5;
  const width = visible ? chartSize.width - exportMenu.width : 0;
  const height = visible
    ? Math.max(titleHeight + marginBottom, exportMenu.height)
    : exportMenu.height;

  return { width, height, ...point };
}

function getTopLegendAreaHeight(useSpectrumLegend: boolean, legendItemHeight: number) {
  return useSpectrumLegend
    ? SPECTRUM_LEGEND_LABEL_HEIGHT +
        spectrumLegendBar.PADDING * 2 +
        spectrumLegendTooltip.POINT_HEIGHT +
        spectrumLegendTooltip.HEIGHT +
        padding.Y
    : legendItemHeight + padding.Y;
}

function getYAxisTitleRect({
  chartSize,
  visible,
  title,
  legend: { align: legendAlign, width: legendWidth, visible: legendVisible, useSpectrumLegend },
  hasCenterYAxis,
  visibleSecondaryYAxis,
  isRightSide = false,
  yAxisTitleHeight,
  legendItemHeight,
}: YAxisTitleRectParam) {
  const marginBottom = 5;
  const height = visible ? yAxisTitleHeight + marginBottom : 0;
  const verticalLegendAlign = isVerticalAlign(legendAlign);

  const width =
    (chartSize.width - (verticalLegendAlign ? padding.X * 2 : legendWidth)) /
    (visibleSecondaryYAxis ? 2 : 1);

  const point = {
    x: isRightSide ? title.x + width : title.x,
    y: title.y + title.height,
  };

  if (legendVisible) {
    if (legendAlign === 'left') {
      point.x += legendWidth;
    } else if (legendAlign === 'top') {
      point.y += getTopLegendAreaHeight(useSpectrumLegend, legendItemHeight);
    }
  }

  if (hasCenterYAxis) {
    point.x = (width + padding.X * 2) / 2;
  }

  return { height, width, ...point };
}

function getXAxisTitleRect(visible: boolean, xAxis: Rect, xAxisTitleHeight: number) {
  const point = { x: xAxis.x, y: xAxis.y + xAxis.height };
  const height = visible ? xAxisTitleHeight : 0;
  const width = visible ? xAxis.width : 0;

  return { height, width, ...point };
}

function getExportMenuRect(chartSize: Size, visible: boolean) {
  const marginY = 5;
  const x = visible ? padding.X + chartSize.width - BUTTON_RECT_SIZE : padding.X + chartSize.width;
  const y = padding.Y;
  const height = visible ? BUTTON_RECT_SIZE + marginY : 0;
  const width = visible ? BUTTON_RECT_SIZE : 0;

  return { x, y, height, width };
}

function getResetButtonRect(exportMenu: Rect, useResetButton: boolean) {
  const marginY = 5;
  const x = useResetButton ? exportMenu.x - BUTTON_RECT_SIZE - padding.X : 0;
  const y = useResetButton ? exportMenu.y : 0;
  const height = useResetButton ? BUTTON_RECT_SIZE + marginY : 0;
  const width = useResetButton ? BUTTON_RECT_SIZE : 0;

  return { x, y, height, width };
}

export function isUsingResetButton(options: Options) {
  return !!(options.series as LineTypeSeriesOptions | TreemapChartSeriesOptions)?.zoomable;
}

export function isExportMenuVisible(options: Options) {
  const visible = options.exportMenu?.visible;

  return isUndefined(visible) ? true : visible;
}

function getMaxLabelWidth(labels: string[] = []) {
  return labels.length ? getMaxLengthLabelWidth(labels) + padding.X : Y_AXIS_MIN_WIDTH;
}

function pickOptionSize(option?: BaseSizeOptions): OptionalSize {
  if (!option || (isUndefined(option.width) && isUndefined(option.height))) {
    return null;
  }

  return pick(option, 'width', 'height');
}

function validOffsetValue(axis: OptionalSize, plot: OptionalSize, sizeKey: 'width' | 'height') {
  const axisSize = axis![sizeKey];
  const plotSize = plot![sizeKey];

  if (isNumber(axisSize) && isNumber(plotSize)) {
    return Math.max(axisSize, plotSize);
  }
}

function getOptionSize(options: Options) {
  const xAxis = pickOptionSize(options.xAxis);

  const yAxisOptions = getYAxisOption(options);
  const yAxis = pickOptionSize(yAxisOptions.yAxis);
  const secondaryYAxis = pickOptionSize(yAxisOptions.secondaryYAxis);

  const plot = pickOptionSize(options.plot);

  if (plot) {
    /*
    If both the width of the x-axis and the width of the plot are entered,
    set the maximum value.
  */
    if (xAxis) {
      xAxis.width = plot.width = validOffsetValue(xAxis, plot, 'width');
    }

    /*
    If both the height of the y-axis and the height of the plot are entered,
    set the maximum value.
  */
    if (yAxis) {
      yAxis.height = plot.height = validOffsetValue(yAxis, plot, 'height');
    }

    if (secondaryYAxis) {
      secondaryYAxis.height = plot.height = validOffsetValue(secondaryYAxis, plot, 'height');
    }
  }

  return {
    xAxis,
    yAxis,
    plot,
    secondaryYAxis,
  };
}

function getYAxisTitleHeight(axisTheme: AxisTheme | AxisTheme[]) {
  if (Array.isArray(axisTheme)) {
    return Math.max(axisTheme[0].title!.fontSize!, axisTheme[1].title!.fontSize!);
  }

  return axisTheme.title!.fontSize;
}

const layout: StoreModule = {
  name: 'layout',
  state: () => ({
    layout: {} as Layout,
  }),
  action: {
    setLayout({ state }) {
      const {
        legend: legendState,
        theme,
        circleLegend: circleLegendState,
        series,
        options,
        chart,
        axes,
      } = state;
      const chartSize = {
        height: chart.height - padding.Y * 2,
        width: chart.width - padding.X * 2,
      };
      const hasCenterYAxis = isCenterYAxis(options, !!series.bar);
      const hasAxis = !(series.pie || series.radar || series.treemap);
      const optionSize = getOptionSize(options);
      const { yAxis: yAxisOption, secondaryYAxis: secondaryYAxisOption } = getYAxisOption(options);
      const visibleSecondaryYAxis = !!secondaryYAxisOption;

      const titleHeight = theme.title.fontSize as number;
      const yAxisTitleHeight = getYAxisTitleHeight(theme.yAxis) as number;
      const xAxisTitleHeight = theme.xAxis.title!.fontSize as number;
      const legendItemHeight = getLegendItemHeight(theme.legend.label!.fontSize!);

      // Don't change the order!
      // exportMenu -> resetButton -> title -> yAxis.title -> yAxis -> secondaryYAxisTitle -> secondaryYAxis -> xAxis -> xAxis.title -> legend -> circleLegend -> plot
      const exportMenu = getExportMenuRect(chartSize, isExportMenuVisible(options));
      const resetButton = getResetButtonRect(exportMenu, isUsingResetButton(options));
      const title = getTitleRect(chartSize, exportMenu, !!options.chart?.title, titleHeight);
      const yAxisTitle = getYAxisTitleRect({
        chartSize,
        visible: !!yAxisOption?.title || !!secondaryYAxisOption?.title,
        title,
        legend: legendState,
        hasCenterYAxis,
        visibleSecondaryYAxis,
        yAxisTitleHeight,
        legendItemHeight,
      });

      const yAxis = getYAxisRect({
        chartSize,
        legend: legendState,
        circleLegend: circleLegendState,
        yAxisTitle,
        hasCenterYAxis,
        hasAxis,
        maxLabelWidth: getMaxLabelWidth(axes?.yAxis.labels),
        size: optionSize,
        xAxisTitleHeight,
        legendItemHeight,
      });

      const secondaryYAxisTitle = getYAxisTitleRect({
        chartSize,
        visible: !!yAxisOption?.title || !!secondaryYAxisOption?.title,
        title,
        legend: legendState,
        hasCenterYAxis,
        isRightSide: true,
        visibleSecondaryYAxis,
        yAxisTitleHeight,
        legendItemHeight,
      });

      const secondaryYAxis = getYAxisRect({
        chartSize,
        legend: legendState,
        circleLegend: circleLegendState,
        yAxisTitle: secondaryYAxisTitle,
        hasCenterYAxis,
        hasAxis,
        maxLabelWidth: getMaxLabelWidth(axes?.secondaryYAxis?.labels),
        size: optionSize,
        isRightSide: true,
        visibleSecondaryYAxis,
        xAxisTitleHeight,
        legendItemHeight,
      });

      const xAxis = getXAxisRect({
        chartSize,
        yAxis,
        secondaryYAxis,
        legend: legendState,
        circleLegend: circleLegendState,
        hasCenterYAxis,
        hasAxis,
        size: optionSize,
      });
      const xAxisTitle = getXAxisTitleRect(!!options.xAxis?.title, xAxis, xAxisTitleHeight);
      const legend = getLegendRect({
        chartSize,
        xAxis,
        yAxis,
        secondaryYAxis,
        title,
        legend: legendState,
        hasAxis,
        xAxisTitleHeight,
        legendItemHeight,
      });

      const circleLegend = getCircleLegendRect(
        xAxis,
        yAxis,
        legendState.align,
        circleLegendState.width
      );
      const plot = getPlotRect(xAxis, yAxis, optionSize.plot);

      extend(state.layout, {
        title,
        plot,
        legend,
        circleLegend,
        xAxis,
        xAxisTitle,
        yAxis,
        yAxisTitle,
        exportMenu,
        resetButton,
        secondaryYAxisTitle,
        secondaryYAxis,
      });
    },
  },
  observe: {
    updateLayoutObserve() {
      this.dispatch('setLayout');
    },
  },
};

export default layout;
