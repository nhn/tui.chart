import { StoreModule, Layout, CircleLegend, Legend, Options } from '@t/store/store';
import { extend } from '@src/store/store';
import {
  Align,
  Rect,
  Size,
  BaseXAxisOptions,
  BaseAxisOptions,
  BarTypeYAxisOptions,
  LineTypeXAxisOptions,
} from '@t/options';
import { LEGEND_ITEM_HEIGHT, LEGEND_MARGIN_Y } from '@src/brushes/legend';
import { isUndefined, pick } from '@src/helpers/utils';
import { isCenterYAxis } from './axes';
import { BUTTON_RECT_SIZE } from '@src/component/exportMenu';
import { getTextWidth } from '@src/helpers/calculator';

export const padding = { X: 10, Y: 15 };
export const X_AXIS_HEIGHT = 20;
const MAIN_TITLE_HEIGHT = 18;
const X_AXIS_TITLE_HEIGHT = 11;
const Y_AXIS_TITLE_HEIGHT = 11;
const Y_AXIS_MIN_WIDTH = 40;

export function isVerticalAlign(align?: Align) {
  return align === 'top' || align === 'bottom';
}

type OptionAxisSize = {
  yAxis: Partial<Size> | null;
  xAxis: Partial<Size> | null;
};

type AxisParam = {
  chartSize: Size;
  legend: Legend;
  circleLegend: CircleLegend;
  hasCenterYAxis: boolean;
  hasAxis: boolean;
  size: OptionAxisSize;
};

type YAxisRectParam = AxisParam & {
  yAxisTitle: Rect;
  maxLabelWidth: number;
};

type XAxisRectParam = AxisParam & {
  yAxis: Rect;
};

function adjustRectSize(size: Partial<Size> | null, width: number, height: number) {
  return {
    height: size?.height ?? height,
    width: size?.width ?? width,
  };
}

function getDefaultXAxisHeight(size: OptionAxisSize) {
  return size.xAxis?.height && !size.yAxis ? size.xAxis?.height : X_AXIS_HEIGHT;
}

function getYAxisRect({
  chartSize,
  legend,
  circleLegend,
  yAxisTitle,
  hasCenterYAxis,
  hasAxis,
  maxLabelWidth,
  size,
}: YAxisRectParam) {
  const { height, width } = chartSize;
  const { align } = legend;
  const DEFAULT_X_HEIGHT = getDefaultXAxisHeight(size);

  let x = yAxisTitle.x;
  let y = yAxisTitle.y + yAxisTitle.height;
  let yAxisHeight = height - y - DEFAULT_X_HEIGHT - X_AXIS_TITLE_HEIGHT;
  let yAxisWidth = size?.yAxis?.width ?? maxLabelWidth;

  if (hasCenterYAxis) {
    yAxisWidth = maxLabelWidth + 30;
    x = (width - legend.width - yAxisWidth + padding.X * 2) / 2;
  } else if (!hasAxis) {
    yAxisWidth = 0;
    yAxisHeight = height - y;
  }

  if (legend.visible) {
    const legendAreaHeight = LEGEND_ITEM_HEIGHT + LEGEND_MARGIN_Y + padding.Y;
    const topArea = Math.max(y, legendAreaHeight);

    if (align === 'left') {
      x = yAxisTitle.x;
    } else if (align === 'top') {
      y = topArea;
      yAxisHeight = height - topArea - X_AXIS_HEIGHT - X_AXIS_TITLE_HEIGHT;
    } else if (align === 'bottom') {
      yAxisHeight = height - y - X_AXIS_HEIGHT - X_AXIS_TITLE_HEIGHT - LEGEND_ITEM_HEIGHT;
    }
  }

  if (circleLegend.visible && align === 'left') {
    x = Math.max(circleLegend.width + padding.X, x);
  }

  return {
    x,
    y,
    ...adjustRectSize(size?.yAxis, yAxisWidth, yAxisHeight),
  };
}

function getXAxisRect({
  chartSize,
  yAxis,
  legend,
  circleLegend,
  hasCenterYAxis,
  hasAxis,
  size,
}: XAxisRectParam) {
  const { width } = chartSize;
  const { align, width: legendWidth } = legend;
  const verticalAlign = isVerticalAlign(align);

  let xAxisWidth;
  let x = yAxis.x + yAxis.width;
  const xAxisHeight = !hasAxis ? 0 : X_AXIS_HEIGHT;

  if (verticalAlign) {
    xAxisWidth = width - (yAxis.x + yAxis.width + padding.X);

    if (circleLegend.visible) {
      xAxisWidth -= circleLegend.width;
    }
  } else {
    xAxisWidth = width - (yAxis.width + Math.max(legendWidth, circleLegend.width));
  }

  if (hasCenterYAxis) {
    x = padding.X * 2;
    xAxisWidth = width - legendWidth - padding.X * 2;
  }

  return {
    x,
    y: yAxis.y + yAxis.height,
    ...adjustRectSize(size?.xAxis, xAxisWidth, xAxisHeight),
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

function getPlotRect(xAxis: Rect, yAxis: Rect) {
  return {
    width: xAxis.width,
    height: yAxis.height,
    x: xAxis.x,
    y: yAxis.y,
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

  return labelWidths?.length ? Math.max(...labelWidths) + padding.X * 2 : Y_AXIS_MIN_WIDTH;
}

function getAxisSize(
  axis?: BaseAxisOptions | BarTypeYAxisOptions | BaseXAxisOptions | LineTypeXAxisOptions
): Partial<Size> | null {
  if (!axis || (!axis?.width && !axis?.height)) {
    return null;
  }

  return pick(axis, 'width', 'height');
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
      const hasAxis = !(series.pie || series.radar);
      const optionsAxisSize = {
        xAxis: getAxisSize(options.xAxis),
        yAxis: getAxisSize(options.yAxis),
      };

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
        size: optionsAxisSize,
      });
      const xAxis = getXAxisRect({
        chartSize,
        yAxis,
        legend: legendState,
        circleLegend: circleLegendState,
        hasCenterYAxis,
        hasAxis,
        size: optionsAxisSize,
      });
      const xAxisTitle = getXAxisTitleRect(!!options.xAxis?.title, xAxis);
      const legend = getLegendRect(chartSize, xAxis, yAxis, title, legendState);
      const circleLegend = getCircleLegendRect(xAxis, yAxis, align, circleLegendState.width);
      const plot = getPlotRect(xAxis, yAxis);

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
    // setLayout({chart}) {
    //   const yAxis = {
    //     width: 33,
    //     height: chart.height,
    //     x: 0,
    //     y: 0
    //   };
    //   const xAxis = {
    //     width: chart.width,
    //     height: 34,
    //     x: yAxis.x + yAxis.width,
    //     y: yAxis.y + yAxis.height
    //   };
    //   const plot = {
    //     width: chart.width - yAxis.width,
    //     height: chart.height - xAxis.height,
    //     x: yAxis.x + yAxis.width,
    //     y: 0
    //   };
    //   this.dispatch('setLayout', {
    //     plot,
    //     xAxis,
    //     yAxis
    //   });
    // }
  },
};

export default layout;
