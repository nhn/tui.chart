import { StoreModule, Layout, CircleLegend, Legend, Options } from '@t/store/store';
import { extend } from '@src/store/store';
import { Align, Rect, Size, BaseSizeOptions } from '@t/options';
import { LEGEND_ITEM_HEIGHT, LEGEND_MARGIN_Y } from '@src/brushes/legend';
import { isUndefined, pick } from '@src/helpers/utils';
import { isCenterYAxis } from './axes';
import { BUTTON_RECT_SIZE } from '@src/component/exportMenu';
import { getTextWidth } from '@src/helpers/calculator';
import { TICK_SIZE } from '@src/brushes/axis';

export const padding = { X: 10, Y: 15 };
export const X_AXIS_HEIGHT = 20;
const MAIN_TITLE_HEIGHT = 18;
const X_AXIS_TITLE_HEIGHT = 11;
const Y_AXIS_TITLE_HEIGHT = 11;
const Y_AXIS_MIN_WIDTH = 40;

export function isVerticalAlign(align?: Align) {
  return align === 'top' || align === 'bottom';
}

type OptionalSize = Partial<Size> | null;

type OptionSize = {
  yAxis: OptionalSize;
  xAxis: OptionalSize;
  plot: OptionalSize;
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
};

type XAxisRectParam = AxisParam & {
  yAxis: Rect;
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

function getYAxisXPoint(yAxisRectParam: YAxisRectParam) {
  const {
    chartSize,
    legend,
    circleLegend,
    yAxisTitle,
    hasCenterYAxis,
    maxLabelWidth,
    size,
  } = yAxisRectParam;
  const { width } = chartSize;
  const { align } = legend;

  let x = yAxisTitle.x;
  let yAxisWidth = size?.yAxis?.width ?? maxLabelWidth;

  if (hasCenterYAxis) {
    yAxisWidth = maxLabelWidth + (TICK_SIZE + padding.X) * 2;
    x = (width - legend.width - yAxisWidth + padding.X * 2) / 2;
  }

  if (legend.visible && align === 'left') {
    x = yAxisTitle.x;
  }

  if (circleLegend.visible && align === 'left') {
    x = Math.max(circleLegend.width + padding.X, x);
  }

  return x;
}

function getYAxisYPoint({ legend, yAxisTitle }: YAxisRectParam) {
  const { align } = legend;

  let y = yAxisTitle.y + yAxisTitle.height;

  if (legend.visible) {
    const legendAreaHeight = LEGEND_ITEM_HEIGHT + LEGEND_MARGIN_Y + padding.Y;
    const topArea = Math.max(y, legendAreaHeight);

    if (align === 'top') {
      y = topArea;
    }
  }

  return y;
}

function getYAxisWidth({ hasCenterYAxis, hasAxis, maxLabelWidth, size }: YAxisRectParam) {
  let yAxisWidth = size?.yAxis?.width ?? maxLabelWidth;

  if (hasCenterYAxis) {
    yAxisWidth = maxLabelWidth + (TICK_SIZE + padding.X) * 2;
  } else if (!hasAxis) {
    yAxisWidth = 0;
  }

  return yAxisWidth;
}

function getYAxisHeight({ chartSize, legend, yAxisTitle, hasAxis, size }: YAxisRectParam) {
  const { height } = chartSize;
  const { align } = legend;
  const xAxisHeight = getDefaultXAxisHeight(size);

  const y = yAxisTitle.y + yAxisTitle.height;
  let yAxisHeight = height - y - xAxisHeight - X_AXIS_TITLE_HEIGHT;

  if (!hasAxis) {
    yAxisHeight = height - y;
  }

  if (legend.visible) {
    const legendAreaHeight = LEGEND_ITEM_HEIGHT + LEGEND_MARGIN_Y + padding.Y;
    const topArea = Math.max(y, legendAreaHeight);

    if (align === 'top') {
      yAxisHeight = height - topArea - X_AXIS_HEIGHT - X_AXIS_TITLE_HEIGHT;
    } else if (align === 'bottom') {
      yAxisHeight = height - y - X_AXIS_HEIGHT - X_AXIS_TITLE_HEIGHT - LEGEND_ITEM_HEIGHT;
    }
  }

  if (!size?.yAxis?.height && size?.plot?.height) {
    yAxisHeight = size.plot.height;
  }

  return yAxisHeight;
}

function getYAxisRect(yAxisRectParam: YAxisRectParam) {
  const { size } = yAxisRectParam;
  const x = getYAxisXPoint(yAxisRectParam);
  const y = getYAxisYPoint(yAxisRectParam);
  const yAxisWidth = getYAxisWidth(yAxisRectParam);
  const yAxisHeight = getYAxisHeight(yAxisRectParam);

  return { x, y, ...getValidRectSize(size?.yAxis, yAxisWidth, yAxisHeight) };
}

function getXAxisWidth({
  chartSize,
  yAxis,
  hasCenterYAxis,
  size,
  legend,
  circleLegend,
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

  if (!size?.xAxis?.width && size?.plot?.width) {
    xAxisWidth = size.plot.width;
  }

  return xAxisWidth;
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

function getLegendRect(chartSize: Size, xAxis: Rect, yAxis: Rect, title: Rect, legend: Legend) {
  const { align, width: legendWidth } = legend;
  const { width } = chartSize;
  const verticalAlign = isVerticalAlign(align);
  let x = xAxis.x + xAxis.width + padding.X;
  let y = Math.max(yAxis.y, BUTTON_RECT_SIZE);

  if (verticalAlign) {
    x = (width - legendWidth) / 2;
    y =
      align === 'top' ? title.height : yAxis.y + yAxis.height + X_AXIS_HEIGHT + X_AXIS_TITLE_HEIGHT;
  } else if (align === 'left') {
    x = padding.X;
  }

  return { width: legendWidth, height: yAxis.height - xAxis.height, x, y };
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

function getTitleRect(chartSize: Size, exportMenu: Rect, visible: boolean) {
  const point = { x: padding.X, y: padding.Y };
  const marginBottom = 5;
  const width = visible ? chartSize.width : 0;
  const height = visible
    ? Math.max(MAIN_TITLE_HEIGHT + marginBottom, exportMenu.height)
    : exportMenu.height;

  return { width, height, ...point };
}

function getYAxisTitleRect(
  chartSize: Size,
  visible: boolean,
  title: Rect,
  legend: Legend,
  hasCenterYAxis: boolean
) {
  const point = { x: title.x, y: title.y + title.height };
  const marginBottom = 5;
  const height = visible ? Y_AXIS_TITLE_HEIGHT + marginBottom : 0;
  const width = visible ? chartSize.width - legend.width : 0;

  if (legend.visible) {
    if (legend.align === 'left') {
      point.x += legend.width;
    } else if (legend.align === 'top') {
      point.y += LEGEND_ITEM_HEIGHT;
    }
  }

  if (hasCenterYAxis) {
    point.x = (width + padding.X * 2) / 2;
  }

  return { height, width, ...point };
}

function getXAxisTitleRect(visible: boolean, xAxis: Rect) {
  const point = { x: xAxis.x, y: xAxis.y + xAxis.height };
  const height = visible ? X_AXIS_TITLE_HEIGHT : 0;
  const width = visible ? xAxis.width : 0;

  return { height, width, ...point };
}

function getExportMenuRect(chartSize: Size, visible: boolean) {
  const marginY = 5;
  const x = visible ? padding.X + chartSize.width - BUTTON_RECT_SIZE : 0;
  const y = visible ? padding.Y : 0;
  const height = visible ? BUTTON_RECT_SIZE + marginY : 0;
  const width = visible ? BUTTON_RECT_SIZE : 0;

  return { x, y, height, width };
}

export function isExportMenuVisible(options: Options) {
  const visible = options.exportMenu?.visible;

  return isUndefined(visible) ? true : visible;
}

function getMaxLabelWidth(labels: string[] = []) {
  const labelWidths = labels.map((label) => getTextWidth(label));

  return labelWidths.length ? Math.max(...labelWidths) + padding.X : Y_AXIS_MIN_WIDTH;
}

function pickOptionSize(option?: BaseSizeOptions): OptionalSize {
  if (!option || (isUndefined(option.width) && isUndefined(option.height))) {
    return null;
  }

  return pick(option, 'width', 'height');
}

function getOptionSize(options: Options) {
  const xAxis = pickOptionSize(options.xAxis);
  const yAxis = pickOptionSize(options.yAxis);
  const plot = pickOptionSize(options.plot);

  /*
    If both the width of the x-axis and the width of the plot are entered,
    set the maximum value.
  */
  if (xAxis?.width && plot?.width) {
    xAxis.width = plot.width = Math.max(xAxis.width, plot.width);
  }

  /*
    If both the height of the y-axis and the height of the plot are entered,
    set the maximum value.
  */
  if (yAxis?.height && plot?.height) {
    yAxis.height = plot.height = Math.max(yAxis.height, plot.height);
  }

  return {
    xAxis,
    yAxis,
    plot,
  };
}

const layout: StoreModule = {
  name: 'layout',
  state: () => ({
    layout: {} as Layout,
  }),
  action: {
    setLayout({ state }) {
      const { legend: legendState } = state;
      const {
        legend: { align },
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

      // Don't change the order!
      // exportMenu -> title -> yAxis.title -> yAxis -> xAxis -> xAxis.title -> legend -> circleLegend -> plot
      const exportMenu = getExportMenuRect(chartSize, isExportMenuVisible(options));
      const title = getTitleRect(chartSize, exportMenu, !!options.chart?.title);
      const yAxisTitle = getYAxisTitleRect(
        chartSize,
        !!options.yAxis?.title,
        title,
        legendState,
        hasCenterYAxis
      );
      const yAxis = getYAxisRect({
        chartSize,
        legend: legendState,
        circleLegend: circleLegendState,
        yAxisTitle,
        hasCenterYAxis,
        hasAxis,
        maxLabelWidth: getMaxLabelWidth(axes?.yAxis.labels),
        size: optionSize,
      });
      const xAxis = getXAxisRect({
        chartSize,
        yAxis,
        legend: legendState,
        circleLegend: circleLegendState,
        hasCenterYAxis,
        hasAxis,
        size: optionSize,
      });
      const xAxisTitle = getXAxisTitleRect(!!options.xAxis?.title, xAxis);
      const legend = getLegendRect(chartSize, xAxis, yAxis, title, legendState);
      const circleLegend = getCircleLegendRect(xAxis, yAxis, align, circleLegendState.width);
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
