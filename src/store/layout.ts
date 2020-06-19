import { StoreModule, Layout, CircleLegend } from '@t/store/store';
import { extend } from '@src/store/store';
import { Align, Rect, Size } from '@t/options';
import { LEGEND_ITEM_HEIGHT, LEGEND_MARGIN_TOP, LEGEND_MARGIN_BOTTOM } from '@src/brushes/legend';

const padding = { X: 10, Y: 15 };
const X_AXIS_LABEL_HEIGHT = 34;

export function isVerticalAlign(align?: Align) {
  return align === 'top' || align === 'bottom';
}

function getYAxisRect(chartSize: Size, align: Align, legendWidth: number, verticalAlign: boolean) {
  const { height } = chartSize;

  const x = align === 'left' ? legendWidth + padding.X : padding.X;
  const y = align === 'top' ? LEGEND_ITEM_HEIGHT + LEGEND_MARGIN_BOTTOM + padding.Y : padding.Y;
  const yAxisHeight = verticalAlign
    ? height - padding.Y * 2 - X_AXIS_LABEL_HEIGHT - LEGEND_ITEM_HEIGHT - LEGEND_MARGIN_BOTTOM
    : height - padding.Y * 2 - X_AXIS_LABEL_HEIGHT;

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

  let xAxisWidth = width - (yAxis.x + yAxis.width + legendWidth + padding.X * 2);

  if (align === 'left') {
    xAxisWidth = width - (yAxis.width + legendWidth + padding.X * 2);
  } else if (verticalAlign) {
    xAxisWidth = width - (yAxis.x + yAxis.width + padding.X);

    if (circleLegend.visible) {
      xAxisWidth -= circleLegend.width;
    }
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
    y = align === 'top' ? 0 : yAxis.y + yAxis.height + LEGEND_MARGIN_TOP;
  } else if (align === 'left') {
    x = padding.X;
  }

  return { width: legendWidth, height: yAxis.height, x, y };
}

function getCircleLegendRect(xAxis: Rect, yAxis: Rect, align: Align, width: number) {
  return {
    width,
    height: yAxis.height,
    x: align === 'left' ? 0 + padding.X : xAxis.x + xAxis.width + 10,
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

const layout: StoreModule = {
  name: 'layout',
  state: () => ({
    layout: {} as Layout,
  }),
  action: {
    setLayout({ state }) {
      const {
        chart: { height, width },
        legend: { align, width: legendWidth },
        circleLegend: circleLegendState,
      } = state;

      const verticalAlign = isVerticalAlign(align);
      const chartSize = { height, width };

      const yAxis = getYAxisRect(chartSize, align, legendWidth, verticalAlign);
      const xAxis = getXAxisRect(chartSize, yAxis, align, legendWidth, circleLegendState);
      const legend = getLegendRect(chartSize, xAxis, yAxis, align, legendWidth);
      const circleLegend = circleLegendState.visible
        ? getCircleLegendRect(xAxis, yAxis, align, circleLegendState.width)
        : null;

      const plot = getPlotRect(xAxis, yAxis);

      extend(state.layout, { yAxis, xAxis, plot, legend, circleLegend });
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
