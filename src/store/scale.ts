import { extend } from '@src/store/store';
import { StoreModule, Scale } from '@t/store/store';
import { getAxisName, getSizeKey, isLabelAxisOnYAxis } from '@src/helpers/axes';
import { calculateCoordinateScale, getStackScaleData } from '@src/scale/coordinateScaleCalculator';
import { calculateDatetimeScale } from '@src/scale/datetimeScaleCalculator';
import { isCoordinateSeries } from '@src/helpers/coordinate';
import { hasPercentStackSeries } from './stackSeriesData';
import { isExist } from '@src/helpers/utils';

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
        if (hasPercentStackSeries(stackSeries)) {
          scaleData[valueAxisName] = getStackScaleData(stackSeries[seriesName].scaleType);
        } else if (isCoordinateSeries(series)) {
          const dateTypeLabel = isExist(options.xAxis?.date);
          const range = dataRange[seriesName];
          const labelOptions = {
            dataRange: range[labelAxisName],
            offsetSize: layout.plot[labelSizeKey],
            scaleOption: scaleOptions[labelAxisName],
            rawCategoriesSize: state.rawCategories.length,
          };
          const valueOptions = {
            dataRange: range[valueAxisName],
            offsetSize: layout.plot[valueSizeKey],
            scaleOption: scaleOptions[valueAxisName],
          };

          scaleData[valueAxisName] = calculateCoordinateScale(valueOptions);
          scaleData[labelAxisName] = dateTypeLabel
            ? calculateDatetimeScale(labelOptions)
            : calculateCoordinateScale(labelOptions);
        } else {
          scaleData[valueAxisName] = calculateCoordinateScale({
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
