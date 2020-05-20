import { Layout, StoreModule } from '@t/store/store';
import { extend } from '@src/store/store';

const layout: StoreModule = {
  name: 'layout',
  state: () => ({
    layout: {} as Layout
  }),
  action: {
    setLayout({ state }) {
      const {
        chart: { height, width }
      } = state;
      const padding = 10;

      const yAxis = {
        width: 50,
        height: height - padding * 2 - 34,
        x: 0 + padding,
        y: 0 + padding
      };

      const xAxis = {
        width: width - (yAxis.x + yAxis.width + padding * 2),
        height: 20,
        x: yAxis.x + yAxis.width,
        y: yAxis.y + yAxis.height
      };

      const plot = {
        width: xAxis.width,
        height: yAxis.height,
        x: xAxis.x,
        y: 0 + padding
      };

      extend(state.layout, { yAxis, xAxis, plot });
    }
  },
  observe: {
    updateLayoutObserve() {
      this.dispatch('setLayout');
    }
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
  }
};

export default layout;
