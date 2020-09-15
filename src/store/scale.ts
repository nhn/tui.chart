import { extend } from '@src/store/store';
import { StoreModule, Scale, Options, ChartState } from '@t/store/store';
import {
  getAxisName,
  getSizeKey,
  isLabelAxisOnYAxis,
  getYAxisOption,
  getValueAxisNames,
} from '@src/helpers/axes';
import {
  calculateCoordinateScale,
  calculateScaleForCoordinateLineType,
  getStackScaleData,
} from '@src/scale/coordinateScaleCalculator';
import { calculateDatetimeScale } from '@src/scale/datetimeScaleCalculator';
import { isCoordinateSeries } from '@src/helpers/coordinate';
import { hasPercentStackSeries } from './stackSeriesData';
import { isExist } from '@src/helpers/utils';
import { LineChartOptions, Scale as ScaleOption } from '@t/options';

type ScaleOptions = {
  xAxis?: ScaleOption;
  yAxis?: ScaleOption;
  secondaryYAxis?: ScaleOption;
};

function getLabelScaleData(
  state: ChartState<Options>,
  labelAxisOnYAxis: boolean,
  scaleOptions: ScaleOptions,
  labelAxisName: string
) {
  const { dataRange, layout, series, categories, rawCategories, options } = state;
  const { labelSizeKey } = getSizeKey(labelAxisOnYAxis);
  const dateTypeLabel = isExist(options.xAxis?.date);
  const range = dataRange;
  const labelOptions = {
    dataRange: range[labelAxisName],
    offsetSize: layout.plot[labelSizeKey],
    scaleOption: scaleOptions[labelAxisName],
    rawCategoriesSize: rawCategories.length,
  };

  let result = dateTypeLabel
    ? calculateDatetimeScale(labelOptions)
    : calculateCoordinateScale(labelOptions);

  if (series.line) {
    result = calculateScaleForCoordinateLineType(result, options as LineChartOptions, categories);
  }

  return result;
}

function getValueScaleData(
  state: ChartState<Options>,
  labelAxisOnYAxis: boolean,
  scaleOptions: ScaleOptions,
  valueAxisName: string
) {
  const { dataRange, layout, series, stackSeries } = state;
  const { valueSizeKey } = getSizeKey(labelAxisOnYAxis);
  let result;

  if (hasPercentStackSeries(stackSeries)) {
    Object.keys(series).forEach((seriesName) => {
      result = getStackScaleData(stackSeries[seriesName].scaleType);
    });
  } else if (isCoordinateSeries(series)) {
    const valueOptions = {
      dataRange: dataRange[valueAxisName],
      offsetSize: layout.plot[valueSizeKey],
      scaleOption: scaleOptions[valueAxisName],
    };

    result = calculateCoordinateScale(valueOptions);
  } else {
    result = calculateCoordinateScale({
      dataRange: dataRange[valueAxisName],
      offsetSize: layout.plot[valueSizeKey],
      scaleOption: scaleOptions[valueAxisName],
    });
  }

  return result;
}

const scale: StoreModule = {
  name: 'scale',
  state: () => ({
    scale: {} as Scale,
  }),
  action: {
    setScale({ state }) {
      const { series, options } = state;
      const labelAxisOnYAxis = isLabelAxisOnYAxis(series, options);
      const { labelAxisName, valueAxisName } = getAxisName(labelAxisOnYAxis);
      const { yAxis, secondaryYAxis } = getYAxisOption(options);
      const scaleData = {};

      const scaleOptions: ScaleOptions = {
        xAxis: options?.xAxis?.scale,
        yAxis: yAxis?.scale,
      };

      if (secondaryYAxis) {
        scaleOptions.secondaryYAxis = secondaryYAxis?.scale;
      }

      getValueAxisNames(options, valueAxisName).forEach((axisName) => {
        scaleData[axisName] = getValueScaleData(state, labelAxisOnYAxis, scaleOptions, axisName);
      });

      if (isCoordinateSeries(series)) {
        scaleData[labelAxisName] = getLabelScaleData(
          state,
          labelAxisOnYAxis,
          scaleOptions,
          labelAxisName
        );
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
