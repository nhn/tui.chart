import { Layout, Rect, StoreModule } from '@t/store';
import { extend } from '@src/store/store';

const BUTTON_RECT_SIZE = 24;
const BUTTON_MARGIN = 5; // 안으로?

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

function calculateLegendLayout(chartHeight: number) {
  const legendWidth = 50;
  const legendHeight = chartHeight / 2;

  return {
    x: 0,
    y: 0,
    width: 50,
    height: 50,
  };
}

function calculateMapLayout(chartWidth: number, chartHeight: number, zoomButtonRect: Rect) {
  return {
    x: 0,
    y: zoomButtonRect.height,
    width: chartWidth,
    height: chartHeight - zoomButtonRect.height,
  };
}

const layout: StoreModule = {
  name: 'layout',
  state: () => ({
    layout: {} as Layout,
  }),
  action: {
    setLayout({ state }) {
      const { chart, options } = state;
      const { width, height } = chart;

      console.log(options);

      const titleFontSize = 40;
      const titleHeight = titleFontSize + BUTTON_MARGIN * 2; // theme + visible 옵션
      const zoomButton = calculateZoomButtonLayout(width, titleHeight);
      const title = calculateTitleLayout(width, zoomButton);
      const map = calculateMapLayout(width, height, title); // 옵션으로 레이아웃이 넘어 갈 수도 있음
      const legend = calculateLegendLayout();

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
