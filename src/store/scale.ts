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
      const { series, dataRange, layout, stackSeries } = state;
      const scaleData = {};

      const labelAxisOnYAxis = isLabelAxisOnYAxis(series);
      const valueAxis = labelAxisOnYAxis ? 'xAxis' : 'yAxis';
      const offsetSizeProp = labelAxisOnYAxis ? 'width' : 'height';

      Object.keys(series).forEach(seriesName => {
        if (isPercentStack(stackSeries.column?.stack) || isPercentStack(stackSeries.bar?.stack)) {
          // @TODO: 스택 percent에 따른 scale data 처리 필요
          scaleData[valueAxis] = getStackScaleData('percentStack');
        } else {
          scaleData[valueAxis] = coordinateScaleCalculator({
            range: dataRange[seriesName],
            offsetSize: layout.plot[offsetSizeProp]
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
