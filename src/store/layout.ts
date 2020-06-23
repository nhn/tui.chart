import { StoreModule, Layout, CircleLegend, Legend } from '@t/store/store';
import { extend } from '@src/store/store';
import { Align, Rect, Size } from '@t/options';
import { LEGEND_ITEM_HEIGHT, LEGEND_MARGIN_Y } from '@src/brushes/legend';

const padding = { X: 10, Y: 15 };
const X_AXIS_LABEL_HEIGHT = 34;
const MAIN_TITLE_HEIGHT = 18;

export function isVerticalAlign(align?: Align) {
  return align === 'top' || align === 'bottom';
}

function getYAxisRect(chartSize: Size, legend: Legend, circleLegend: CircleLegend, title: Rect) {
  const { align, visible, width } = legend;
  const { height } = chartSize;
  const verticalAlign = isVerticalAlign(align);

  let x = padding.X;
  let y = padding.Y;
  let yAxisHeight = height - padding.Y * 2 - X_AXIS_LABEL_HEIGHT;

  if (visible) {
    if (align === 'left') {
      x = width + padding.X;
    } else if (align === 'top') {
      y = LEGEND_ITEM_HEIGHT + LEGEND_MARGIN_Y + padding.Y;
    }

    if (verticalAlign) {
      yAxisHeight =
        height - padding.Y * 2 - X_AXIS_LABEL_HEIGHT - LEGEND_ITEM_HEIGHT - LEGEND_MARGIN_Y;
    }
  }

  if (circleLegend.visible) {
    if (align === 'left') {
      x = Math.max(circleLegend.width + padding.X, x);
    }
  }

  y += title.y;
  yAxisHeight -= title.height;

  return {
    x,
    y,
    height: yAxisHeight,
    width: 40, // @TODO: y축 값 너비 계산해서 지정해줘야함
  };
}

function getXAxisRect(
  chartSize: Size,
  yAxis: Rect,
  align: Align,
  legendWidth: number,
  circleLegend: CircleLegend
) {
  const { width } = chartSize;
  const verticalAlign = isVerticalAlign(align);

  let xAxisWidth;

  if (verticalAlign) {
    xAxisWidth = width - (yAxis.x + yAxis.width + padding.X);

    if (circleLegend.visible) {
      xAxisWidth -= circleLegend.width;
    }
  } else {
    xAxisWidth = width - (yAxis.width + Math.max(legendWidth, circleLegend.width) + padding.X) - 30; // @TODO: 마지막 라벨 길이
  }

  return {
    width: xAxisWidth,
    height: 20,
    x: yAxis.x + yAxis.width,
    y: yAxis.y + yAxis.height,
  };
}

function getLegendRect(
  chartSize: Size,
  xAxis: Rect,
  yAxis: Rect,
  align: Align,
  legendWidth: number
) {
  const { width } = chartSize;
  const verticalAlign = isVerticalAlign(align);
  let x = xAxis.x + xAxis.width + padding.X;
  let y = yAxis.y;

  if (verticalAlign) {
    x = (width - legendWidth) / 2;
    y = align === 'top' ? 0 : yAxis.y + yAxis.height + X_AXIS_LABEL_HEIGHT;
  } else if (align === 'left') {
    x = padding.X;
  }

  return { width: legendWidth, height: yAxis.height, x, y };
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

function getTitleRect(chartSize: Size, visible?: boolean) {
  return visible
    ? {
        width: chartSize.width - padding.X * 2,
        height: MAIN_TITLE_HEIGHT,
        x: padding.X,
        y: padding.Y,
      }
    : {
        width: 0,
        height: 0,
        x: 0,
        y: 0,
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
        chart: { height, width },
        legend: { align, width: legendWidth },
        circleLegend: circleLegendState,
        options,
      } = state;

      const chartSize = { height, width };

      const title = getTitleRect(chartSize, !!options.chart?.title);
      const yAxis = getYAxisRect(chartSize, legendState, circleLegendState, title);
      const xAxis = getXAxisRect(chartSize, yAxis, align, legendWidth, circleLegendState);
      const legend = getLegendRect(chartSize, xAxis, yAxis, align, legendWidth);
      const circleLegend = getCircleLegendRect(xAxis, yAxis, align, circleLegendState.width);
      const plot = getPlotRect(xAxis, yAxis);

      extend(state.layout, { yAxis, xAxis, plot, legend, circleLegend, title });
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
