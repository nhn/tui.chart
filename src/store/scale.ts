import { extend } from '@src/store/store';
import { StoreModule, Stack, Scale } from '@t/store/store';
import { isLabelAxisOnYAxis } from '@src/helpers/axes';
import { coordinateScaleCalculator, getStackScaleData } from '@src/scale/coordinateScaleCalculator';

function isPercentStack(stack?: Stack) {
  return stack && stack.type === 'percent';
}

const scale: StoreModule = {
  name: 'scale',
  state: () => ({
    scale: {} as Scale
  }),
  action: {
    setScale({ state }) {
      const { series, dataRange, layout, stackSeries, options } = state;
      const scaleData = {};

      const labelAxisOnYAxis = isLabelAxisOnYAxis(series);
      const valueAxis = labelAxisOnYAxis ? 'xAxis' : 'yAxis';
      const offsetSizeProp = labelAxisOnYAxis ? 'width' : 'height';
      const scaleOptions = { xAxis: options?.xAxis?.scale, yAxis: options?.yAxis?.scale };

      Object.keys(series).forEach(seriesName => {
        if (isPercentStack(stackSeries.column?.stack) || isPercentStack(stackSeries.bar?.stack)) {
          scaleData[valueAxis] = getStackScaleData('percentStack');
        } else {
          scaleData[valueAxis] = coordinateScaleCalculator({
            dataRange: dataRange[seriesName],
            offsetSize: layout.plot[offsetSizeProp],
            scaleOption: scaleOptions[valueAxis]
          });
        }
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
