import {
  StoreModule,
  Layout,
  CircleLegend,
  Legend,
  Options,
  AxisData,
  CircularAxisData,
  ChartOptionsUsingYAxis,
  Series,
} from '@t/store/store';
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
import { AxisTheme, CircularAxisTheme } from '@t/theme';

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
  hasXYAxis: boolean;
  size: OptionSize;
};

type YAxisRectParam = AxisParam & {
  yAxisTitle: Rect;
  maxLabelWidth: number;
  isRightSide?: boolean;
  visibleSecondaryYAxis?: boolean;
  xAxisTitleHeight: number;
};

type XAxisRectParam = AxisParam & {
  yAxis: Rect;
  secondaryYAxis: Rect;
  xAxisData: AxisData;
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
};

type LegendRectParams = {
  legend: Legend;
  xAxis: Rect;
  yAxis: Rect;
  title: Rect;
  chartSize: Size;
  hasXYAxis: boolean;
  secondaryYAxis: Rect;
  xAxisTitleHeight: number;
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
    hasXYAxis,
    maxLabelWidth,
    visibleSecondaryYAxis = false,
    isRightSide = false,
  } = yAxisRectParam;
  let yAxisWidth = getDefaultYAxisWidth(yAxisRectParam);

  if (hasCenterYAxis && !isRightSide) {
    yAxisWidth = maxLabelWidth + (TICK_SIZE + padding.X) * 2;
  } else if (!hasXYAxis || (isRightSide && !visibleSecondaryYAxis)) {
    yAxisWidth = 0;
  }

  return yAxisWidth;
}

function getYAxisHeight({
  chartSize,
  legend,
  yAxisTitle,
  hasXYAxis,
  size,
  xAxisTitleHeight,
}: YAxisRectParam) {
  const { height } = chartSize;
  const { align, height: legendHeight } = legend;
  const xAxisHeight = getDefaultXAxisHeight(size);

  const y = yAxisTitle.y + yAxisTitle.height;
  let yAxisHeight = height - y - xAxisHeight - xAxisTitleHeight;

  if (!hasXYAxis) {
    yAxisHeight = height - y;
  }

  if (legend.visible) {
    const topArea = Math.max(y, legendHeight);

    if (align === 'top') {
      yAxisHeight = height - topArea - (hasXYAxis ? X_AXIS_HEIGHT + xAxisTitleHeight : 0);
    } else if (align === 'bottom') {
      yAxisHeight = height - y - X_AXIS_HEIGHT - xAxisTitleHeight - legendHeight;
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
  xAxisData,
}: XAxisRectParam) {
  const { width } = chartSize;
  const { align, width: legendWidth } = legend;
  const legendVerticalAlign = isVerticalAlign(align);
  let xAxisWidth;

  if (legendVerticalAlign) {
    xAxisWidth = width - (yAxis.x + yAxis.width + padding.X);

    if (circleLegend.visible) {
      xAxisWidth -= circleLegend.width;
    }
  } else {
    xAxisWidth =
      width - (yAxis.width + Math.max(legendWidth, circleLegend.visible ? circleLegend.width : 0));
  }

  if (hasCenterYAxis) {
    xAxisWidth = width - (legendVerticalAlign ? 0 : legendWidth) - padding.X * 2;
  }

  if (secondaryYAxis.width) {
    xAxisWidth -= secondaryYAxis.width;
  }

  if (xAxisData?.maxLabelWidth) {
    // subtract half of the maximum label length to secure margin size
    xAxisWidth -= xAxisData.maxLabelWidth * 0.5;
  }

  return xAxisWidth;
}

function getXAxisHeight(xAxisData: AxisData, hasXYAxis = false) {
  if (!hasXYAxis) {
    return 0;
  }

  return xAxisData?.maxHeight ?? X_AXIS_HEIGHT;
}

function getXAxisRect(xAxisRectParam: XAxisRectParam) {
  const { hasXYAxis, hasCenterYAxis, yAxis, size, xAxisData } = xAxisRectParam;
  const x = hasCenterYAxis ? padding.X * 2 : yAxis.x + yAxis.width;
  const y = yAxis.y + yAxis.height;
  const xAxisWidth = getXAxisWidth(xAxisRectParam);
  const xAxisHeight = getXAxisHeight(xAxisData, hasXYAxis);

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
    hasXYAxis,
    secondaryYAxis,
    xAxisTitleHeight,
  } = legendRectParams;
  if (!legend.visible) {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
  }

  const { align, width: legendWidth, height: legendHeight } = legend;
  const { width } = chartSize;
  const verticalAlign = isVerticalAlign(align);
  let x = xAxis.x + xAxis.width + secondaryYAxis.width + padding.X;
  let y = Math.max(yAxis.y, BUTTON_RECT_SIZE);

  if (verticalAlign) {
    x = (width - legendWidth) / 2;

    if (align === 'top') {
      y = title.y + title.height;
    } else {
      y = yAxis.y + yAxis.height + (hasXYAxis ? xAxis.height + xAxisTitleHeight : padding.Y);
    }
  } else if (align === 'left') {
    x = padding.X;
  }

  return { width: legendWidth, height: legendHeight, x, y };
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
    ...getValidRectSize(size, xAxis.width, yAxis.height),
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

function getTopLegendAreaHeight(useSpectrumLegend: boolean, legendHeight: number) {
  return useSpectrumLegend
    ? SPECTRUM_LEGEND_LABEL_HEIGHT +
        spectrumLegendBar.PADDING * 2 +
        spectrumLegendTooltip.POINT_HEIGHT +
        spectrumLegendTooltip.HEIGHT +
        padding.Y
    : legendHeight + padding.Y;
}

function getYAxisTitleRect({
  chartSize,
  visible,
  title,
  legend: {
    align: legendAlign,
    width: legendWidth,
    height: legendHeight,
    visible: legendVisible,
    useSpectrumLegend,
  },
  hasCenterYAxis,
  visibleSecondaryYAxis,
  isRightSide = false,
  yAxisTitleHeight,
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
      point.y += getTopLegendAreaHeight(useSpectrumLegend, legendHeight);
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

function getYAxisMaxLabelWidth(maxLabelLength?: number) {
  return maxLabelLength ? maxLabelLength + padding.X : Y_AXIS_MIN_WIDTH;
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

  const yAxisOptions = getYAxisOption(options as ChartOptionsUsingYAxis);
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

function getAxisTitleHeight(axisTheme: AxisTheme | AxisTheme[], offsetY = 0) {
  const fontSize = Array.isArray(axisTheme)
    ? Math.max(axisTheme[0].title!.fontSize!, axisTheme[1].title!.fontSize!)
    : axisTheme.title!.fontSize!;

  return fontSize + offsetY;
}

function adjustAxisSize(
  { width, height }: Size,
  layout: Pick<
    Layout,
    'title' | 'yAxisTitle' | 'yAxis' | 'xAxis' | 'xAxisTitle' | 'legend' | 'secondaryYAxis'
  >,
  legendState: Legend
) {
  if (width < 0 || height < 0) {
    return;
  }

  const { title, yAxisTitle, yAxis, xAxis, xAxisTitle, legend, secondaryYAxis } = layout;
  const { align } = legendState;
  const hasVerticalLegend = isVerticalAlign(align);
  const legendHeight = hasVerticalLegend ? legend.height : 0;
  const diffHeight =
    xAxis.height +
    xAxisTitle.height +
    yAxis.height +
    yAxisTitle.height +
    title.height +
    legendHeight -
    height;

  if (diffHeight > 0) {
    yAxis.height -= diffHeight;
    xAxis.y -= diffHeight;
    xAxisTitle.y -= diffHeight;

    if (hasVerticalLegend) {
      legend.y -= diffHeight;
    }
  }

  secondaryYAxis.x = xAxis.x + xAxis.width;
  secondaryYAxis.height = yAxis.height;
}

function getCircularAxisTitleRect(
  plot: Rect,
  axisTheme: CircularAxisTheme,
  circularAxis: CircularAxisData
) {
  if (!circularAxis) {
    return { ...plot };
  }

  const { x, y } = plot;
  const {
    centerX,
    centerY,
    axisSize,
    title,
    radius: { outer },
  } = circularAxis;
  const offsetY = title?.offsetY ?? 0;

  return {
    x: centerX + x - axisSize / 2,
    y: centerY + y - outer / 2,
    width: axisSize,
    height: axisTheme.title!.fontSize! + offsetY,
  };
}

function hasXYAxes(series: Series) {
  return !(series.pie || series.radar || series.treemap || series.radialBar || series.gauge);
}

function getYAxisOptions(options: Options, hasXYAxis: boolean) {
  return hasXYAxis
    ? getYAxisOption(options as ChartOptionsUsingYAxis)
    : {
        yAxis: null,
        secondaryYAxis: null,
      };
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
        radialAxes,
      } = state;
      const { width, height } = chart;
      const chartSize = {
        height: height - padding.Y * 2,
        width: width - padding.X * 2,
      };
      const hasCenterYAxis = series.bar ? isCenterYAxis(options as ChartOptionsUsingYAxis) : false;
      const hasXYAxis = hasXYAxes(series);
      const optionSize = getOptionSize(options);
      const { yAxis: yAxisOption, secondaryYAxis: secondaryYAxisOption } = getYAxisOptions(
        options,
        hasXYAxis
      );

      const visibleSecondaryYAxis = !!secondaryYAxisOption;

      const titleHeight = theme.title.fontSize as number;
      const yAxisTitleHeight = getAxisTitleHeight(theme.yAxis, axes?.yAxis?.title?.offsetY) ?? 0;
      const xAxisTitleHeight = getAxisTitleHeight(theme.xAxis, axes?.xAxis?.title?.offsetY) ?? 0;
      // Don't change the order!
      // exportMenu -> resetButton -> title -> yAxis.title -> yAxis -> secondaryYAxisTitle -> secondaryYAxis -> xAxis -> xAxis.title -> legend -> circleLegend -> plot -> circularAxis.title
      const exportMenu = getExportMenuRect(chartSize, isExportMenuVisible(options));
      const resetButton = getResetButtonRect(exportMenu, isUsingResetButton(options));
      const btnAreaRect = exportMenu.height ? exportMenu : resetButton;
      const title = getTitleRect(chartSize, btnAreaRect, !!options.chart?.title, titleHeight);
      const yAxisTitleVisible = !!yAxisOption?.title || !!secondaryYAxisOption?.title;
      const yAxisTitle = getYAxisTitleRect({
        chartSize,
        visible: yAxisTitleVisible,
        title,
        legend: legendState,
        hasCenterYAxis,
        visibleSecondaryYAxis,
        yAxisTitleHeight,
      });

      const yAxis = getYAxisRect({
        chartSize,
        legend: legendState,
        circleLegend: circleLegendState,
        yAxisTitle,
        hasCenterYAxis,
        hasXYAxis,
        maxLabelWidth: getYAxisMaxLabelWidth(axes?.yAxis.maxLabelWidth),
        size: optionSize,
        xAxisTitleHeight,
      });

      const secondaryYAxisTitle = getYAxisTitleRect({
        chartSize,
        visible: yAxisTitleVisible,
        title,
        legend: legendState,
        hasCenterYAxis,
        isRightSide: true,
        visibleSecondaryYAxis,
        yAxisTitleHeight,
      });

      const secondaryYAxis = getYAxisRect({
        chartSize,
        legend: legendState,
        circleLegend: circleLegendState,
        yAxisTitle: secondaryYAxisTitle,
        hasCenterYAxis,
        hasXYAxis,
        maxLabelWidth: getYAxisMaxLabelWidth(axes?.secondaryYAxis?.maxLabelWidth),
        size: optionSize,
        isRightSide: true,
        visibleSecondaryYAxis,
        xAxisTitleHeight,
      });

      const xAxis = getXAxisRect({
        chartSize,
        yAxis,
        secondaryYAxis,
        legend: legendState,
        circleLegend: circleLegendState,
        hasCenterYAxis,
        hasXYAxis,
        size: optionSize,
        xAxisData: axes?.xAxis,
      });

      const xAxisTitle = getXAxisTitleRect(!!options.xAxis?.title, xAxis, xAxisTitleHeight);

      const legend = getLegendRect({
        chartSize,
        xAxis,
        yAxis,
        secondaryYAxis,
        title,
        legend: legendState,
        hasXYAxis,
        xAxisTitleHeight,
      });

      adjustAxisSize(
        chartSize,
        { title, yAxisTitle, yAxis, xAxis, xAxisTitle, legend, secondaryYAxis },
        legendState
      );

      const circleLegend = getCircleLegendRect(
        xAxis,
        yAxis,
        legendState.align,
        circleLegendState.width
      );

      const plot = getPlotRect(xAxis, yAxis, optionSize.plot);

      const circularAxisTitle = getCircularAxisTitleRect(
        plot,
        theme.circularAxis,
        radialAxes?.circularAxis
      );

      extend(state.layout, {
        chart: { x: 0, y: 0, width, height },
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
        circularAxisTitle,
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
