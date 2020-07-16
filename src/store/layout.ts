import { StoreModule, Layout, CircleLegend, Legend, Options } from '@t/store/store';
import { extend } from '@src/store/store';
import { Align, Rect, Size } from '@t/options';
import { LEGEND_ITEM_HEIGHT, LEGEND_MARGIN_Y } from '@src/brushes/legend';
import { isUndefined } from '@src/helpers/utils';
import { EXPORT_BUTTON_RECT_SIZE } from '@src/component/exportMenu';
import { isCenterYAxis } from './axes';

export const padding = { X: 10, Y: 15 };
export const X_AXIS_HEIGHT = 20;
const MAIN_TITLE_HEIGHT = 18;
const X_AXIS_TITLE_HEIGHT = 11;
const Y_AXIS_TITLE_HEIGHT = 11;

export function isVerticalAlign(align?: Align) {
  return align === 'top' || align === 'bottom';
}

function getYAxisRect(
  chartSize: Size,
  legend: Legend,
  circleLegend: CircleLegend,
  yAxisTitle: Rect,
  hasCenterYAxis: boolean
) {
  const { height, width } = chartSize;
  const { align } = legend;

  let x = yAxisTitle.x;
  let y = yAxisTitle.y + yAxisTitle.height;
  let yAxisHeight = height - y - X_AXIS_HEIGHT - X_AXIS_TITLE_HEIGHT;

  if (legend.visible) {
    const legendAreaHeight = LEGEND_ITEM_HEIGHT + LEGEND_MARGIN_Y + padding.Y;
    const topArea = Math.max(yAxisTitle.y + yAxisTitle.height, legendAreaHeight);

    if (align === 'left') {
      x = yAxisTitle.x;
    } else if (align === 'top') {
      y = topArea;
      yAxisHeight = height - topArea - X_AXIS_HEIGHT - X_AXIS_TITLE_HEIGHT;
    } else if (align === 'bottom') {
      yAxisHeight = height - y - X_AXIS_HEIGHT - X_AXIS_TITLE_HEIGHT - LEGEND_ITEM_HEIGHT;
    }
  }

  if (circleLegend.visible) {
    if (align === 'left') {
      x = Math.max(circleLegend.width + padding.X, x);
    }
  }

  let yAxisWidth = 40; // @TODO: y축 값 너비 계산해서 지정해줘야함

  if (hasCenterYAxis) {
    yAxisWidth = 80; // @TODO: y축 값 너비 계산해서 지정
    x = (width - legend.width - yAxisWidth + padding.X * 2) / 2;
  }

  return {
    x,
    y,
    height: yAxisHeight,
    width: yAxisWidth,
  };
}

function getXAxisRect(
  chartSize: Size,
  yAxis: Rect,
  legend: Legend,
  circleLegend: CircleLegend,
  hasCenterYAxis: boolean
) {
  const { width } = chartSize;
  const { align, width: legendWidth } = legend;
  const verticalAlign = isVerticalAlign(align);

  let xAxisWidth;
  let x = yAxis.x + yAxis.width;

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
    width: xAxisWidth,
    height: X_AXIS_HEIGHT,
    x,
    y: yAxis.y + yAxis.height,
  };
}

function getLegendRect(chartSize: Size, xAxis: Rect, yAxis: Rect, title: Rect, legend: Legend) {
  const { align, width: legendWidth } = legend;
  const { width } = chartSize;
  const verticalAlign = isVerticalAlign(align);
  let x = xAxis.x + xAxis.width + padding.X;
  let y = Math.max(yAxis.y, EXPORT_BUTTON_RECT_SIZE);

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
  const x = visible ? padding.X + chartSize.width - EXPORT_BUTTON_RECT_SIZE : 0;
  const y = visible ? padding.Y : 0;
  const height = visible ? EXPORT_BUTTON_RECT_SIZE + marginY : 0;
  const width = visible ? EXPORT_BUTTON_RECT_SIZE : 0;

  return { x, y, height, width };
}

export function isExportMenuVisible(options: Options) {
  const visible = options.exportMenu?.visible;

  return isUndefined(visible) ? true : visible;
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
      } = state;
      const chartSize = {
        height: chart.height - padding.Y * 2,
        width: chart.width - padding.X * 2,
      };
      const hasCenterYAxis = isCenterYAxis(options, !!series.bar);

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
      const yAxis = getYAxisRect(
        chartSize,
        legendState,
        circleLegendState,
        yAxisTitle,
        hasCenterYAxis
      );
      const xAxis = getXAxisRect(chartSize, yAxis, legendState, circleLegendState, hasCenterYAxis);
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
