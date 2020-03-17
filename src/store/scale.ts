import { StoreModule, ScaleData } from '../../types/store/store';

import coordinateScaleCalculator from '@src/scale/coordinateScaleCalculator';

const scale: StoreModule = {
  name: 'scale',
  state: () => ({
    scale: {}
  }),
  action: {
    setScale({ state }) {
      const { series, dataRange, layout } = state;
      const scaleData: Record<string, ScaleData> = {};

      Object.keys(series).forEach(seriesName => {
        scaleData.yAxis = coordinateScaleCalculator({
          range: dataRange[seriesName],
          offsetSize: layout.plot.height
        });
      });

      this.extend(state.scale, scaleData);
    }
  },
  observe: {
    updateScale() {
      this.dispatch('setScale');
    }
  }
};

export default scale;
