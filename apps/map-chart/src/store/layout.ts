import { ActionParams, ChartOptions, Layout, Legend, Rect, StoreModule } from '@t/store';
import { extend } from '@src/store/store';
import { isVerticalAlign } from '@src/helpers/legend';

const BUTTON_RECT_SIZE = 24;
const BUTTON_MARGIN = 5;

function calculateZoomButtonLayout(chartWidth: number, titleHeight: number) {
  const buttonCount = 2;
  const width = (BUTTON_RECT_SIZE + BUTTON_MARGIN) * buttonCount + BUTTON_MARGIN;
  const height = Math.max(BUTTON_RECT_SIZE + BUTTON_MARGIN * 2, titleHeight);

  return { x: chartWidth - width, y: 0, width, height };
}

function calculateTitleLayout(chartWidth: number, zoomButtonRect: Rect) {
  return {
    x: 0,
    y: 0,
    width: chartWidth - zoomButtonRect.width,
    height: zoomButtonRect.height,
  };
}

function calculateLegendLayout(chartRect: ChartOptions, headerRect: Rect, legend: Legend) {
  const titleEndYPoint = headerRect.y + headerRect.height;
  let x = 0;
  let y = titleEndYPoint;
  const { width, height, align: legendAlign } = legend;

  if (isVerticalAlign(legendAlign)) {
    x = (chartRect.width - legend.width) / 2;
    if (legendAlign === 'bottom') {
      y = chartRect.height - height;
    }
  } else {
    y = (chartRect.height - legend.height) / 2;
    if (legendAlign === 'right') {
      x = chartRect.width - width;
    }
  }

  return { x, y, width, height };
}

function calculateMapLayout(chartWidth: number, chartHeight: number, headerRect: Rect) {
  return {
    x: 0,
    y: headerRect.height,
    width: chartWidth,
    height: chartHeight - headerRect.height,
  };
}

function calculateHeaderAreaRect(title: Rect, zoomButton: Rect) {
  return {
    x: 0,
    y: 0,
    height: Math.max(title.height, zoomButton.height),
    width: Math.max(title.width, zoomButton.width),
  };
}

const layout: StoreModule = {
  name: 'layout',
  state: () => ({
    layout: {} as Layout,
  }),
  action: {
    setLayout({ state }: ActionParams) {
      const { chart, legend: legendState } = state;
      const { width, height } = chart;
      // Don't change the order!
      // zoomButton -> title -> map -> legend
      // @TODO: Apply Theme + Visible options
      const titleFontSize = 40;
      const titleHeight = titleFontSize + BUTTON_MARGIN * 2;
      const zoomButton = calculateZoomButtonLayout(width, titleHeight);
      const title = calculateTitleLayout(width, zoomButton);
      const headerRect = calculateHeaderAreaRect(title, zoomButton);
      const map = calculateMapLayout(width, height, headerRect);
      const legend = calculateLegendLayout(chart, headerRect, legendState);

      extend(state.layout, {
        chart: { x: 0, y: 0, width, height },
        map,
        legend,
        title,
        zoomButton,
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
