import { StoreModule, ScaleData } from '@t/store/store';

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
      const valueAxis = series.bar ? 'xAxis' : 'yAxis';
      const offsetSizeProp = series.bar ? 'width' : 'height';

      Object.keys(series).forEach(seriesName => {
        scaleData[valueAxis] = coordinateScaleCalculator({
          range: dataRange[seriesName],
          offsetSize: layout.plot[offsetSizeProp]
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
