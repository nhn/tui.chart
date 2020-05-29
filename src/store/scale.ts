import { extend } from '@src/store/store';
import { StoreModule, Stack, Scale } from '@t/store/store';
import { getAxisName, getSizeKey, isLabelAxisOnYAxis } from '@src/helpers/axes';
import { coordinateScaleCalculator, getStackScaleData } from '@src/scale/coordinateScaleCalculator';
import { isCoordinateSeries } from '@src/helpers/coordinate';

function isPercentStack(stack?: Stack) {
  return stack && stack.type === 'percent';
}

const scale: StoreModule = {
  name: 'scale',
  state: () => ({
    scale: {} as Scale,
  }),
  action: {
    setScale({ state }) {
      const { series, dataRange, layout, stackSeries, options } = state;
      const scaleData = {};

      const labelAxisOnYAxis = isLabelAxisOnYAxis(series);
      const { labelAxisName, valueAxisName } = getAxisName(labelAxisOnYAxis);
      const { labelSizeKey, valueSizeKey } = getSizeKey(labelAxisOnYAxis);

      const scaleOptions = {
        xAxis: options?.xAxis?.scale,
        yAxis: options?.yAxis?.scale,
      };

      Object.keys(series).forEach((seriesName) => {
        if (isPercentStack(stackSeries.column?.stack) || isPercentStack(stackSeries.bar?.stack)) {
          scaleData[valueAxisName] = getStackScaleData('percentStack');
        } else if (isCoordinateSeries(series)) {
          const range = dataRange[seriesName];

          scaleData[valueAxisName] = coordinateScaleCalculator({
            dataRange: range[valueAxisName],
            offsetSize: layout.plot[valueSizeKey],
            scaleOption: scaleOptions[valueAxisName],
          });

          scaleData[labelAxisName] = coordinateScaleCalculator({
            dataRange: range[labelAxisName],
            offsetSize: layout.plot[labelSizeKey],
            scaleOption: scaleOptions[labelAxisName],
          });
        } else {
          scaleData[valueAxisName] = coordinateScaleCalculator({
            dataRange: dataRange[seriesName][valueAxisName],
            offsetSize: layout.plot[valueSizeKey],
            scaleOption: scaleOptions[valueAxisName],
          });
        }
      });

      extend(state.scale, scaleData);
    },
  },
  observe: {
    updateScale() {
      this.dispatch('setScale');
    },
  },
};

export default scale;
