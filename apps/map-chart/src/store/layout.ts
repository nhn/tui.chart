import { Layout, StoreModule } from '@t/store';
import { extend } from '@src/store/store';

const layout: StoreModule = {
  name: 'layout',
  state: () => ({
    layout: {} as Layout,
  }),
  action: {
    setLayout({ state }) {
      const { chart } = state;
      const { width, height } = chart;

      extend(state.layout, {
        chart: { x: 0, y: 0, width, height },
        mapArea: { x: 0, y: 0, width: width - 100, height: height - 100 }, // @TODO: for layout test. need to remove after set legend area
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
