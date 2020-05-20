import { StoreModule, ScaleData } from '@t/store/store';

import coordinateScaleCalculator from '@src/scale/coordinateScaleCalculator';
import { isLabelAxisOnYAxis } from '@src/helpers/axes';
import { extend } from '@src/store/store';

const scale: StoreModule = {
  name: 'scale',
  state: () => ({
    scale: {}
  }),
  action: {
    setScale({ state }) {
      const { series, dataRange, layout } = state;
      const scaleData: Record<string, ScaleData> = {};

      const labelAxisOnYAxis = isLabelAxisOnYAxis(series);
      const valueAxis = labelAxisOnYAxis ? 'xAxis' : 'yAxis';
      const offsetSizeProp = labelAxisOnYAxis ? 'width' : 'height';

      Object.keys(series).forEach(seriesName => {
        scaleData[valueAxis] = coordinateScaleCalculator({
          range: dataRange[seriesName],
          offsetSize: layout.plot[offsetSizeProp]
        });
      });

      extend(state.scale, scaleData);
    }
  },
  observe: {
    updateScale() {
      this.dispatch('setScale');
    }
  }
};

export default scale;
