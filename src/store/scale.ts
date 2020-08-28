import { extend } from '@src/store/store';
import { StoreModule, Scale } from '@t/store/store';
import { getAxisName, getSizeKey, isLabelAxisOnYAxis } from '@src/helpers/axes';
import {
  calculateCoordinateScale,
  calculateScaleForCoordinateLineType,
  getStackScaleData,
} from '@src/scale/coordinateScaleCalculator';
import { calculateDatetimeScale } from '@src/scale/datetimeScaleCalculator';
import { isCoordinateSeries } from '@src/helpers/coordinate';
import { hasPercentStackSeries } from './stackSeriesData';
import { isExist } from '@src/helpers/utils';
import { LineChartOptions } from '@t/options';

const scale: StoreModule = {
  name: 'scale',
  state: () => ({
    scale: {} as Scale,
  }),
  action: {
    setScale({ state }) {
      const { series, dataRange, layout, stackSeries, options, categories } = state;
      const scaleData = {};

      const labelAxisOnYAxis = isLabelAxisOnYAxis(series, options);
      const { labelAxisName, valueAxisName } = getAxisName(labelAxisOnYAxis);
      const { labelSizeKey, valueSizeKey } = getSizeKey(labelAxisOnYAxis);
      const scaleOptions = {
        xAxis: options?.xAxis?.scale,
        yAxis: options?.yAxis?.scale,
      };

      if (hasPercentStackSeries(stackSeries)) {
        Object.keys(series).forEach((seriesName) => {
          scaleData[valueAxisName] = getStackScaleData(stackSeries[seriesName].scaleType);
        });
      } else if (isCoordinateSeries(series)) {
        const dateTypeLabel = isExist(options.xAxis?.date);
        const range = dataRange;
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
        if (series.line) {
          scaleData[labelAxisName] = calculateScaleForCoordinateLineType(
            scaleData[labelAxisName],
            options as LineChartOptions,
            categories
          );
        }
      } else {
        scaleData[valueAxisName] = calculateCoordinateScale({
          dataRange: dataRange[valueAxisName],
          offsetSize: layout.plot[valueSizeKey],
          scaleOption: scaleOptions[valueAxisName],
        });
      }

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
