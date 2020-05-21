import { extend } from '@src/store/store';
import { StoreModule, Stack, Scale, ValueEdge } from '@t/store/store';
import { isLabelAxisOnYAxis } from '@src/helpers/axes';
import { coordinateScaleCalculator, getStackScaleData } from '@src/scale/coordinateScaleCalculator';
import { isNumber } from '@src/helpers/utils';

function isPercentStack(stack?: Stack) {
  return stack && stack.type === 'percent';
}

function makeScaleOptions(dataRange: ValueEdge, scaleOptions?: Partial<ValueEdge>): ValueEdge {
  return {
    max: isNumber(scaleOptions?.max) ? scaleOptions!.max : dataRange.max,
    min: isNumber(scaleOptions?.min) ? scaleOptions!.min : dataRange.min
  };
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
          // @TODO: 스택 percent에 따른 scale data 처리 필요
          scaleData[valueAxis] = getStackScaleData('percentStack');
        } else {
          scaleData[valueAxis] = coordinateScaleCalculator({
            range: {
              scale: makeScaleOptions(dataRange[seriesName], scaleOptions[valueAxis]),
              data: dataRange[seriesName]
            },
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
